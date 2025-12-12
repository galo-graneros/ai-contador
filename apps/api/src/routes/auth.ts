import { Router } from 'express'

export const authRouter = Router()

// Auth is handled by Supabase client-side
// These endpoints are for server-side token validation and user management

authRouter.post('/verify', async (req, res) => {
    // Token verification is done by authMiddleware
    // This endpoint can be used to verify a token is valid
    res.json({ valid: true })
})

authRouter.get('/me', async (req, res) => {
    // Return current user info
    // This would be used after authMiddleware
    res.json({ message: 'Use Supabase client for auth' })
})
