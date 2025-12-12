import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'AI Contador - Tu Asistente Contable Inteligente',
    description: 'Automatiza tu contabilidad con inteligencia artificial. Facturación AFIP, clasificación automática de gastos, y declaraciones juradas al instante.',
    keywords: ['contador', 'contabilidad', 'AFIP', 'facturación', 'monotributo', 'pymes', 'Argentina', 'AI'],
    authors: [{ name: 'AI Contador' }],
    openGraph: {
        title: 'AI Contador - Tu Asistente Contable Inteligente',
        description: 'Automatiza tu contabilidad con inteligencia artificial',
        type: 'website',
        locale: 'es_AR'
    }
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className="min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
                {children}
            </body>
        </html>
    )
}
