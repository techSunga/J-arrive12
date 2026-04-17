"use client"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Package, Truck, Flame, Box, ShieldCheck, Zap, CheckCircle2, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ServicesPage() {
  const services = [
    {
      title: "Livraison à domicile",
      desc: "Nous livrons tout à domicile à Brazzaville, en toute sécurité.",
      icon: Package,
      color: "bg-blue-50 text-brand-blue",
      details: ["Rapide", "Fiable", "Toute la ville"]
    },
    {
      title: "Stockage des marchandises",
      desc: "Besoin de place ? Stockez vos marchandises en toute sécurité.",
      icon: Box,
      color: "bg-green-50 text-green-600",
      details: ["Sécurisé", "Climatisé", "Accès 24/7"]
    },
    {
      title: "Déménagement",
      desc: "Un service professionnel pour vos changements de domicile.",
      icon: Truck,
      color: "bg-slate-900 text-white",
      details: ["Aide au portage", "Protection meubles", "Tarif forfaitaire"]
    },
    {
      title: "Récupération de vos colis",
      desc: "Nous récupérons vos colis et les livrons pour vous.",
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600",
      details: ["En magasin", "Chez les fournisseurs", "Gain de temps"]
    },
    {
      title: "Achat et livraison de votre gaz",
      desc: "Ne tombez plus en panne de gaz ! Nous nous occupons de tout.",
      icon: Flame,
      color: "bg-orange-50 text-brand-orange",
      details: ["Achat inclus", "Toutes marques", "Livraison Express"]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-24">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
             >
                <Zap className="w-3 h-3" /> Solutions Logistiques
             </motion.div>
             <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">Nos services <span className="text-brand-orange">Premium</span>.</h1>
             <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Une gamme complète de services pensée pour simplifier votre quotidien et booster votre business au Congo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
             {services.map((service, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
               >
                 <Card className="border-none shadow-premium bg-white p-10 rounded-[50px] h-full group hover:shadow-2xl transition-all duration-500">
                    <div className="flex flex-col md:flex-row gap-8">
                       <div className={`${service.color} w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                          <service.icon className="w-10 h-10" />
                       </div>
                       <div className="space-y-6">
                          <h2 className="text-2xl font-black text-slate-900">{service.title}</h2>
                          <p className="text-gray-500 font-medium leading-relaxed">{service.desc}</p>
                          <div className="flex flex-wrap gap-4">
                             {service.details.map((detail, j) => (
                               <div key={j} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                  <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                                  <span className="text-xs font-bold text-slate-600">{detail}</span>
                               </div>
                             ))}
                          </div>
                          <div className="pt-4">
                             <Link href="/auth/register">
                               <Button variant="ghost" className="text-brand-blue font-black gap-2 p-0 hover:bg-transparent hover:text-brand-blue-dark group-hover:translate-x-2 transition-all">
                                  Commander ce service <ChevronRight className="w-4 h-4" />
                               </Button>
                             </Link>
                          </div>
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))}
          </div>

          <div className="bg-brand-blue rounded-[60px] p-12 md:p-20 text-white relative overflow-hidden text-center shadow-2xl">
             <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <ShieldCheck className="w-16 h-16 text-brand-orange mx-auto mb-6" />
                <h2 className="text-3xl md:text-5xl font-black mb-6">Prêt à simplifier vos envois ?</h2>
                <p className="text-blue-100 font-medium text-lg">Rejoignez des milliers de Congolais qui font confiance à J'ARRIVE pour leurs besoins logistiques quotidiens.</p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                   <Link href="/auth/register">
                     <Button className="bg-white text-brand-blue hover:bg-gray-100 h-16 px-10 rounded-2xl font-black text-xl border-none shadow-xl transition-all active:scale-95">Créer un compte</Button>
                   </Link>
                   <Link href="/contact">
                     <Button variant="outline" className="border-white text-white hover:bg-white/10 h-16 px-10 rounded-2xl font-black text-xl transition-all">Nous appeler</Button>
                   </Link>
                </div>
             </div>
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          </div>

        </div>
      </main>

      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center gap-2 mb-6 text-brand-blue font-black italic text-2xl">
               <div className="bg-brand-orange p-1.5 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
               </div>
               J'ARRIVE
            </div>
            <p className="text-gray-500 text-sm">Simplifier la logistique, connecter le Congo. 🇨🇬</p>
        </div>
      </footer>
    </div>
  )
}
