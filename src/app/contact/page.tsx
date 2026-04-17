"use client"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Truck, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate sending
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            
            {/* Info Section */}
            <div className="space-y-12">
               <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
                  >
                     <MessageCircle className="w-3 h-3" /> Contactez-nous
                  </motion.div>
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">Parlons de votre <span className="text-brand-blue">logistique</span>.</h1>
                  <p className="text-gray-500 font-medium text-lg max-w-lg">Notre équipe est disponible 24/7 pour vous accompagner dans vos livraisons urbaines à Brazzaville.</p>
               </div>

               <div className="space-y-8">
                  <div className="group flex items-start gap-6 p-6 rounded-[32px] hover:bg-gray-50 transition-colors cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-blue/20">
                        <Phone className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Téléphone & WhatsApp</p>
                        <p className="text-xl font-black text-slate-900">+242 06 621 73 95</p>
                        <p className="text-xs font-bold text-brand-blue mt-1">Disponible 24h/24</p>
                     </div>
                  </div>

                  <div className="group flex items-start gap-6 p-6 rounded-[32px] hover:bg-gray-50 transition-colors cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl bg-brand-orange text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-orange/20">
                        <Mail className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                        <p className="text-xl font-black text-slate-900">contact@jarrive.cg</p>
                        <p className="text-xs font-bold text-brand-orange mt-1">Réponse sous 15 mins</p>
                     </div>
                  </div>

                  <div className="group flex items-start gap-6 p-6 rounded-[32px] hover:bg-gray-50 transition-colors cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
                        <MapPin className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bureaux</p>
                        <p className="text-xl font-black text-slate-900">Bakoula, Brazzaville, Congo</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">Immeuble J'ARRIVE, Rue 12</p>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-gray-100 flex items-center gap-8">
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />)}
                  </div>
                  <p className="text-sm font-bold text-gray-500">
                     Rejoignez les <span className="text-slate-900">5000+</span> utilisateurs satisfaits.
                  </p>
               </div>
            </div>

            {/* Form Section */}
            <div className="relative">
               <div className="absolute inset-0 bg-brand-blue/5 rounded-[60px] blur-3xl -z-10" />
               <Card className="border-none shadow-2xl shadow-brand-blue/10 bg-white p-10 rounded-[50px]">
                  {sent ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="text-center py-20 space-y-6"
                    >
                       <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Send className="w-10 h-10" />
                       </div>
                       <h2 className="text-3xl font-black text-slate-900">Message envoyé !</h2>
                       <p className="text-gray-500 font-medium">Merci pour votre confiance. Notre équipe vous répondra très rapidement.</p>
                       <Button onClick={() => setSent(false)} variant="outline" className="mt-8 border-brand-blue text-brand-blue font-bold">Envoyer un autre message</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom Complet</label>
                             <Input placeholder="Jean Bakoula" className="h-14 bg-gray-50/50 border-none rounded-2xl px-6 font-bold" required />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
                             <Input type="email" placeholder="jean@mail.cg" className="h-14 bg-gray-50/50 border-none rounded-2xl px-6 font-bold" required />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Sujet</label>
                          <Input placeholder="Question sur ma livraison" className="h-14 bg-gray-50/50 border-none rounded-2xl px-6 font-bold" required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Message</label>
                          <Textarea placeholder="Comment pouvons-nous vous aider ?" className="min-h-[150px] bg-gray-50/50 border-none rounded-[32px] p-6 font-bold" required />
                       </div>
                       <Button 
                         type="submit" 
                         disabled={loading}
                         className="w-full h-16 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black text-xl shadow-xl shadow-brand-blue/20 transition-all hover:translate-y-[-2px] active:scale-95"
                       >
                          {loading ? <Clock className="w-6 h-6 animate-spin" /> : "Envoyer le Message"}
                       </Button>
                    </form>
                  )}
               </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
