"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Package, Clock, ShieldCheck, Map, Search, Filter, TrendingUp, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function MissionsDisponibles() {
  const router = useRouter()
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMissions()
    
    // Subscribe to new missions
    const channel = supabase
      .channel('public:missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchMissions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMissions(data || [])
    } catch (error) {
      console.error("Error fetching missions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptMission = async (missionId: string) => {
    setAcceptingId(missionId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Session expirée. Veuillez vous reconnecter.")
        router.push("/auth/login")
        return
      }

      const { error } = await supabase
        .from('missions')
        .update({
          driver_id: user.id,
          status: 'accepted'
        })
        .eq('id', missionId)

      if (error) throw error
      
      // Redirect to the active mission page
      router.push("/driver/mission-active")
    } catch (error: any) {
      alert("Erreur lors de l'acceptation: " + error.message)
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Missions Disponibles</h1>
          <p className="text-gray-500 font-medium">Récupérez des missions à proximité de vous</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-10 h-10 w-64 bg-white border-gray-200" placeholder="Filtrer par quartier..." />
           </div>
           <Button variant="outline" className="border-gray-200 flex gap-2 font-bold">
              <Filter className="w-4 h-4" /> Type
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                <p className="text-gray-400 font-bold">Recherche de missions en cours...</p>
              </div>
            ) : missions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
                 <Package className="w-12 h-12 text-gray-300 mb-4" />
                 <p className="text-gray-400 font-bold">Aucune mission disponible pour le moment.</p>
                 <Button variant="link" onClick={fetchMissions} className="text-brand-blue font-bold mt-2">Actualiser</Button>
              </div>
            ) : (
              <AnimatePresence>
                {missions.map((mission, i) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-orange/20 transition-all group overflow-hidden bg-white rounded-3xl">
                      <CardContent className="p-0">
                         <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="p-6 flex-1 space-y-4">
                               <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-brand-blue/10 text-brand-blue">
                                    {mission.type}
                                  </span>
                                  <span className="text-xs text-brand-orange font-bold animate-pulse">NOUVEAU</span>
                               </div>
                               <h3 className="text-lg font-black text-slate-900 leading-tight">Course • {mission.price_fcfa >= 5000 ? 'Professionnelle' : 'Standard'}</h3>
                               
                               <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                     <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-blue bg-white" />
                                     <p className="text-xs font-bold text-slate-600">{mission.origin_address}</p>
                                  </div>
                                  <div className="w-0.5 h-4 bg-dashed border-l border-gray-200 ml-1.25" />
                                  <div className="flex items-center gap-3">
                                     <MapPin className="w-2.5 h-2.5 text-brand-orange" />
                                     <p className="text-xs font-bold text-slate-600">{mission.dest_address}</p>
                                  </div>
                               </div>
                            </div>
                            <div className="p-6 w-full md:w-48 bg-gray-50/30 flex flex-col justify-between gap-4">
                               <div className="space-y-1">
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gain Net</p>
                                  <p className="text-2xl font-black text-slate-900">{mission.price_fcfa.toLocaleString()} <span className="text-xs font-bold text-gray-400">FCFA</span></p>
                               </div>
                               <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                  <span className="flex items-center gap-1"><Map className="w-3 h-3" /> Dist. inconnue</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ASAP</span>
                               </div>
                               <Button 
                                 onClick={() => handleAcceptMission(mission.id)}
                                 disabled={!!acceptingId}
                                 className="w-full bg-brand-orange hover:bg-brand-orange/90 shadow-md shadow-brand-orange/20 font-bold border-none h-11"
                               >
                                 {acceptingId === mission.id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accepter"}
                               </Button>
                            </div>
                         </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
         </div>

         <div className="lg:col-span-1">
            <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden sticky top-28 rounded-[32px]">
               <div className="h-64 bg-gray-100 relative group cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Brazzaville,Congo&zoom=13&size=400x400')] bg-cover opacity-30 grayscale group-hover:grayscale-0 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20">
                        <p className="text-xs font-bold text-brand-blue flex items-center gap-2">
                           <MapPin className="w-3 h-3" /> Carte Live (Brazzaville)
                        </p>
                     </div>
                  </div>
                  {missions.slice(0, 3).map((m, i) => (
                    <div key={m.id} className="absolute w-3 h-3 bg-brand-orange rounded-full animate-pulse" style={{ 
                      top: `${30 + i * 20}%`, 
                      left: `${30 + i * 15}%` 
                    }} />
                  ))}
               </div>
               <CardContent className="p-6">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-orange" /> Infos Trafic & Bonus
                  </h4>
                  <div className="space-y-4">
                     <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0" />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          Zone de forte demande : <span className="font-bold">Moungali & Ouenzé</span>. Restez dans ce périmètre pour plus d'opportunités.
                        </p>
                     </div>
                     <div className="flex gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                        <TrendingUp className="w-5 h-5 text-brand-orange shrink-0" />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          <span className="font-bold">Majoré !</span> +250 FCFA sur toutes les livraisons "Gaz" ce midi.
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
