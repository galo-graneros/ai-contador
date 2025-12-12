import { createClient } from '@/lib/supabase/server'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@ai-contador/shared'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { ConnectionStatus } from '@/components/dashboard/connection-status'

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get dashboard data
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Fetch transactions for the month
    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString())

    // Calculate totals
    let totalIncome = 0
    let totalExpenses = 0
    transactions?.forEach(t => {
        const amount = Number(t.amount)
        if (t.type === 'income' || amount > 0) {
            totalIncome += Math.abs(amount)
        } else if (t.type === 'expense' || amount < 0) {
            totalExpenses += Math.abs(amount)
        }
    })
    const balance = totalIncome - totalExpenses

    // Get pending classification count
    const { count: pendingCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')

    // Get invoiced total
    const { data: invoices } = await supabase
        .from('invoices')
        .select('importe_total')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .gte('fecha_emision', startOfMonth.toISOString().split('T')[0])
        .lte('fecha_emision', endOfMonth.toISOString().split('T')[0])

    const totalFacturado = invoices?.reduce((sum, inv) => sum + Number(inv.importe_total), 0) || 0

    // Get pending invoices count
    const { count: pendingInvoices } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'income')
        .eq('status', 'classified')
        .is('invoice_id', null)

    // Get recent transactions
    const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
      id,
      description,
      amount,
      date,
      type,
      status,
      ai_classifications (
        categoria_afip,
        descripcion_limpia,
        probabilidad
      )
    `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

    // Get connections
    const { data: connections } = await supabase
        .from('connections')
        .select('provider, status, last_sync_at')
        .eq('user_id', user.id)

    const periodo = `${now.toLocaleString('es-AR', { month: 'long' })} ${now.getFullYear()}`

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Resumen de {periodo}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/facturas/nueva" className="btn btn-primary">
                        <FileText className="h-4 w-4 mr-2" />
                        Nueva Factura
                    </Link>
                </div>
            </div>

            {/* Alert for pending items */}
            {((pendingCount || 0) > 0 || (pendingInvoices || 0) > 0) && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                            Tenés items pendientes
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            {pendingCount || 0} movimientos sin clasificar y {pendingInvoices || 0} ingresos sin facturar.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ingresos del Mes"
                    value={formatCurrency(totalIncome)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    trend={totalIncome > 0 ? 'up' : 'neutral'}
                    color="green"
                />
                <StatCard
                    title="Gastos del Mes"
                    value={formatCurrency(totalExpenses)}
                    icon={<TrendingDown className="h-6 w-6" />}
                    trend="neutral"
                    color="red"
                />
                <StatCard
                    title="Balance"
                    value={formatCurrency(balance)}
                    icon={<DollarSign className="h-6 w-6" />}
                    trend={balance >= 0 ? 'up' : 'down'}
                    color={balance >= 0 ? 'blue' : 'red'}
                />
                <StatCard
                    title="Total Facturado"
                    value={formatCurrency(totalFacturado)}
                    icon={<FileText className="h-6 w-6" />}
                    trend="neutral"
                    color="purple"
                    subtitle={`${invoices?.length || 0} facturas`}
                />
            </div>

            {/* Charts and Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Chart */}
                <div className="lg:col-span-2 card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Ingresos vs Gastos (últimos 6 meses)
                    </h3>
                    <MonthlyChart userId={user.id} />
                </div>

                {/* Connection Status */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Conexiones
                    </h3>
                    <ConnectionStatus connections={connections || []} />
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Movimientos Recientes
                    </h3>
                    <Link
                        href="/movimientos"
                        className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                    >
                        Ver todos
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
                <RecentTransactions transactions={recentTransactions || []} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickActionCard
                    title="Clasificar Movimientos"
                    description={`${pendingCount || 0} pendientes de clasificar`}
                    href="/movimientos?status=pending"
                    icon={<Clock className="h-6 w-6" />}
                />
                <QuickActionCard
                    title="Emitir Facturas"
                    description={`${pendingInvoices || 0} ingresos sin facturar`}
                    href="/facturas/nueva"
                    icon={<FileText className="h-6 w-6" />}
                />
                <QuickActionCard
                    title="Ver Declaraciones"
                    description="Borradores del período actual"
                    href="/declaraciones"
                    icon={<DollarSign className="h-6 w-6" />}
                />
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon,
    trend = 'neutral',
    color,
    subtitle
}: {
    title: string
    value: string
    icon: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
    color: 'green' | 'red' | 'blue' | 'purple'
    subtitle?: string
}) {
    const colors = {
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
    }

    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    {icon}
                </div>
                {trend === 'up' && <ArrowUpRight className="h-5 w-5 text-green-500" />}
                {trend === 'down' && <ArrowDownRight className="h-5 w-5 text-red-500" />}
            </div>
            <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    )
}

function QuickActionCard({
    title,
    description,
    href,
    icon
}: {
    title: string
    description: string
    href: string
    icon: React.ReactNode
}) {
    return (
        <Link
            href={href}
            className="card card-hover flex items-center gap-4 group"
        >
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-primary-600 transition-colors" />
        </Link>
    )
}
