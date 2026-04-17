"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Truck, DollarSign, TrendingUp, AlertTriangle, ChevronRight, BarChart3, Package, Loader2, ShieldCheck, Clock, RefreshCw, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useAdminStats } from "@/hooks/use-supabase"
import Link from "next/link"

const STATUS_TRANSLATE: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: 'En attente',  color: 'text-red-500',      dot: 'bg-red-500 animate-pulse' },
  accepted:  { label: 'Confirmé',    color: 'text-brand-blue',   dot: 'bg-brand-blue' },
  picked_up: { label: 'En transit',  color: 'text-purple-500',   dot: 'bg-purple-500 animate-pulse' },
  delivered: { label: 'Livré',       color: 'text-green-500',    dot: 'bg-green-500' },
  cancelled: { label: 'Annulé',      color: 'text-gray-400',     dot: 'bg-gray-300' },
}

export default function AdminDashboard() {
  const { stats, recentMissions, loading, refresh } = useAdminStats()

  const kpis = [
    {
      label: "Utilisateurs Totaux",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      badge: "Base clients",
      badgeColor: "bg-blue-50 text-blue-600",
    },
    {
      label: "Livreurs Enregistrés",
      value: stats.activeDrivers.toLocaleString(),
      icon: Truck,
      color: "text-brand-orange",
      bg: "bg-orange-50",
      badge: "Flotte",
      badgeColor: "bg-orange-50 text-brand-orange",
    },
    {
      label: "Revenu Total Payé",
      value: `${stats.revenue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      badge: "+15% marge",
      badgeColor: "bg-green-50 text-green-600",
    },
    {
      label: "Missions en cours",
      value: stats.activeMissions.toLocaleString(),
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      badge: `${stats.pendingMissions} en attente`,
      badgeColor: stats.pendingMissions > 0 ? "bg-red-50 text-red-500" : "bg-purple-50 text-purple-600",
      href: "/admin/live"
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold tracking-tight">Synchronisation des données...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Synchronisé en temps réel</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de Bord Global</h1>
          <p className="text-gray-500 font-medium">Supervision de J'ARRIVE Logistique Congo</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 font-bold flex gap-2 rounded-2xl" onClick={refresh}>
            <RefreshCw className="w-4 h-4" /> Actualiser
          </Button>
          <Button className="bg-brand-blue font-bold px-8 shadow-xl shadow-brand-blue/20 rounded-2xl flex gap-2">
            <BarChart3 className="w-4 h-4" /> Rapport
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi: any, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={kpi.href || '#'}>
              <Card className="border-none shadow-premium bg-white rounded-[32px] hover:scale-[1.02] transition-transform cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${kpi.bg} p-4 rounded-2xl`}>
                      <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${kpi.badgeColor}`}>
                      {kpi.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest leading-none mb-2">{kpi.label}</p>
                  <p className="text-2xl font-black text-slate-900 leading-tight">{kpi.value}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Missions Table */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[32px]">
            <CardHeader className="bg-gray-50/20 border-b border-gray-100 flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 leading-tight">Supervision des Livraisons</CardTitle>
                <CardDescription className="text-gray-400 font-medium tracking-tight">
                  {recentMissions.length} missions récentes • Temps réel
                </CardDescription>
              </div>
              <Link href="/admin/live">
                <Button variant="ghost" className="text-brand-blue font-black text-[10px] uppercase tracking-widest flex gap-2">
                  Voir live monitor <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {recentMissions.length > 0 ? recentMissions.map((mission) => {
                  const s = STATUS_TRANSLATE[mission.status] || { label: mission.status, color: 'text-gray-400', dot: 'bg-gray-300' }
                  return (
                    <Link key={mission.id} href={`/admin/live?id=${mission.id}`}>
                      <div className="p-6 flex items-center justify-between hover:bg-gray-50/20 transition-all group cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">
                              #{mission.id.slice(0, 8).toUpperCase()} <span className="text-gray-400 font-bold">•</span> <span className="uppercase">{mission.type}</span>
                            </p>
                            <p className="text-xs text-gray-400 font-bold tracking-tight">
                              {mission.client?.full_name || 'Client Inconnu'} → {mission.driver?.full_name || 'Non assigné'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</p>
                            <p className="text-xs text-gray-400 font-bold">
                              {new Date(mission.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="text-sm font-black text-slate-900">{(mission.price_fcfa || 0).toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span></p>
                          <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  )
                }) : (
                  <div className="p-16 text-center">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Aucune mission enregistrée</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Fleet Health */}
          <Card className="border-none bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-8 tracking-tight">Santé de la Plateforme</h3>
              <div className="space-y-7">
                {[
                  {
                    label: 'Taux de livraison',
                    value: recentMissions.length > 0
                      ? Math.round((recentMissions.filter(m => m.status === 'delivered').length / recentMissions.length) * 100)
                      : 0,
                    color: 'bg-green-500',
                  },
                  {
                    label: 'Missions assignées',
                    value: recentMissions.length > 0
                      ? Math.round((recentMissions.filter(m => m.driver_id).length / recentMissions.length) * 100)
                      : 0,
                    color: 'bg-brand-orange',
                  },
                  {
                    label: 'Paiements reçus',
                    value: recentMissions.length > 0
                      ? Math.round((recentMissions.filter(m => m.payment_status === 'paid').length / recentMissions.length) * 100)
                      : 0,
                    color: 'bg-brand-blue',
                  },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="opacity-50">{bar.label}</span>
                      <span>{bar.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.value}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        className={`h-full ${bar.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-white/5 rounded-[28px] border border-white/10 text-center backdrop-blur-sm">
                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2">Marge Nette Estimée</p>
                <p className="text-4xl font-black">
                  {Math.floor(stats.revenue * 0.15).toLocaleString()}
                  <span className="text-xs opacity-40 ml-1">FCFA</span>
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-blue opacity-20 rounded-full blur-3xl animate-pulse" />
          </Card>

          {/* Recent Events */}
          <Card className="border-none shadow-premium bg-white p-8 rounded-[32px]">
            <h3 className="font-black text-slate-900 mb-6">Activité Récente</h3>
            <div className="space-y-5">
              {recentMissions.slice(0, 4).map((mission, i) => {
                const s = STATUS_TRANSLATE[mission.status]
                const icons: Record<string, any> = {
                  delivered: ShieldCheck,
                  pending: Clock,
                  cancelled: AlertTriangle,
                }
                const Icon = icons[mission.status] || Package
                const iconColors: Record<string, string> = {
                  delivered: 'text-green-500',
                  pending: 'text-brand-orange',
                  cancelled: 'text-red-500',
                }
                return (
                  <div key={mission.id} className="flex gap-4 items-start">
                    <div className={`p-2.5 rounded-2xl bg-gray-50/50 ${iconColors[mission.status] || 'text-brand-blue'} border border-gray-100/50 shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 leading-snug truncate">Mission #{mission.id.slice(0,6).toUpperCase()} — {s?.label || mission.status}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                        {new Date(mission.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              {recentMissions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucune activité récente</p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-brand-blue font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-50 border border-gray-100">
              Voir tous les logs
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
