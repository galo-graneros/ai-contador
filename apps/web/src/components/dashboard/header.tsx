'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Bell,
    Search,
    LogOut,
    User,
    Menu,
    Settings,
    Moon,
    Sun,
    ChevronDown,
    X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

interface DashboardHeaderProps {
    user: {
        email?: string | null
        full_name?: string | null
        avatar_url?: string | null
    }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const router = useRouter()
    const supabase = createClient()
    const [showMenu, setShowMenu] = useState(false)
    const [showMobileNav, setShowMobileNav] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.classList.toggle('dark')
    }

    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.slice(0, 2).toUpperCase() || 'US'

    return (
        <header className="sticky top-0 z-40 glass-card border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Mobile menu button */}
                <button
                    className="lg:hidden p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 active:scale-95"
                    onClick={() => setShowMobileNav(!showMobileNav)}
                >
                    {showMobileNav ? (
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                </button>

                {/* Search Bar */}
                <div className="hidden md:flex items-center flex-1 max-w-md">
                    <div className="relative w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                        <input
                            type="search"
                            placeholder="Buscar movimientos, facturas..."
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border border-transparent rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-200/80 dark:bg-gray-700/80 rounded">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 active:scale-95"
                    >
                        {isDarkMode ? (
                            <Sun className="h-5 w-5 text-amber-500" />
                        ) : (
                            <Moon className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 active:scale-95"
                        >
                            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" />
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="dropdown-menu w-80 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        <NotificationItem
                                            title="Movimiento clasificado"
                                            description="3 nuevos movimientos fueron clasificados por IA"
                                            time="Hace 5 min"
                                            type="info"
                                        />
                                        <NotificationItem
                                            title="Factura emitida"
                                            description="CAE generado correctamente para factura #0001"
                                            time="Hace 1 hora"
                                            type="success"
                                        />
                                        <NotificationItem
                                            title="Vencimiento próximo"
                                            description="Monotributo vence en 3 días"
                                            time="Hace 2 horas"
                                            type="warning"
                                        />
                                    </div>
                                    <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                                        <Link
                                            href="/notificaciones"
                                            className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Ver todas
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                        >
                            {/* Avatar */}
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Avatar"
                                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-gray-800"
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-glow-sm">
                                    <span className="text-sm font-semibold text-white">{initials}</span>
                                </div>
                            )}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.full_name || 'Usuario'}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                    {user.email}
                                </p>
                            </div>
                            <ChevronDown className={clsx(
                                "hidden md:block h-4 w-4 text-gray-400 transition-transform duration-200",
                                showMenu && "rotate-180"
                            )} />
                        </button>

                        {/* User Dropdown */}
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="dropdown-menu w-56 z-50">
                                    {/* Mobile user info */}
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 md:hidden">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {user.full_name || 'Usuario'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    <Link href="/configuracion" className="dropdown-item">
                                        <Settings className="h-4 w-4 text-gray-400" />
                                        <span>Configuración</span>
                                    </Link>

                                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />

                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

function NotificationItem({
    title,
    description,
    time,
    type
}: {
    title: string
    description: string
    time: string
    type: 'info' | 'success' | 'warning'
}) {
    const colors = {
        info: 'bg-blue-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500'
    }

    return (
        <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
                <div className={`h-2 w-2 rounded-full ${colors[type]} mt-2 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{description}</p>
                    <p className="text-xs text-gray-400 mt-1">{time}</p>
                </div>
            </div>
        </div>
    )
}
