'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    User,
    Mail,
    Phone,
    CreditCard,
    Bell,
    Shield,
    Moon,
    Sun,
    Smartphone,
    Save,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react'
import clsx from 'clsx'

export default function ConfiguracionPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // User data
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        cuit: ''
    })

    // Notification preferences
    const [notifications, setNotifications] = useState({
        email: true,
        whatsapp: false,
        push: true,
        invoice_reminders: true,
        tax_deadlines: true,
        weekly_summary: false
    })

    // Theme
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

    useEffect(() => {
        loadUserData()
    }, [])

    async function loadUserData() {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (userData) {
                setProfile({
                    full_name: userData.full_name || '',
                    email: userData.email || user.email || '',
                    phone: userData.phone || '',
                    cuit: userData.cuit || ''
                })

                if (userData.notification_preferences) {
                    setNotifications(prev => ({
                        ...prev,
                        ...userData.notification_preferences
                    }))
                }
            }

            // Load theme from localStorage
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
            if (savedTheme) {
                setTheme(savedTheme)
            }
        } catch (err) {
            console.error('Error loading user data:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        setError(null)
        setSaved(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    cuit: profile.cuit,
                    notification_preferences: notifications,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            // Save theme preference
            localStorage.setItem('theme', theme)
            document.documentElement.classList.remove('light', 'dark')
            if (theme !== 'system') {
                document.documentElement.classList.add(theme)
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            setError(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Configuración
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Administrá tu perfil y preferencias
                </p>
            </div>

            {/* Success/Error Messages */}
            {saved && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl animate-slide-down">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                        Cambios guardados correctamente
                    </span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
                </div>
            )}

            {/* Profile Section */}
            <SettingsCard
                icon={<User className="h-5 w-5" />}
                title="Información Personal"
                description="Tu información de perfil y datos de facturación"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            value={profile.full_name}
                            onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
                            className="input"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                            />
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Teléfono
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                                className="input"
                                placeholder="+54 11 1234-5678"
                            />
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CUIT
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={profile.cuit}
                                onChange={(e) => setProfile(p => ({ ...p, cuit: e.target.value }))}
                                className="input"
                                placeholder="20-12345678-9"
                            />
                            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Notifications Section */}
            <SettingsCard
                icon={<Bell className="h-5 w-5" />}
                title="Preferencias de Notificaciones"
                description="Configurá cómo y cuándo recibir alertas"
            >
                <div className="space-y-6">
                    {/* Channels */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Canales de Notificación
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                            <NotificationChannel
                                icon={<Mail className="h-5 w-5" />}
                                label="Email"
                                enabled={notifications.email}
                                onChange={(v) => setNotifications(n => ({ ...n, email: v }))}
                            />
                            <NotificationChannel
                                icon={<Smartphone className="h-5 w-5" />}
                                label="WhatsApp"
                                enabled={notifications.whatsapp}
                                onChange={(v) => setNotifications(n => ({ ...n, whatsapp: v }))}
                            />
                            <NotificationChannel
                                icon={<Bell className="h-5 w-5" />}
                                label="Push"
                                enabled={notifications.push}
                                onChange={(v) => setNotifications(n => ({ ...n, push: v }))}
                            />
                        </div>
                    </div>

                    {/* Notification Types */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />

                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Tipos de Notificaciones
                        </h4>
                        <div className="space-y-3">
                            <ToggleItem
                                label="Recordatorios de facturas"
                                description="Recibí alertas cuando haya ingresos sin facturar"
                                enabled={notifications.invoice_reminders}
                                onChange={(v) => setNotifications(n => ({ ...n, invoice_reminders: v }))}
                            />
                            <ToggleItem
                                label="Vencimientos impositivos"
                                description="Alertas de vencimiento de monotributo, IVA, IIBB"
                                enabled={notifications.tax_deadlines}
                                onChange={(v) => setNotifications(n => ({ ...n, tax_deadlines: v }))}
                            />
                            <ToggleItem
                                label="Resumen semanal"
                                description="Recibí un resumen de tu actividad cada lunes"
                                enabled={notifications.weekly_summary}
                                onChange={(v) => setNotifications(n => ({ ...n, weekly_summary: v }))}
                            />
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Theme Section */}
            <SettingsCard
                icon={<Moon className="h-5 w-5" />}
                title="Apariencia"
                description="Personalizá el tema visual de la aplicación"
            >
                <div className="grid grid-cols-3 gap-4">
                    <ThemeOption
                        icon={<Sun className="h-5 w-5" />}
                        label="Claro"
                        selected={theme === 'light'}
                        onClick={() => setTheme('light')}
                    />
                    <ThemeOption
                        icon={<Moon className="h-5 w-5" />}
                        label="Oscuro"
                        selected={theme === 'dark'}
                        onClick={() => setTheme('dark')}
                    />
                    <ThemeOption
                        icon={<Settings className="h-5 w-5" />}
                        label="Sistema"
                        selected={theme === 'system'}
                        onClick={() => setTheme('system')}
                    />
                </div>
            </SettingsCard>

            {/* Security Section */}
            <SettingsCard
                icon={<Shield className="h-5 w-5" />}
                title="Seguridad"
                description="Gestioná tu contraseña y seguridad de la cuenta"
            >
                <button className="btn btn-secondary">
                    Cambiar Contraseña
                </button>
            </SettingsCard>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary min-w-[160px]"
                >
                    {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : saved ? (
                        <>
                            <Check className="h-5 w-5 mr-2" />
                            Guardado
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

// Import Settings icon for the component
import { Settings } from 'lucide-react'

function SettingsCard({
    icon,
    title,
    description,
    children
}: {
    icon: React.ReactNode
    title: string
    description: string
    children: React.ReactNode
}) {
    return (
        <div className="card">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </div>
    )
}

function NotificationChannel({
    icon,
    label,
    enabled,
    onChange
}: {
    icon: React.ReactNode
    label: string
    enabled: boolean
    onChange: (value: boolean) => void
}) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={clsx(
                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                enabled
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
        >
            <div className={clsx(
                'p-2 rounded-lg transition-colors',
                enabled
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            )}>
                {icon}
            </div>
            <span className={clsx(
                'font-medium',
                enabled
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
            )}>
                {label}
            </span>
            {enabled && (
                <Check className="h-4 w-4 text-indigo-500 ml-auto" />
            )}
        </button>
    )
}

function ToggleItem({
    label,
    description,
    enabled,
    onChange
}: {
    label: string
    description: string
    enabled: boolean
    onChange: (value: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div>
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={clsx(
                    'toggle',
                    enabled ? 'toggle-checked' : 'toggle-unchecked'
                )}
            >
                <span className={clsx(
                    'toggle-dot',
                    enabled ? 'translate-x-5' : 'translate-x-1'
                )} />
            </button>
        </div>
    )
}

function ThemeOption({
    icon,
    label,
    selected,
    onClick
}: {
    icon: React.ReactNode
    label: string
    selected: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
                selected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
        >
            <div className={clsx(
                'p-3 rounded-xl transition-colors',
                selected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            )}>
                {icon}
            </div>
            <span className={clsx(
                'font-medium',
                selected
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
            )}>
                {label}
            </span>
        </button>
    )
}
