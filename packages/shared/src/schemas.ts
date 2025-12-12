import { z } from 'zod'

// User schemas
export const userRoleSchema = z.enum(['user', 'contador', 'auditor', 'admin'])
export type UserRole = z.infer<typeof userRoleSchema>

export const updateUserSchema = z.object({
    full_name: z.string().min(2).max(255).optional(),
    phone: z.string().max(20).optional(),
    cuit: z.string().regex(/^\d{2}-\d{8}-\d$/).optional(),
    notification_preferences: z.object({
        email: z.boolean(),
        whatsapp: z.boolean(),
        push: z.boolean()
    }).optional()
})

// Connection schemas
export const connectionProviderSchema = z.enum(['mercadopago', 'afip', 'banco'])
export type ConnectionProvider = z.infer<typeof connectionProviderSchema>

export const afipConnectionSchema = z.object({
    cuit: z.string().regex(/^\d{11}$/, 'CUIT must be 11 digits'),
    certificate: z.string().min(1, 'Certificate is required'),
    privateKey: z.string().min(1, 'Private key is required'),
    puntoVenta: z.number().int().min(1).max(99999).default(1)
})

// Transaction schemas
export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer', 'tax', 'other'])
export type TransactionType = z.infer<typeof transactionTypeSchema>

export const transactionFilterSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    type: transactionTypeSchema.optional(),
    status: z.enum(['pending', 'classified', 'invoiced', 'reconciled']).optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    search: z.string().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20)
})

// Classification schemas
export const classificationTypeSchema = z.enum(['ingreso', 'gasto', 'transferencia', 'impuesto'])
export type ClassificationType = z.infer<typeof classificationTypeSchema>

export const aiClassificationSchema = z.object({
    categoria_afip: z.string(),
    tipo: classificationTypeSchema,
    proveedor_cliente: z.string().nullable(),
    descripcion_limpia: z.string(),
    probabilidad: z.number().min(0).max(1),
    sugerencia_factura: z.boolean(),
    notas: z.string().nullable()
})
export type AIClassification = z.infer<typeof aiClassificationSchema>

export const classificationOverrideSchema = z.object({
    categoria_afip: z.string(),
    tipo: classificationTypeSchema,
    proveedor_cliente: z.string().optional(),
    notas: z.string().optional()
})

// Invoice schemas
export const invoiceStatusSchema = z.enum(['draft', 'pending', 'approved', 'rejected', 'cancelled'])
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>

export const createInvoiceSchema = z.object({
    receptor_cuit: z.string().regex(/^\d{11}$/).optional(),
    receptor_nombre: z.string().min(1).max(255),
    receptor_condicion_iva: z.string().default('Consumidor Final'),
    concepto: z.string().min(1),
    items: z.array(z.object({
        descripcion: z.string().min(1),
        cantidad: z.number().positive().default(1),
        precio_unitario: z.number().positive()
    })).min(1),
    observaciones: z.string().optional()
})

// Declaration schemas
export const declarationTypeSchema = z.enum(['iva_ventas', 'iva_compras', 'monotributo', 'iibb', 'ganancias'])
export type DeclarationType = z.infer<typeof declarationTypeSchema>

export const declarationPeriodSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Period must be YYYY-MM format')

// Notification schemas
export const notificationTypeSchema = z.enum(['invoice_pending', 'afip_expiry', 'balance_summary', 'sync_error', 'declaration_ready'])
export type NotificationType = z.infer<typeof notificationTypeSchema>

export const notificationChannelSchema = z.enum(['email', 'whatsapp', 'push', 'in_app'])
export type NotificationChannel = z.infer<typeof notificationChannelSchema>
