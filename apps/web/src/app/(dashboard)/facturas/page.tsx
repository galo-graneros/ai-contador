import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Download, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@ai-contador/shared'
import clsx from 'clsx'

export default async function FacturasPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get invoices
    const { data: invoices, count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('fecha_emision', { ascending: false })
        .limit(50)

    // Get stats
    const { data: approvedInvoices } = await supabase
        .from('invoices')
        .select('importe_total')
        .eq('user_id', user.id)
        .eq('status', 'approved')

    const totalFacturado = approvedInvoices?.reduce((sum, inv) => sum + Number(inv.importe_total), 0) || 0

    // Count by status
    const draftCount = invoices?.filter(i => i.status === 'draft').length || 0
    const approvedCount = invoices?.filter(i => i.status === 'approved').length || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Facturas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {count || 0} facturas · Total facturado: {formatCurrency(totalFacturado)}
                    </p>
                </div>
                <Link href="/facturas/nueva" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Factura
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm text-green-700 dark:text-green-400">Aprobadas</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300">{approvedCount}</p>
                </div>
                <div className="card bg-yellow-50 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Borradores</p>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{draftCount}</p>
                </div>
                <div className="card bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-400">Total Facturado</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{formatCurrency(totalFacturado)}</p>
                </div>
            </div>

            {/* AFIP Connection Warning */}
            {!invoices?.some(i => i.cae) && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                            Conectá AFIP para facturar
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Necesitás conectar tu cuenta de AFIP para emitir facturas electrónicas y obtener CAE.
                        </p>
                        <Link href="/conexiones" className="text-sm text-amber-800 dark:text-amber-200 font-medium hover:underline mt-1 inline-block">
                            Conectar ahora →
                        </Link>
                    </div>
                </div>
            )}

            {/* Invoices Table */}
            <div className="card">
                {invoices && invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                        Número
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                        Cliente
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                        Fecha
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                        Total
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                        CAE
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                        Estado
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                    {String(invoice.punto_venta).padStart(4, '0')}-
                                                    {String(invoice.invoice_number).padStart(8, '0')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                                            {invoice.receptor_nombre}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(invoice.fecha_emision)}
                                        </td>
                                        <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white text-right">
                                            {formatCurrency(invoice.importe_total)}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {invoice.cae ? (
                                                <span className="font-mono text-xs text-gray-500">{invoice.cae}</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={clsx(
                                                'badge',
                                                invoice.status === 'approved' ? 'badge-success' :
                                                    invoice.status === 'draft' ? 'badge-warning' :
                                                        invoice.status === 'rejected' ? 'badge-error' : 'badge-info'
                                            )}>
                                                {invoice.status === 'approved' ? 'Aprobada' :
                                                    invoice.status === 'draft' ? 'Borrador' :
                                                        invoice.status === 'rejected' ? 'Rechazada' : invoice.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={`/facturas/${invoice.id}`}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                </Link>
                                                {invoice.status === 'approved' && (
                                                    <Link
                                                        href={`/api/invoices/${invoice.id}/pdf`}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    >
                                                        <Download className="h-4 w-4 text-gray-500" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No hay facturas aún</p>
                        <Link href="/facturas/nueva" className="btn btn-primary">
                            Crear primera factura
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
