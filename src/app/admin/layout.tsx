"use client"

import AdminSidebar from "@/components/admin-sidebar"
import { Bell, Search, Truck, ShieldAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/mobile-nav"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAdminNotificationCount } from "@/hooks/use-supabase"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [adminProfile, setAdminProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const { total: notifCount, pendingVerifications, pendingMissions } = useAdminNotificationCount()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profile?.role !== 'admin') {
        router.push('/auth/login')
      } else {
        setAdminProfile(profile)
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [router])

  if (!authChecked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-bold tracking-widest uppercase">Vérification admin...</p>
      </div>
    )
  }

  const adminInitial = adminProfile?.full_name?.charAt(0)?.toUpperCase() || 'A'
  const adminName = adminProfile?.full_name || 'Administrateur'

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
        {/* Admin Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          {/* Logo (mobile only) */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="bg-brand-orange p-1.5 rounded-lg">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
          </div>

          {/* Search (desktop) */}
          <div className="hidden md:block relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input className="pl-10 h-10 bg-gray-50 border-none rounded-full" placeholder="Rechercher..." />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Notification bell with real badge */}
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                title={`${pendingVerifications} vérification(s) en attente, ${pendingMissions} mission(s) en attente`}
              >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-orange text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-0.5 animate-pulse">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>

              {/* Tooltip breakdown */}
              {notifCount > 0 && (
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-48 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl z-50 pointer-events-none">
                  <p>{pendingVerifications} dossier(s) à vérifier</p>
                  <p>{pendingMissions} mission(s) en attente</p>
                </div>
              )}
            </div>

            {/* Admin profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{adminName}</p>
                <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest leading-none">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black border-2 border-brand-orange/30 shrink-0">
                {adminInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Alert bar if pending verifications */}
        {pendingVerifications > 0 && (
          <div className="mx-4 md:mx-8 mt-4 flex items-center gap-3 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-2xl text-sm">
            <ShieldAlert className="w-4 h-4 text-brand-orange shrink-0" />
            <span className="font-bold text-brand-orange">
              {pendingVerifications} livreur{pendingVerifications > 1 ? 's' : ''} en attente de vérification
            </span>
            <button
              onClick={() => router.push('/admin/verifications')}
              className="ml-auto text-[10px] font-black uppercase tracking-widest bg-brand-orange text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Traiter →
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-8 pb-32 lg:pb-8">
          {children}
        </div>

        <MobileNav role="admin" />
      </main>
    </div>
  )
}
