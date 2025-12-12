import { supabase } from '../lib/supabase.js'
import { MP_OPERATION_TYPES } from '@ai-contador/shared'

interface MPTokenResponse {
    access_token: string
    refresh_token?: string
    expires_in: number
    user_id: number
    expires_at?: string
}

interface MPMovement {
    id: number
    type: string
    action: string
    amount: number
    currency_id: string
    date_created: string
    description: string
    payer?: { id: number; email?: string }
    collector?: { id: number; email?: string }
    external_reference?: string
    status: string
}

export class MercadoPagoService {
    private clientId: string
    private clientSecret: string
    private redirectUri: string
    private baseUrl = 'https://api.mercadopago.com'

    constructor() {
        this.clientId = process.env.MERCADOPAGO_CLIENT_ID || ''
        this.clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET || ''
        this.redirectUri = process.env.MERCADOPAGO_REDIRECT_URI || ''

        if (!this.clientId || !this.clientSecret) {
            console.warn('⚠️ MercadoPago credentials not configured')
        }
    }

    getAuthUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            platform_id: 'mp',
            redirect_uri: this.redirectUri,
            state
        })

        return `https://auth.mercadopago.com.ar/authorization?${params.toString()}`
    }

    async exchangeCode(code: string): Promise<MPTokenResponse> {
        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectUri
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`MercadoPago OAuth error: ${error}`)
        }

        const data = await response.json()

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            user_id: data.user_id,
            expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
        }
    }

    async refreshToken(refreshToken: string): Promise<MPTokenResponse> {
        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        })

        if (!response.ok) {
            throw new Error('Failed to refresh MercadoPago token')
        }

        const data = await response.json()

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            user_id: data.user_id,
            expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
        }
    }

    async getBalance(accessToken: string): Promise<{ available: number; pending: number }> {
        const response = await fetch(`${this.baseUrl}/users/me/mercadopago_account/balance`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch balance')
        }

        const data = await response.json()

        return {
            available: data.available_balance || 0,
            pending: data.pending_balance || 0
        }
    }

    async getMovements(accessToken: string, options?: {
        begin_date?: string
        end_date?: string
        offset?: number
        limit?: number
    }): Promise<MPMovement[]> {
        const params = new URLSearchParams({
            sort: 'date_created',
            criteria: 'desc',
            range: 'date_created',
            offset: String(options?.offset || 0),
            limit: String(options?.limit || 50)
        })

        if (options?.begin_date) {
            params.append('begin_date', options.begin_date)
        }
        if (options?.end_date) {
            params.append('end_date', options.end_date)
        }

        const response = await fetch(
            `${this.baseUrl}/mercadopago_account/movements/search?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch movements')
        }

        const data = await response.json()
        return data.results || []
    }

    async getPayment(paymentId: string | number, accessToken: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            return null
        }

        return response.json()
    }

    async syncTransactions(userId: string, accessToken: string): Promise<number> {
        // Get connection to find connection_id
        const { data: connection } = await supabase
            .from('connections')
            .select('id')
            .eq('user_id', userId)
            .eq('provider', 'mercadopago')
            .single()

        if (!connection) {
            throw new Error('MercadoPago connection not found')
        }

        // Get last 3 months of movements
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        const movements = await this.getMovements(accessToken, {
            begin_date: threeMonthsAgo.toISOString(),
            limit: 100
        })

        let syncedCount = 0

        for (const movement of movements) {
            // Map MP type to our transaction type
            const mpType = movement.type?.toLowerCase() || 'other'
            const transactionType = (MP_OPERATION_TYPES as Record<string, string>)[mpType] || 'other'

            // Determine counterparty
            let counterparty = ''
            if (movement.payer?.email) {
                counterparty = movement.payer.email
            } else if (movement.collector?.email) {
                counterparty = movement.collector.email
            }

            // Upsert transaction
            const { error } = await supabase
                .from('transactions')
                .upsert({
                    user_id: userId,
                    connection_id: connection.id,
                    external_id: String(movement.id),
                    type: transactionType as any,
                    amount: movement.amount,
                    currency: movement.currency_id || 'ARS',
                    description: movement.description || `MercadoPago ${movement.type}`,
                    counterparty,
                    date: movement.date_created,
                    raw_data: movement,
                    status: 'pending'
                }, {
                    onConflict: 'connection_id,external_id',
                    ignoreDuplicates: true
                })

            if (!error) {
                syncedCount++
            }
        }

        return syncedCount
    }

    async syncSingleTransaction(userId: string, accessToken: string, payment: any): Promise<void> {
        const { data: connection } = await supabase
            .from('connections')
            .select('id')
            .eq('user_id', userId)
            .eq('provider', 'mercadopago')
            .single()

        if (!connection) return

        const transactionType = payment.transaction_amount > 0 ? 'income' : 'expense'

        await supabase
            .from('transactions')
            .upsert({
                user_id: userId,
                connection_id: connection.id,
                external_id: String(payment.id),
                type: transactionType,
                amount: payment.transaction_amount,
                currency: payment.currency_id || 'ARS',
                description: payment.description || 'MercadoPago payment',
                counterparty: payment.payer?.email || '',
                date: payment.date_created,
                raw_data: payment,
                status: 'pending'
            }, {
                onConflict: 'connection_id,external_id'
            })
    }
}
