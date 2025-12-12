import PDFDocument from 'pdfkit'
import { formatCurrency, formatDate, formatCUIT } from '@ai-contador/shared'

interface Invoice {
    id: string
    invoice_number: number
    punto_venta: number
    tipo_comprobante: string
    cae: string | null
    cae_vencimiento: string | null
    fecha_emision: string
    receptor_cuit: string | null
    receptor_nombre: string
    receptor_condicion_iva: string
    importe_neto: number
    importe_iva: number
    importe_total: number
    concepto: string
    observaciones: string | null
    invoice_items: Array<{
        descripcion: string
        cantidad: number
        precio_unitario: number
        subtotal: number
    }>
}

interface User {
    full_name: string | null
    cuit: string | null
}

export class PdfService {
    async generateInvoicePdf(invoice: Invoice, user: User | null): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4'
                })

                const chunks: Buffer[] = []
                doc.on('data', (chunk) => chunks.push(chunk))
                doc.on('end', () => resolve(Buffer.concat(chunks)))
                doc.on('error', reject)

                // Header
                this.drawHeader(doc, invoice, user)

                // Separator
                doc.moveTo(50, 200).lineTo(545, 200).stroke()

                // Client info
                this.drawClientInfo(doc, invoice)

                // Items table
                this.drawItemsTable(doc, invoice)

                // Totals
                this.drawTotals(doc, invoice)

                // CAE info
                if (invoice.cae) {
                    this.drawCAE(doc, invoice)
                }

                // Footer
                this.drawFooter(doc)

                doc.end()
            } catch (error) {
                reject(error)
            }
        })
    }

    private drawHeader(doc: PDFKit.PDFDocument, invoice: Invoice, user: User | null): void {
        // Company name / title
        doc.fontSize(20).font('Helvetica-Bold')
        doc.text(user?.full_name || 'AI Contador', 50, 50)

        // Invoice type
        const tipoComprobante = invoice.tipo_comprobante === '11' ? 'FACTURA C' : `COMPROBANTE ${invoice.tipo_comprobante}`
        doc.fontSize(16)
        doc.text(tipoComprobante, 400, 50, { width: 150, align: 'right' })

        // CUIT
        doc.fontSize(10).font('Helvetica')
        if (user?.cuit) {
            doc.text(`CUIT: ${formatCUIT(user.cuit)}`, 50, 80)
        }

        // Invoice number
        const invoiceNum = `${String(invoice.punto_venta).padStart(4, '0')}-${String(invoice.invoice_number).padStart(8, '0')}`
        doc.fontSize(12)
        doc.text(`Nº ${invoiceNum}`, 400, 80, { width: 150, align: 'right' })

        // Date
        doc.fontSize(10)
        doc.text(`Fecha: ${formatDate(invoice.fecha_emision)}`, 400, 100, { width: 150, align: 'right' })

        // Condition
        doc.text('IVA: Monotributo', 50, 100)
    }

    private drawClientInfo(doc: PDFKit.PDFDocument, invoice: Invoice): void {
        const startY = 220

        doc.fontSize(10).font('Helvetica-Bold')
        doc.text('DATOS DEL CLIENTE', 50, startY)

        doc.font('Helvetica')
        doc.text(`Nombre/Razón Social: ${invoice.receptor_nombre}`, 50, startY + 20)

        if (invoice.receptor_cuit) {
            doc.text(`CUIT: ${formatCUIT(invoice.receptor_cuit)}`, 50, startY + 35)
        }

        doc.text(`Condición IVA: ${invoice.receptor_condicion_iva}`, 50, startY + 50)
    }

    private drawItemsTable(doc: PDFKit.PDFDocument, invoice: Invoice): void {
        const startY = 310
        const columns = {
            descripcion: { x: 50, width: 250 },
            cantidad: { x: 310, width: 60 },
            precio: { x: 380, width: 80 },
            subtotal: { x: 470, width: 75 }
        }

        // Table header
        doc.fontSize(9).font('Helvetica-Bold')
        doc.rect(50, startY, 495, 20).fill('#f0f0f0')
        doc.fillColor('#000')
        doc.text('Descripción', columns.descripcion.x + 5, startY + 5, { width: columns.descripcion.width })
        doc.text('Cant.', columns.cantidad.x + 5, startY + 5, { width: columns.cantidad.width, align: 'center' })
        doc.text('P. Unit.', columns.precio.x + 5, startY + 5, { width: columns.precio.width, align: 'right' })
        doc.text('Subtotal', columns.subtotal.x + 5, startY + 5, { width: columns.subtotal.width, align: 'right' })

        // Table rows
        doc.font('Helvetica')
        let currentY = startY + 25

        for (const item of invoice.invoice_items) {
            doc.text(item.descripcion, columns.descripcion.x + 5, currentY, { width: columns.descripcion.width })
            doc.text(String(item.cantidad), columns.cantidad.x + 5, currentY, { width: columns.cantidad.width, align: 'center' })
            doc.text(formatCurrency(item.precio_unitario), columns.precio.x + 5, currentY, { width: columns.precio.width, align: 'right' })
            doc.text(formatCurrency(item.subtotal), columns.subtotal.x + 5, currentY, { width: columns.subtotal.width, align: 'right' })

            currentY += 20
        }

        // Table border
        doc.rect(50, startY, 495, currentY - startY + 5).stroke()
    }

    private drawTotals(doc: PDFKit.PDFDocument, invoice: Invoice): void {
        const startY = 500

        doc.fontSize(10).font('Helvetica')

        // Net amount
        doc.text('Importe Neto:', 350, startY)
        doc.text(formatCurrency(invoice.importe_neto), 450, startY, { width: 95, align: 'right' })

        // IVA (for Factura C it's 0)
        if (invoice.importe_iva > 0) {
            doc.text('IVA 21%:', 350, startY + 15)
            doc.text(formatCurrency(invoice.importe_iva), 450, startY + 15, { width: 95, align: 'right' })
        }

        // Total
        doc.font('Helvetica-Bold').fontSize(12)
        doc.text('TOTAL:', 350, startY + 35)
        doc.text(formatCurrency(invoice.importe_total), 450, startY + 35, { width: 95, align: 'right' })
    }

    private drawCAE(doc: PDFKit.PDFDocument, invoice: Invoice): void {
        const startY = 600

        doc.fontSize(10).font('Helvetica-Bold')
        doc.text('DATOS AFIP', 50, startY)

        doc.font('Helvetica')
        doc.text(`CAE: ${invoice.cae}`, 50, startY + 15)
        doc.text(`Vencimiento CAE: ${invoice.cae_vencimiento ? formatDate(invoice.cae_vencimiento) : '-'}`, 50, startY + 30)
    }

    private drawFooter(doc: PDFKit.PDFDocument): void {
        const footerY = 750

        doc.fontSize(8).font('Helvetica')
        doc.text(
            'Documento generado por AI Contador - www.aicontador.com',
            50,
            footerY,
            { width: 495, align: 'center' }
        )
    }
}
