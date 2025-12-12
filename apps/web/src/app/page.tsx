import Link from 'next/link'
import {
    Sparkles,
    FileText,
    TrendingUp,
    Shield,
    Zap,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    Users,
    Clock,
    Star
} from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
            {/* Floating Orbs Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="floating-orb floating-orb-1 top-20 -left-40" />
                <div className="floating-orb floating-orb-2 top-1/2 -right-32" />
                <div className="floating-orb floating-orb-3 bottom-20 left-1/3" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-60" />
                                <div className="relative p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold">AI Contador</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/register"
                                className="btn-primary px-5 py-2.5"
                            >
                                Comenzar Gratis
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-16 pb-32">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-300">Usado por +500 empresas en Argentina</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 animate-fade-in">
                            Tu Contador Personal con{' '}
                            <span className="gradient-text-animated">
                                Inteligencia Artificial
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                            Automatiza tu facturación AFIP, clasifica gastos con IA, y genera
                            declaraciones juradas en segundos. Diseñado para pymes y monotributistas.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:from-indigo-400 hover:to-purple-500 transition-all shadow-glow hover:shadow-glow-lg hover:scale-105"
                            >
                                Empezar Gratis
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all"
                            >
                                Ver Demo
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
                            <TrustBadge icon={<Shield className="h-5 w-5" />} text="100% Seguro" />
                            <TrustBadge icon={<Zap className="h-5 w-5" />} text="Setup en 5 min" />
                            <TrustBadge icon={<Clock className="h-5 w-5" />} text="Soporte 24/7" />
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative mt-20 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-3xl" />
                        <div className="relative bg-gray-900/80 border border-white/10 rounded-3xl p-2 shadow-2xl">
                            <div className="bg-gray-950 rounded-2xl p-6 overflow-hidden">
                                {/* Browser chrome */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="flex-1 ml-4">
                                        <div className="bg-gray-800 rounded-lg px-4 py-1.5 text-sm text-gray-400 max-w-sm mx-auto">
                                            app.aicontador.com/dashboard
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard mockup */}
                                <div className="grid grid-cols-4 gap-4">
                                    <MockStatCard label="Ingresos" value="$2.450.000" color="emerald" />
                                    <MockStatCard label="Gastos" value="$823.500" color="red" />
                                    <MockStatCard label="Balance" value="$1.626.500" color="blue" />
                                    <MockStatCard label="Facturado" value="$1.980.000" color="purple" />
                                </div>
                                <div className="mt-4 h-40 bg-gray-900 rounded-xl flex items-center justify-center">
                                    <div className="flex items-end gap-2 h-24">
                                        {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                            <div
                                                key={i}
                                                className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg opacity-80"
                                                style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="relative py-32 bg-gray-900/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            Funcionalidades
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Todo lo que necesitás para tu contabilidad
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Simplificamos las tareas contables más tediosas para que puedas enfocarte en hacer crecer tu negocio.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<FileText className="h-7 w-7" />}
                            title="Facturación AFIP Automática"
                            description="Emití facturas electrónicas C directamente a AFIP. CAE al instante, sin complicaciones."
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={<Sparkles className="h-7 w-7" />}
                            title="Clasificación con IA"
                            description="Nuestro modelo de IA clasifica automáticamente tus movimientos según categorías AFIP y RG 1415."
                            gradient="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-7 w-7" />}
                            title="Sync MercadoPago"
                            description="Conectá tu cuenta de MercadoPago y sincronizá todos tus movimientos automáticamente."
                            gradient="from-green-500 to-emerald-500"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-7 w-7" />}
                            title="Declaraciones Juradas"
                            description="Generamos borradores de IVA, Monotributo e IIBB automáticamente cada mes."
                            gradient="from-orange-500 to-amber-500"
                        />
                        <FeatureCard
                            icon={<Shield className="h-7 w-7" />}
                            title="100% Seguro"
                            description="Tus datos están encriptados con AES-256. Nunca compartimos tu información con terceros."
                            gradient="from-red-500 to-rose-500"
                        />
                        <FeatureCard
                            icon={<Zap className="h-7 w-7" />}
                            title="Notificaciones Inteligentes"
                            description="Te avisamos por WhatsApp o email sobre vencimientos y facturas pendientes automáticamente."
                            gradient="from-yellow-500 to-orange-500"
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <StatItem value="500+" label="Empresas" />
                        <StatItem value="$2B+" label="Facturado" />
                        <StatItem value="50K+" label="Facturas Emitidas" />
                        <StatItem value="99.9%" label="Uptime" />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative py-32">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-6">
                                <TrendingUp className="h-4 w-4" />
                                Beneficios
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-8">
                                Dejá que la IA haga el trabajo pesado
                            </h2>
                            <p className="text-xl text-gray-400 mb-10">
                                Con AI Contador, pasás menos tiempo en papeles y más tiempo haciendo crecer tu negocio.
                            </p>

                            <ul className="space-y-5">
                                <BenefitItem text="Ahorrá +10 horas mensuales en tareas contables" />
                                <BenefitItem text="Nunca más te olvides de emitir una factura" />
                                <BenefitItem text="Conocé tu situación fiscal al instante" />
                                <BenefitItem text="Evitá errores en clasificación de gastos" />
                                <BenefitItem text="Recibí alertas de vencimientos importantes" />
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
                            <div className="relative bg-gray-900/80 border border-white/10 rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-semibold">Panel de Control</h3>
                                    <span className="text-sm text-gray-500">Diciembre 2024</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <DemoCard label="Ingresos" value="$1.245.000" color="emerald" />
                                    <DemoCard label="Gastos" value="$423.500" color="red" />
                                    <DemoCard label="Facturado" value="$980.000" color="blue" />
                                    <DemoCard label="Pendientes" value="3" color="amber" />
                                </div>

                                <div className="bg-gray-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="h-4 w-4 text-purple-400" />
                                        <span className="text-sm font-medium">Clasificación IA</span>
                                    </div>
                                    <div className="space-y-2">
                                        <ClassificationPreview desc="Pago MercadoPago" cat="Venta Servicios" />
                                        <ClassificationPreview desc="Transferencia Banco" cat="Cobro Cliente" />
                                        <ClassificationPreview desc="Débito Automático" cat="Servicios" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32">
                <div className="absolute inset-0 hero-gradient-animated opacity-90" />
                <div className="relative container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        ¿Listo para automatizar tu contabilidad?
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Unite a cientos de emprendedores que ya simplifican su vida con AI Contador.
                    </p>
                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                    >
                        Crear Cuenta Gratis
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="mt-6 text-white/60 text-sm">
                        No se requiere tarjeta de crédito • Setup en 5 minutos
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">AI Contador</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            © 2024 AI Contador. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-400">
            <div className="text-indigo-400">{icon}</div>
            <span className="text-sm">{text}</span>
        </div>
    )
}

function MockStatCard({ label, value, color }: { label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-400',
        red: 'text-red-400',
        blue: 'text-blue-400',
        purple: 'text-purple-400'
    }
    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
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
        <div className="group relative bg-gray-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    {icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{value}</div>
            <div className="text-gray-400">{label}</div>
        </div>
    )
}

function BenefitItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-4">
            <div className="p-1 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-gray-300">{text}</span>
        </li>
    )
}

function DemoCard({ label, value, color }: { label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-400',
        red: 'text-red-400',
        blue: 'text-blue-400',
        amber: 'text-amber-400'
    }
    return (
        <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
        </div>
    )
}

function ClassificationPreview({ desc, cat }: { desc: string; cat: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{desc}</span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">{cat}</span>
        </div>
    )
}
