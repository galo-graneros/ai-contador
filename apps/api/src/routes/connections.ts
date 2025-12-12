import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { encrypt, decrypt } from '../lib/encryption.js'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'
import { afipConnectionSchema } from '@ai-contador/shared'
import { MercadoPagoService } from '../services/mercadopago.js'
import { AfipService } from '../services/afip.js'

export const connectionsRouter = Router()

// List all connections for user
connectionsRouter.get('/', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest

        const { data, error } = await supabase
            .from('connections')
            .select('id, provider, status, metadata, last_sync_at, error_message, created_at')
            .eq('user_id', userId)

        if (error) throw new AppError(500, 'Failed to fetch connections')

        res.json({ connections: data })
    } catch (error) {
        next(error)
    }
})

// Get MercadoPago OAuth URL
connectionsRouter.get('/mercadopago/auth-url', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const mpService = new MercadoPagoService()
        const authUrl = mpService.getAuthUrl(userId)

        res.json({ authUrl })
    } catch (error) {
        next(error)
    }
})

// Handle MercadoPago OAuth callback (called from frontend after redirect)
connectionsRouter.post('/mercadopago/callback', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { code } = req.body

        if (!code) throw new AppError(400, 'Authorization code required')

        const mpService = new MercadoPagoService()
        const tokens = await mpService.exchangeCode(code)

        // Store encrypted tokens
        const { error } = await supabase
            .from('connections')
            .upsert({
                user_id: userId,
                provider: 'mercadopago',
                status: 'active',
                access_token_encrypted: encrypt(tokens.access_token),
                refresh_token_encrypted: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
                token_expires_at: tokens.expires_at,
                metadata: { user_id: tokens.user_id },
                last_sync_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,provider'
            })

        if (error) throw new AppError(500, 'Failed to save connection')

        // Trigger initial sync
        await mpService.syncTransactions(userId, tokens.access_token)

        res.json({ success: true, message: 'MercadoPago connected successfully' })
    } catch (error) {
        next(error)
    }
})

// Connect AFIP (upload certificates)
connectionsRouter.post('/afip', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const data = afipConnectionSchema.parse(req.body)

        // Encrypt sensitive data
        const credentials = {
            cuit: data.cuit,
            certificate: encrypt(data.certificate),
            privateKey: encrypt(data.privateKey),
            puntoVenta: data.puntoVenta
        }

        // Test connection
        const afipService = new AfipService(
            data.cuit,
            data.certificate,
            data.privateKey,
            data.puntoVenta
        )

        const isValid = await afipService.testConnection()
        if (!isValid) {
            throw new AppError(400, 'Could not connect to AFIP. Please verify your credentials.')
        }

        // Store connection
        const { error } = await supabase
            .from('connections')
            .upsert({
                user_id: userId,
                provider: 'afip',
                status: 'active',
                credentials_encrypted: encrypt(JSON.stringify(credentials)),
                metadata: { cuit: data.cuit, punto_venta: data.puntoVenta },
                last_sync_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,provider'
            })

        if (error) throw new AppError(500, 'Failed to save connection')

        res.json({ success: true, message: 'AFIP connected successfully' })
    } catch (error) {
        next(error)
    }
})

// Disconnect a provider
connectionsRouter.delete('/:provider', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { provider } = req.params

        const { error } = await supabase
            .from('connections')
            .delete()
            .eq('user_id', userId)
            .eq('provider', provider)

        if (error) throw new AppError(500, 'Failed to delete connection')

        res.json({ success: true, message: `${provider} disconnected` })
    } catch (error) {
        next(error)
    }
})

// Sync transactions from a provider
connectionsRouter.post('/:provider/sync', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { provider } = req.params

        // Get connection
        const { data: connection, error } = await supabase
            .from('connections')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', provider)
            .single()

        if (error || !connection) {
            throw new AppError(404, 'Connection not found')
        }

        if (provider === 'mercadopago' && connection.access_token_encrypted) {
            const mpService = new MercadoPagoService()
            const accessToken = decrypt(connection.access_token_encrypted)
            await mpService.syncTransactions(userId, accessToken)
        }

        // Update last sync time
        await supabase
            .from('connections')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', connection.id)

        res.json({ success: true, message: 'Sync completed' })
    } catch (error) {
        next(error)
    }
})
