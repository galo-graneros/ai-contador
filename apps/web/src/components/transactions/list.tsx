'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@ai-contador/shared'
import {
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    Eye,
    Sparkles
} from 'lucide-react'
import clsx from 'clsx'

interface Transaction {
    id: string
    description: string
    amount: number
    date: string
    type: string
    status: string
    counterparty?: string | null
    ai_classifications?: {
        categoria_afip: string
        tipo: string
        descripcion_limpia: string
        probabilidad: number
    } | null
}

interface TransactionsListProps {
    transactions: Transaction[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export function TransactionsList({ transactions, pagination }: TransactionsListProps) {
    const router = useRouter()

    if (transactions.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500 mb-4">No se encontraron movimientos</p>
                <Link href="/conexiones" className="btn btn-primary">
                    Conectar MercadoPago
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                Descripción
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                Categoría IA
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                Fecha
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                Monto
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                Confianza
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.map((tx) => {
                            const isIncome = tx.type === 'income' || tx.amount > 0
                            const classification = tx.ai_classifications
                            const confidence = classification?.probabilidad || 0

                            return (
                                <tr
                                    key={tx.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                                                isIncome
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                            )}>
                                                {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                    {classification?.descripcion_limpia || tx.description}
                                                </p>
                                                {tx.counterparty && (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {tx.counterparty}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        {classification ? (
                                            <span className="badge badge-info">
                                                {classification.categoria_afip}
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning">
                                                Sin clasificar
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className={clsx(
                                        'py-4 px-4 text-sm font-semibold text-right',
                                        isIncome ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center">
                                            {classification ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={clsx(
                                                                'h-full rounded-full',
                                                                confidence >= 0.8 ? 'bg-green-500' :
                                                                    confidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                                            )}
                                                            style={{ width: `${confidence * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {Math.round(confidence * 100)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={`/movimientos/${tx.id}`}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Ver detalle"
                                            >
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            </Link>
                                            {!classification && (
                                                <button
                                                    className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                    title="Clasificar con IA"
                                                >
                                                    <Sparkles className="h-4 w-4 text-primary-600" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500">
                        Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                        {pagination.total} resultados
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/movimientos?page=${pagination.page - 1}`)}
                            disabled={pagination.page === 1}
                            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => router.push(`/movimientos?page=${pagination.page + 1}`)}
                            disabled={pagination.page === pagination.totalPages}
                            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
