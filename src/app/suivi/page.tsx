"use client"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Search, MapPin, Truck, Package, Loader2, Info, Clock,
  CheckCircle, Navigation, Phone, User, Calendar, Zap, ArrowRight
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with Google Maps
const TrackingMap = dynamic(
  () => import("@/components/tracking-map").then(m => m.TrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 gap-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Chargement de la carte...</p>
      </div>
    ),
  }
)

const STATUS_STEPS = [
  { key: "pending",   label: "Déposé",    icon: Clock,         desc: "Commande enregistrée" },
  { key: "accepted",  label: "Assigné",   icon: User,          desc: "Livreur en route" },
  { key: "picked_up", label: "En transit", icon: Truck,        desc: "Colis récupéré" },
  { key: "delivered", label: "Livré",     icon: CheckCircle,   desc: "Mission accomplie" },
]

const STATUS_ORDER = ["pending", "accepted", "picked_up", "delivered"]

export default function SuiviPage() {
  const [trackingId, setTrackingId] = useState("")
  const [loading, setLoading] = useState(false)
  const [mission, setMission] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to real-time updates once a mission is found
  useEffect(() => {
    if (!mission?.id) return

    const sub = supabase
      .channel(`tracking-${mission.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "missions",
        filter: `id=eq.${mission.id}`,
      }, (payload) => {
        setMission((prev: any) => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [mission?.id])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = trackingId.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setMission(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("missions")
        .select("*, driver:driver_id(full_name, phone), client:client_id(full_name, phone)")
        .or(`id.eq.${trimmed},id.ilike.${trimmed}%`)
        .maybeSingle()

      if (supabaseError) throw supabaseError
      if (!data) {
        setError("Aucun colis trouvé avec cet identifiant. Vérifiez et réessayez.")
      } else {
        setMission(data)
      }
    } catch {
      setError("Une erreur est survenue. Vérifiez votre connexion et réessayez.")
    } finally {
      setLoading(false)
    }
  }

  const currentStepIdx = STATUS_ORDER.indexOf(mission?.status || "pending")

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-28 pb-20">
        {/* ── Hero / Search ── */}
        <section className="max-w-4xl mx-auto px-4 text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Zap className="w-3 h-3" /> Suivi en Direct · Temps Réel
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-4 leading-none"
          >
            Suivez votre <span className="text-brand-orange">colis</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 font-medium mb-10"
          >
            Entrez l'identifiant de votre mission pour voir sa position en temps réel sur la carte.
          </motion.p>

          <form onSubmit={handleTrack}>
            <div className="relative group max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                placeholder="ID mission (ex: 8a2f1c3d...)"
                className="h-16 md:h-20 pl-14 pr-52 rounded-[30px] border-2 border-gray-100 bg-white shadow-xl shadow-brand-blue/5 text-lg font-bold focus:border-brand-blue focus:ring-0"
              />
              <Button
                type="submit"
                disabled={loading || !trackingId.trim()}
                className="absolute right-2 top-2 bottom-2 bg-brand-blue hover:bg-blue-700 text-white px-8 rounded-[24px] font-black text-base flex gap-2 items-center shadow-lg shadow-brand-blue/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4" /> Localiser</>}
              </Button>
            </div>
          </form>
        </section>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto px-4 mb-8"
            >
              <div className="p-5 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold text-sm flex items-center gap-3">
                <Info className="w-5 h-5 shrink-0" /> {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        <AnimatePresence mode="wait">
          {mission && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 space-y-6"
            >
              {/* ── Map + Info Grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[560px]">

                {/* MAP — 3/5 width */}
                <div className="lg:col-span-3 rounded-[32px] overflow-hidden shadow-2xl min-h-[400px] lg:min-h-full relative">
                  {/* Live badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    Live
                  </div>
                  <TrackingMap
                    originAddress={mission.origin_address}
                    destAddress={mission.dest_address}
                    originLat={mission.origin_lat}
                    originLng={mission.origin_lng}
                    destLat={mission.dest_lat}
                    destLng={mission.dest_lng}
                    status={mission.status}
                  />
                </div>

                {/* INFO PANEL — 2/5 width */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                  {/* Status badge + ID */}
                  <Card className="border-none shadow-premium bg-white p-6 rounded-[24px]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Colis</p>
                        <h2 className="text-xl font-black text-slate-900">#{mission.id.slice(0, 8).toUpperCase()}</h2>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          {new Date(mission.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          mission.status === "delivered" ? "bg-green-50 text-green-600" :
                          mission.status === "cancelled" ? "bg-red-50 text-red-500" :
                          "bg-brand-blue text-white"
                        }`}>
                          {mission.status !== "delivered" && <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
                          {STATUS_STEPS.find(s => s.key === mission.status)?.label || mission.status}
                        </span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex gap-3 items-stretch">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="w-3 h-3 rounded-full border-2 border-brand-blue bg-white shrink-0" />
                        <div className="w-px flex-1 border-l-2 border-dashed border-gray-200" />
                        <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Départ</p>
                          <p className="text-sm font-bold text-slate-900 leading-snug">{mission.origin_address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination</p>
                          <p className="text-sm font-bold text-slate-900 leading-snug">{mission.dest_address}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Driver + Details */}
                  <Card className="border-none shadow-premium bg-white p-6 rounded-[24px] space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Informations de livraison</h3>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
                        {mission.driver?.full_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Livreur</p>
                        <p className="font-black text-slate-900 text-sm">{mission.driver?.full_name || "Assignation en cours..."}</p>
                        {mission.driver?.phone && (
                          <a href={`tel:${mission.driver.phone}`} className="text-[10px] text-brand-blue font-bold flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {mission.driver.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Type</p>
                        <p className="text-sm font-bold text-slate-900 capitalize">{mission.type}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Prix</p>
                        <p className="text-sm font-bold text-slate-900">{(mission.price_fcfa || 0).toLocaleString()} FCFA</p>
                      </div>
                      {mission.distance_km && (
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Distance</p>
                          <p className="text-sm font-bold text-slate-900">{mission.distance_km} km</p>
                        </div>
                      )}
                      {mission.estimated_time_min && (
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Temps estimé</p>
                          <p className="text-sm font-bold text-slate-900">{mission.estimated_time_min} min</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* ── Progress Stepper ── */}
              <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-sm font-black mb-8 text-center uppercase tracking-widest opacity-60">Progression de la livraison</h3>

                <div className="relative flex justify-between items-center max-w-3xl mx-auto">
                  {/* Background track */}
                  <div className="absolute h-1 bg-white/10 left-0 right-0 top-[18px] -z-0" />
                  {/* Progress fill */}
                  <motion.div
                    className="absolute h-1 bg-brand-orange left-0 top-[18px] -z-0"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />

                  {STATUS_STEPS.map((step, i) => {
                    const isDone = i <= currentStepIdx
                    const isCurrent = i === currentStepIdx
                    const Icon = step.icon

                    return (
                      <div key={step.key} className="flex flex-col items-center gap-3 relative z-10">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: isCurrent ? 1.15 : 1 }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
                              : "bg-slate-800 text-slate-600"
                          } ${isCurrent ? "ring-4 ring-brand-orange/25" : ""}`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                        <div className="text-center">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isDone ? "text-white" : "text-slate-600"}`}>
                            {step.label}
                          </p>
                          <p className={`text-[9px] font-medium mt-0.5 hidden md:block ${isDone ? "text-white/50" : "text-slate-700"}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Delivered banner */}
                {mission.status === "delivered" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center p-4 bg-green-500/10 border border-green-500/20 rounded-2xl"
                  >
                    <p className="text-green-400 font-black text-sm">🎉 Colis livré avec succès !</p>
                    {mission.delivered_at && (
                      <p className="text-green-400/60 text-xs font-medium mt-1">
                        Livré le {new Date(mission.delivered_at).toLocaleString("fr-FR")}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state hint ── */}
        {!mission && !error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto px-4 mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Search, title: "Trouvez", desc: "Entrez votre ID de mission" },
                { icon: MapPin, title: "Localisez", desc: "Visualisez sur Google Maps" },
                { icon: Zap, title: "Suivez Live", desc: "Mise à jour en temps réel" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl gap-3">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <p className="font-black text-slate-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
