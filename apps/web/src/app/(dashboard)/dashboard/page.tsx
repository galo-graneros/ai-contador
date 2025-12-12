import { createClient } from '@/lib/supabase/server'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    Sparkles,
    Zap,
    BarChart3
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

    // Get user profile for greeting
    const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const periodo = `${now.toLocaleString('es-AR', { month: 'long' })} ${now.getFullYear()}`
    const greeting = getGreeting()
    const firstName = profile?.full_name?.split(' ')[0] || 'Usuario'

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                            <span className="text-sm font-medium text-white/80">{greeting}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Hola, {firstName}! 👋
                        </h1>
                        <p className="text-white/70 text-lg">
                            Resumen financiero de <span className="font-semibold text-white">{periodo}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/facturas/nueva"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                        >
                            <FileText className="h-5 w-5" />
                            Nueva Factura
                        </Link>
                    </div>
                </div>
            </div>

            {/* Alert for pending items */}
            {((pendingCount || 0) > 0 || (pendingInvoices || 0) > 0) && (
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/50 rounded-2xl p-5 animate-slide-up">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl" />
                    <div className="relative flex items-start gap-4">
                        <div className="p-2.5 bg-amber-100 dark:bg-amber-800/30 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-amber-800 dark:text-amber-200">
                                Tenés items pendientes
                            </p>
                            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                                <span className="font-medium">{pendingCount || 0}</span> movimientos sin clasificar y{' '}
                                <span className="font-medium">{pendingInvoices || 0}</span> ingresos sin facturar.
                            </p>
                        </div>
                        <Link
                            href="/movimientos?status=pending"
                            className="ml-auto shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Revisar
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Ingresos del Mes"
                    value={formatCurrency(totalIncome)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    trend={totalIncome > 0 ? 'up' : 'neutral'}
                    color="green"
                    delay="0"
                />
                <StatCard
                    title="Gastos del Mes"
                    value={formatCurrency(totalExpenses)}
                    icon={<TrendingDown className="h-6 w-6" />}
                    trend="neutral"
                    color="red"
                    delay="1"
                />
                <StatCard
                    title="Balance"
                    value={formatCurrency(balance)}
                    icon={<DollarSign className="h-6 w-6" />}
                    trend={balance >= 0 ? 'up' : 'down'}
                    color={balance >= 0 ? 'blue' : 'red'}
                    delay="2"
                />
                <StatCard
                    title="Total Facturado"
                    value={formatCurrency(totalFacturado)}
                    icon={<FileText className="h-6 w-6" />}
                    trend="neutral"
                    color="purple"
                    subtitle={`${invoices?.length || 0} facturas`}
                    delay="3"
                />
            </div>

            {/* Charts and Connections Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Chart */}
                <div className="lg:col-span-2 card card-hover">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Ingresos vs Gastos
                            </h3>
                        </div>
                        <span className="text-sm text-gray-500">Últimos 6 meses</span>
                    </div>
                    <MonthlyChart userId={user.id} />
                </div>

                {/* Connection Status */}
                <div className="card card-hover">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Conexiones
                        </h3>
                    </div>
                    <ConnectionStatus connections={connections || []} />
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card card-hover">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Movimientos Recientes
                        </h3>
                    </div>
                    <Link
                        href="/movimientos"
                        className="group flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        Ver todos
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
                <RecentTransactions transactions={recentTransactions || []} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <QuickActionCard
                    title="Clasificar Movimientos"
                    description={`${pendingCount || 0} pendientes de clasificar`}
                    href="/movimientos?status=pending"
                    icon={<Sparkles className="h-6 w-6" />}
                    gradient="from-indigo-500 to-purple-500"
                />
                <QuickActionCard
                    title="Emitir Facturas"
                    description={`${pendingInvoices || 0} ingresos sin facturar`}
                    href="/facturas/nueva"
                    icon={<FileText className="h-6 w-6" />}
                    gradient="from-purple-500 to-pink-500"
                />
                <QuickActionCard
                    title="Ver Declaraciones"
                    description="Borradores del período actual"
                    href="/declaraciones"
                    icon={<DollarSign className="h-6 w-6" />}
                    gradient="from-pink-500 to-orange-500"
                />
            </div>
        </div>
    )
}

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
}

function StatCard({
    title,
    value,
    icon,
    trend = 'neutral',
    color,
    subtitle,
    delay = '0'
}: {
    title: string
    value: string
    icon: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
    color: 'green' | 'red' | 'blue' | 'purple'
    subtitle?: string
    delay?: string
}) {
    const colorStyles = {
        green: {
            icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            glow: 'stat-card-green',
            value: 'text-emerald-600'
        },
        red: {
            icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            glow: 'stat-card-red',
            value: 'text-red-600'
        },
        blue: {
            icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            glow: 'stat-card-blue',
            value: 'text-blue-600'
        },
        purple: {
            icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            glow: 'stat-card-purple',
            value: 'text-purple-600'
        }
    }

    const styles = colorStyles[color]

    return (
        <div
            className={`card card-hover stat-card ${styles.glow} animate-fade-in-up`}
            style={{ animationDelay: `${parseInt(delay) * 100}ms` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${styles.icon}`}>
                    {icon}
                </div>
                {trend === 'up' && (
                    <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full text-xs font-medium">
                        <ArrowUpRight className="h-3 w-3" />
                        <span>+12%</span>
                    </div>
                )}
                {trend === 'down' && (
                    <div className="flex items-center gap-1 text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full text-xs font-medium">
                        <ArrowDownRight className="h-3 w-3" />
                        <span>-8%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                {subtitle && (
                    <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    )
}

function QuickActionCard({
    title,
    description,
    href,
    icon,
    gradient
}: {
    title: string
    description: string
    href: string
    icon: React.ReactNode
    gradient: string
}) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-transparent transition-all duration-300"
        >
            {/* Gradient border on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl" />

            {/* Content */}
            <div className="relative flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${gradient} transition-colors">
                        {title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
            </div>
        </Link>
    )
}
