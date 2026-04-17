"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Filter, MoreVertical, ShieldCheck, Mail, Phone, Download, Plus, Loader2, RefreshCw, UserX, UserCheck } from "lucide-react"
import { useState, useMemo } from "react"
import { useAllProfiles } from "@/hooks/use-supabase"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

const ROLE_LABELS: Record<string, string> = {
  particular: 'Particulier',
  pro: 'Pro',
  driver: 'Livreur',
  admin: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  particular: 'bg-blue-50 text-blue-600',
  pro:        'bg-purple-50 text-purple-600',
  driver:     'bg-orange-50 text-brand-orange',
  admin:      'bg-slate-100 text-slate-700',
}

export default function AdminUsers() {
  const { profiles, loading, refresh } = useAllProfiles()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [suspending, setSuspending] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      const matchRole = roleFilter === 'all' || p.role === roleFilter
      const matchSearch = !search || 
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search)
      return matchRole && matchSearch
    })
  }, [profiles, search, roleFilter])

  const stats = useMemo(() => ({
    total: profiles.length,
    particular: profiles.filter(p => p.role === 'particular').length,
    pro: profiles.filter(p => p.role === 'pro').length,
    drivers: profiles.filter(p => p.role === 'driver').length,
  }), [profiles])

  const handleSuspend = async (id: string) => {
    setSuspending(id)
    await supabase.from('profiles').update({ role: 'suspended' } as any).eq('id', id)
    setSuspending(null)
    refresh()
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 font-medium">Clients particuliers et professionnels • Temps réel</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 font-bold flex gap-2 rounded-2xl" onClick={refresh}>
            <RefreshCw className="w-4 h-4" /> Actualiser
          </Button>
          <Button className="bg-brand-blue font-bold px-8 shadow-lg shadow-brand-blue/20 flex gap-2 rounded-2xl">
            <Plus className="w-4 h-4" /> Nouvel Utilisateur
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-900' },
          { label: 'Particuliers', value: stats.particular, color: 'text-blue-600' },
          { label: 'Professionnels', value: stats.pro, color: 'text-purple-600' },
          { label: 'Livreurs', value: stats.drivers, color: 'text-brand-orange' },
        ].map((s, i) => (
          <Card key={i} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="border border-white shadow-premium bg-white rounded-[24px] overflow-hidden">
        {/* Filters */}
        <CardHeader className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 bg-gray-50 border-none rounded-xl w-72"
                placeholder="Nom, téléphone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'particular', 'pro', 'driver'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`text-[10px] font-black px-3 py-2 rounded-xl uppercase tracking-widest transition-all ${
                    roleFilter === r ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {r === 'all' ? 'Tous' : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
              <p className="text-sm text-gray-400 font-bold">Chargement des utilisateurs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-100">
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Utilisateur</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vérifié</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inscrit le</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold shrink-0">
                            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{user.full_name || 'Sans nom'}</p>
                            <p className="text-[10px] font-medium text-gray-400">{user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${ROLE_COLORS[user.role] || 'bg-gray-50 text-gray-400'}`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {user.phone || '—'}
                        </div>
                      </td>
                      <td className="p-4">
                        {user.is_verified ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-green-600">
                            <ShieldCheck className="w-3 h-3" /> Vérifié
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-gray-400">En attente</span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-400" disabled={suspending === user.id}>
                          {suspending === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
                        </Button>
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
