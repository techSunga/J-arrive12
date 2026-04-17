"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Smartphone, CreditCard, ChevronRight, Loader2, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface RechargeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RechargeModal({ isOpen, onClose, onSuccess }: RechargeModalProps) {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("5000")
  const [loading, setLoading] = useState(false)

  const handleRecharge = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_fcfa')
        .eq('id', user.id)
        .single()

      const newBalance = (profile?.balance_fcfa || 0) + parseInt(amount)

      // 2. Update balance
      const { error } = await supabase
        .from('profiles')
        .update({ balance_fcfa: newBalance })
        .eq('id', user.id)

      if (error) throw error

      setStep(3)
      setTimeout(() => {
        onSuccess()
        onClose()
        setStep(1)
      }, 2000)

      toast.success("Votre compte a été rechargé !")
    } catch (error: any) {
      toast.error("Erreur: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl rounded-[40px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900">Recharger mon solde</DialogTitle>
          <DialogDescription className="font-medium text-gray-500">
            Alimentez votre compte J'ARRIVE Cash instantanément via Mobile Money.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 pt-4">
             <div className="grid grid-cols-2 gap-3">
                {['2000', '5000', '10000', '25000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`p-4 rounded-2xl border-2 font-black transition-all ${
                      amount === amt ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {amt} <span className="text-[10px]">FCFA</span>
                  </button>
                ))}
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Montant Personnalisé</label>
                <Input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-lg"
                />
             </div>
             <Button className="w-full h-14 bg-brand-blue rounded-2xl font-black text-lg shadow-lg shadow-brand-blue/20" onClick={() => setStep(2)}>
                Continuer
             </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 pt-4">
             <div className="bg-yellow-400 p-6 rounded-3xl text-slate-900 flex justify-between items-center shadow-lg">
                <div className="font-black text-lg italic">MTN MoMo</div>
                <CreditCard className="w-8 h-8 opacity-50" />
             </div>
             <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-medium">Montant à recharger</span>
                   <span className="font-black text-slate-900">{amount} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-medium">Frais de service</span>
                   <span className="font-black text-green-600">0 FCFA</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-black text-lg">
                   <span>Total</span>
                   <span className="text-brand-blue">{amount} FCFA</span>
                </div>
             </div>
             <p className="text-[10px] text-center text-gray-400 font-bold italic">
                Une demande de confirmation sera envoyée sur votre téléphone.
             </p>
             <Button 
               disabled={loading}
               onClick={handleRecharge}
               className="w-full h-14 bg-brand-orange rounded-2xl font-black text-lg shadow-lg shadow-brand-orange/20"
             >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmer le paiement"}
             </Button>
             <Button variant="ghost" className="w-full text-gray-400 font-bold" onClick={() => setStep(1)}>
                DÉpôt par carte bancaire ? (Bientôt)
             </Button>
          </div>
        )}

        {step === 3 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900">Rechargement réussi !</h3>
                <p className="text-gray-500">Votre nouveau solde est disponible.</p>
             </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
