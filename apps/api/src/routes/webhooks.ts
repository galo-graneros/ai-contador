import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { decrypt } from '../lib/encryption.js'
import { MercadoPagoService } from '../services/mercadopago.js'

export const webhooksRouter = Router()

// MercadoPago webhook
webhooksRouter.post('/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body

        console.log('MercadoPago webhook received:', type, data)

        // Handle payment notifications
        if (type === 'payment' && data?.id) {
            // Find user by MP user_id in connections
            // This would require the MP user_id in the webhook, which isn't always provided
            // For now, we'll need to handle this differently

            // One approach: query all active MP connections and check
            const { data: connections } = await supabase
                .from('connections')
                .select('user_id, access_token_encrypted, metadata')
                .eq('provider', 'mercadopago')
                .eq('status', 'active')

            if (connections) {
                for (const connection of connections) {
                    if (connection.access_token_encrypted) {
                        try {
                            const mpService = new MercadoPagoService()
                            const accessToken = decrypt(connection.access_token_encrypted)

                            // Try to fetch the payment with this user's token
                            const payment = await mpService.getPayment(data.id, accessToken)

                            if (payment) {
                                // This payment belongs to this user, sync it
                                await mpService.syncSingleTransaction(connection.user_id, accessToken, payment)
                                break
                            }
                        } catch (e) {
                            // Payment doesn't belong to this user, continue
                        }
                    }
                }
            }
        }

        // Always respond 200 to acknowledge receipt
        res.status(200).json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        // Still return 200 to prevent retries
        res.status(200).json({ received: true, error: 'Processing error' })
    }
})

// MercadoPago OAuth callback
webhooksRouter.get('/mercadopago/callback', async (req, res) => {
    const { code, state } = req.query

    if (!code) {
        res.redirect(`${process.env.FRONTEND_URL}/settings?error=mp_auth_failed`)
        return
    }

    // Redirect to frontend with the code
    res.redirect(`${process.env.FRONTEND_URL}/settings/mercadopago/callback?code=${code}&state=${state}`)
})
