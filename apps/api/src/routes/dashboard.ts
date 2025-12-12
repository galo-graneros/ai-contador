import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'

export const dashboardRouter = Router()

// Get complete dashboard data
dashboardRouter.get('/', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest

        // Current month dates
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        // Get transactions for the month
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId)
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString())

        // Calculate income and expenses
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

        // Get pending transactions count
        const { count: pendingCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'pending')

        // Get invoices for the month
        const { data: invoices } = await supabase
            .from('invoices')
            .select('importe_total, status')
            .eq('user_id', userId)
            .eq('status', 'approved')
            .gte('fecha_emision', startOfMonth.toISOString().split('T')[0])
            .lte('fecha_emision', endOfMonth.toISOString().split('T')[0])

        const totalFacturado = invoices?.reduce((sum, inv) => sum + Number(inv.importe_total), 0) || 0

        // Get draft invoices count
        const { count: draftInvoiceCount } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'draft')

        // Get pending invoices (incomes without invoice)
        const { count: pendingInvoiceCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'income')
            .eq('status', 'classified')
            .is('invoice_id', null)

        // Get declaration drafts for current period
        const { data: declarations } = await supabase
            .from('declaration_drafts')
            .select('tipo, saldo_a_pagar, status')
            .eq('user_id', userId)
            .eq('periodo', periodo)

        // Get recent classified transactions
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
          tipo,
          descripcion_limpia,
          probabilidad
        )
      `)
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10)

        // Get connections status
        const { data: connections } = await supabase
            .from('connections')
            .select('provider, status, last_sync_at')
            .eq('user_id', userId)

        res.json({
            periodo,
            summary: {
                ingresos: totalIncome,
                gastos: totalExpenses,
                balance: totalIncome - totalExpenses,
                totalFacturado,
                pendientesClasificar: pendingCount || 0,
                pendientesFacturar: pendingInvoiceCount || 0,
                borradorFacturas: draftInvoiceCount || 0
            },
            declarations: declarations || [],
            recentTransactions: recentTransactions || [],
            connections: connections || []
        })
    } catch (error) {
        next(error)
    }
})

// Get chart data for income/expenses over time
dashboardRouter.get('/charts/monthly', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { months = '6' } = req.query

        const monthsCount = parseInt(months as string)
        const data: Array<{
            month: string
            income: number
            expenses: number
        }> = []

        for (let i = monthsCount - 1; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount, type')
                .eq('user_id', userId)
                .gte('date', startOfMonth.toISOString())
                .lte('date', endOfMonth.toISOString())

            let income = 0
            let expenses = 0
            transactions?.forEach(t => {
                const amount = Number(t.amount)
                if (t.type === 'income' || amount > 0) {
                    income += Math.abs(amount)
                } else {
                    expenses += Math.abs(amount)
                }
            })

            data.push({
                month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                income,
                expenses
            })
        }

        res.json({ data })
    } catch (error) {
        next(error)
    }
})

// Get category breakdown
dashboardRouter.get('/charts/categories', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest

        // Current month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // Get transactions with classifications
        const { data: transactions } = await supabase
            .from('transactions')
            .select(`
        amount,
        type,
        ai_classifications (categoria_afip)
      `)
            .eq('user_id', userId)
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString())

        // Group by category
        const categories: Record<string, { income: number; expense: number }> = {}

        transactions?.forEach(t => {
            const category = (t.ai_classifications as any)?.categoria_afip || 'Sin clasificar'
            if (!categories[category]) {
                categories[category] = { income: 0, expense: 0 }
            }

            const amount = Math.abs(Number(t.amount))
            if (t.type === 'income') {
                categories[category].income += amount
            } else if (t.type === 'expense') {
                categories[category].expense += amount
            }
        })

        const data = Object.entries(categories).map(([category, values]) => ({
            category,
            ...values
        }))

        res.json({ data })
    } catch (error) {
        next(error)
    }
})
