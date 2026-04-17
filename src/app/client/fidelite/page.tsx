"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Star, Award, TrendingUp, ChevronRight, Zap, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useProfile } from "@/hooks/use-supabase"

export default function FidelitePage() {
  const { profile, loading } = useProfile()
  
  const rewards = [
    { title: "Livraison Offerte", cost: 500, icon: Gift, desc: "Valable sur n'importe quel trajet Brazzaville - Pointe Noire." },
    { title: "-50% sur le Gaz", cost: 300, icon: Zap, desc: "Réduction immédiate sur une recharge de 12kg." },
    { title: "Priorité VIP", cost: 1000, icon: Award, desc: "Passez devant tout le monde pendant les heures de pointe." },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Vérification de vos points...</p>
      </div>
    )
  }

  const pts = profile?.total_pts || 0
  const nextTarget = 1500
  const progress = Math.min((pts / nextTarget) * 100, 100)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Programme de Fidélité</h1>
          <p className="text-gray-500">Transformez vos points en récompenses exclusives</p>
        </div>
        <Button className="bg-brand-orange text-white font-bold flex gap-2 shadow-lg shadow-brand-orange/20">
           <Zap className="w-4 h-4" /> Comment ça marche ?
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none bg-brand-blue p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
           <div className="relative z-10">
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Votre Solde</p>
              <h2 className="text-6xl font-black mb-6">{pts.toLocaleString()} <span className="text-xl font-bold opacity-60">pts</span></h2>
              
              <div className="space-y-4">
                 <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-brand-orange" 
                    />
                 </div>
                 <p className="text-xs font-medium opacity-80 text-center">
                   {pts < nextTarget 
                     ? `Encore ${nextTarget - pts} points pour passer au statut PLATINIUM`
                     : "Statut PLATINIUM atteint !"}
                 </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                 <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Star className="w-5 h-5 text-brand-orange mb-2" />
                    <p className="text-sm font-bold">Rang Actuel</p>
                    <p className="text-lg font-black tracking-tight">GOLD</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                    <p className="text-sm font-bold">Multiplicateur</p>
                    <p className="text-lg font-black tracking-tight">x1.2</p>
                 </div>
              </div>
           </div>
           
           <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-orange opacity-20 rounded-full blur-3xl" />
           <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
        </Card>

        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-bold text-slate-900 border-l-4 border-brand-orange pl-4">Récompenses disponibles</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward, i) => (
                <Card key={i} className="border border-gray-100 shadow-sm bg-white hover:border-brand-blue transition-all group cursor-pointer overflow-hidden">
                   <CardContent className="p-0">
                      <div className="p-6">
                         <div className="flex justify-between items-start mb-6">
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 group-hover:bg-brand-blue/10 group-hover:border-brand-blue/20 transition-colors">
                               <reward.icon className="w-6 h-6 text-brand-blue" />
                            </div>
                            <span className="text-sm font-black text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full">{reward.cost} pts</span>
                         </div>
                         <h4 className="font-bold text-lg mb-2 text-slate-900">{reward.title}</h4>
                         <p className="text-sm text-gray-500 mb-6">{reward.desc}</p>
                         <Button className="w-full bg-brand-blue group-hover:bg-brand-blue-dark shadow-md group-hover:shadow-lg transition-all border-none">Échanger mes points</Button>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
