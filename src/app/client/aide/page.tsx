"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  ChevronRight, 
  Mail, 
  Phone, 
  MessageCircle, 
  FileText, 
  ShieldCheck, 
  HelpCircle,
  Truck,
  Package
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const FAQS = [
  {
    q: "Comment puis-je suivre mon colis ?",
    a: "Une fois votre commande passée, allez dans la section 'Suivi' de votre application. Vous y verrez la position du livreur en temps réel sur la carte.",
    category: "Livraison"
  },
  {
    q: "Quels sont les tarifs de livraison ?",
    a: "Nos tarifs commencent à 1000 FCFA pour les courses classiques en centre-ville. Le prix exact est calculé lors de votre commande selon la distance.",
    category: "Tarifs"
  },
  {
    q: "Comment devenir livreur partner ?",
    a: "Inscrivez-vous sur la plateforme en choisissant le rôle 'Livreur', remplissez votre profil et téléchargez vos documents. Notre équipe validera votre dossier sous 24h.",
    category: "Partenariat"
  },
  {
    q: "Puis-je annuler une commande ?",
    a: "Oui, tant que la commande n'a pas été récupérée par le livreur, vous pouvez l'annuler sans frais depuis l'historique.",
    category: "Commandes"
  }
]

export default function AidePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Comment pouvons-nous vous aider ?</h1>
        <p className="text-gray-500 font-medium">Trouvez des réponses rapides ou contactez notre support client.</p>
        
        <div className="max-w-2xl mx-auto relative group pt-4">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher un sujet, une question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 bg-white shadow-xl shadow-slate-200/50 rounded-3xl pl-16 pr-6 border-none text-lg font-medium focus:ring-2 focus:ring-brand-blue/20 transition-all"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Mon Compte", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Livraison", icon: Truck, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Paiements", icon: FileText, color: "text-green-500", bg: "bg-green-50" },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-premium rounded-[32px] hover:scale-105 transition-transform cursor-pointer overflow-hidden p-6 bg-white group">
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="font-black text-slate-900">{item.label}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">Voir les articles →</p>
          </Card>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-brand-blue" /> Foire Aux Questions
        </h2>
        
        <div className="space-y-3">
          {filteredFaqs.map((faq, i) => (
            <motion.div 
              key={i}
              className={`bg-white rounded-3xl border border-gray-100 overflow-hidden cursor-pointer transition-all ${activeFaq === i ? 'shadow-xl ring-2 ring-brand-blue/5' : 'hover:bg-gray-50/50'}`}
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-lg">
                    {faq.category}
                  </span>
                  <p className="font-bold text-slate-900">{faq.q}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
              </div>
              
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 text-gray-500 font-medium leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Support Contact */}
      <Card className="border-none shadow-premium bg-slate-900 rounded-[40px] overflow-hidden p-10 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="space-y-4 max-w-lg">
            <h3 className="text-3xl font-black">Vous n'avez pas trouvé ?</h3>
            <p className="text-slate-400 font-medium">Nos agents de support sont disponibles 7j/7 de 8h à 20h pour vous assister dans vos démarches.</p>
            <div className="flex gap-4 pt-2">
               <div className="flex items-center gap-2 text-sm font-bold text-white">
                 <Phone className="w-4 h-4 text-brand-orange" /> +242 06 000 00 00
               </div>
               <div className="flex items-center gap-2 text-sm font-bold text-white">
                 <Mail className="w-4 h-4 text-brand-orange" /> support@jarrive.cg
               </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-brand-orange/20">
              <MessageCircle className="w-5 h-5 mr-2" /> Discuter avec un agent
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 rounded-2xl font-black">
              Ouvrir un ticket
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
