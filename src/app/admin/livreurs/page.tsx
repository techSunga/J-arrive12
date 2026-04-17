"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Truck, MoreVertical, Star, MapPin, Search, Plus, Loader2, RefreshCw, Phone, CheckCircle2, XCircle } from "lucide-react"
import { useState, useMemo } from "react"
import { useAllProfiles } from "@/hooks/use-supabase"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLivreurs() {
  const { profiles: drivers, loading, refresh } = useAllProfiles('driver')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [processing, setProcessing] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return drivers.filter(d => {
      const matchSearch = !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search)
      const matchStatus = statusFilter === 'all' 
        || (statusFilter === 'verified' && d.is_verified)
        || (statusFilter === 'pending' && !d.is_verified)
      return matchSearch && matchStatus
    })
  }, [drivers, search, statusFilter])

  const stats = useMemo(() => ({
    total: drivers.length,
    verified: drivers.filter(d => d.is_verified).length,
    pending: drivers.filter(d => !d.is_verified).length,
  }), [drivers])

  const handleApprove = async (id: string) => {
    setProcessing(id)
    await supabase.from('profiles').update({ is_verified: true } as any).eq('id', id)
    setProcessing(null)
    refresh()
  }

  const handleRevoke = async (id: string) => {
    setProcessing(id)
    await supabase.from('profiles').update({ is_verified: false } as any).eq('id', id)
    setProcessing(null)
    refresh()
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Flotte de Livreurs</h1>
          <p className="text-gray-500 font-medium">Gestion et vérification des partenaires • Temps réel</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 font-bold flex gap-2 rounded-2xl" onClick={refresh}>
            <RefreshCw className="w-4 h-4" /> Actualiser
          </Button>
          <Button className="bg-brand-orange font-bold px-8 shadow-lg shadow-brand-orange/20 flex gap-2 rounded-2xl">
            <Plus className="w-4 h-4" /> Recruter
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Livreurs</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '—' : stats.total}</p>
        </Card>
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vérifiés ✅</p>
          <p className="text-3xl font-black text-green-600">{loading ? '—' : stats.verified}</p>
        </Card>
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">En attente 🕐</p>
          <p className="text-3xl font-black text-brand-orange">{loading ? '—' : stats.pending}</p>
        </Card>
      </div>

      {/* Table */}
      <Card className="border border-white shadow-premium bg-white rounded-[24px] overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 bg-gray-50 border-none rounded-xl w-68"
                placeholder="Rechercher un livreur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'verified', label: '✅ Vérifiés' },
                { key: 'pending', label: '🕐 En attente' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`text-[10px] font-black px-3 py-2 rounded-xl uppercase tracking-widest transition-all ${
                    statusFilter === f.key ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400">{filtered.length} livreur{filtered.length > 1 ? 's' : ''}</span>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
              <p className="text-sm text-gray-400 font-bold">Synchronisation de la flotte...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">Aucun livreur trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-100">
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Livreur</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inscrit le</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((driver) => (
                    <motion.tr
                      key={driver.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                            {driver.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{driver.full_name || 'Sans nom'}</p>
                            <p className="text-[10px] font-medium text-gray-400">{driver.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {driver.phone || '—'}
                        </div>
                      </td>
                      <td className="p-4">
                        {driver.is_verified ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            <ShieldCheck className="w-3 h-3" /> Vérifié
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-brand-orange bg-orange-50 px-2 py-1 rounded-md">En vérification</span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-400">
                        {new Date(driver.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {!driver.is_verified ? (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(driver.id)}
                              disabled={processing === driver.id}
                              className="text-[10px] h-8 px-3 bg-green-600 hover:bg-green-700 font-black rounded-lg flex gap-1"
                            >
                              {processing === driver.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Approuver
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevoke(driver.id)}
                              disabled={processing === driver.id}
                              className="text-[10px] h-8 px-3 border-red-100 text-red-500 hover:bg-red-50 font-black rounded-lg flex gap-1"
                            >
                              {processing === driver.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Révoquer
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
