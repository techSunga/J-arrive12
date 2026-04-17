"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Map as MapIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertTriangle,
  MessageSquare
} from "lucide-react"

const adminLinks = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { name: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { name: "Flotte Livreurs", href: "/admin/livreurs", icon: Truck },
  { name: "Supervision Live", href: "/admin/live", icon: MapIcon },
  { name: "Support Client", href: "/admin/support", icon: MessageSquare },
  { name: "Finances", href: "/admin/finances", icon: DollarSign },
  { name: "Rapports", href: "/admin/rapports", icon: BarChart3 },
  { name: "Vérifications", href: "/admin/verifications", icon: ShieldCheck },
  { name: "Paramètres", href: "/admin/parametres", icon: Settings },
]

import { useAdminNotificationCount } from "@/hooks/use-supabase"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { pendingVerifications, pendingMissions } = useAdminNotificationCount()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const links = [
    { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { name: "Flotte Livreurs", href: "/admin/livreurs", icon: Truck },
    { name: "Supervision Live", href: "/admin/live", icon: MapIcon },
    { name: "Support Client", href: "/admin/support", icon: MessageSquare },
    { name: "Finances", href: "/admin/finances", icon: DollarSign },
    { name: "Rapports", href: "/admin/rapports", icon: BarChart3 },
    { 
      name: "Vérifications", 
      href: "/admin/verifications", 
      icon: ShieldCheck,
      badge: pendingVerifications > 0 ? pendingVerifications : null 
    },
    { name: "Paramètres", href: "/admin/parametres", icon: Settings },
  ]

  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-brand-orange p-1.5 rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white italic">J'ARRIVE <span className="text-[10px] bg-brand-blue text-white px-1.5 py-0.5 rounded not-italic ml-1">ADMIN</span></span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 pt-4">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5" />
                {link.name}
              </div>
              {link.badge && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        {(pendingMissions > 0 || pendingVerifications > 0) && (
          <div className="bg-slate-800/50 p-4 rounded-2xl mb-4 border border-slate-700/50">
             <div className="flex items-center gap-2 text-brand-orange mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Alertes Live</span>
             </div>
             {pendingVerifications > 0 && (
               <p className="text-[10px] text-slate-400 mb-1">• {pendingVerifications} livreur(s) attendent validation.</p>
             )}
             {pendingMissions > 0 && (
               <p className="text-[10px] text-slate-400">• {pendingMissions} mission(s) sans livreur.</p>
             )}
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-colors">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
