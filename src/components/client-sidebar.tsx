"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  CreditCard, 
  History, 
  Settings, 
  Bell, 
  MessageSquare,
  Star,
  Gift,
  LogOut,
  Truck,
  User,
  HelpCircle
} from "lucide-react"

const sidebarLinks = [
  { name: "Accueil", href: "/client", icon: LayoutDashboard },
  { name: "Mon Profil", href: "/client/profil", icon: User },
  { name: "Commander", href: "/client/commander", icon: Package },
  { name: "Suivi Colis", href: "/client/suivi", icon: MapPin },
  { name: "Tarifs", href: "/client/tarifs", icon: CreditCard },
  { name: "Historique", href: "/client/historique", icon: History },
  { name: "Notifications", href: "/client/notifications", icon: Bell },
  { name: "Fidélité", href: "/client/fidelite", icon: Gift },
  { name: "Avis", href: "/client/avis", icon: Star },
  { name: "Messages", href: "/client/chat", icon: MessageSquare },
  { name: "Paramètres", href: "/client/parametres", icon: Settings },
  { name: "Centre d'Aide", href: "/client/aide", icon: HelpCircle },
]

export default function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-brand-orange p-1.5 rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-brand-blue italic">J'ARRIVE</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-brand-blue"
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
