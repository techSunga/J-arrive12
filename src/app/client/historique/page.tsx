"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Calendar, MapPin, CreditCard, ChevronRight, Search, Filter, Loader2, Star } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function HistoriquePage() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
    const channel = supabase
      .channel('client-history')
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
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMissions(data || [])
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
         <p className="mt-4 text-gray-400 font-bold">Récupération de votre historique...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historique des commandes</h1>
          <p className="text-gray-500 font-medium">Retrouvez toutes vos activités passées</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-10 h-12 w-64 bg-white border-none shadow-sm rounded-2xl font-bold" placeholder="Rechercher..." />
           </div>
           <Button variant="outline" className="h-12 border-none shadow-sm bg-white rounded-2xl font-black flex gap-2">
              <Filter className="w-4 h-4 text-brand-blue" /> Filtres
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[32px]">
        <CardContent className="p-0">
          {missions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commande</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Itinéraire</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {missions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-gray-50/30 transition-all group cursor-pointer">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${mission.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-brand-blue/5 text-brand-blue'}`}>
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{mission.type}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {mission.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-bold">
                        {new Date(mission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 text-xs">
                           <span className="font-black text-slate-900 max-w-[120px] truncate">{mission.origin_address}</span>
                           <ChevronRight className="w-3 h-3 text-gray-300" />
                           <span className="font-black text-slate-900 max-w-[120px] truncate">{mission.dest_address}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900">
                        {mission.price_fcfa.toLocaleString()} FCFA
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            mission.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            mission.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-brand-blue'
                          }`}>
                            {mission.status === 'delivered' ? 'Livré' : 
                             mission.status === 'cancelled' ? 'Annulé' : 
                             mission.status === 'picked_up' ? 'En route' : 'En attente'}
                          </span>
                          
                          {mission.status === 'delivered' && (
                            <Link href={`/client/suivi?id=${mission.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-brand-orange hover:text-brand-orange hover:bg-orange-50 gap-1 px-2 rounded-lg">
                                <Star className="w-3 h-3 fill-current" /> Noter
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="icon" className="text-gray-200 group-hover:text-brand-blue group-hover:translate-x-1 transition-all">
                           <ChevronRight className="w-6 h-6" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center space-y-4">
               <Package className="w-12 h-12 text-gray-200 mx-auto" />
               <p className="text-gray-400 font-bold">Aucune commande dans votre historique</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
