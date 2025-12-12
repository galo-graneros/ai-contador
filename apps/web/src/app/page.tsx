import Link from 'next/link'
import {
    Sparkles,
    FileText,
    TrendingUp,
    Shield,
    Zap,
    BarChart3,
    ArrowRight,
    CheckCircle2
} from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient opacity-90" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <nav className="relative z-10 container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-8 w-8 text-white" />
                            <span className="text-2xl font-bold text-white">AI Contador</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/register"
                                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Comenzar Gratis
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="relative z-10 container mx-auto px-6 py-24">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in">
                            Tu Contador Personal con
                            <span className="block mt-2">Inteligencia Artificial</span>
                        </h1>
                        <p className="text-xl text-white/80 mb-8 animate-slide-up">
                            Automatiza tu facturación AFIP, clasifica gastos con IA, y genera declaraciones
                            juradas en segundos. Diseñado para pymes y monotributistas en Argentina.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                            >
                                Empezar Gratis
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
                            >
                                Ver Funcionalidades
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)" className="dark:fill-gray-900" />
                    </svg>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Todo lo que necesitás para tu contabilidad
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Simplificamos las tareas contables más tediosas para que puedas enfocarte en tu negocio.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<FileText className="h-8 w-8" />}
                            title="Facturación AFIP Automática"
                            description="Emití facturas electrónicas C directamente a AFIP. CAE al instante, sin complicaciones."
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={<Sparkles className="h-8 w-8" />}
                            title="Clasificación con IA"
                            description="Nuestro modelo de IA clasifica automáticamente tus movimientos según categorías AFIP."
                            gradient="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-8 w-8" />}
                            title="Sync MercadoPago"
                            description="Conectá tu cuenta de MercadoPago y sincronizá todos tus movimientos automáticamente."
                            gradient="from-green-500 to-emerald-500"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-8 w-8" />}
                            title="Declaraciones Juradas"
                            description="Generamos borradores de IVA, Monotributo e IIBB automáticamente cada mes."
                            gradient="from-orange-500 to-amber-500"
                        />
                        <FeatureCard
                            icon={<Shield className="h-8 w-8" />}
                            title="100% Seguro"
                            description="Tus datos están encriptados. Nunca compartimos tu información con terceros."
                            gradient="from-red-500 to-rose-500"
                        />
                        <FeatureCard
                            icon={<Zap className="h-8 w-8" />}
                            title="Notificaciones Inteligentes"
                            description="Te avisamos por WhatsApp o email sobre vencimientos y facturas pendientes."
                            gradient="from-yellow-500 to-orange-500"
                        />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-white dark:bg-gray-800">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Dejá que la IA haga el trabajo pesado
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                                Con AI Contador, pasás menos tiempo en papeles y más tiempo haciendo crecer tu negocio.
                            </p>

                            <ul className="space-y-4">
                                <BenefitItem text="Ahorrá +10 horas mensuales en tareas contables" />
                                <BenefitItem text="Nunca más te olvides de emitir una factura" />
                                <BenefitItem text="Conocé tu situación fiscal al instante" />
                                <BenefitItem text="Evitá errores en clasificación de gastos" />
                                <BenefitItem text="Recibí alertas de vencimientos importantes" />
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-3xl" />
                            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h3>
                                    <span className="text-sm text-gray-500">Diciembre 2024</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <StatCard label="Ingresos" value="$1.245.000" color="green" />
                                    <StatCard label="Gastos" value="$423.500" color="red" />
                                    <StatCard label="Facturado" value="$980.000" color="blue" />
                                    <StatCard label="Pendientes" value="3" color="yellow" />
                                </div>

                                <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                    [Gráfico de tendencias]
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-hero-gradient">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        ¿Listo para automatizar tu contabilidad?
                    </h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Unite a cientos de emprendedores que ya simplifican su vida con AI Contador.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                    >
                        Crear Cuenta Gratis
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                    <p className="mt-4 text-white/60 text-sm">
                        No se requiere tarjeta de crédito
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <Sparkles className="h-6 w-6 text-white" />
                            <span className="text-lg font-bold text-white">AI Contador</span>
                        </div>
                        <p className="text-sm">
                            © 2024 AI Contador. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description,
    gradient
}: {
    icon: React.ReactNode
    title: string
    description: string
    gradient: string
}) {
    return (
        <div className="card card-hover group">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
                {description}
            </p>
        </div>
    )
}

function BenefitItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{text}</span>
        </li>
    )
}

function StatCard({
    label,
    value,
    color
}: {
    label: string
    value: string
    color: 'green' | 'red' | 'blue' | 'yellow'
}) {
    const colors = {
        green: 'text-green-600',
        red: 'text-red-600',
        blue: 'text-blue-600',
        yellow: 'text-yellow-600'
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
        </div>
    )
}
