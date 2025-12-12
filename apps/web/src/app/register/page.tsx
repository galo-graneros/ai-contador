'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-8 bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                        <Sparkles className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        ¡Cuenta creada!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Te enviamos un email de confirmación a <strong>{email}</strong>.
                        Revisá tu bandeja de entrada para activar tu cuenta.
                    </p>
                    <Link href="/login" className="btn btn-primary">
                        Ir a Iniciar Sesión
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Visual */}
            <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-12">
                <div className="max-w-lg text-white">
                    <h2 className="text-4xl font-bold mb-6">
                        Empezá gratis hoy
                    </h2>
                    <p className="text-lg text-white/80 mb-8">
                        Creá tu cuenta en segundos y comenzá a automatizar tu contabilidad con inteligencia artificial.
                    </p>
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <p className="text-sm font-medium mb-4">Lo que incluye el plan gratuito:</p>
                        <ul className="space-y-3 text-sm text-white/80">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Hasta 50 transacciones/mes
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Clasificación IA ilimitada
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Conexión MercadoPago
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Dashboard básico
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center px-8">
                <div className="w-full max-w-md">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <Sparkles className="h-8 w-8 text-primary-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">AI Contador</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Crear cuenta
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Completá tus datos para comenzar
                    </p>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="input pl-10"
                                    placeholder="Juan Pérez"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                required
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                Acepto los{' '}
                                <Link href="/terms" className="text-primary-600 hover:underline">
                                    términos y condiciones
                                </Link>{' '}
                                y la{' '}
                                <Link href="/privacy" className="text-primary-600 hover:underline">
                                    política de privacidad
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Crear Cuenta
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                        ¿Ya tenés cuenta?{' '}
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
