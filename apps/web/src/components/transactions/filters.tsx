'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { useState } from 'react'

export function TransactionsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('search') || '')

    const currentStatus = searchParams.get('status')
    const currentType = searchParams.get('type')

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.delete('page') // Reset to first page
        router.push(`/movimientos?${params.toString()}`)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateFilter('search', search || null)
    }

    const clearFilters = () => {
        router.push('/movimientos')
        setSearch('')
    }

    const hasFilters = currentStatus || currentType || searchParams.get('search')

    return (
        <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por descripción..."
                            className="input pl-10"
                        />
                    </div>
                </form>

                {/* Status filter */}
                <select
                    value={currentStatus || ''}
                    onChange={(e) => updateFilter('status', e.target.value || null)}
                    className="input w-full md:w-48"
                >
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="classified">Clasificados</option>
                    <option value="invoiced">Facturados</option>
                </select>

                {/* Type filter */}
                <select
                    value={currentType || ''}
                    onChange={(e) => updateFilter('type', e.target.value || null)}
                    className="input w-full md:w-48"
                >
                    <option value="">Todos los tipos</option>
                    <option value="income">Ingresos</option>
                    <option value="expense">Gastos</option>
                    <option value="transfer">Transferencias</option>
                </select>

                {/* Clear filters */}
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="btn btn-secondary whitespace-nowrap"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar
                    </button>
                )}
            </div>
        </div>
    )
}
