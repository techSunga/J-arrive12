"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  History, 
  Settings,
  PlusCircle,
  Menu,
  MessageCircle,
  ShieldCheck,
  BarChart3
} from "lucide-react"

export function MobileNav({ role }: { role: 'client' | 'driver' | 'admin' }) {
  const pathname = usePathname()

  const clientLinks = [
    { name: "Accueil", href: "/client", icon: LayoutDashboard },
    { name: "Chat", href: "/client/chat", icon: MessageCircle },
    { name: "Commander", href: "/client/commander", icon: PlusCircle, primary: true },
    { name: "Suivi", href: "/client/suivi", icon: MapPin },
    { name: "Missions", href: "/client/historique", icon: History },
  ]

  const driverLinks = [
    { name: "Dashboard", href: "/driver", icon: LayoutDashboard },
    { name: "Chat", href: "/driver/chat", icon: MessageCircle },
    { name: "Active", href: "/driver/mission-active", icon: MapPin, primary: true },
    { name: "Argent", href: "/driver/portefeuille", icon: History },
    { name: "Profil", href: "/driver/profil", icon: Menu },
  ]

  const adminLinks = [
    { name: "Admin", href: "/admin", icon: LayoutDashboard },
    { name: "Chat", href: "/admin/support", icon: MessageCircle },
    { name: "Vérifier", href: "/admin/verifications", icon: ShieldCheck, primary: true },
    { name: "Stats", href: "/admin/rapports", icon: BarChart3 },
    { name: "Param", href: "/admin/parametres", icon: Settings },
  ]

  const links = role === 'admin' ? adminLinks : role === 'driver' ? driverLinks : clientLinks

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-md">
       <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl flex items-center justify-around">
          {links.map((link) => {
            const isActive = pathname === link.href
            if (link.primary) {
              return (
                <Link key={link.name} href={link.href} className="relative -top-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90",
                    role === 'driver' ? "bg-brand-orange" : "bg-brand-blue"
                  )}>
                    <link.icon className="w-7 h-7 text-white" />
                  </div>
                </Link>
              )
            }
            return (
              <Link key={link.name} href={link.href} className="flex flex-col items-center gap-1 px-3 py-1">
                <link.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-brand-orange" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-white" : "text-gray-500"
                )}>{link.name}</span>
              </Link>
            )
          })}
       </div>
    </div>
  )
}
