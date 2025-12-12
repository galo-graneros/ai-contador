// Format currency for Argentina
export function formatCurrency(
    amount: number,
    currency: string = 'ARS',
    locale: string = 'es-AR'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

// Format date for Argentina
export function formatDate(
    date: Date | string,
    options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }
): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-AR', options).format(d)
}

// Format CUIT with dashes
export function formatCUIT(cuit: string): string {
    const clean = cuit.replace(/\D/g, '')
    if (clean.length !== 11) return cuit
    return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`
}

// Parse CUIT to clean format
export function parseCUIT(cuit: string): string {
    return cuit.replace(/\D/g, '')
}

// Validate CUIT (basic Argentinian CUIT validation)
export function isValidCUIT(cuit: string): boolean {
    const clean = cuit.replace(/\D/g, '')
    if (clean.length !== 11) return false

    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    let sum = 0

    for (let i = 0; i < 10; i++) {
        sum += parseInt(clean[i]) * multipliers[i]
    }

    const mod = sum % 11
    const verifier = mod === 0 ? 0 : mod === 1 ? 9 : 11 - mod

    return verifier === parseInt(clean[10])
}

// Get period string (YYYY-MM) from date
export function getPeriod(date: Date = new Date()): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Parse period string to start/end dates
export function getPeriodDates(period: string): { start: Date; end: Date } {
    const [year, month] = period.split('-').map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59, 999)
    return { start, end }
}

// Calculate VAT amount (21%)
export function calculateIVA(neto: number, alicuota: number = 21): number {
    return neto * (alicuota / 100)
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
}

// Slugify text for URLs
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// Generate random alphanumeric string
export function generateId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// Delay function for async operations
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry function with exponential backoff
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
            if (i < maxRetries - 1) {
                await delay(baseDelay * Math.pow(2, i))
            }
        }
    }

    throw lastError
}

// Chunk array into smaller arrays
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T
    } catch {
        return fallback
    }
}
