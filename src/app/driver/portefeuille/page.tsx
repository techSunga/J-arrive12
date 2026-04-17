"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, Plus, Smartphone, History, ChevronRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

type Transaction = {
  id: string
  type: "Revenu" | "Retrait" | "Commission"
  item: string
  amount: number
  date: string
  status: "Validé" | "En cours" | "Rejeté"
  timestamp: Date
}

export default function PortefeuillePage() {
  const [balance, setBalance] = useState(0)
  const [weekRevenue, setWeekRevenue] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    fetchWallet()

    // Real-time synchronization
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const channel = supabase.channel('driver_wallet')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'missions', filter: `driver_id=eq.${user.id}` },
          () => {
            fetchWallet() // Resync on any mission change
          }
        )
        .subscribe()
        
      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [])

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: missions, error } = await supabase
        .from('missions')
        .select('*')
        .eq('driver_id', user.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })

      if (error) throw error

      if (missions) {
        let total = 0
        let sevenDaysTotal = 0
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const txs: Transaction[] = missions.map(m => {
          // Commission example: driver keeps 80%
          const driverEarn = Math.floor(m.price_fcfa * 0.8)
          total += driverEarn
          
          const deliveredAt = new Date(m.delivered_at || m.created_at)
          if (deliveredAt >= sevenDaysAgo) {
            sevenDaysTotal += driverEarn
          }

          return {
            id: `T-${m.id.slice(0, 4).toUpperCase()}`,
            type: "Revenu",
            item: `Mission #${m.id.slice(0, 6).toUpperCase()}`,
            amount: driverEarn,
            date: deliveredAt.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
            status: "Validé",
            timestamp: deliveredAt
          }
        })

        setBalance(total)
        setWeekRevenue(sevenDaysTotal)
        setTransactions(txs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  const handleWithdrawal = async () => {
    if (balance < 1000) {
      toast.error("Le solde minimum pour un retrait est de 1,000 FCFA")
      return
    }

    setRequesting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
      
      if (!profile?.phone) {
        toast.error("Veuillez configurer votre numéro MoMo dans 'Mon Profil' avant de retirer.")
        return
      }

      const { error } = await supabase
        .from('withdrawals')
        .insert({
          driver_id: user.id,
          amount: balance, 
          phone_momo: profile.phone,
          status: 'pending'
        })

      if (error) throw error

      toast.success("Demande de retrait envoyée ! Elle sera traitée sous 24h.")
      setBalance(0)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronisation du Portefeuille...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mon Portefeuille</h1>
          <p className="text-gray-500">Gérez vos revenus et vos retraits MoMo</p>
        </div>
        <Button className="bg-brand-blue h-12 px-8 font-bold shadow-lg shadow-brand-blue/20 flex gap-2">
           <Plus className="w-5 h-5" /> Ajouter un compte MoMo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-1 border-none bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                 <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <Wallet className="w-6 h-6 text-brand-orange" />
                 </div>
                 <span className="text-[10px] font-black bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full uppercase tracking-widest">Compte Actif</span>
              </div>
              
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">Solde Total Livreur (80%)</p>
              <h2 className="text-5xl font-black mb-8">{balance.toLocaleString()} <span className="text-sm font-bold opacity-40">FCFA</span></h2>
              
              <div className="pt-6 border-t border-white/10 space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="opacity-60">Retrait min.</span>
                    <span className="font-bold">1,000 FCFA</span>
                 </div>
              </div>

              <div className="mt-8">
                 <Button 
                   onClick={handleWithdrawal}
                   disabled={balance < 1000 || requesting} 
                   className="w-full bg-brand-orange hover:bg-brand-orange-dark h-14 font-black shadow-xl shadow-brand-orange/20 border-none transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                 >
                    {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Retirer maintenant"}
                 </Button>
              </div>
           </div>
           <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-blue opacity-20 rounded-full blur-3xl" />
        </Card>

        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-gray-100 shadow-sm bg-white p-6">
                 <div className="flex gap-4 items-center">
                    <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                       <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase">Revenus (7j)</p>
                       <p className="text-xl font-black text-slate-900">+{weekRevenue.toLocaleString()} FCFA</p>
                    </div>
                 </div>
              </Card>
              <Card className="border border-gray-100 shadow-sm bg-white p-6">
                 <div className="flex gap-4 items-center">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                       <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase">Compte lié</p>
                       <p className="text-xl font-black text-slate-900">06 445 ....</p>
                    </div>
                 </div>
              </Card>
           </div>

           <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/20 border-b border-gray-50 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-lg">Dernières Transactions</CardTitle>
                    <CardDescription>Suivi de vos entrées et sorties</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 {transactions.length === 0 ? (
                   <div className="p-8 text-center text-gray-400 font-medium">Aucune transaction pour le moment.</div>
                 ) : (
                   <div className="divide-y divide-gray-50">
                      {transactions.map((t, i) => (
                        <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-xl ${t.type === 'Revenu' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                 {t.type === 'Revenu' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900">{t.item}</p>
                                 <p className="text-[10px] text-gray-400 font-medium">{t.date}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-green-600">+{t.amount.toLocaleString()} FCFA</p>
                              <span className="text-[10px] font-bold text-green-600">{t.status}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
