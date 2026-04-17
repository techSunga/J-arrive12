"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, TrendingUp, Medal, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type DriverProfile = {
  id: string
  full_name: string
  total_pts: number
  missions_completed: number
  rating: number
  avatar_url?: string
}

export default function ClassementPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchRanking()
    
    // Subscribe to realtime updates on profiles table
    const channel = supabase.channel('driver_ranking_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: "role=eq.driver" },
        (payload) => {
          fetchRanking() // Refetch the list when points/ratings update
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchRanking = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, total_pts, missions_completed, rating, avatar_url')
      .eq('role', 'driver')
      .order('total_pts', { ascending: false })

    if (data) {
      setDrivers(data as DriverProfile[])
    }
    setLoading(false)
  }

  const getInitials = (name?: string) => {
    if (!name) return "DR"
    const parts = name.split(' ')
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Mise à jour du classement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex p-3 bg-brand-orange/10 rounded-3xl mb-2 text-brand-orange">
           <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Elite J'ARRIVE</h1>
        <p className="text-gray-500 font-medium">Rejoignez le top des livreurs et débloquez des bonus exclusifs chaque mois.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            {drivers.map((driver, index) => {
              const rank = index + 1
              const isMe = driver.id === currentUserId
              
              return (
                <Card key={driver.id} className={`border border-gray-100 shadow-sm transition-all overflow-hidden ${isMe ? 'ring-2 ring-brand-orange shadow-xl shadow-brand-orange/5' : 'bg-white'}`}>
                   <CardContent className="p-6 flex items-center gap-6">
                      <div className="flex flex-col items-center gap-1 w-12 shrink-0">
                         {rank <= 3 ? (
                           <div className={`p-1 rounded-full ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : 'bg-orange-400'}`}>
                              <Medal className="w-6 h-6 text-white" />
                           </div>
                         ) : <span className="text-xl font-black text-gray-300">#{rank}</span>}
                      </div>

                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-brand-blue border-2 border-white shadow-sm shrink-0">
                         {getInitials(driver.full_name)}
                      </div>

                      <div className="flex-1">
                         <p className="font-bold text-slate-900">
                           {driver.full_name || "Livreur Anonyme"} {isMe && "(Vous)"}
                         </p>
                         <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mt-1">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-current" /> {driver.rating?.toFixed(1) || "5.0"}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {driver.missions_completed || 0} missions</span>
                         </div>
                      </div>

                      <div className="text-right">
                         <p className="text-xl font-black text-brand-orange">{driver.total_pts?.toLocaleString() || 0} <span className="text-[10px] uppercase">pts</span></p>
                         {rank <= 5 && (
                           <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">+ {300 - (rank * 50)} FCFA Bonus</p>
                         )}
                      </div>
                   </CardContent>
                </Card>
              )
            })}
            
            {drivers.length === 0 && (
              <div className="text-center p-8 bg-gray-50 rounded-[32px] text-gray-500">
                Aucun livreur évalué pour le moment.
              </div>
            )}
         </div>

         <div className="space-y-6">
            <Card className="bg-brand-blue p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6">Récompense de Rang</h3>
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl h-fit"><Trophy className="text-yellow-400" /></div>
                        <div>
                           <p className="font-bold">Top 1 de la semaine</p>
                           <p className="text-sm opacity-70">Gagnez un plein de carburant offert.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl h-fit"><TrendingUp className="text-green-400" /></div>
                        <div>
                           <p className="font-bold">Meilleure Progression</p>
                           <p className="text-sm opacity-70">Commission réduite de moitié.</p>
                        </div>
                     </div>
                  </div>
                  <Button className="w-full mt-10 bg-white text-brand-blue h-12 font-bold border-none hover:bg-gray-100">Voir mon historique de rang</Button>
               </div>
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white opacity-5 rounded-full" />
            </Card>
         </div>
      </div>
    </div>
  )
}
