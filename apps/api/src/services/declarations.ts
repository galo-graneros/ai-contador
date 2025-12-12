import { supabase } from '../lib/supabase.js'
import { getPeriodDates, IIBB_ALICUOTAS, MONOTRIBUTO_CATEGORIAS } from '@ai-contador/shared'

type DeclarationType = 'iva_ventas' | 'iva_compras' | 'monotributo' | 'iibb' | 'ganancias'

interface DeclarationDraft {
    id?: string
    user_id: string
    periodo: string
    tipo: DeclarationType
    base_imponible: number
    impuesto_determinado: number
    deducciones: number
    saldo_a_pagar: number
    detalles: Record<string, any>
    status: 'draft' | 'reviewed' | 'submitted'
    notas: string | null
}

export class DeclarationService {
    async generateDraft(
        userId: string,
        periodo: string,
        tipo: DeclarationType
    ): Promise<DeclarationDraft> {
        const { start, end } = getPeriodDates(periodo)

        switch (tipo) {
            case 'iva_ventas':
                return this.generateIvaVentas(userId, periodo, start, end)
            case 'iva_compras':
                return this.generateIvaCompras(userId, periodo, start, end)
            case 'monotributo':
                return this.generateMonotributo(userId, periodo, start, end)
            case 'iibb':
                return this.generateIIBB(userId, periodo, start, end)
            case 'ganancias':
                return this.generateGanancias(userId, periodo, start, end)
            default:
                throw new Error(`Unknown declaration type: ${tipo}`)
        }
    }

    private async generateIvaVentas(
        userId: string,
        periodo: string,
        start: Date,
        end: Date
    ): Promise<DeclarationDraft> {
        // Get all income transactions for the period
        const { data: invoices } = await supabase
            .from('invoices')
            .select('importe_neto, importe_iva, importe_total')
            .eq('user_id', userId)
            .eq('status', 'approved')
            .gte('fecha_emision', start.toISOString().split('T')[0])
            .lte('fecha_emision', end.toISOString().split('T')[0])

        const totals = invoices?.reduce(
            (acc, inv) => ({
                neto: acc.neto + Number(inv.importe_neto),
                iva: acc.iva + Number(inv.importe_iva),
                total: acc.total + Number(inv.importe_total)
            }),
            { neto: 0, iva: 0, total: 0 }
        ) || { neto: 0, iva: 0, total: 0 }

        const draft: DeclarationDraft = {
            user_id: userId,
            periodo,
            tipo: 'iva_ventas',
            base_imponible: totals.neto,
            impuesto_determinado: totals.iva,
            deducciones: 0,
            saldo_a_pagar: totals.iva,
            detalles: {
                cantidad_comprobantes: invoices?.length || 0,
                importe_neto: totals.neto,
                iva_21: totals.iva,
                total_facturado: totals.total
            },
            status: 'draft',
            notas: null
        }

        return this.saveDraft(draft)
    }

    private async generateIvaCompras(
        userId: string,
        periodo: string,
        start: Date,
        end: Date
    ): Promise<DeclarationDraft> {
        // Get all expense transactions with classifications
        const { data: transactions } = await supabase
            .from('transactions')
            .select(`
        amount,
        ai_classifications (tipo)
      `)
            .eq('user_id', userId)
            .eq('type', 'expense')
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())

        const totalGastos = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0

        // Estimate IVA based on 21% average (simplified)
        const ivaEstimado = totalGastos * 0.21 / 1.21

        const draft: DeclarationDraft = {
            user_id: userId,
            periodo,
            tipo: 'iva_compras',
            base_imponible: totalGastos - ivaEstimado,
            impuesto_determinado: ivaEstimado,
            deducciones: 0,
            saldo_a_pagar: 0, // IVA compras is a credit
            detalles: {
                total_gastos: totalGastos,
                iva_credito_fiscal: ivaEstimado,
                cantidad_transacciones: transactions?.length || 0
            },
            status: 'draft',
            notas: 'IVA estimado al 21%. Verificar comprobantes de compra para cálculo exacto.'
        }

        return this.saveDraft(draft)
    }

    private async generateMonotributo(
        userId: string,
        periodo: string,
        start: Date,
        end: Date
    ): Promise<DeclarationDraft> {
        // Get income for the last 12 months to determine category
        const twelveMonthsAgo = new Date(end)
        twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

        const { data: invoices } = await supabase
            .from('invoices')
            .select('importe_total')
            .eq('user_id', userId)
            .eq('status', 'approved')
            .gte('fecha_emision', twelveMonthsAgo.toISOString().split('T')[0])
            .lte('fecha_emision', end.toISOString().split('T')[0])

        const ingresosAnuales = invoices?.reduce((sum, inv) => sum + Number(inv.importe_total), 0) || 0

        // Determine monotributo category
        let categoria = MONOTRIBUTO_CATEGORIAS[0]
        for (const cat of MONOTRIBUTO_CATEGORIAS) {
            if (ingresosAnuales <= cat.ingresosBrutosAnuales) {
                categoria = cat
                break
            }
        }

        const draft: DeclarationDraft = {
            user_id: userId,
            periodo,
            tipo: 'monotributo',
            base_imponible: ingresosAnuales,
            impuesto_determinado: categoria.cuotaMensual,
            deducciones: 0,
            saldo_a_pagar: categoria.cuotaMensual,
            detalles: {
                categoria: categoria.categoria,
                ingresos_anuales: ingresosAnuales,
                limite_categoria: categoria.ingresosBrutosAnuales,
                cuota_mensual: categoria.cuotaMensual
            },
            status: 'draft',
            notas: `Categoría ${categoria.categoria} basada en ingresos de los últimos 12 meses.`
        }

        return this.saveDraft(draft)
    }

    private async generateIIBB(
        userId: string,
        periodo: string,
        start: Date,
        end: Date
    ): Promise<DeclarationDraft> {
        // Get income for the period
        const { data: invoices } = await supabase
            .from('invoices')
            .select('importe_total')
            .eq('user_id', userId)
            .eq('status', 'approved')
            .gte('fecha_emision', start.toISOString().split('T')[0])
            .lte('fecha_emision', end.toISOString().split('T')[0])

        const ingresosMes = invoices?.reduce((sum, inv) => sum + Number(inv.importe_total), 0) || 0

        // Use default aliquot (this should be based on user's jurisdiction)
        const alicuota = IIBB_ALICUOTAS.DEFAULT
        const impuesto = ingresosMes * (alicuota / 100)

        const draft: DeclarationDraft = {
            user_id: userId,
            periodo,
            tipo: 'iibb',
            base_imponible: ingresosMes,
            impuesto_determinado: impuesto,
            deducciones: 0,
            saldo_a_pagar: impuesto,
            detalles: {
                ingresos_brutos: ingresosMes,
                alicuota: alicuota,
                cantidad_comprobantes: invoices?.length || 0
            },
            status: 'draft',
            notas: `Alícuota por defecto ${alicuota}%. Verificar alícuota según jurisdicción.`
        }

        return this.saveDraft(draft)
    }

    private async generateGanancias(
        userId: string,
        periodo: string,
        start: Date,
        end: Date
    ): Promise<DeclarationDraft> {
        // This is a simplified annual ganancias estimate
        const { data: income } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
            .eq('type', 'income')
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())

        const { data: expenses } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
            .eq('type', 'expense')
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())

        const totalIncome = income?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
        const totalExpenses = expenses?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0
        const ganancia = totalIncome - totalExpenses

        // Simplified tax calculation (35% for highest bracket)
        const impuestoEstimado = ganancia > 0 ? ganancia * 0.35 : 0

        const draft: DeclarationDraft = {
            user_id: userId,
            periodo,
            tipo: 'ganancias',
            base_imponible: ganancia,
            impuesto_determinado: impuestoEstimado,
            deducciones: totalExpenses,
            saldo_a_pagar: impuestoEstimado,
            detalles: {
                ingresos_totales: totalIncome,
                gastos_deducibles: totalExpenses,
                ganancia_neta: ganancia,
                alicuota_estimada: 35
            },
            status: 'draft',
            notas: 'Cálculo simplificado. Consultar con contador para deducciones específicas.'
        }

        return this.saveDraft(draft)
    }

    private async saveDraft(draft: DeclarationDraft): Promise<DeclarationDraft> {
        const { data, error } = await supabase
            .from('declaration_drafts')
            .upsert({
                ...draft,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,periodo,tipo'
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to save declaration draft: ${error.message}`)
        }

        return data as DeclarationDraft
    }

    async generateAllDrafts(userId: string, periodo: string): Promise<DeclarationDraft[]> {
        const tipos: DeclarationType[] = ['iva_ventas', 'iva_compras', 'monotributo', 'iibb']
        const drafts: DeclarationDraft[] = []

        for (const tipo of tipos) {
            try {
                const draft = await this.generateDraft(userId, periodo, tipo)
                drafts.push(draft)
            } catch (error) {
                console.error(`Failed to generate ${tipo} draft:`, error)
            }
        }

        return drafts
    }
}
