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
    HelpCircle
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
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <Sparkles className="h-8 w-8 text-primary-600" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">AI Contador</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Help */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/ayuda"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                    >
                        <HelpCircle className="h-5 w-5" />
                        Ayuda y Soporte
                    </Link>
                </div>
            </div>
        </aside>
    )
}
