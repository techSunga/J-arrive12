"use client"

import ClientSidebar from "@/components/client-sidebar"
import { Bell, Search, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import Chatbot from "@/components/chatbot"
import { MobileNav } from "@/components/mobile-nav"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useClientNotificationCount } from "@/hooks/use-supabase"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const { count: notifCount } = useClientNotificationCount()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      } else {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [router])

  if (!authChecked) {
    return (
       <div className="h-screen flex items-center justify-center bg-white">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
       </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar />
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
             <div className="bg-brand-orange p-1.5 rounded-lg">
                <Truck className="w-4 h-4 text-white" />
             </div>
             <span className="text-lg font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
          </div>

          <div className="hidden md:block relative w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input className="pl-10 h-10 bg-gray-100/50 border-none rounded-xl" placeholder="Recherche..." />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <button 
                onClick={() => router.push('/client/notifications')}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
             >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-orange text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-0.5 animate-pulse">
                    {notifCount}
                  </span>
                )}
             </button>
             <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-100">
                <div className="hidden sm:block text-right">
                   <p className="text-xs md:text-sm font-bold truncate max-w-[100px]">Client</p>
                   <p className="text-[10px] text-brand-orange font-black uppercase tracking-widest leading-none">Gold</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold text-xs md:text-base">
                   C
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 pb-32 lg:pb-8">
          {children}
        </div>
        
        <MobileNav role="client" />
        <Chatbot />
      </main>
    </div>
  )
}
