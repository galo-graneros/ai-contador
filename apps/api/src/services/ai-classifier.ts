import OpenAI from 'openai'
import { CATEGORIAS_AFIP, AIClassification } from '@ai-contador/shared'

interface Transaction {
    id: string
    description: string
    amount: number
    currency: string
    date: string
    type: string
    counterparty?: string | null
    raw_data?: any
}

export class AIClassifierService {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })
    }

    async classifyTransaction(transaction: Transaction): Promise<AIClassification> {
        const prompt = this.buildClassificationPrompt(transaction)

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `Eres un contador argentino experto en clasificación contable según RG 1415 y normativas AFIP. 
Tu tarea es clasificar movimientos bancarios y de MercadoPago para pymes y monotributistas.
Siempre responde ÚNICAMENTE con un objeto JSON válido, sin explicaciones adicionales.
Las categorías válidas son: ${CATEGORIAS_AFIP.join(', ')}`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })

            const content = response.choices[0]?.message?.content
            if (!content) {
                throw new Error('Empty response from AI')
            }

            const classification = JSON.parse(content) as AIClassification

            // Validate and normalize the response
            return this.normalizeClassification(classification, transaction)
        } catch (error) {
            console.error('AI classification error:', error)

            // Return a default classification if AI fails
            return this.getDefaultClassification(transaction)
        }
    }

    private buildClassificationPrompt(transaction: Transaction): string {
        const rawDataInfo = transaction.raw_data
            ? `\nDatos adicionales: ${JSON.stringify(transaction.raw_data)}`
            : ''

        return `Clasifica el siguiente movimiento contable:

Descripción: ${transaction.description}
Monto: ${transaction.amount} ${transaction.currency}
Fecha: ${transaction.date}
Tipo detectado: ${transaction.type}
Contraparte: ${transaction.counterparty || 'No especificada'}${rawDataInfo}

Responde con un JSON con esta estructura exacta:
{
  "categoria_afip": "una de las categorías AFIP válidas",
  "tipo": "ingreso" | "gasto" | "transferencia" | "impuesto",
  "proveedor_cliente": "nombre del proveedor o cliente si se puede identificar, o null",
  "descripcion_limpia": "descripción clara y profesional del movimiento",
  "probabilidad": 0.0-1.0,
  "sugerencia_factura": true si debería facturarse o solicitar factura,
  "notas": "observaciones adicionales relevantes o null"
}`
    }

    private normalizeClassification(
        classification: Partial<AIClassification>,
        transaction: Transaction
    ): AIClassification {
        // Ensure tipo is valid
        const validTipos = ['ingreso', 'gasto', 'transferencia', 'impuesto'] as const
        let tipo = classification.tipo || 'gasto'
        if (!validTipos.includes(tipo as any)) {
            tipo = transaction.amount > 0 ? 'ingreso' : 'gasto'
        }

        // Ensure categoria_afip is valid
        let categoriaAfip = classification.categoria_afip || 'Otros gastos'
        if (!CATEGORIAS_AFIP.includes(categoriaAfip as any)) {
            categoriaAfip = tipo === 'ingreso' ? 'Otros ingresos' : 'Otros gastos'
        }

        return {
            categoria_afip: categoriaAfip,
            tipo: tipo as AIClassification['tipo'],
            proveedor_cliente: classification.proveedor_cliente || null,
            descripcion_limpia: classification.descripcion_limpia || transaction.description,
            probabilidad: Math.min(1, Math.max(0, classification.probabilidad || 0.5)),
            sugerencia_factura: classification.sugerencia_factura || false,
            notas: classification.notas || null
        }
    }

    private getDefaultClassification(transaction: Transaction): AIClassification {
        const isIncome = transaction.amount > 0 || transaction.type === 'income'

        return {
            categoria_afip: isIncome ? 'Otros ingresos' : 'Otros gastos',
            tipo: isIncome ? 'ingreso' : 'gasto',
            proveedor_cliente: transaction.counterparty || null,
            descripcion_limpia: transaction.description,
            probabilidad: 0.3,
            sugerencia_factura: isIncome,
            notas: 'Clasificación automática por defecto - requiere revisión manual'
        }
    }

    async explainClassification(
        transaction: Transaction,
        classification: AIClassification | null
    ): Promise<string> {
        if (!classification) {
            return 'Este movimiento aún no ha sido clasificado.'
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un contador argentino que explica clasificaciones contables de forma clara y sencilla para clientes que no son expertos en contabilidad.'
                    },
                    {
                        role: 'user',
                        content: `Explica brevemente por qué este movimiento se clasificó así:

Movimiento: ${transaction.description}
Monto: ${transaction.amount} ${transaction.currency}

Clasificación asignada:
- Categoría AFIP: ${classification.categoria_afip}
- Tipo: ${classification.tipo}
- Sugerencia factura: ${classification.sugerencia_factura ? 'Sí' : 'No'}
${classification.notas ? `- Notas: ${classification.notas}` : ''}

Explica en 2-3 oraciones de forma simple.`
                    }
                ],
                temperature: 0.5,
                max_tokens: 200
            })

            return response.choices[0]?.message?.content || 'No se pudo generar una explicación.'
        } catch (error) {
            console.error('AI explanation error:', error)
            return 'No se pudo generar una explicación en este momento.'
        }
    }

    async batchClassify(transactions: Transaction[]): Promise<Map<string, AIClassification>> {
        const results = new Map<string, AIClassification>()

        // Process in batches of 5 to avoid rate limits
        const batchSize = 5
        for (let i = 0; i < transactions.length; i += batchSize) {
            const batch = transactions.slice(i, i + batchSize)

            const promises = batch.map(async (tx) => {
                const classification = await this.classifyTransaction(tx)
                results.set(tx.id, classification)
            })

            await Promise.all(promises)

            // Small delay between batches
            if (i + batchSize < transactions.length) {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

        return results
    }
}
