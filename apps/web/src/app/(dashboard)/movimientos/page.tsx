import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionsList } from '@/components/transactions/list'
import { TransactionsFilters } from '@/components/transactions/filters'
import { Sparkles, FileDown } from 'lucide-react'
import Link from 'next/link'

export default async function MovimientosPage({
    searchParams
}: {
    searchParams: { [key: string]: string | undefined }
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Build query with filters
    let query = supabase
        .from('transactions')
        .select(`
      *,
      ai_classifications (*)
    `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })

    // Apply filters
    if (searchParams.status) {
        query = query.eq('status', searchParams.status)
    }
    if (searchParams.type) {
        query = query.eq('type', searchParams.type)
    }
    if (searchParams.search) {
        query = query.ilike('description', `%${searchParams.search}%`)
    }

    // Pagination
    const page = parseInt(searchParams.page || '1')
    const limit = 20
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: transactions, count } = await query

    // Get pending count
    const { count: pendingCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Movimientos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {count || 0} movimientos en total · {pendingCount || 0} pendientes de clasificar
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary">
                        <FileDown className="h-4 w-4 mr-2" />
                        Exportar
                    </button>
                    <Link href="/movimientos/clasificar" className="btn btn-primary">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Clasificar con IA
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <TransactionsFilters />

            {/* List */}
            <div className="card">
                <TransactionsList
                    transactions={transactions || []}
                    pagination={{
                        page,
                        limit,
                        total: count || 0,
                        totalPages: Math.ceil((count || 0) / limit)
                    }}
                />
            </div>
        </div>
    )
}
