"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle2, Truck, Clock, AlertCircle, Loader2, ChevronRight, MessageSquare } from "lucide-react"
import { useMissions } from "@/hooks/use-supabase"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const { missions, loading } = useMissions('client')

  // Filter for missions that have recent activity or are active
  const activeMissions = missions.filter(m => m.status !== 'pending')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement de vos alertes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-gray-500 font-medium">Restez informé de l'état de vos livraisons</p>
      </div>

      <div className="space-y-4">
        {activeMissions.length === 0 ? (
          <Card className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] bg-white">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">Vous n'avez aucune notification pour le moment.</p>
          </Card>
        ) : (
          activeMissions.map((mission, i) => {
            const statusConfig: Record<string, { icon: any; color: string; label: string; desc: string }> = {
              accepted: { 
                icon: CheckCircle2, 
                color: "text-brand-blue bg-blue-50", 
                label: "Mission Acceptée", 
                desc: "Un livreur a accepté votre mission et se dirige vers le point de départ." 
              },
              picked_up: { 
                icon: Truck, 
                color: "text-brand-orange bg-orange-50", 
                label: "Colis en transit", 
                desc: "Le livreur a récupéré votre colis. Il est en route !" 
              },
              delivered: { 
                icon: CheckCircle2, 
                color: "text-green-600 bg-green-50", 
                label: "Livraison effectuée", 
                desc: "Votre colis a été livré avec succès. N'oubliez pas de noter le livreur." 
              },
              cancelled: { 
                icon: AlertCircle, 
                color: "text-red-600 bg-red-50", 
                label: "Mission Annulée", 
                desc: "Cette mission a été annulée. Contactez le support si besoin." 
              }
            }

            const config = statusConfig[mission.status] || { 
                icon: Clock, 
                color: "text-gray-400 bg-gray-50", 
                label: "Mise à jour", 
                desc: "Statut mis à jour." 
            }

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/client/suivi?id=${mission.id}`}>
                    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-[32px] overflow-hidden bg-white">
                    <CardContent className="p-6 flex items-start gap-6">
                        <div className={`p-4 rounded-2xl ${config.color} shrink-0`}>
                            <config.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-black text-slate-900 leading-tight">{config.label}</h3>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{mission.id.slice(0, 8)}</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-3">{config.desc}</p>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black bg-gray-50 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">
                                    {new Date(mission.updated_at || mission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {mission.status !== 'delivered' && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-blue uppercase tracking-widest">
                                        <Truck className="w-3 h-3" /> Suivre le live
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-brand-blue transition-colors self-center" />
                    </CardContent>
                    </Card>
                </Link>
              </motion.div>
            )
          })
        )}
      </div>
      
      {/* Simulation / Tips */}
      <Card className="border-none bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group">
          <div className="relative z-10 flex gap-6 items-center">
              <div className="hidden md:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center shrink-0">
                  <MessageSquare className="w-8 h-8 text-brand-orange" />
              </div>
              <div>
                  <h4 className="text-xl font-black mb-2 leading-tight">Centre de Support</h4>
                  <p className="text-white/60 text-sm font-medium leading-relaxed">Une question sur une notification ? Discutez en direct avec nos agents disponibles 24h/7.</p>
              </div>
              <Link href="/client/chat" className="ml-auto">
                <Button className="bg-brand-orange hover:bg-orange-600 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-brand-orange/20 border-none transition-transform active:scale-95">Discuter</Button>
              </Link>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </div>
  )
}
