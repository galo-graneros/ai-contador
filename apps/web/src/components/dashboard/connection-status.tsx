import Link from 'next/link'
import { CheckCircle2, XCircle, AlertCircle, Plus, RefreshCw, ExternalLink } from 'lucide-react'
import { formatDate } from '@ai-contador/shared'
import clsx from 'clsx'

interface Connection {
    provider: string
    status: string
    last_sync_at: string | null
}

interface ConnectionStatusProps {
    connections: Connection[]
}

const providers = [
    {
        id: 'mercadopago',
        name: 'MercadoPago',
        icon: '/mp-icon.svg',
        emoji: '💳',
        description: 'Sincroniza cobros y pagos',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'afip',
        name: 'AFIP',
        icon: '/afip-icon.svg',
        emoji: '🏛️',
        description: 'Facturación electrónica',
        color: 'from-indigo-500 to-purple-500'
    }
]

export function ConnectionStatus({ connections }: ConnectionStatusProps) {
    const getConnection = (providerId: string) =>
        connections.find(c => c.provider === providerId)

    return (
        <div className="space-y-4">
            {providers.map((provider, index) => {
                const connection = getConnection(provider.id)
                const isConnected = connection?.status === 'active'
                const hasError = connection?.status === 'error'
                const isPending = connection?.status === 'pending'

                return (
                    <div
                        key={provider.id}
                        className={clsx(
                            'group relative overflow-hidden rounded-xl p-4 transition-all duration-300 animate-fade-in',
                            isConnected
                                ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50'
                                : hasError
                                    ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-700/50'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Gradient overlay on connection */}
                        {isConnected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                        )}

                        <div className="relative flex items-center gap-4">
                            {/* Provider Icon */}
                            <div className={clsx(
                                'flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-2xl',
                                isConnected
                                    ? 'bg-white dark:bg-gray-900 shadow-sm'
                                    : `bg-gradient-to-br ${provider.color} text-white`
                            )}>
                                {isConnected ? provider.emoji : provider.emoji}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {provider.name}
                                    </p>
                                    {isConnected && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            Conectado
                                        </span>
                                    )}
                                    {hasError && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                                            Error
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {isConnected && connection?.last_sync_at
                                        ? `Última sync: ${formatDate(connection.last_sync_at)}`
                                        : hasError
                                            ? 'Revisar credenciales'
                                            : provider.description
                                    }
                                </p>
                            </div>

                            {/* Action */}
                            <div className="flex-shrink-0">
                                {isConnected ? (
                                    <button className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors group-hover:scale-110">
                                        <RefreshCw className="h-5 w-5" />
                                    </button>
                                ) : hasError ? (
                                    <Link
                                        href={`/conexiones?connect=${provider.id}`}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Reconectar
                                    </Link>
                                ) : (
                                    <Link
                                        href={`/conexiones?connect=${provider.id}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all hover:scale-105 shadow-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Conectar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Manage Link */}
            <Link
                href="/conexiones"
                className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
            >
                <span>Administrar todas las conexiones</span>
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </div>
    )
}
