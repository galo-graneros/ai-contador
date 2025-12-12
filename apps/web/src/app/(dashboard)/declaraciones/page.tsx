import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calculator, RefreshCw, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatCurrency, getPeriod } from '@ai-contador/shared'
import clsx from 'clsx'

const declarationTypes = [
    { id: 'iva_ventas', name: 'IVA Ventas', icon: '📊' },
    { id: 'iva_compras', name: 'IVA Compras', icon: '📉' },
    { id: 'monotributo', name: 'Monotributo', icon: '💼' },
    { id: 'iibb', name: 'Ingresos Brutos', icon: '🏛️' }
]

export default async function DeclaracionesPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const periodo = getPeriod()

    // Get declarations for current period
    const { data: declarations } = await supabase
        .from('declaration_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('periodo', periodo)

    // Calculate total estimated
    const totalEstimado = declarations?.reduce((sum, d) => sum + Number(d.saldo_a_pagar), 0) || 0

    const getDeclaration = (tipo: string) =>
        declarations?.find(d => d.tipo === tipo)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Declaraciones Juradas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Período {periodo} · Estimado a pagar: {formatCurrency(totalEstimado)}
                    </p>
                </div>
                <button className="btn btn-primary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar Borradores
                </button>
            </div>

            {/* Warning */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                        Estos son borradores estimados
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Las declaraciones generadas son estimaciones basadas en tus movimientos.
                        Revisá con tu contador antes de presentar ante AFIP.
                    </p>
                </div>
            </div>

            {/* Declaration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {declarationTypes.map((type) => {
                    const declaration = getDeclaration(type.id)
                    const hasData = declaration && Number(declaration.base_imponible) > 0

                    return (
                        <div key={type.id} className="card">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{type.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {type.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{periodo}</p>
                                    </div>
                                </div>
                                {declaration ? (
                                    <span className={clsx(
                                        'badge',
                                        declaration.status === 'reviewed' ? 'badge-success' : 'badge-warning'
                                    )}>
                                        {declaration.status === 'reviewed' ? 'Revisado' : 'Borrador'}
                                    </span>
                                ) : (
                                    <span className="badge badge-info">Sin generar</span>
                                )}
                            </div>

                            {declaration ? (
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Base Imponible</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(declaration.base_imponible)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Impuesto Determinado</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(declaration.impuesto_determinado)}
                                        </span>
                                    </div>
                                    {Number(declaration.deducciones) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Deducciones</span>
                                            <span className="font-medium text-green-600">
                                                -{formatCurrency(declaration.deducciones)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Saldo a Pagar</span>
                                        <span className="text-lg font-bold text-primary-600">
                                            {formatCurrency(declaration.saldo_a_pagar)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center text-gray-500 text-sm mb-4">
                                    No hay datos suficientes para generar esta declaración
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Link
                                    href={`/declaraciones/${declaration?.id || 'generar'}?tipo=${type.id}`}
                                    className="btn btn-secondary flex-1"
                                >
                                    <Calculator className="h-4 w-4 mr-2" />
                                    {declaration ? 'Ver Detalle' : 'Generar'}
                                </Link>
                                {declaration && (
                                    <button className="btn btn-outline p-2">
                                        <FileDown className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Summary */}
            <div className="card bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80">Total Estimado a Pagar - {periodo}</p>
                        <p className="text-4xl font-bold mt-1">{formatCurrency(totalEstimado)}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm">Actualizado hoy</span>
                    </div>
                </div>
            </div>

            {/* Past Periods */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Períodos Anteriores
                </h3>
                <p className="text-gray-500 text-sm">
                    Próximamente podrás ver el historial de declaraciones de períodos anteriores.
                </p>
            </div>
        </div>
    )
}
