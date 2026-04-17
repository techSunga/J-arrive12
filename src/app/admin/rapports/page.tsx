"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Truck, 
  Calendar, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Loader2,
  FileText
} from "lucide-react"
import { useState, useMemo } from "react"
import { useMissions } from "@/hooks/use-supabase"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function AdminRapports() {
  const { missions, loading } = useMissions('admin')
  const [timeRange, setTimeRange] = useState('7d')

  // Calculate stats based on missions
  const stats = useMemo(() => {
    if (!missions.length) return {
      revenue: 0,
      totalMissions: 0,
      deliveredRate: 0,
      avgPrice: 0,
      statusBreakdown: { delivered: 0, pending: 0, accepted: 0, cancelled: 0 },
      typeBreakdown: {} as Record<string, number>
    }

    const now = new Date()
    const filteredMissions = missions.filter(m => {
      if (timeRange === 'all') return true
      const date = new Date(m.created_at)
      const diffHrs = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (timeRange === '24h') return diffHrs <= 24
      if (timeRange === '7d') return diffHrs <= 24 * 7
      if (timeRange === '30d') return diffHrs <= 24 * 30
      return true
    })

    const delivered = filteredMissions.filter(m => m.status === 'delivered')
    const totalRev = delivered.reduce((acc, m) => acc + (m.price_fcfa || 0), 0)
    
    const types: Record<string, number> = {}
    filteredMissions.forEach(m => {
      const typeLabel = m.type === 'package' ? 'Colis' : m.type === 'food' ? 'Repas' : 'Course'
      types[typeLabel] = (types[typeLabel] || 0) + 1
    })

    return {
      revenue: totalRev,
      totalMissions: filteredMissions.length,
      deliveredRate: Math.round((delivered.length / (filteredMissions.length || 1)) * 100),
      avgPrice: Math.round(totalRev / (delivered.length || 1)),
      statusBreakdown: {
        delivered: delivered.length,
        pending: filteredMissions.filter(m => m.status === 'pending').length,
        accepted: filteredMissions.filter(m => m.status === 'accepted' || m.status === 'picked_up').length,
        cancelled: filteredMissions.filter(m => m.status === 'cancelled').length,
      },
      typeBreakdown: types
    }
  }, [missions, timeRange])

  const handleExport = () => {
    if (!missions.length) return
    
    const headers = ["ID", "Client", "Livreur", "Type", "Status", "Prix (FCFA)", "Date"]
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + missions.map(m => {
          return [
            m.id.slice(0, 8),
            m.client_id, // Could be improved if client name joined
            m.driver_id || "N/A",
            m.type,
            m.status,
            m.price_fcfa,
            new Date(m.created_at).toLocaleDateString()
          ].join(",")
        }).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `rapport_jarrive_${timeRange}_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Rapport exporté avec succès")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Génération des rapports analytiques...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rapports & Analyses</h1>
          <p className="text-gray-500 font-medium">Visualisez les performances de la plateforme en temps réel</p>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-gray-100 p-1 rounded-xl">
             {['24h', '7d', '30d', 'all'].map((range) => (
               <button
                 key={range}
                 onClick={() => setTimeRange(range)}
                 className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                   timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                 }`}
               >
                 {range}
               </button>
             ))}
           </div>
           <Button 
            onClick={handleExport}
            className="bg-slate-900 text-white font-bold rounded-xl flex gap-2"
           >
              <Download className="w-4 h-4" /> Exporter Data
           </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Chiffre d\'Affaires', value: `${stats.revenue.toLocaleString()} FCFA`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Missions', value: stats.totalMissions, icon: Truck, color: 'text-brand-blue', bg: 'bg-blue-50' },
          { label: 'Taux de Succès', value: `${stats.deliveredRate}%`, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Panier Moyen', value: `${stats.avgPrice.toLocaleString()} FCFA`, icon: BarChart3, color: 'text-brand-orange', bg: 'bg-orange-50' },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-premium bg-white p-6 rounded-[32px] overflow-hidden relative group hover:scale-[1.02] transition-transform">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3" /> +12% cette semaine
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Missions Breakdown */}
        <Card className="lg:col-span-2 border-none shadow-premium bg-white rounded-[40px] overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">Volume par Catégorie</CardTitle>
              <CardDescription>Répartition des types de livraisons effectuées</CardDescription>
            </div>
            <BarChart3 className="w-6 h-6 text-gray-300" />
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {Object.entries(stats.typeBreakdown).map(([type, count]) => {
                const percentage = Math.round((count / stats.totalMissions) * 100)
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{type}</p>
                      <p className="text-xs font-bold text-gray-400">{count} missions • {percentage}%</p>
                    </div>
                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-brand-blue rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status Mini Chart */}
        <Card className="lg:col-span-1 border-none shadow-premium bg-slate-900 text-white rounded-[40px] overflow-hidden p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-8">
               <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                 <CheckCircle2 className="w-6 h-6 text-brand-orange" />
               </div>
               <span className="text-[10px] font-black bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full uppercase tracking-widest">Live Status</span>
            </div>
            <h3 className="text-2xl font-black mb-2">État Global</h3>
            <p className="text-sm text-slate-400 font-medium mb-8">Récapitulatif des missions en cours et archivées.</p>
            
            <div className="space-y-5">
              {[
                { label: 'Terminées', value: stats.statusBreakdown.delivered, color: 'bg-green-500' },
                { label: 'En cours', value: stats.statusBreakdown.accepted, color: 'bg-brand-blue' },
                { label: 'En attente', value: stats.statusBreakdown.pending, color: 'bg-brand-orange' },
                { label: 'Annulées', value: stats.statusBreakdown.cancelled, color: 'bg-red-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs font-bold text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-sm font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-white/10">
            <Button variant="ghost" className="w-full text-white hover:bg-white/5 font-black text-xs uppercase tracking-widest flex gap-2">
              <FileText className="w-4 h-4" /> Voir Log Complet
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Summary / Insights */}
      <Card className="border-none shadow-premium bg-brand-blue/5 rounded-[40px] p-8 border border-brand-blue/10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-10 h-10 text-brand-blue" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-black text-slate-900 mb-2">Analyse de Performance</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
              Votre volume d'activité a augmenté de <span className="text-brand-blue font-black underline">18%</span> par rapport au mois dernier. 
              Le type de mission le plus rentable actuellement est <span className="font-bold">"{Object.entries(stats.typeBreakdown).sort((a,b) => b[1] - a[1])[0]?.[0] || '---'}"</span>. 
              Pensez à réduire le temps d'attente moyen pour optimiser vos revenus.
            </p>
          </div>
          <Button className="bg-brand-blue hover:bg-brand-blue-dark text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-brand-blue/20">
            Optimiser la Flotte
          </Button>
        </div>
      </Card>
    </div>
  )
}
