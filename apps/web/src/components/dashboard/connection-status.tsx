import Link from 'next/link'
import { CheckCircle2, XCircle, AlertCircle, Plus } from 'lucide-react'
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
        icon: '💳',
        description: 'Sincroniza cobros y pagos'
    },
    {
        id: 'afip',
        name: 'AFIP',
        icon: '🏛️',
        description: 'Facturación electrónica'
    }
]

export function ConnectionStatus({ connections }: ConnectionStatusProps) {
    const getConnection = (providerId: string) =>
        connections.find(c => c.provider === providerId)

    return (
        <div className="space-y-3">
            {providers.map((provider) => {
                const connection = getConnection(provider.id)
                const isConnected = connection?.status === 'active'
                const hasError = connection?.status === 'error'

                return (
                    <div
                        key={provider.id}
                        className={clsx(
                            'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                            isConnected
                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                : hasError
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                        )}
                    >
                        <span className="text-2xl">{provider.icon}</span>

                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {provider.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {isConnected && connection?.last_sync_at
                                    ? `Última sync: ${formatDate(connection.last_sync_at)}`
                                    : hasError
                                        ? 'Error de conexión'
                                        : provider.description
                                }
                            </p>
                        </div>

                        {isConnected ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : hasError ? (
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        ) : (
                            <Link
                                href={`/conexiones?connect=${provider.id}`}
                                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                            >
                                <Plus className="h-4 w-4" />
                                Conectar
                            </Link>
                        )}
                    </div>
                )
            })}

            <Link
                href="/conexiones"
                className="block text-center text-sm text-primary-600 hover:underline mt-4"
            >
                Administrar conexiones
            </Link>
        </div>
    )
}
