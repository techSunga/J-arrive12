"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Truck, MapPin, Clock, CheckCircle2, AlertCircle, Search, Filter, Mail, Phone, ExternalLink, UserPlus } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLive() {
  const [missions, setMissions] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMissions()
    fetchVerifiedDrivers()
    
    const channel = supabase
      .channel('admin-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
        fetchMissions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchVerifiedDrivers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver')
      .eq('is_verified', true)
    setDrivers(data || [])
  }

  const handleAssign = async (missionId: string, driverId: string) => {
    try {
      setAssigningId(missionId)
      const { error } = await supabase
        .from('missions')
        .update({
          driver_id: driverId,
          status: 'accepted' // 'accepted' signifies the mission is taken
        })
        .eq('id', missionId)
      
      if (error) throw error
    } catch (e: any) {
      alert("Erreur lors de l'assignation: " + e.message)
    } finally {
      setAssigningId(null)
    }
  }

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        client:client_id (full_name, phone),
        driver:driver_id (full_name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(20)
    
    setMissions(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Monitor</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Activités en Temps Réel</h1>
           <p className="text-gray-500 font-medium">Surveillance globale de la flotte et des commandes</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Missions Actives</p>
                 <p className="text-xl font-black text-brand-blue">{missions.filter(m => m.status !== 'delivered').length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                 <Truck className="w-5 h-5" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <AnimatePresence mode="popLayout">
            {missions.map((mission, i) => (
              <motion.div
                key={mission.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`border-none shadow-premium transition-all ${
                  mission.status === 'pending' ? 'bg-orange-50/30 ring-1 ring-orange-100' : 'bg-white'
                }`}>
                   <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100/50">
                         {/* Status & ID */}
                         <div className="p-6 lg:w-48 flex flex-col justify-between items-start gap-4">
                            <Badge className={`uppercase text-[10px] font-black tracking-widest ${
                              mission.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              mission.status === 'pending' ? 'bg-brand-orange text-white' : 'bg-brand-blue text-white'
                            }`}>
                               {mission.status === 'pending' ? 'En attente' :
                                mission.status === 'accepted' ? 'Assigné' :
                                mission.status === 'picked_up' ? 'Transit' : 'Livré'}
                            </Badge>
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID Commande</p>
                               <p className="text-sm font-black text-slate-900">#{mission.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(mission.created_at).toLocaleTimeString()}</p>
                         </div>

                         {/* Itinerary */}
                         <div className="p-6 flex-1 space-y-4">
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                  <span className="text-[10px] font-black text-slate-400">TYPE:</span>
                                  <span className="text-[10px] font-black text-slate-900 uppercase">{mission.type}</span>
                               </div>
                               <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                  <span className="text-[10px] font-black text-slate-400">PRIX:</span>
                                  <span className="text-[10px] font-black text-slate-900">{mission.price_fcfa.toLocaleString()} FCFA</span>
                               </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                     <MapPin className="w-4 h-4 text-brand-blue" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Point de Départ</p>
                                     <p className="text-sm font-bold text-slate-900 truncate">{mission.origin_address}</p>
                                  </div>
                               </div>
                               <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                     <MapPin className="w-4 h-4 text-brand-orange" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                     <p className="text-sm font-bold text-slate-900 truncate">{mission.dest_address}</p>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Parties */}
                         <div className="p-6 lg:w-80 space-y-4">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black border border-gray-100">C</div>
                                  <div>
                                     <p className="text-xs font-black text-slate-900">{mission.client?.full_name || 'Client'}</p>
                                     <p className="text-[10px] text-gray-400 font-bold">{mission.client?.phone || 'Pas de numéro'}</p>
                                  </div>
                               </div>
                               <ExternalLink className="w-4 h-4 text-gray-300" />
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border border-gray-100 ${
                                    mission.driver_id ? 'bg-orange-100 text-brand-orange' : 'bg-gray-50 text-gray-300 border-dashed'
                                  }`}>
                                     {mission.driver_id ? 'L' : '?'}
                                  </div>
                                  <div>
                                     <p className="text-xs font-black text-slate-900">{mission.driver?.full_name || 'Non assigné'}</p>
                                     <p className="text-[10px] text-gray-400 font-bold">{mission.driver_id ? mission.driver?.phone : 'Recherche...'}</p>
                                  </div>
                               </div>
                               {mission.status === 'pending' && !mission.driver_id ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button className="text-[10px] px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold shadow-md hover:scale-105 active:scale-95 transition-all outline-none flex items-center gap-1">
                                        <UserPlus className="w-3 h-3" /> Assigner
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md border-none shadow-premium rounded-[32px] p-6 bg-white overflow-hidden">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl font-black text-slate-900">Assigner un Livreur</DialogTitle>
                                        <p className="text-sm text-gray-500 font-medium">Sélectionnez un partenaire disponible pour la commande #{mission.id.slice(0, 8)}</p>
                                      </DialogHeader>
                                      <div className="space-y-4 mt-6 max-h-72 overflow-y-auto pr-2">
                                        {drivers.length === 0 ? (
                                          <p className="text-sm text-gray-400 font-bold text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">Aucun livreur vérifié disponible.</p>
                                        ) : (
                                          drivers.map(driver => (
                                            <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg hover:border-brand-orange/20 transition-all group">
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-black">
                                                  {driver.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                  <p className="text-sm font-black text-slate-900">{driver.full_name}</p>
                                                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {driver.phone || 'Non renseigné'}
                                                  </p>
                                                </div>
                                              </div>
                                              <button 
                                                disabled={assigningId === mission.id}
                                                onClick={() => handleAssign(mission.id, driver.id)}
                                                className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:bg-brand-orange disabled:opacity-50"
                                              >
                                                Choisir
                                              </button>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                               ) : (
                                  <ExternalLink className="w-4 h-4 text-gray-300" />
                               )}
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>
    </div>
  )
}
