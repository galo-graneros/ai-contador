import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'
import { AIClassifierService } from '../services/ai-classifier.js'
import { classificationOverrideSchema } from '@ai-contador/shared'

export const aiRouter = Router()

// Classify a single transaction
aiRouter.post('/classify/:transactionId', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { transactionId } = req.params

        // Get transaction
        const { data: transaction, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .eq('user_id', userId)
            .single()

        if (error || !transaction) {
            throw new AppError(404, 'Transaction not found')
        }

        // Classify with AI
        const aiService = new AIClassifierService()
        const classification = await aiService.classifyTransaction(transaction)

        // Save classification
        const { data: savedClassification, error: saveError } = await supabase
            .from('ai_classifications')
            .upsert({
                transaction_id: transactionId,
                ...classification,
                model_used: 'gpt-4',
                is_override: false
            }, {
                onConflict: 'transaction_id'
            })
            .select()
            .single()

        if (saveError) throw new AppError(500, 'Failed to save classification')

        // Update transaction status
        await supabase
            .from('transactions')
            .update({ status: 'classified' })
            .eq('id', transactionId)

        res.json({ classification: savedClassification })
    } catch (error) {
        next(error)
    }
})

// Batch classify pending transactions
aiRouter.post('/classify-batch', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { limit = 20 } = req.body

        // Get pending transactions
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .limit(limit)

        if (error) throw new AppError(500, 'Failed to fetch transactions')

        if (!transactions || transactions.length === 0) {
            res.json({ message: 'No pending transactions', classified: 0 })
            return
        }

        const aiService = new AIClassifierService()
        let classifiedCount = 0

        for (const transaction of transactions) {
            try {
                const classification = await aiService.classifyTransaction(transaction)

                await supabase
                    .from('ai_classifications')
                    .upsert({
                        transaction_id: transaction.id,
                        ...classification,
                        model_used: 'gpt-4',
                        is_override: false
                    }, {
                        onConflict: 'transaction_id'
                    })

                await supabase
                    .from('transactions')
                    .update({ status: 'classified' })
                    .eq('id', transaction.id)

                classifiedCount++
            } catch (e) {
                console.error(`Failed to classify transaction ${transaction.id}:`, e)
            }
        }

        res.json({
            message: 'Batch classification complete',
            classified: classifiedCount,
            total: transactions.length
        })
    } catch (error) {
        next(error)
    }
})

// Override classification manually
aiRouter.post('/override/:transactionId', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { transactionId } = req.params
        const data = classificationOverrideSchema.parse(req.body)

        // Verify transaction belongs to user
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .select('id')
            .eq('id', transactionId)
            .eq('user_id', userId)
            .single()

        if (txError || !transaction) {
            throw new AppError(404, 'Transaction not found')
        }

        // Update classification
        const { data: classification, error } = await supabase
            .from('ai_classifications')
            .update({
                categoria_afip: data.categoria_afip,
                tipo: data.tipo,
                proveedor_cliente: data.proveedor_cliente,
                notas: data.notas,
                is_override: true,
                override_by: userId,
                updated_at: new Date().toISOString()
            })
            .eq('transaction_id', transactionId)
            .select()
            .single()

        if (error) throw new AppError(500, 'Failed to update classification')

        res.json({ classification })
    } catch (error) {
        next(error)
    }
})

// Get AI explanation for a transaction
aiRouter.post('/explain/:transactionId', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { transactionId } = req.params

        // Get transaction with classification
        const { data: transaction, error } = await supabase
            .from('transactions')
            .select(`
        *,
        ai_classifications (*)
      `)
            .eq('id', transactionId)
            .eq('user_id', userId)
            .single()

        if (error || !transaction) {
            throw new AppError(404, 'Transaction not found')
        }

        const aiService = new AIClassifierService()
        const explanation = await aiService.explainClassification(
            transaction,
            transaction.ai_classifications
        )

        res.json({ explanation })
    } catch (error) {
        next(error)
    }
})
