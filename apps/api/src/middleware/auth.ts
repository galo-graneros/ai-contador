import type { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase.js'

export interface AuthenticatedRequest extends Request {
    userId: string
    userEmail: string
    userRole: string
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' })
            return
        }

        const token = authHeader.split(' ')[1]

        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            res.status(401).json({ error: 'Invalid or expired token' })
            return
        }

        // Get user profile with role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

            // Attach user info to request
            ; (req as AuthenticatedRequest).userId = user.id
            ; (req as AuthenticatedRequest).userEmail = user.email || ''
            ; (req as AuthenticatedRequest).userRole = profile?.role || 'user'

        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        res.status(500).json({ error: 'Authentication error' })
    }
}

// Optional: Role-based access control middleware
export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest

        if (!roles.includes(authReq.userRole)) {
            res.status(403).json({ error: 'Insufficient permissions' })
            return
        }

        next()
    }
}
