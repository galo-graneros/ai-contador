import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <DashboardNav />
            <div className="lg:pl-64">
                <DashboardHeader user={profile || { email: user.email, full_name: null }} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
