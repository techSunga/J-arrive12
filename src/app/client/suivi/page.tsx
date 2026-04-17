"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Truck, Phone, MessageCircle, Clock, CheckCircle2, Loader2, Package, Zap, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ChatDialog } from "@/components/chat-dialog"

const TrackingMap = dynamic(
  () => import("@/components/tracking-map").then(m => m.TrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 gap-3 rounded-[32px]">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Chargement de la carte...</p>
      </div>
    ),
  }
)

const STEPS = [
  { id: "pending",   label: "En attente",   desc: "Recherche d'un livreur...",           icon: Clock,        color: "bg-yellow-500" },
  { id: "accepted",  label: "Confirmé",     desc: "Le livreur arrive au point de départ", icon: CheckCircle2, color: "bg-brand-blue" },
  { id: "picked_up", label: "En transit",   desc: "Le colis est en route vers vous",      icon: Truck,        color: "bg-brand-orange" },
  { id: "delivered", label: "Livré ✅",     desc: "Commande terminée avec succès",        icon: CheckCircle2, color: "bg-green-500" },
]

export default function ClientSuiviPage() {
  const [mission, setMission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allMissions, setAllMissions] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchMissions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("missions")
        .select("*, driver:driver_id(full_name, phone)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (data && data.length > 0) {
        setAllMissions(data)
        
        // Get mission from ID if in URL
        const urlParams = new URLSearchParams(window.location.search)
        const urlId = urlParams.get('id')
        
        const active = urlId ? data.find(m => m.id === urlId) : (data.find(m => !["delivered", "cancelled"].includes(m.status)) || data[0])
        
        if (active) {
          setMission(active)
          setSelectedId(active.id)
          
          // Check if reviewed if delivered
          if (active.status === 'delivered') {
            const { data: rev } = await supabase
              .from('reviews')
              .select('id')
              .eq('mission_id', active.id)
              .maybeSingle()
            setHasReviewed(!!rev)
            if (!rev) setShowReviewModal(true)
          }
        }
      }
    } catch (err) {
      console.error("Error fetching missions:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  // Real-time subscription to mission updates
  useEffect(() => {
    if (!mission?.id) return

    const sub = supabase
      .channel(`client-suivi-${mission.id}`)
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

  const selectMission = async (m: any) => {
    setMission(m)
    setSelectedId(m.id)
    if (m.status === 'delivered') {
      const { data: rev } = await supabase
        .from('reviews')
        .select('id')
        .eq('mission_id', m.id)
        .maybeSingle()
      setHasReviewed(!!rev)
      if (!rev) setShowReviewModal(true)
    } else {
      setHasReviewed(false)
      setShowReviewModal(false)
    }
  }

  const submitReview = async () => {
    if (!mission || !mission.driver_id) return
    setSubmittingReview(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('reviews').insert({
        mission_id: mission.id,
        client_id: user?.id,
        driver_id: mission.driver_id,
        rating,
        comment
      })
      if (error) throw error
      toast.success("Merci pour votre avis !")
      setHasReviewed(true)
      setShowReviewModal(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === mission?.status)

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold tracking-tight">Localisation en cours...</p>
      </div>
    )
  }

  // ── No missions ──
  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-gray-100 p-8 rounded-full">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Aucune commande en cours</h2>
          <p className="text-gray-500 mt-2">Passez une commande pour commencer le suivi en temps réel.</p>
        </div>
        <Link href="/client/commander">
          <Button className="bg-brand-blue font-bold px-8 rounded-2xl">Commander maintenant</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Suivi Live</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suivi de commande</h1>
          <p className="text-gray-500 font-medium">
            #{mission.id.slice(0, 8).toUpperCase()} · {STEPS[currentStepIndex]?.label || mission.status}
          </p>
        </div>
        <Button variant="outline" className="border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50">
          Signaler un problème
        </Button>
      </div>

      {/* Mission selector if multiple */}
      {allMissions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allMissions.map(m => (
            <button
              key={m.id}
              onClick={() => selectMission(m)}
              className={`shrink-0 text-[10px] font-black px-3 py-2 rounded-xl uppercase tracking-widest transition-all ${
                selectedId === m.id
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              #{m.id.slice(0, 6).toUpperCase()} · {m.type}
            </button>
          ))}
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[550px]">

        {/* MAP */}
        <div className="flex-1 rounded-[32px] overflow-hidden shadow-premium min-h-[380px] relative">
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

        {/* Sidebar */}
        <aside className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto">

          {/* Driver card */}
          <Card className="border border-gray-100 shadow-premium rounded-[28px] bg-white">
            <CardHeader className="pb-4 border-b border-gray-50">
              <CardTitle className="text-base font-black text-slate-900">Livreur J'ARRIVE</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {mission.driver ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-black text-white border-2 border-brand-orange/30 shrink-0">
                      {mission.driver.full_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{mission.driver.full_name}</h4>
                      <div className="flex items-center gap-1 text-brand-orange mt-0.5">
                        <Zap className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Livreur Certifié</span>
                      </div>
                      {mission.driver.phone && (
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{mission.driver.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {mission.driver.phone && (
                      <a href={`tel:${mission.driver.phone}`}>
                        <Button variant="outline" className="w-full h-11 flex gap-2 font-black text-brand-blue border-blue-100 bg-blue-50/50 hover:bg-blue-100 rounded-2xl uppercase text-[10px] tracking-widest">
                          <Phone className="w-4 h-4" /> Appeler
                        </Button>
                      </a>
                    )}
                    <ChatDialog 
                      missionId={mission.id}
                      currentUserId={mission.client_id}
                      otherUserName={mission.driver.full_name || "Livreur"}
                      trigger={
                        <Button variant="outline" className="h-11 flex gap-2 font-black text-brand-orange border-orange-100 bg-orange-50/50 hover:bg-orange-100 rounded-2xl uppercase text-[10px] tracking-widest">
                          <MessageCircle className="w-4 h-4" /> Chat
                        </Button>
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" />
                  <p className="text-xs font-bold text-gray-400">Recherche d'un livreur disponible...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery address */}
          <Card className="border border-gray-100 shadow-sm rounded-[28px] bg-white p-5">
            <div className="flex gap-3 items-stretch">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-blue bg-white shrink-0" />
                <div className="w-px flex-1 border-l-2 border-dashed border-gray-200" />
                <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              </div>
              <div className="flex-1 flex flex-col justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Départ</p>
                  <p className="text-sm font-bold text-slate-900">{mission.origin_address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination</p>
                  <p className="text-sm font-bold text-slate-900">{mission.dest_address}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                <p className="text-sm font-bold text-slate-900 capitalize">{mission.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix</p>
                <p className="text-sm font-bold text-slate-900">{(mission.price_fcfa || 0).toLocaleString()} FCFA</p>
              </div>
            </div>
          </Card>

          {/* Status stepper */}
          <Card className="border border-gray-100 shadow-sm rounded-[28px] bg-white p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Progression</h3>
            <div className="relative space-y-8">
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100" />
              {STEPS.map((step, idx) => {
                const isPast = idx < currentStepIndex
                const isCurrent = idx === currentStepIndex
                const isFuture = idx > currentStepIndex
                const Icon = step.icon

                return (
                  <div key={step.id} className={`flex gap-4 items-start transition-opacity duration-500 ${isFuture ? "opacity-25" : ""}`}>
                    <div className={`relative z-10 p-2 rounded-full text-white shadow-md shrink-0 ${
                      isPast ? "bg-green-500" : isCurrent ? `${step.color} scale-110` : "bg-gray-200"
                    } ${isCurrent ? "ring-4 ring-current/20" : ""}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className={`font-black text-sm ${isFuture ? "text-gray-400" : "text-slate-900"}`}>{step.label}</p>
                      <p className="text-xs text-gray-400 font-medium">{step.desc}</p>
                      {isCurrent && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`mt-2 inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${step.color} text-white`}
                        >
                          En cours ···
                        </motion.span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </aside>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && mission?.status === 'delivered' && !hasReviewed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden p-8"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto text-green-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Colis Livré ! 🎁</h2>
                <p className="text-sm text-gray-500 font-medium">Comment s'est passée votre livraison avec {mission.driver?.full_name || 'votre livreur'} ?</p>
                
                <div className="flex justify-center gap-2 py-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className="transition-transform active:scale-90"
                    >
                      <Star className={`w-10 h-10 ${rating >= s ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Laissez un petit commentaire (optionnel)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 min-h-[100px] resize-none"
                />

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowReviewModal(false)}
                    className="rounded-2xl font-bold text-gray-400 h-14"
                  >
                    Plus tard
                  </Button>
                  <Button 
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-black rounded-2xl h-14 shadow-lg shadow-brand-blue/20"
                  >
                    {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
