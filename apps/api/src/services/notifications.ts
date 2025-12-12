import { Resend } from 'resend'
import { Twilio } from 'twilio'
import { supabase } from '../lib/supabase.js'
import { NOTIFICATION_TEMPLATES, formatCurrency } from '@ai-contador/shared'

type NotificationType = 'invoice_pending' | 'afip_expiry' | 'balance_summary' | 'sync_error' | 'declaration_ready'
type NotificationChannel = 'email' | 'whatsapp' | 'push' | 'in_app'

interface NotificationData {
    userId: string
    type: NotificationType
    channel: NotificationChannel
    data?: Record<string, any>
}

export class NotificationService {
    private resend: Resend | null = null
    private twilio: Twilio | null = null

    constructor() {
        if (process.env.RESEND_API_KEY) {
            this.resend = new Resend(process.env.RESEND_API_KEY)
        }

        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilio = new Twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            )
        }
    }

    async send(notification: NotificationData): Promise<boolean> {
        const template = NOTIFICATION_TEMPLATES[notification.type]
        if (!template) {
            console.error(`Unknown notification type: ${notification.type}`)
            return false
        }

        // Format message with data
        const title = this.formatMessage(template.title, notification.data || {})
        const message = this.formatMessage(template.message, notification.data || {})

        // Save notification to database
        const { data: savedNotification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: notification.userId,
                type: notification.type,
                channel: notification.channel,
                title,
                message,
                data: notification.data,
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            console.error('Failed to save notification:', error)
            return false
        }

        // Send based on channel
        try {
            switch (notification.channel) {
                case 'email':
                    await this.sendEmail(notification.userId, title, message)
                    break
                case 'whatsapp':
                    await this.sendWhatsApp(notification.userId, message)
                    break
                case 'in_app':
                    // Already saved, no additional action needed
                    break
            }

            // Update status to sent
            await supabase
                .from('notifications')
                .update({ status: 'sent', sent_at: new Date().toISOString() })
                .eq('id', savedNotification.id)

            return true
        } catch (error) {
            console.error('Failed to send notification:', error)

            await supabase
                .from('notifications')
                .update({
                    status: 'failed',
                    error_message: error instanceof Error ? error.message : 'Unknown error'
                })
                .eq('id', savedNotification.id)

            return false
        }
    }

    private formatMessage(template: string, data: Record<string, any>): string {
        let message = template

        for (const [key, value] of Object.entries(data)) {
            const placeholder = `{${key}}`
            let formattedValue = String(value)

            // Format currency values
            if (key.includes('amount') || key.includes('income') || key.includes('expense') || key.includes('balance')) {
                formattedValue = formatCurrency(Number(value))
            }

            message = message.replace(placeholder, formattedValue)
        }

        return message
    }

    private async sendEmail(userId: string, subject: string, body: string): Promise<void> {
        if (!this.resend) {
            console.warn('Resend not configured, skipping email')
            return
        }

        // Get user email
        const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single()

        if (!user?.email) {
            throw new Error('User email not found')
        }

        await this.resend.emails.send({
            from: 'AI Contador <notificaciones@aicontador.com>',
            to: user.email,
            subject,
            text: body,
            html: this.wrapEmailHtml(subject, body)
        })
    }

    private wrapEmailHtml(subject: string, body: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
    </div>
    <div class="content">
      <p>${body}</p>
    </div>
    <div class="footer">
      <p>AI Contador - Tu asistente contable inteligente</p>
    </div>
  </div>
</body>
</html>`
    }

    private async sendWhatsApp(userId: string, message: string): Promise<void> {
        if (!this.twilio) {
            console.warn('Twilio not configured, skipping WhatsApp')
            return
        }

        // Get user phone
        const { data: user } = await supabase
            .from('users')
            .select('phone')
            .eq('id', userId)
            .single()

        if (!user?.phone) {
            throw new Error('User phone not found')
        }

        await this.twilio.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${user.phone}`,
            body: message
        })
    }

    // Batch notification methods
    async sendPendingInvoiceReminders(): Promise<void> {
        // Get users with pending invoices
        const { data: users } = await supabase
            .from('transactions')
            .select('user_id')
            .eq('type', 'income')
            .eq('status', 'classified')
            .is('invoice_id', null)
            .limit(100)

        if (!users) return

        // Group by user and count
        const userCounts = users.reduce((acc, t) => {
            acc[t.user_id] = (acc[t.user_id] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        for (const [userId, count] of Object.entries(userCounts)) {
            // Get pending amount
            const { data: pendingTx } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', userId)
                .eq('type', 'income')
                .eq('status', 'classified')
                .is('invoice_id', null)

            const totalAmount = pendingTx?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

            await this.send({
                userId,
                type: 'invoice_pending',
                channel: 'email',
                data: { count, amount: totalAmount }
            })
        }
    }

    async sendMonthlySummaries(): Promise<void> {
        // Get all active users
        const { data: users } = await supabase
            .from('users')
            .select('id')
            .limit(1000)

        if (!users) return

        const now = new Date()
        const monthName = now.toLocaleString('es-AR', { month: 'long' })

        for (const user of users) {
            // Get month stats
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount, type')
                .eq('user_id', user.id)
                .gte('date', startOfMonth.toISOString())
                .lte('date', endOfMonth.toISOString())

            if (!transactions || transactions.length === 0) continue

            let income = 0
            let expenses = 0
            transactions.forEach(t => {
                if (t.type === 'income') income += Number(t.amount)
                else if (t.type === 'expense') expenses += Math.abs(Number(t.amount))
            })

            await this.send({
                userId: user.id,
                type: 'balance_summary',
                channel: 'email',
                data: {
                    month: monthName,
                    income,
                    expenses,
                    balance: income - expenses
                }
            })
        }
    }
}
