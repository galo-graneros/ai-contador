const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface FetchOptions extends RequestInit {
    token?: string
}

export async function apiClient<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { token, ...fetchOptions } = options

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
}

// Typed API methods
export const api = {
    // Dashboard
    getDashboard: (token: string) =>
        apiClient<any>('/api/dashboard', { token }),

    getChartData: (token: string, months = 6) =>
        apiClient<any>(`/api/dashboard/charts/monthly?months=${months}`, { token }),

    getCategoryData: (token: string) =>
        apiClient<any>('/api/dashboard/charts/categories', { token }),

    // Connections
    getConnections: (token: string) =>
        apiClient<any>('/api/connections', { token }),

    getMPAuthUrl: (token: string) =>
        apiClient<{ authUrl: string }>('/api/connections/mercadopago/auth-url', { token }),

    connectMP: (token: string, code: string) =>
        apiClient<any>('/api/connections/mercadopago/callback', {
            token,
            method: 'POST',
            body: JSON.stringify({ code })
        }),

    connectAFIP: (token: string, data: any) =>
        apiClient<any>('/api/connections/afip', {
            token,
            method: 'POST',
            body: JSON.stringify(data)
        }),

    syncConnection: (token: string, provider: string) =>
        apiClient<any>(`/api/connections/${provider}/sync`, {
            token,
            method: 'POST'
        }),

    // Transactions
    getTransactions: (token: string, params?: Record<string, any>) => {
        const searchParams = new URLSearchParams(params || {})
        return apiClient<any>(`/api/transactions?${searchParams}`, { token })
    },

    getTransaction: (token: string, id: string) =>
        apiClient<any>(`/api/transactions/${id}`, { token }),

    getTransactionStats: (token: string) =>
        apiClient<any>('/api/transactions/stats/summary', { token }),

    // AI Classification
    classifyTransaction: (token: string, id: string) =>
        apiClient<any>(`/api/ai/classify/${id}`, { token, method: 'POST' }),

    batchClassify: (token: string, limit = 20) =>
        apiClient<any>('/api/ai/classify-batch', {
            token,
            method: 'POST',
            body: JSON.stringify({ limit })
        }),

    explainClassification: (token: string, id: string) =>
        apiClient<any>(`/api/ai/explain/${id}`, { token, method: 'POST' }),

    // Invoices
    getInvoices: (token: string, params?: Record<string, any>) => {
        const searchParams = new URLSearchParams(params || {})
        return apiClient<any>(`/api/invoices?${searchParams}`, { token })
    },

    getInvoice: (token: string, id: string) =>
        apiClient<any>(`/api/invoices/${id}`, { token }),

    createInvoice: (token: string, data: any) =>
        apiClient<any>('/api/invoices', {
            token,
            method: 'POST',
            body: JSON.stringify(data)
        }),

    submitInvoice: (token: string, id: string) =>
        apiClient<any>(`/api/invoices/${id}/submit`, { token, method: 'POST' }),

    getInvoiceStats: (token: string) =>
        apiClient<any>('/api/invoices/stats/summary', { token }),

    // Declarations
    getDeclarations: (token: string, params?: Record<string, any>) => {
        const searchParams = new URLSearchParams(params || {})
        return apiClient<any>(`/api/declarations?${searchParams}`, { token })
    },

    getDeclaration: (token: string, id: string) =>
        apiClient<any>(`/api/declarations/${id}`, { token }),

    generateDeclaration: (token: string, periodo: string, tipo: string) =>
        apiClient<any>('/api/declarations/generate', {
            token,
            method: 'POST',
            body: JSON.stringify({ periodo, tipo })
        }),

    getDeclarationSummary: (token: string) =>
        apiClient<any>('/api/declarations/summary/current', { token })
}
