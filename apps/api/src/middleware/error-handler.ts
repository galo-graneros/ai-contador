import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string
    ) {
        super(message)
        this.name = 'AppError'
    }
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error('Error:', err)

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation error',
            details: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            }))
        })
        return
    }

    // Custom app errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            code: err.code
        })
        return
    }

    // Default error
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
}
