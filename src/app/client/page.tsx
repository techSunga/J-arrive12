"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Plus, 
  History, 
  TrendingUp,
  Gift,
  Bot,
  Truck,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useProfile, useMissions } from "@/hooks/use-supabase"
import { useState } from "react"

export default function ClientDashboard() {
  const { profile, loading: profileLoading, refreshProfile } = useProfile()
  const { missions, loading: missionsLoading } = useMissions('client')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (profileLoading) {
     return (
        <div className="h-[80vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        </div>
     )
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-10 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header avec Statut */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-brand-blue/10">
                 {profile?.role === 'pro' ? 'Compte Professionnel' : 'Compte Particulier'}
              </span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Bienvenu, {profile?.full_name?.split(' ')[0] || 'Utilisateur'} ! 👋
           </h1>
           <p className="text-gray-500 font-medium mt-1">Heureux de vous revoir sur J'ARRIVE. Que livrons-nous aujourd'hui ?</p>
        </div>
        <div className="flex gap-4">
           <Link href="/client/commander">
              <Button className="bg-brand-blue hover:bg-brand-blue-dark text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-brand-blue/20 group border-none transition-all active:scale-95">
                 <Plus className="mr-2 w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                 Nouvel Expédition
              </Button>
           </Link>
        </div>
      </div>

      {/* Grid de Cartes de Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/client/suivi" className="block">
          <Card className="border-none shadow-premium bg-white p-6 overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Livraisons en cours</p>
                <h3 className="text-3xl font-black text-brand-blue">{missionsLoading ? '...' : missions.filter(m => m.status !== 'delivered' && m.status !== 'cancelled').length}</h3>
                <p className="inline-flex items-center text-[10px] font-black text-brand-blue mt-4 uppercase tracking-tighter">
                   Suivre en temps réel <ChevronRight className="w-3 h-3 ml-1" />
                </p>
             </div>
             <Package className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-50 group-hover:scale-110 transition-transform" />
          </Card>
        </Link>

        <Card className="border-none shadow-premium bg-white p-6 overflow-hidden relative group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Points Fidélité</p>
              <h3 className="text-3xl font-black text-brand-orange">0 <span className="text-xs uppercase opacity-40">pts</span></h3>
              <Link href="/client/fidelite" className="inline-flex items-center text-[10px] font-black text-brand-orange mt-4 hover:underline uppercase tracking-tighter">
                 Échanger mes points <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
           </div>
           <Gift className="absolute -bottom-4 -right-4 w-24 h-24 text-orange-50 group-hover:scale-110 transition-transform" />
        </Card>

        <Link href="/client/historique" className="block">
          <Card className="border-none shadow-slate-200 shadow-xl bg-slate-900 text-white p-6 overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform">
             <div className="relative z-10">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Missions Terminées</p>
                <h3 className="text-3xl font-black">{missionsLoading ? '...' : missions.filter(m => m.status === 'delivered').length}</h3>
                <p className="inline-flex items-center text-[10px] font-black text-brand-orange mt-4 uppercase tracking-tighter">
                   Voir l'historique <ChevronRight className="w-3 h-3 ml-1" />
                </p>
             </div>
             <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des Commandes Récentes */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <div className="w-2 h-8 bg-brand-blue rounded-full" />
                 Missions Récentes
              </h2>
              <Link href="/client/historique" className="text-xs font-black text-brand-blue uppercase hover:underline tracking-widest">Voir tout</Link>
           </div>
           
           <div className="space-y-4">
              {missionsLoading ? (
                 <div className="p-12 text-center text-gray-400 font-medium">Chargement des missions...</div>
              ) : missions.length === 0 ? (
                 <Card className="border-dashed border-2 border-gray-100 bg-gray-50/30 p-12 text-center">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Vous n'avez pas encore passé de commande.</p>
                    <Link href="/client/commander" className="mt-4 block">
                       <Button variant="outline" className="border-brand-blue text-brand-blue font-bold">Lancer ma première mission</Button>
                    </Link>
                 </Card>
              ) : (
                 missions.slice(0, 3).map((mission, i) => (
                    <motion.div key={mission.id} variants={itemVariants}>
                       <Link href={`/client/suivi?id=${mission.id}`}>
                          <Card className="border border-gray-50 shadow-sm bg-white hover:border-brand-blue/20 transition-all cursor-pointer group">
                             <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-blue group-hover:bg-blue-50 transition-colors">
                                      <Truck className="w-6 h-6" />
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-bold text-slate-900">{mission.dest_address}</p>
                                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">ID: {mission.id.slice(0,8)} • {mission.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                   <div className="text-right">
                                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                                         mission.status === 'delivered' ? 'text-green-600' : 
                                         mission.status === 'pending' ? 'text-orange-500' : 'text-brand-blue animate-pulse'
                                      }`}>
                                         {mission.status === 'delivered' ? 'Terminé' : 
                                          mission.status === 'pending' ? 'En attente' : 'En route'}
                                      </p>
                                      <p className="text-xs text-gray-400 font-medium">
                                         {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                                      </p>
                                   </div>
                                   <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-brand-blue transition-colors" />
                                </div>
                             </CardContent>
                          </Card>
                       </Link>
                    </motion.div>
                 ))
              )}
           </div>
        </div>

        {/* Section Interactive / Aide */}
        <div className="space-y-8">
           <Card className="border-none bg-gradient-to-br from-brand-blue to-blue-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <Bot className="w-12 h-12 mb-6" />
                 <h3 className="text-2xl font-black mb-2 leading-tight">Besoin d'aide ?</h3>
                 <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed">Notre assistant intelligent est là 24h/24 pour répondre à vos questions sur vos livraisons.</p>
                 <Link href="/client/chat">
                    <Button className="w-full bg-white text-brand-blue h-14 rounded-2xl font-black text-lg border-none shadow-lg hover:scale-[1.02] transition-transform">Démarrer le Chat</Button>
                 </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
           </Card>

           <Card className="border border-gray-100 shadow-sm bg-white p-8 rounded-[40px]">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-brand-orange" /> Adresses Favoris
              </h3>
              <div className="space-y-4">
                 {[
                   { name: "La Maison", addr: "Moungali, Rue 12", type: "Home" },
                   { name: "Bureau (Bakoula)", addr: "Centre-ville, Immeuble", type: "Work" }
                 ].map((addr, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-brand-orange opacity-40 group-hover:opacity-100 transition-opacity" />
                          <div className="space-y-0.5">
                             <p className="text-sm font-bold text-slate-900">{addr.name}</p>
                             <p className="text-[10px] text-gray-400 font-medium">{addr.addr}</p>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-blue transition-colors" />
                    </div>
                 ))}
                 <Button variant="ghost" className="w-full mt-2 text-brand-blue font-black text-[10px] uppercase tracking-widest border border-dashed border-blue-50 py-6 rounded-2xl hover:bg-blue-50/50">
                    + Ajouter une adresse
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </motion.div>
  )
}
