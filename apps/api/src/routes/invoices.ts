import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { decrypt } from '../lib/encryption.js'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'
import { createInvoiceSchema } from '@ai-contador/shared'
import { AfipService } from '../services/afip.js'
import { PdfService } from '../services/pdf-generator.js'

export const invoicesRouter = Router()

// List invoices
invoicesRouter.get('/', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { status, limit = '20', page = '1' } = req.query

        let query = supabase
            .from('invoices')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('fecha_emision', { ascending: false })

        if (status && typeof status === 'string') {
            query = query.eq('status', status)
        }

        const pageNum = parseInt(page as string)
        const limitNum = parseInt(limit as string)
        const offset = (pageNum - 1) * limitNum
        query = query.range(offset, offset + limitNum - 1)

        const { data, error, count } = await query

        if (error) throw new AppError(500, 'Failed to fetch invoices')

        res.json({
            invoices: data,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limitNum)
            }
        })
    } catch (error) {
        next(error)
    }
})

// Get single invoice
invoicesRouter.get('/:id', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { id } = req.params

        const { data, error } = await supabase
            .from('invoices')
            .select(`
        *,
        invoice_items (*)
      `)
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (error) throw new AppError(404, 'Invoice not found')

        res.json({ invoice: data })
    } catch (error) {
        next(error)
    }
})

// Create draft invoice
invoicesRouter.post('/', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const data = createInvoiceSchema.parse(req.body)

        // Calculate totals
        const items = data.items.map(item => ({
            ...item,
            subtotal: item.cantidad * item.precio_unitario
        }))
        const importeNeto = items.reduce((sum, item) => sum + item.subtotal, 0)
        const importeTotal = importeNeto // Factura C doesn't have IVA

        // Get next invoice number
        const { data: lastInvoice } = await supabase
            .from('invoices')
            .select('invoice_number')
            .eq('user_id', userId)
            .order('invoice_number', { ascending: false })
            .limit(1)
            .single()

        const nextNumber = (lastInvoice?.invoice_number || 0) + 1

        // Create invoice
        const { data: invoice, error } = await supabase
            .from('invoices')
            .insert({
                user_id: userId,
                invoice_number: nextNumber,
                receptor_cuit: data.receptor_cuit,
                receptor_nombre: data.receptor_nombre,
                receptor_condicion_iva: data.receptor_condicion_iva,
                concepto: data.concepto,
                importe_neto: importeNeto,
                importe_iva: 0,
                importe_total: importeTotal,
                observaciones: data.observaciones,
                status: 'draft'
            })
            .select()
            .single()

        if (error) throw new AppError(500, 'Failed to create invoice')

        // Create invoice items
        const itemsToInsert = items.map(item => ({
            invoice_id: invoice.id,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal
        }))

        await supabase.from('invoice_items').insert(itemsToInsert)

        res.status(201).json({ invoice })
    } catch (error) {
        next(error)
    }
})

// Submit invoice to AFIP
invoicesRouter.post('/:id/submit', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { id } = req.params

        // Get invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, invoice_items (*)')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (invoiceError || !invoice) {
            throw new AppError(404, 'Invoice not found')
        }

        if (invoice.status !== 'draft') {
            throw new AppError(400, 'Invoice already submitted')
        }

        // Get AFIP connection
        const { data: connection } = await supabase
            .from('connections')
            .select('credentials_encrypted')
            .eq('user_id', userId)
            .eq('provider', 'afip')
            .single()

        if (!connection?.credentials_encrypted) {
            throw new AppError(400, 'AFIP not connected')
        }

        const credentials = JSON.parse(decrypt(connection.credentials_encrypted))

        // Create AFIP service and submit invoice
        const afipService = new AfipService(
            credentials.cuit,
            decrypt(credentials.certificate),
            decrypt(credentials.privateKey),
            credentials.puntoVenta
        )

        const result = await afipService.createFacturaC({
            puntoVenta: credentials.puntoVenta,
            numeroComprobante: invoice.invoice_number,
            fechaEmision: new Date(invoice.fecha_emision),
            importeTotal: invoice.importe_total,
            importeNeto: invoice.importe_neto,
            receptorCuit: invoice.receptor_cuit,
            receptorNombre: invoice.receptor_nombre,
            concepto: invoice.concepto
        })

        // Update invoice with CAE
        const { data: updatedInvoice, error: updateError } = await supabase
            .from('invoices')
            .update({
                cae: result.cae,
                cae_vencimiento: result.caeVencimiento,
                status: 'approved',
                afip_response: result
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw new AppError(500, 'Failed to update invoice')

        res.json({ invoice: updatedInvoice })
    } catch (error) {
        next(error)
    }
})

// Generate PDF
invoicesRouter.get('/:id/pdf', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest
        const { id } = req.params

        // Get invoice with items
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select('*, invoice_items (*)')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (error || !invoice) {
            throw new AppError(404, 'Invoice not found')
        }

        // Get user info
        const { data: user } = await supabase
            .from('users')
            .select('full_name, cuit')
            .eq('id', userId)
            .single()

        // Generate PDF
        const pdfService = new PdfService()
        const pdfBuffer = await pdfService.generateInvoicePdf(invoice, user)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="factura-${invoice.invoice_number}.pdf"`)
        res.send(pdfBuffer)
    } catch (error) {
        next(error)
    }
})

// Get invoice statistics
invoicesRouter.get('/stats/summary', async (req, res, next) => {
    try {
        const { userId } = req as AuthenticatedRequest

        // Current month dates
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // Get approved invoices this month
        const { data: approvedInvoices } = await supabase
            .from('invoices')
            .select('importe_total')
            .eq('user_id', userId)
            .eq('status', 'approved')
            .gte('fecha_emision', startOfMonth.toISOString().split('T')[0])
            .lte('fecha_emision', endOfMonth.toISOString().split('T')[0])

        // Get pending drafts
        const { count: draftCount } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'draft')

        const totalFacturado = approvedInvoices?.reduce((sum, inv) => sum + Number(inv.importe_total), 0) || 0

        res.json({
            totalFacturado,
            invoiceCount: approvedInvoices?.length || 0,
            draftCount: draftCount || 0
        })
    } catch (error) {
        next(error)
    }
})
