'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ArrowLeftRight,
    FileText,
    Calculator,
    Settings,
    Sparkles,
    Link2,
    HelpCircle,
    LogOut,
    ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { href: '/facturas', label: 'Facturas', icon: FileText },
    { href: '/declaraciones', label: 'Declaraciones', icon: Calculator },
    { href: '/conexiones', label: 'Conexiones', icon: Link2 },
    { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function DashboardNav() {
    const pathname = usePathname()

    return (
        <aside className="sidebar hidden lg:block">
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-50" />
                        <div className="relative p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">AI Contador</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Contabilidad Inteligente</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-l-[3px] border-indigo-500 ml-[-3px] pl-[calc(1rem+3px)]'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <item.icon className={clsx(
                                    "h-5 w-5 transition-all duration-300",
                                    isActive
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:scale-110"
                                )} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="h-4 w-4 ml-auto text-indigo-400 animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 space-y-2">
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-4" />

                    {/* Help Link */}
                    <Link
                        href="/ayuda"
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300"
                    >
                        <HelpCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Ayuda y Soporte
                    </Link>

                    {/* Pro Upgrade Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 mt-4">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-white/90" />
                                <span className="font-semibold text-white">Upgrade a Pro</span>
                            </div>
                            <p className="text-xs text-white/70 mb-3">
                                Desbloquea todas las funciones avanzadas
                            </p>
                            <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors">
                                Ver planes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
