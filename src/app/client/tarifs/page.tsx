"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Truck, Flame, Check, CreditCard } from "lucide-react"

export default function TarifsPage() {
  const plans = [
    {
      name: "Pack starter",
      price: "30 000",
      desc: "25 livraisons le mois",
      features: ["Zone centre et au delà", "Suivi en temps réel", "Support dédié"],
      color: "border-gray-100",
      btn: "bg-slate-900"
    },
    {
      name: "Pack standard",
      price: "80 000",
      desc: "80 livraisons le mois",
      features: ["Zone centre plus proche périphérie", "Suivi en temps réel", "Livraison express"],
      color: "border-brand-blue shadow-xl shadow-brand-blue/10",
      featured: true,
      btn: "bg-brand-blue"
    },
    {
      name: "Pack pro",
      price: "200 000",
      desc: "250 livraisons le mois",
      features: ["Toute la zone urbaine", "Priorité absolue", "Support VIP"],
      color: "border-brand-orange shadow-xl shadow-brand-orange/10",
      btn: "bg-brand-orange"
    }
  ]

  return (
    <div className="space-y-12 bg-white pb-12">
      <div className="text-center">
         <h1 className="text-4xl font-extrabold mb-4 text-slate-900">Nos Tarifs Transparents</h1>
         <p className="text-gray-500 max-w-xl mx-auto font-medium">
            Aucun frais caché. Payez uniquement pour ce dont vous avez besoin, en espèces à la livraison.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {plans.map((p, i) => (
           <Card key={i} className={`border-2 relative overflow-hidden flex flex-col bg-white ${p.color}`}>
              {p.featured && (
                <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                   Populaire
                </div>
              )}
              <CardHeader className="text-center pt-10">
                 <CardTitle className="text-2xl font-bold">{p.name}</CardTitle>
                 <CardDescription className="font-medium">{p.desc}</CardDescription>
                 <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-slate-900">{p.price}</span>
                    <span className="text-gray-400 font-bold">FCFA</span>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between p-8 pt-0">
                 <ul className="space-y-4 mb-8">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                         <div className="bg-green-50 p-1 rounded-full">
                            <Check className="w-3.5 h-3.5 text-green-500" />
                         </div>
                         {f}
                      </li>
                    ))}
                 </ul>
                 <Button className={`w-full h-12 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] border-none ${p.btn} ${p.featured ? 'shadow-brand-blue/20' : p.name === 'Déménagement' ? 'shadow-brand-orange/20' : 'shadow-slate-200'}`}>
                    Choisir ce plan
                 </Button>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="bg-gray-50/50 border border-gray-100 p-10 rounded-[40px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-brand-blue border border-gray-50"><Package className="w-6 h-6" /></div>
            <h4 className="font-bold text-slate-900">Colis Sécurisé</h4>
            <p className="text-xs text-gray-400">Assurance incluse</p>
         </div>
         <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-brand-orange border border-gray-50"><Truck className="w-6 h-6" /></div>
            <h4 className="font-bold text-slate-900">Flotte Moderne</h4>
            <p className="text-xs text-gray-400">Motos et Camions</p>
         </div>
         <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-yellow-500 border border-gray-50"><CreditCard className="w-6 h-6" /></div>
            <h4 className="font-bold text-slate-900">Paiement sur place</h4>
            <p className="text-xs text-gray-400">En espèces à la livraison</p>
         </div>
         <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-green-500 border border-gray-50"><Flame className="w-6 h-6" /></div>
            <h4 className="font-bold text-slate-900">Gaz 24/7</h4>
            <p className="text-xs text-gray-400">Recharge immédiate</p>
         </div>
      </div>
    </div>
  )
}
