"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Package, MapPin, CreditCard, ChevronRight, Info, Flame, Home, Box, CheckCircle2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CommanderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [service, setService] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    receiverName: "",
    receiverPhone: "",
    momoNumber: "06 123 4567" // Default for demo
  })

  const services = [
    { id: "colis", title: "Livraison à domicile", desc: "Vos colis, repas, etc.", icon: Package, price: 1500, priceDisplay: "1 500 FCFA" },
    { id: "gaz", title: "Achat & livraison de gaz", desc: "Bouteille 12kg/20kg", icon: Flame, price: 2500, priceDisplay: "2 500 FCFA" },
    { id: "moving", title: "Déménagement", desc: "Forfait utilitaire", icon: Truck, price: 25000, priceDisplay: "25 000 FCFA" },
    { id: "storage", title: "Stockage de marchandises", desc: "Par m³ / mois", icon: Box, price: 5000, priceDisplay: "5 000 FCFA" },
  ]

  const selectedService = services.find(s => s.id === service)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert("Veuillez vous connecter pour passer commande.")
        router.push("/auth/login")
        return
      }

      const { error } = await supabase
        .from('missions')
        .insert({
          client_id: user.id,
          type: service,
          origin_address: formData.origin,
          dest_address: formData.destination,
          price_fcfa: selectedService?.price || 0,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cash'
        })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/client/suivi")
      }, 3000)

    } catch (error: any) {
      console.error("Error creating mission:", error)
      alert("Erreur lors de la commande: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Commande Confirmée !</h2>
          <p className="text-gray-500">Votre commande a été validée. Le paiement se fera à la livraison.</p>
        </div>
        <p className="text-xs text-brand-blue font-bold animate-pulse">Redirection vers le suivi dans 3 secondes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
         {[1, 2, 3].map((s) => (
           <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                 {s}
              </div>
              {s < 3 && <div className={`h-1 w-12 rounded-full ${step > s ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
           </div>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <div>
                <h2 className="text-2xl font-bold">Sélectionnez un service</h2>
                <p className="text-gray-500">De quel type de livraison avez-vous besoin ?</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <Card 
                    key={s.id} 
                    className={`cursor-pointer transition-all border-2 ${service === s.id ? 'border-brand-blue bg-brand-blue/5 shadow-md' : 'border-gray-100 hover:border-brand-blue/50'}`}
                    onClick={() => setService(s.id)}
                  >
                    <CardContent className="p-6 flex items-center gap-6">
                       <div className={`p-3 rounded-2xl ${service === s.id ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <s.icon className="w-8 h-8" />
                       </div>
                       <div className="flex-1">
                          <h3 className="font-bold">{s.title}</h3>
                          <p className="text-xs text-gray-500">{s.desc}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-brand-blue">{s.priceDisplay}</p>
                       </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
             
             <div className="flex justify-end pt-4">
                <Button size="lg" className="bg-brand-blue gap-2" disabled={!service} onClick={() => setStep(2)}>
                   Continuer <ChevronRight className="w-4 h-4" />
                </Button>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <Button variant="ghost" className="mb-4 text-brand-blue font-bold px-0" onClick={() => setStep(1)}>← Retour</Button>
             <div>
                <h2 className="text-2xl font-bold">Détails de l'itinéraire</h2>
                <p className="text-gray-500">Où devons-nous récupérer et livrer votre colis ?</p>
             </div>

             <Card className="border-none shadow-sm">
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-4">
                      <div className="flex gap-4">
                         <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full border-4 border-brand-blue bg-white" />
                            <div className="w-0.5 h-16 bg-dashed border-l-2 border-dashed border-gray-300 my-1" />
                            <MapPin className="text-brand-orange w-4 h-4" />
                         </div>
                         <div className="flex-1 space-y-8">
                            <div className="space-y-2">
                               <label className="text-xs font-bold uppercase text-gray-400">Point d'enlèvement</label>
                               <Input 
                                 placeholder="Ex: Marché Total, Bacongo" 
                                 value={formData.origin}
                                 onChange={(e) => setFormData({...formData, origin: e.target.value})}
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold uppercase text-gray-400">Point de livraison</label>
                               <Input 
                                 placeholder="Ex: Rue Itoua, Ouenzé" 
                                 value={formData.destination}
                                 onChange={(e) => setFormData({...formData, destination: e.target.value})}
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase text-gray-400">Nom du destinataire</label>
                         <Input 
                           placeholder="Prénom Nom" 
                           value={formData.receiverName}
                           onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase text-gray-400">Téléphone</label>
                         <Input 
                           placeholder="+242 06 xxx xx xx" 
                           value={formData.receiverPhone}
                           onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                         />
                      </div>
                   </div>
                </CardContent>
             </Card>

             <div className="flex justify-end pt-4">
                <Button size="lg" className="bg-brand-blue gap-2" disabled={!formData.origin || !formData.destination} onClick={() => setStep(3)}>
                   Valider l'itinéraire <ChevronRight className="w-4 h-4" />
                </Button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <Button variant="ghost" className="mb-4 text-brand-blue font-bold px-0" onClick={() => setStep(2)}>← Retour</Button>
             <div>
                <h2 className="text-2xl font-bold">Validation de la commande</h2>
                <p className="text-gray-500">Confirmez votre commande. Le paiement se fera à la livraison.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                   <Card className="border-none shadow-sm overflow-hidden">
                      <div className="bg-green-500 p-4 flex items-center justify-between">
                         <span className="font-bold text-white">PAIEMENT SUR PLACE</span>
                         <div className="bg-white rounded-lg px-3 py-1 text-[10px] font-extrabold text-green-600">EN ESPÈCES</div>
                      </div>
                      <CardContent className="p-8 space-y-4">
                         <div className="p-4 bg-green-50 text-green-700 rounded-xl flex gap-3 items-start">
                            <Info className="w-5 h-5 mt-0.5 shrink-0" />
                            <p className="text-sm font-medium">Vous paierez le livreur en espèces une fois que le service sera rendu.</p>
                         </div>
                      </CardContent>
                   </Card>
                </div>

                <Card className="border-none shadow-sm bg-gray-900 text-white h-fit">
                   <CardHeader>
                      <CardTitle className="text-lg">Résumé</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm opacity-80">
                         <span>{selectedService?.title}</span>
                         <span>{selectedService?.priceDisplay}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-xl">
                         <span>TOTAL</span>
                         <span className="text-brand-orange">{selectedService?.price || 0} FCFA</span>
                      </div>
                      <Button 
                        onClick={handlePayment} 
                        disabled={loading}
                        className="w-full bg-brand-orange hover:bg-brand-orange/90 mt-4 h-12 text-lg font-bold shadow-lg shadow-brand-orange/20"
                      >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmer la commande"}
                      </Button>
                   </CardContent>
                </Card>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
