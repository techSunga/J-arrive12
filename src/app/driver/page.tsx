"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Truck, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Wallet, 
  Star,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useProfile, useMissions } from "@/hooks/use-supabase"

export default function DriverDashboard() {
  const { profile, loading: profileLoading } = useProfile()
  const { missions, loading: missionsLoading } = useMissions('driver')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const activeMissions = missions.filter(m => m.status === 'accepted' || m.status === 'picked_up')
  const availableMissions = missions.filter(m => m.status === 'pending')

  if (profileLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
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
      {/* Header Driver */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-green-200 shadow-sm">
                 Nouveau Livreur
              </span>
              <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-yellow-200">
                 N/A <Star className="w-2.5 h-2.5 inline-block fill-current -mt-0.5" />
              </span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Bienvenu, {profile?.full_name?.split(' ')[0] || 'Livreur'} ! 🛵
           </h1>
           <p className="text-gray-500 font-medium mt-1">Prêt pour votre première livraison ?</p>
        </div>
        <div className="flex gap-4">
           <Link href="/driver/missions">
              <Button className="bg-brand-orange hover:bg-orange-600 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-brand-orange/20 border-none transition-all active:scale-95">
                 Découvrir les Missions
                 <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
           </Link>
        </div>
      </div>

      {/* Stats rapides Livreur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-premium bg-white p-6 overflow-hidden relative group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mission Active</p>
              <h3 className="text-3xl font-black text-brand-orange">
                {activeMissions.length > 0 ? '1' : 'Aucune'}
              </h3>
              {activeMissions.length > 0 ? (
                <Link href="/driver/mission-active" className="inline-flex items-center text-[10px] font-black text-brand-orange mt-4 hover:underline uppercase tracking-tighter">
                   Voir la mission en cours <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              ) : (
                <p className="text-[10px] font-black text-gray-300 mt-4 uppercase tracking-tighter italic">En attente de mission</p>
              )}
           </div>
           <Truck className="absolute -bottom-4 -right-4 w-24 h-24 text-orange-50 group-hover:scale-110 transition-transform" />
        </Card>

        <Card className="border-none shadow-premium bg-white p-6 overflow-hidden relative group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gains du Jour</p>
              <h3 className="text-3xl font-black text-slate-900">0 <span className="text-xs uppercase opacity-40">FCFA</span></h3>
              <Link href="/driver/portefeuille" className="inline-flex items-center text-[10px] font-black text-brand-blue mt-4 hover:underline uppercase tracking-tighter">
                 Consulter mon portefeuille <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
           </div>
           <Wallet className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-50 group-hover:scale-110 transition-transform" />
        </Card>

        <Card className="border-none shadow-premium bg-brand-orange text-white p-6 overflow-hidden relative group">
           <div className="relative z-10">
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Missions Disponibles</p>
              <h3 className="text-3xl font-black">{missionsLoading ? '...' : availableMissions.length}</h3>
              <Link href="/driver/missions" className="inline-flex items-center text-[10px] font-black text-white mt-4 hover:underline uppercase tracking-tighter">
                 Voir les offres <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
           </div>
           <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Missions Disponibles - Liste Rapide */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <div className="w-2 h-8 bg-brand-orange rounded-full" />
                 Missions Prioritaires
              </h2>
              <Link href="/driver/missions" className="text-xs font-black text-brand-orange uppercase hover:underline tracking-widest">Voir tout</Link>
           </div>
           
           <div className="space-y-4">
              {missionsLoading ? (
                <div className="p-12 text-center text-gray-400 font-medium">Chargement des missions...</div>
              ) : availableMissions.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-100 bg-gray-50/30 p-12 text-center">
                   <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                   <p className="text-gray-400 font-medium">Aucune nouvelle mission disponible pour le moment.</p>
                </Card>
              ) : (
                availableMissions.slice(0, 3).map((mission) => (
                  <Card key={mission.id} className="border border-gray-50 shadow-sm bg-white hover:border-brand-orange/20 transition-all cursor-pointer group">
                     <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                              <MapPin className="w-6 h-6" />
                           </div>
                           <div className="space-y-1">
                              <p className="font-bold text-slate-900 truncate max-w-[200px]">{mission.dest_address}</p>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{mission.price_fcfa} FCFA • {mission.type}</p>
                           </div>
                        </div>
                        <Link href="/driver/missions">
                           <Button variant="ghost" className="text-brand-orange font-black text-[10px] uppercase tracking-widest group-hover:bg-orange-50 rounded-xl">Accepter</Button>
                        </Link>
                     </CardContent>
                  </Card>
                ))
              )}
           </div>
        </div>

        {/* Section Score & Performance */}
        <div className="space-y-8">
           <Card className="border-none bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <ShieldCheck className="w-12 h-12 mb-6 text-brand-orange" />
                 <h3 className="text-2xl font-black mb-2 leading-tight">Score Livraison</h3>
                 <div className="text-5xl font-black text-brand-orange mb-4">0%</div>
                 <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Bienvenue parmi nous ! Complétez vos premières missions pour faire grimper votre score.</p>
                 <Link href="/driver/classement">
                    <Button className="w-full bg-brand-orange text-white h-14 rounded-2xl font-black text-lg border-none hover:scale-[1.02] transition-transform">Voir mon Rang</Button>
                 </Link>
              </div>
           </Card>

           <Card className="border border-gray-100 shadow-sm bg-white p-8 rounded-[40px]">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-brand-orange" /> Statistiques de la semaine
              </h3>
              <div className="space-y-6">
                 {[
                   { label: "Missions Terminées", value: "0", trend: "0%" },
                   { label: "Temps de livraison moyen", value: "--", trend: "0%" },
                   { label: "Kilomètres parcourus", value: "0 km", trend: "0%" }
                 ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">{stat.label}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.trend}</p>
                       </div>
                       <p className="text-lg font-black text-slate-900">{stat.value}</p>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </motion.div>
  )
}