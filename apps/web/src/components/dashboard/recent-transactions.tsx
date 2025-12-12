import { formatCurrency, formatDate } from '@ai-contador/shared'
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

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
            <div className="py-8 text-center text-gray-500">
                No hay movimientos recientes. Conectá MercadoPago para sincronizar.
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoría
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {transactions.map((transaction) => {
                        const isIncome = transaction.type === 'income' || transaction.amount > 0
                        const classification = transaction.ai_classifications

                        return (
                            <tr
                                key={transaction.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            'h-10 w-10 rounded-full flex items-center justify-center',
                                            isIncome
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                        )}>
                                            {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                {classification?.descripcion_limpia || transaction.description}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {transaction.description}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="badge badge-info">
                                        {classification?.categoria_afip || 'Sin clasificar'}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                                    {formatDate(transaction.date)}
                                </td>
                                <td className={clsx(
                                    'py-4 px-4 text-sm font-semibold text-right',
                                    isIncome ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        {transaction.status === 'pending' ? (
                                            <span className="badge badge-warning flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Pendiente
                                            </span>
                                        ) : (
                                            <span className="badge badge-success flex items-center gap-1">
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
