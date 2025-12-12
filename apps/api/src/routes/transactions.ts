import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'
import { transactionFilterSchema } from '@ai-contador/shared'

export const transactionsRouter = Router()

// List transactions with filtering
transactionsRouter.get('/', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const filters = transactionFilterSchema.parse(req.query)

        let query = supabase
            .from('transactions')
            .select(`
        *,
        ai_classifications (
          id,
          categoria_afip,
          tipo,
          proveedor_cliente,
          descripcion_limpia,
          probabilidad,
          sugerencia_factura
        )
      `, { count: 'exact' })
            .eq('user_id', userId)
            .order('date', { ascending: false })

        // Apply filters
        if (filters.startDate) {
            query = query.gte('date', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate)
        }
        if (filters.type) {
            query = query.eq('type', filters.type)
        }
        if (filters.status) {
            query = query.eq('status', filters.status)
        }
        if (filters.minAmount) {
            query = query.gte('amount', filters.minAmount)
        }
        if (filters.maxAmount) {
            query = query.lte('amount', filters.maxAmount)
        }
        if (filters.search) {
            query = query.ilike('description', `%${filters.search}%`)
        }

        // Pagination
        const offset = (filters.page - 1) * filters.limit
        query = query.range(offset, offset + filters.limit - 1)

        const { data, error, count } = await query

        if (error) throw new AppError(500, 'Failed to fetch transactions')

        res.json({
            transactions: data,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / filters.limit)
            }
        })
    } catch (error) {
        next(error)
    }
})

// Get single transaction
transactionsRouter.get('/:id', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { id } = req.params

        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        ai_classifications (*),
        invoices (id, invoice_number, status, cae)
      `)
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (error) throw new AppError(404, 'Transaction not found')

        res.json({ transaction: data })
    } catch (error) {
        next(error)
    }
})

// Update transaction (manual type override)
transactionsRouter.patch('/:id', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { id } = req.params
        const { type, counterparty } = req.body

        const { data, error } = await supabase
            .from('transactions')
            .update({ type, counterparty, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw new AppError(500, 'Failed to update transaction')

        res.json({ transaction: data })
    } catch (error) {
        next(error)
    }
})

// Get transaction statistics
transactionsRouter.get('/stats/summary', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { period } = req.query as { period?: string }

        // Default to current month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // Get income
        const { data: incomeData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
            .eq('type', 'income')
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString())

        // Get expenses
        const { data: expenseData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
            .eq('type', 'expense')
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString())

        // Get pending classification count
        const { count: pendingCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'pending')

        const totalIncome = incomeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
        const totalExpenses = expenseData?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0

        res.json({
            period: period || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            income: totalIncome,
            expenses: totalExpenses,
            balance: totalIncome - totalExpenses,
            pendingClassification: pendingCount || 0
        })
    } catch (error) {
        next(error)
    }
})
