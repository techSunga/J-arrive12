"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Package, User, Loader2, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

type Mission = {
  id: string
  type: string
  driver_id: string
  created_at: string
  driver: { full_name: string } | null
}

type Review = {
  id: string
  rating: number
  comment: string
  created_at: string
  driver: { full_name: string } | null
}

export default function AvisPage() {
  const [rating, setRating] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [pendingMissions, setPendingMissions] = useState<Mission[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch 'delivered' missions
      const { data: missions } = await supabase
        .from('missions')
        .select(`id, type, driver_id, created_at, driver:profiles!driver_id(full_name)`)
        .eq('client_id', user.id)
        .eq('status', 'delivered')

      // Fetch reviews already submitted
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`id, mission_id, rating, comment, created_at, driver:profiles!driver_id(full_name)`)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      const reviewedMissionIds = new Set(reviews?.map(r => r.mission_id) || [])
      
      const unreviewed = (missions as unknown as Mission[])?.filter(m => !reviewedMissionIds.has(m.id)) || []
      
      setPendingMissions(unreviewed)
      if (reviews) {
        setMyReviews(reviews as unknown as Review[])
      }

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (missionId: string, driverId: string) => {
    const missionRating = rating[missionId] || 0
    if (missionRating === 0) {
      toast.error('Veuillez sélectionner au moins une étoile.')
      return
    }

    setSubmittingId(missionId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const { error } = await supabase
        .from('reviews')
        .insert({
          mission_id: missionId,
          client_id: user.id,
          driver_id: driverId,
          rating: missionRating,
          comment: comments[missionId] || ''
        })

      if (error) throw error

      toast.success("Avis soumis avec succès. Merci !")
      fetchData() // Refresh list

    } catch (err: any) {
      alert("Erreur lors de la soumission de l'avis: " + err.message)
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement des avis...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Avis et Notations</h1>
        <p className="text-gray-500">Partagez votre expérience pour nous aider à nous améliorer</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <div className="w-2 h-8 bg-brand-orange rounded-full" />
           Avis en attente ({pendingMissions.length})
        </h3>
        {pendingMissions.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-[32px] flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Vous n'avez aucune mission en attente d'évaluation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {pendingMissions.map((mission) => (
               <Card key={mission.id} className="border border-gray-100 shadow-sm bg-white overflow-hidden hover:border-brand-blue transition-all group">
                  <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-50 p-2 rounded-xl border border-orange-100">
                           <Package className="w-5 h-5 text-brand-orange" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-tighter">CMD-{mission.id.slice(0, 4)}</span>
                     </div>
                     <p className="font-bold text-slate-900 mb-1">{mission.type === 'package' ? 'Livraison de Colis' : mission.type === 'food' ? 'Livraison Repas' : 'Course'}</p>
                     <p className="text-xs text-gray-500 mb-4">Livreur : <span className="font-bold text-brand-blue">{mission.driver?.full_name || 'Anonyme'}</span></p>
                     
                     <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            onClick={() => setRating(prev => ({ ...prev, [mission.id]: star }))}
                            className={`hover:scale-110 transition-transform ${star <= (rating[mission.id] || 0) ? 'text-brand-orange' : 'text-gray-200'}`}
                          >
                            <Star className={`w-6 h-6 ${star <= (rating[mission.id] || 0) ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                     </div>

                     <textarea 
                       className="w-full h-20 text-sm bg-gray-50 border-gray-100 rounded-xl p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue"
                       placeholder="Laissez un commentaire (optionnel)..."
                       value={comments[mission.id] || ''}
                       onChange={e => setComments(prev => ({ ...prev, [mission.id]: e.target.value }))}
                     />
                     
                     <Button 
                       onClick={() => handleSubmitReview(mission.id, mission.driver_id)}
                       disabled={submittingId === mission.id}
                       className="w-full bg-brand-blue group-hover:bg-brand-blue-dark transition-all font-bold"
                     >
                       {submittingId === mission.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer l'avis"}
                     </Button>
                  </CardContent>
               </Card>
             ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <div className="w-2 h-8 bg-brand-blue rounded-full" />
           Mes avis récents
        </h3>
        <div className="space-y-4">
           {myReviews.map((rev) => (
             <Card key={rev.id} className="border border-gray-100 shadow-sm bg-gray-50/30">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-brand-blue shadow-sm">
                            <User className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-950">Livreur : {rev.driver?.full_name || 'Anonyme'}</p>
                            <p className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex gap-0.5">
                         {[1, 2, 3, 4, 5].map((s) => (
                           <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-brand-orange fill-current' : 'text-gray-200'}`} />
                         ))}
                      </div>
                   </div>
                   {rev.comment && (
                     <p className="text-sm text-gray-600 italic leading-relaxed pl-4 border-l-2 border-brand-orange">
                        "{rev.comment}"
                     </p>
                   )}
                </CardContent>
             </Card>
           ))}
        </div>
      </div>
    </div>
  )
}
