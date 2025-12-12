'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, LogOut, User, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardHeaderProps {
    user: {
        email?: string | null
        full_name?: string | null
    }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const router = useRouter()
    const supabase = createClient()
    const [showMenu, setShowMenu] = useState(false)
    const [showMobileNav, setShowMobileNav] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Mobile menu button */}
                <button
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    onClick={() => setShowMobileNav(!showMobileNav)}
                >
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Search */}
                <div className="hidden md:flex items-center flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Buscar movimientos, facturas..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
                    </button>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.full_name || 'Usuario'}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {user.email}
                                </p>
                            </div>
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 md:hidden">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.full_name || 'Usuario'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Cerrar Sesión
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
