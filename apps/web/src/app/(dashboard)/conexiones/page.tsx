'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api'
import {
    Link2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Upload,
    Loader2
} from 'lucide-react'
import clsx from 'clsx'

interface Connection {
    id: string
    provider: string
    status: string
    last_sync_at: string | null
    error_message: string | null
}

export default function ConexionesPage() {
    const supabase = createClient()
    const [connections, setConnections] = useState<Connection[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState<string | null>(null)
    const [showAfipModal, setShowAfipModal] = useState(false)

    useEffect(() => {
        loadConnections()
    }, [])

    const loadConnections = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const response = await api.getConnections(session.access_token)
            setConnections(response.connections || [])
        } catch (error) {
            console.error('Failed to load connections:', error)
        } finally {
            setLoading(false)
        }
    }

    const connectMercadoPago = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const response = await api.getMPAuthUrl(session.access_token)
            window.location.href = response.authUrl
        } catch (error) {
            console.error('Failed to get MP auth URL:', error)
        }
    }

    const syncConnection = async (provider: string) => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        setSyncing(provider)
        try {
            await api.syncConnection(session.access_token, provider)
            await loadConnections()
        } catch (error) {
            console.error('Failed to sync:', error)
        } finally {
            setSyncing(null)
        }
    }

    const getConnection = (provider: string) =>
        connections.find(c => c.provider === provider)

    const mpConnection = getConnection('mercadopago')
    const afipConnection = getConnection('afip')

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Conexiones
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Conectá tus cuentas externas para sincronizar datos automáticamente
                </p>
            </div>

            {/* Connection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MercadoPago */}
                <div className="card">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-3xl">
                            💳
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    MercadoPago
                                </h3>
                                <StatusBadge status={mpConnection?.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Sincroniza cobros, pagos y movimientos de tu cuenta de MercadoPago
                            </p>
                        </div>
                    </div>

                    {mpConnection?.status === 'active' ? (
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Última sincronización</span>
                                <span className="text-gray-900 dark:text-white">
                                    {mpConnection.last_sync_at
                                        ? new Date(mpConnection.last_sync_at).toLocaleString('es-AR')
                                        : 'Nunca'
                                    }
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => syncConnection('mercadopago')}
                                    disabled={syncing === 'mercadopago'}
                                    className="btn btn-secondary flex-1"
                                >
                                    {syncing === 'mercadopago' ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Sincronizar
                                </button>
                                <button className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50">
                                    Desconectar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={connectMercadoPago}
                            className="btn btn-primary w-full mt-4"
                        >
                            <Link2 className="h-4 w-4 mr-2" />
                            Conectar MercadoPago
                        </button>
                    )}

                    {mpConnection?.status === 'error' && mpConnection.error_message && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
                            {mpConnection.error_message}
                        </div>
                    )}
                </div>

                {/* AFIP */}
                <div className="card">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-3xl">
                            🏛️
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    AFIP
                                </h3>
                                <StatusBadge status={afipConnection?.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Emití facturas electrónicas y obtené CAE directamente desde AFIP
                            </p>
                        </div>
                    </div>

                    {afipConnection?.status === 'active' ? (
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Estado</span>
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Certificado válido
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary flex-1">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Verificar
                                </button>
                                <button className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50">
                                    Desconectar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAfipModal(true)}
                            className="btn btn-primary w-full mt-4"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Cargar Certificado AFIP
                        </button>
                    )}

                    <a
                        href="https://www.afip.gob.ar/ws/WSAA/wsaa_obtener_certificado_produccion.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary-600 hover:underline mt-3"
                    >
                        ¿Cómo obtener el certificado?
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </div>

            {/* Info Section */}
            <div className="card bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    ¿Por qué conectar estas cuentas?
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Sincronización automática de movimientos</span>
                    </div>
                    <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Clasificación inteligente con IA</span>
                    </div>
                    <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Facturación AFIP con CAE al instante</span>
                    </div>
                    <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Declaraciones juradas automáticas</span>
                    </div>
                </div>
            </div>

            {/* AFIP Modal */}
            {showAfipModal && (
                <AfipConnectionModal onClose={() => setShowAfipModal(false)} onSuccess={loadConnections} />
            )}
        </div>
    )
}

function StatusBadge({ status }: { status?: string }) {
    if (!status) {
        return <span className="badge badge-info">No conectado</span>
    }

    switch (status) {
        case 'active':
            return (
                <span className="badge badge-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Conectado
                </span>
            )
        case 'error':
            return (
                <span className="badge badge-error flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Error
                </span>
            )
        case 'pending':
            return (
                <span className="badge badge-warning flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Pendiente
                </span>
            )
        default:
            return <span className="badge">{status}</span>
    }
}

function AfipConnectionModal({
    onClose,
    onSuccess
}: {
    onClose: () => void
    onSuccess: () => void
}) {
    const supabase = createClient()
    const [cuit, setCuit] = useState('')
    const [certificate, setCertificate] = useState('')
    const [privateKey, setPrivateKey] = useState('')
    const [puntoVenta, setPuntoVenta] = useState('1')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            await api.connectAFIP(session.access_token, {
                cuit: cuit.replace(/\D/g, ''),
                certificate,
                privateKey,
                puntoVenta: parseInt(puntoVenta)
            })
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error al conectar AFIP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Conectar AFIP
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Cargá tu certificado digital para facturar
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            CUIT
                        </label>
                        <input
                            type="text"
                            value={cuit}
                            onChange={(e) => setCuit(e.target.value)}
                            className="input"
                            placeholder="20-12345678-9"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Punto de Venta
                        </label>
                        <input
                            type="number"
                            value={puntoVenta}
                            onChange={(e) => setPuntoVenta(e.target.value)}
                            className="input"
                            min="1"
                            max="99999"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Certificado (PEM)
                        </label>
                        <textarea
                            value={certificate}
                            onChange={(e) => setCertificate(e.target.value)}
                            className="input min-h-[100px] font-mono text-xs"
                            placeholder="-----BEGIN CERTIFICATE-----"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Clave Privada (PEM)
                        </label>
                        <textarea
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            className="input min-h-[100px] font-mono text-xs"
                            placeholder="-----BEGIN RSA PRIVATE KEY-----"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Conectar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
