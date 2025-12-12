import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRouter } from './routes/auth.js'
import { connectionsRouter } from './routes/connections.js'
import { transactionsRouter } from './routes/transactions.js'
import { invoicesRouter } from './routes/invoices.js'
import { declarationsRouter } from './routes/declarations.js'
import { webhooksRouter } from './routes/webhooks.js'
import { aiRouter } from './routes/ai.js'
import { dashboardRouter } from './routes/dashboard.js'
import { errorHandler } from './middleware/error-handler.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()
const PORT = process.env.API_PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/api/auth', authRouter)
app.use('/api/webhooks', webhooksRouter)

// Protected routes
app.use('/api/connections', authMiddleware, connectionsRouter)
app.use('/api/transactions', authMiddleware, transactionsRouter)
app.use('/api/invoices', authMiddleware, invoicesRouter)
app.use('/api/declarations', authMiddleware, declarationsRouter)
app.use('/api/ai', authMiddleware, aiRouter)
app.use('/api/dashboard', authMiddleware, dashboardRouter)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app
