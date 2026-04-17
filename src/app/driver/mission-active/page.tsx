"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Phone, MessageSquare, CheckCircle2, ChevronLeft, Flag, Info, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { ChatDialog } from "@/components/chat-dialog"

export default function MissionActive() {
  const router = useRouter()
  const [mission, setMission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchActiveMission()
    const channel = supabase
      .channel('driver-active-mission')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchActiveMission()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchActiveMission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          client:client_id (
            full_name,
            phone
          )
        `)
        .eq('driver_id', user.id)
        .in('status', ['accepted', 'picked_up'])
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No active mission
          setMission(null)
        } else {
          throw error
        }
      } else {
        setMission(data)
      }
    } catch (error) {
      console.error("Error fetching active mission:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = async () => {
    if (!mission) return
    setUpdating(true)
    
    const nextStatus = mission.status === 'accepted' ? 'picked_up' : 'delivered'
    
    try {
      const { error } = await supabase
        .from('missions')
        .update({ status: nextStatus, delivered_at: nextStatus === 'delivered' ? new Date().toISOString() : null })
        .eq('id', mission.id)

      if (error) throw error
      
      if (nextStatus === 'delivered') {
        router.push("/driver/historique")
      } else {
        await fetchActiveMission()
      }
    } catch (error: any) {
      alert("Erreur: " + error.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="mt-4 text-gray-500 font-bold">Chargement de votre mission...</p>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-gray-100 p-6 rounded-full">
           <CheckCircle2 className="w-12 h-12 text-gray-400" />
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-900">Aucune mission active</h2>
           <p className="text-gray-500">Allez dans "Missions Disponibles" pour en trouver une.</p>
        </div>
        <Link href="/driver/missions">
           <Button className="bg-brand-blue font-bold px-8">Voir les missions</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 bg-white">
      <div className="flex justify-between items-center px-2">
         <div className="flex items-center gap-4">
            <Link href="/driver">
               <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <ChevronLeft className="w-6 h-6" />
               </Button>
            </Link>
            <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mission en cours</h1>
               <p className="text-gray-500 font-medium">#{mission.id.slice(0, 8)} • {mission.type}</p>
            </div>
         </div>
         <div className="flex gap-3">
            <Button variant="outline" className="border-red-100 text-red-500 hover:bg-red-50 font-bold flex gap-2">
               <Flag className="w-4 h-4" /> Signaler
            </Button>
            <Button 
               onClick={handleNextStep}
               disabled={updating}
               className="bg-brand-orange text-white font-bold px-8 shadow-lg shadow-brand-orange/20"
            >
               {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                mission.status === 'accepted' ? "Colis Récupéré" : "Terminer la Livraison"}
            </Button>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
         {/* Live Map for Driver */}
         <div className="flex-1 bg-white rounded-3xl relative overflow-hidden shadow-premium border border-gray-100">
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Brazzaville,Congo&zoom=15&size=800x800&scale=2')] bg-cover opacity-40 grayscale-[0.5]" />
            
            <svg className="absolute inset-0 w-full h-full">
               <motion.path
                d="M 100 500 L 250 350 L 500 300"
                stroke="#007BFF"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
               />
            </svg>

            <div className="absolute top-[300px] left-[500px] -translate-x-1/2 -translate-y-1/2">
               <div className="relative">
                  <div className="absolute -inset-8 bg-brand-blue/20 rounded-full animate-ping" />
                  <div className="bg-brand-blue p-3 rounded-full shadow-2xl relative border-4 border-white">
                     <MapPin className="w-6 h-6 text-white" />
                  </div>
               </div>
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-6 min-w-[300px]">
               <div className="bg-white/20 p-4 rounded-2xl">
                  <Navigation className="w-8 h-8 rotate-90" />
               </div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">Dans 300 mètres</p>
                  <p className="text-xl font-bold">Tournez à droite</p>
                  <p className="text-xs opacity-70">Avenue de l'Indépendance</p>
               </div>
            </div>
         </div>

         {/* Mission Sidebar */}
         <aside className="w-full lg:w-[400px] flex flex-col gap-6">
            <Card className="border border-gray-100 shadow-sm overflow-hidden bg-white">
               <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                  <h3 className="font-bold text-slate-900">Information Commande</h3>
                  <p className="text-xs font-bold text-brand-orange uppercase">{mission.type}</p>
               </div>
               <CardContent className="p-6 space-y-8">
                  <div className="space-y-6">
                     <div className={`flex gap-4 items-start relative pb-8 border-l-2 ${mission.status !== 'accepted' ? 'border-green-500' : 'border-brand-blue'} ml-2 pl-6`}>
                        <div className={`absolute top-0 -left-[11px] w-5 h-5 rounded-full border-4 border-white shadow-sm ${mission.status !== 'accepted' ? 'bg-green-500' : 'bg-brand-blue'}`} />
                        <div className="flex-1">
                           <p className={`text-[10px] uppercase font-black mb-1 ${mission.status !== 'accepted' ? 'text-green-500' : 'text-brand-blue'}`}>
                             Étape 1 : Récupération {mission.status !== 'accepted' && "✓"}
                           </p>
                           <p className="font-bold text-slate-900 leading-tight">{mission.origin_address}</p>
                           <p className="text-xs text-gray-500">Brazzaville, Congo</p>
                        </div>
                     </div>
                     <div className="flex gap-4 items-start ml-2 pl-6">
                        <div className={`w-5 h-5 rounded-full border-4 border-white shadow-sm ${mission.status === 'picked_up' ? 'bg-brand-blue' : 'bg-gray-200'}`} />
                        <div className="flex-1">
                           <p className={`text-[10px] uppercase font-black mb-1 ${mission.status === 'picked_up' ? 'text-brand-blue' : 'text-gray-400'}`}>Étape 2 : Livraison</p>
                           <p className="font-bold text-slate-900 leading-tight">{mission.dest_address}</p>
                           <p className="text-xs text-gray-500">Point de destination</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl space-y-4 border border-gray-100">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                           {mission.client?.full_name?.[0] || "C"}
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-black text-slate-900">{mission.client?.full_name || "Client J'ARRIVE"}</p>
                           <p className="text-xs text-gray-400">Paiement : <span className="text-green-600 font-bold">{mission.payment_status === 'paid' ? 'Payé via MoMo' : 'En attente'}</span></p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <Button className="bg-white text-brand-blue border border-blue-100 font-bold hover:bg-blue-50 flex gap-2">
                           <Phone className="w-4 h-4" /> Appeler
                        </Button>
                        <ChatDialog 
                            missionId={mission.id}
                            currentUserId={mission.driver_id}
                            otherUserName={mission.client?.full_name || "Client"}
                            trigger={
                               <Button className="bg-white text-brand-orange border border-orange-100 font-bold hover:bg-orange-50 flex gap-2">
                                  <MessageSquare className="w-4 h-4" /> Chat
                               </Button>
                            }
                         />
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="bg-slate-900 p-6 rounded-[32px] text-white flex items-center justify-between shadow-xl">
               <div>
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Gain Garanti</p>
                  <p className="text-2xl font-black">{mission.price_fcfa.toLocaleString()} <span className="text-xs">FCFA</span></p>
               </div>
               <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
               </div>
            </div>
         </aside>
      </div>
    </div>
  )
}
