"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Map, 
  Navigation, 
  History, 
  Trophy, 
  Wallet, 
  User, 
  Settings, 
  LogOut,
  Truck,
  Power
} from "lucide-react"
import { useState } from "react"

const driverLinks = [
  { name: "Tableau de bord", href: "/driver", icon: LayoutDashboard },
  { name: "Missions disponibles", href: "/driver/missions", icon: Map },
  { name: "Mission active", href: "/driver/mission-active", icon: Navigation },
  { name: "Historique", href: "/driver/historique", icon: History },
  { name: "Classement", href: "/driver/classement", icon: Trophy },
  { name: "Mon Portefeuille", href: "/driver/portefeuille", icon: Wallet },
  { name: "Profil Livreur", href: "/driver/profil", icon: User },
  { name: "Paramètres", href: "/driver/parametres", icon: Settings },
]

export default function DriverSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const [isOnline, setIsOnline] = useState(true)

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-brand-orange p-1.5 rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-brand-blue italic">J'ARRIVE <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded not-italic ml-1">LIVREUR</span></span>
        </Link>
      </div>

      <div className="px-6 mb-6">
         <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${isOnline ? 'border-green-100 bg-green-50 text-green-700' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
         >
            <div className="flex items-center gap-2">
               <Power className="w-4 h-4" />
               <span className="text-sm font-bold">{isOnline ? 'EN LIGNE' : 'HORS LIGNE'}</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
         </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {driverLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-brand-orange"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
