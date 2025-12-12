import { formatCurrency, formatDate } from '@ai-contador/shared'
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

interface Transaction {
    id: string
    description: string
    amount: number
    date: string
    type: string
    status: string
    ai_classifications?: {
        categoria_afip: string
        descripcion_limpia: string
        probabilidad: number
    } | null
}

interface RecentTransactionsProps {
    transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    if (transactions.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                    <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No hay movimientos recientes</p>
                <Link
                    href="/conexiones"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Conectá MercadoPago para sincronizar →
                </Link>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto -mx-6">
            <table className="table-premium min-w-full">
                <thead>
                    <tr>
                        <th className="pl-6 rounded-tl-lg">Descripción</th>
                        <th>Categoría IA</th>
                        <th>Fecha</th>
                        <th className="text-right">Monto</th>
                        <th className="text-center pr-6 rounded-tr-lg">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => {
                        const isIncome = transaction.type === 'income' || transaction.amount > 0
                        const classification = transaction.ai_classifications
                        const confidence = classification?.probabilidad || 0

                        return (
                            <tr
                                key={transaction.id}
                                className="group animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="pl-6">
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={clsx(
                                            'h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
                                            isIncome
                                                ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20 text-red-600 dark:text-red-400'
                                        )}>
                                            {isIncome ? (
                                                <ArrowUpRight className="h-5 w-5" />
                                            ) : (
                                                <ArrowDownRight className="h-5 w-5" />
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {classification?.descripcion_limpia || transaction.description}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {transaction.description}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-purple">
                                            {classification?.categoria_afip || 'Sin clasificar'}
                                        </span>
                                        {classification && (
                                            <ConfidenceDot confidence={confidence} />
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {formatDate(transaction.date)}
                                    </span>
                                </td>

                                <td className="text-right">
                                    <span className={clsx(
                                        'font-semibold tabular-nums',
                                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                    </span>
                                </td>

                                <td className="pr-6">
                                    <div className="flex justify-center">
                                        {transaction.status === 'pending' ? (
                                            <span className="badge badge-warning inline-flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                Pendiente
                                            </span>
                                        ) : transaction.status === 'invoiced' ? (
                                            <span className="badge badge-info inline-flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Facturado
                                            </span>
                                        ) : (
                                            <span className="badge badge-success inline-flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Clasificado
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

function ConfidenceDot({ confidence }: { confidence: number }) {
    const color = confidence >= 0.8
        ? 'bg-emerald-500'
        : confidence >= 0.6
            ? 'bg-amber-500'
            : 'bg-red-500'

    const label = confidence >= 0.8
        ? 'Alta confianza'
        : confidence >= 0.6
            ? 'Media confianza'
            : 'Baja confianza'

    return (
        <div className="group relative">
            <div className={clsx('h-2 w-2 rounded-full', color)} />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {label}: {Math.round(confidence * 100)}%
            </div>
        </div>
    )
}
