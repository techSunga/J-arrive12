"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, Calendar, MapPin, ChevronRight, Search, Download, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function HistoriqueLivreur() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMissions: 0,
    totalGains: 0
  })

  useEffect(() => {
    fetchHistory()
    const channel = supabase
      .channel('driver-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchHistory()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('driver_id', user.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })

      if (error) throw error
      
      const totalGains = data?.reduce((acc, curr) => acc + (curr.price_fcfa || 0), 0) || 0
      
      setMissions(data || [])
      setStats({
        totalMissions: data?.length || 0,
        totalGains: totalGains
      })
    } catch (error) {
      console.error("Error fetching driver history:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
         <p className="mt-4 text-gray-400 font-bold tracking-tight">Analyse de vos performances...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historique des livraisons</h1>
          <p className="text-gray-500 font-medium">Consultez vos performances passées</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-10 h-12 w-64 bg-white border-none shadow-sm rounded-2xl font-bold" placeholder="Rechercher..." />
           </div>
           <Button variant="outline" className="h-12 border-none shadow-sm bg-white rounded-2xl font-black flex gap-2">
              <Download className="w-4 h-4 text-brand-orange" /> Exporter .PDF
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <Card className="p-8 border-none shadow-premium bg-brand-orange/5 rounded-[32px]">
            <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">Missions Terminées</p>
            <p className="text-4xl font-black text-slate-900">{stats.totalMissions}</p>
         </Card>
         <Card className="p-8 border-none shadow-premium bg-brand-blue/5 rounded-[32px]">
            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1">Total des Gains</p>
            <p className="text-4xl font-black text-slate-900">{stats.totalGains.toLocaleString()} <span className="text-sm">FCFA</span></p>
         </Card>
         <Card className="p-8 border-none shadow-premium bg-green-50 rounded-[32px]">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Note Moyenne</p>
            <p className="text-4xl font-black text-slate-900">4.9 / 5</p>
         </Card>
      </div>

      <div className="space-y-4">
        {missions.length > 0 ? missions.map((mission) => (
          <Card key={mission.id} className="border-none shadow-premium bg-white hover:bg-gray-50/20 transition-all cursor-pointer group rounded-[32px] overflow-hidden">
            <CardContent className="p-7 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-brand-orange/10 transition-colors">
                  <Package className="w-7 h-7 text-brand-orange" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <p className="font-black text-slate-900 leading-none">{mission.type}</p>
                     <span className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">#{mission.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                     <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(mission.delivered_at || mission.created_at).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {mission.dest_address}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="font-black text-xl text-slate-900">{mission.price_fcfa.toLocaleString()} <span className="text-xs">FCFA</span></p>
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Payé ✓</p>
                 </div>
                 <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[32px] space-y-4">
             <Package className="w-12 h-12 text-gray-200 mx-auto" />
             <p className="text-gray-400 font-bold">Vous n'avez pas encore terminé de missions</p>
          </div>
        )}
      </div>
    </div>
  )
}
