import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'
import { DeclarationService } from '../services/declarations.js'

export const declarationsRouter = Router()

// List declaration drafts
declarationsRouter.get('/', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { periodo, tipo } = req.query

        let query = supabase
            .from('declaration_drafts')
            .select('*')
            .eq('user_id', userId)
            .order('periodo', { ascending: false })

        if (periodo && typeof periodo === 'string') {
            query = query.eq('periodo', periodo)
        }
        if (tipo && typeof tipo === 'string') {
            query = query.eq('tipo', tipo)
        }

        const { data, error } = await query

        if (error) throw new AppError(500, 'Failed to fetch declarations')

        res.json({ declarations: data })
    } catch (error) {
        next(error)
    }
})

// Get single declaration
declarationsRouter.get('/:id', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { id } = req.params

        const { data, error } = await supabase
            .from('declaration_drafts')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (error) throw new AppError(404, 'Declaration not found')

        res.json({ declaration: data })
    } catch (error) {
        next(error)
    }
})

// Generate/regenerate declaration draft
declarationsRouter.post('/generate', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { periodo, tipo } = req.body

        if (!periodo || !tipo) {
            throw new AppError(400, 'Period and type are required')
        }

        const declarationService = new DeclarationService()
        const declaration = await declarationService.generateDraft(userId, periodo, tipo)

        res.json({ declaration })
    } catch (error) {
        next(error)
    }
})

// Update declaration (mark as reviewed, add notes)
declarationsRouter.patch('/:id', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { id } = req.params
        const { status, notas } = req.body

        const { data, error } = await supabase
            .from('declaration_drafts')
            .update({
                status,
                notas,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw new AppError(500, 'Failed to update declaration')

        res.json({ declaration: data })
    } catch (error) {
        next(error)
    }
})

// Get current period summary
declarationsRouter.get('/summary/current', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest

        const now = new Date()
        const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        const { data: declarations } = await supabase
            .from('declaration_drafts')
            .select('tipo, saldo_a_pagar, status')
            .eq('user_id', userId)
            .eq('periodo', periodo)

        const summary = {
            periodo,
            declarations: declarations || [],
            totalEstimado: declarations?.reduce((sum, d) => sum + Number(d.saldo_a_pagar), 0) || 0
        }

        res.json(summary)
    } catch (error) {
        next(error)
    }
})
