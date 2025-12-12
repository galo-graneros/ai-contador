'use client'

import { useEffect, useState } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { createClient } from '@/lib/supabase/client'

interface MonthlyChartProps {
    userId: string
}

interface ChartData {
    month: string
    income: number
    expenses: number
}

export function MonthlyChart({ userId }: MonthlyChartProps) {
    const [data, setData] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const months = 6
            const chartData: ChartData[] = []

            for (let i = months - 1; i >= 0; i--) {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
                const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount, type')
                    .eq('user_id', userId)
                    .gte('date', startOfMonth.toISOString())
                    .lte('date', endOfMonth.toISOString())

                let income = 0
                let expenses = 0

                transactions?.forEach(t => {
                    const amount = Number(t.amount)
                    if (t.type === 'income' || amount > 0) {
                        income += Math.abs(amount)
                    } else {
                        expenses += Math.abs(amount)
                    }
                })

                chartData.push({
                    month: date.toLocaleString('es-AR', { month: 'short' }),
                    income,
                    expenses
                })
            }

            setData(chartData)
            setLoading(false)
        }

        fetchData()
    }, [userId, supabase])

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="spinner" />
            </div>
        )
    }

    if (data.every(d => d.income === 0 && d.expenses === 0)) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos para mostrar. Conectá MercadoPago para ver tus movimientos.
            </div>
        )
    }

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`
        }
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`
        }
        return `$${value}`
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, '']}
                        labelStyle={{ color: '#111827' }}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="income"
                        name="Ingresos"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                    />
                    <Area
                        type="monotone"
                        dataKey="expenses"
                        name="Gastos"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
