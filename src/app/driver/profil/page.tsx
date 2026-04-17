"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Truck, FileText, Camera, CreditCard, Star, MapPin, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function ProfilLivreur() {
  const [profile, setProfile] = useState<any>(null)
  const [vehicle, setVehicle] = useState<any>({
    type: 'moto',
    plate_number: '',
    model: '',
    color: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)

  useEffect(() => {
    fetchData()

    let channel: any
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        channel = supabase.channel('profil-updates')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
            (payload) => {
              setProfile(payload.new)
            }
          )
          .subscribe()
      }
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileErr) throw profileErr
      setProfile(profileData)

      // Fetch Vehicle
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', user.id)
        .single()

      if (vehicleData) {
        setVehicle(vehicleData)
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVehicle = async () => {
    setSavingVehicle(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const { data: existing } = await supabase.from('vehicles').select('id').eq('driver_id', user.id).single()

      if (existing) {
        // Update
        const { error } = await supabase
          .from('vehicles')
          .update({
            type: vehicle.type,
            plate_number: vehicle.plate_number,
            model: vehicle.model,
            color: vehicle.color
          })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('vehicles')
          .insert({
            driver_id: user.id,
            type: vehicle.type,
            plate_number: vehicle.plate_number,
            model: vehicle.model,
            color: vehicle.color
          })
        if (error) throw error
      }

      toast.success("Informations du véhicule sauvegardées avec succès !")
    } catch (err: any) {
      toast.error("Erreur lors de la sauvegarde : " + err.message)
    } finally {
      setSavingVehicle(false)
    }
  }

  const handleSavePhone = async () => {
    setSavingPhone(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ phone: profile.phone })
        .eq('id', user.id)

      if (error) throw error
      toast.success("Numéro MoMo mis à jour.")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPhone(false)
    }
  }

  const handleUploadDoc = async (docName: string, file: File) => {
    setUploadingDoc(docName)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${docName}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      toast.success(`${docName} téléchargé avec succès !`)
    } catch (err: any) {
      toast.error("Erreur d'upload : " + err.message)
    } finally {
      setUploadingDoc(null)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "MK"
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Derived metrics
  const displayRating = profile?.rating ? profile.rating.toFixed(1) : "N/A"
  const isVerified = profile?.is_verified

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
         <p className="mt-4 text-gray-400 font-bold tracking-tight">Chargement du profil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Profil Livreur</h1>
          <p className="text-gray-500 font-medium">Gérez vos informations et vos documents de bord</p>
        </div>
        <div className="flex gap-3">
          {isVerified ? (
            <span className="bg-green-100 text-green-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-200 shadow-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Compte Certifié
            </span>
          ) : (
            <span className="bg-orange-100 text-orange-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-200 shadow-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> En Attente de Vérification
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[40px]">
            <CardContent className="p-10 flex flex-col items-center">
              <div className="relative group">
                <div className="w-36 h-36 rounded-[48px] bg-brand-orange/10 flex items-center justify-center text-4xl font-black text-brand-orange border-8 border-white shadow-2xl">
                  {getInitials(profile?.full_name)}
                </div>
                <button className="absolute bottom-0 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h3 className="mt-8 text-2xl font-black text-slate-900 leading-tight text-center">{profile?.full_name}</h3>
              <p className="text-sm text-gray-400 font-bold mt-1">
                Livreur depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Aujourd\'hui'}
              </p>
              
              <div className="mt-10 w-full grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-[24px] bg-gray-50/50 flex flex-col items-center border border-gray-100/50 group hover:bg-white hover:shadow-xl transition-all">
                    <Star className="w-6 h-6 text-yellow-500 fill-current mb-2" />
                    <p className="text-xl font-black text-slate-900">{displayRating}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Note Moy.</p>
                 </div>
                 <div className="p-5 rounded-[24px] bg-gray-50/50 flex flex-col items-center border border-gray-100/50 group hover:bg-white hover:shadow-xl transition-all">
                    <CheckCircle2 className="w-6 h-6 text-brand-blue mb-2" />
                    <p className="text-xl font-black text-slate-900">{profile?.missions_completed || 0}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center">Missions Terminées</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-premium bg-white p-8 rounded-[40px]">
             <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-blue" /> Documents
             </h4>
             <div className="space-y-4">
                 {[
                  { name: "Permis de conduire", key: "permis" },
                  { name: "Assurance Véhicule", key: "assurance" },
                  { name: "Pièce d'Identité", key: "id" },
                ].map((doc, i) => (
                  <div key={i} className="flex flex-col gap-2 py-4 border-b border-gray-50 last:border-0 last:pb-0">
                     <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                           <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">{doc.name}</p>
                        </div>
                        {isVerified ? (
                          <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">VALIDE</span>
                        ) : (
                          <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">EN REVUE</span>
                        )}
                     </div>
                     {!isVerified && (
                       <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            id={`file-${doc.key}`}
                            className="hidden" 
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleUploadDoc(doc.name, file)
                            }}
                          />
                          <Button 
                            variant="outline" 
                            className="w-full text-[10px] font-black uppercase tracking-widest h-9 rounded-xl flex gap-2"
                            onClick={() => document.getElementById(`file-${doc.key}`)?.click()}
                            disabled={uploadingDoc === doc.name}
                          >
                            {uploadingDoc === doc.name ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                            {uploadingDoc === doc.name ? "Envoi..." : "Transférer le document"}
                          </Button>
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[40px]">
             <CardHeader className="bg-gray-50/20 border-b border-gray-50 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                   <Truck className="w-6 h-6 text-brand-orange" /> Informations Véhicule
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</label>
                      <select 
                        value={vehicle.type}
                        onChange={(e) => setVehicle({...vehicle, type: e.target.value})}
                        className="flex h-14 w-full rounded-2xl border-none bg-gray-50 px-5 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 shadow-inner"
                      >
                         <option value="moto">Moto</option>
                         <option value="van">Camionnette (Van)</option>
                         <option value="bicycle">Vélo / Trottinette</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Immatriculation</label>
                      <Input 
                        value={vehicle.plate_number}
                        onChange={(e) => setVehicle({...vehicle, plate_number: e.target.value})}
                        placeholder="Ex: ABC-123-CG" 
                        className="h-14 bg-gray-50 border-none font-black text-sm px-5 rounded-2xl shadow-inner" 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marque / Modèle</label>
                      <Input 
                        value={vehicle.model}
                        onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                        placeholder="Ex: Haojue Express 150" 
                        className="h-14 bg-gray-50 border-none font-black text-sm px-5 rounded-2xl shadow-inner" 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Couleur</label>
                      <Input 
                        value={vehicle.color}
                        onChange={(e) => setVehicle({...vehicle, color: e.target.value})}
                        placeholder="Ex: Bleu" 
                        className="h-14 bg-gray-50 border-none font-black text-sm px-5 rounded-2xl shadow-inner" 
                      />
                   </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-50">
                  <Button 
                    onClick={handleSaveVehicle}
                    disabled={savingVehicle}
                    className="bg-slate-900 text-white hover:bg-slate-800 px-10 h-14 font-black rounded-2xl"
                  >
                    {savingVehicle ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sauvegarder le véhicule"}
                  </Button>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[40px]">
             <CardHeader className="bg-gray-50/20 border-b border-gray-50 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                   <CreditCard className="w-6 h-6 text-brand-blue" /> Paiement & Gains
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-brand-blue/5 rounded-[32px] border border-brand-blue/10 gap-6">
                   <div className="flex items-center gap-5 flex-1">
                      <div className="bg-white p-4 rounded-2xl shadow-premium">
                         <MapPin className="text-brand-blue w-7 h-7" />
                      </div>
                      <div className="w-full">
                         <p className="text-sm font-black text-slate-900 mb-2">Numéro MoMo</p>
                         <Input 
                           value={profile?.phone || ''}
                           onChange={(e) => setProfile({...profile, phone: e.target.value})}
                           placeholder="Numéro de réception"
                           className="h-12 bg-white border-none font-black tracking-widest w-full max-w-[250px]"
                         />
                      </div>
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pt-4">
                   <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex-1">
                    <p className="text-xs text-gray-500 font-bold leading-relaxed">
                      Votre compte MoMo sera crédité automatiquement en fonction de vos requêtes depuis le "Portefeuille". Assurez-vous que le numéro est correct.
                    </p>
                   </div>
                   <Button 
                     onClick={handleSavePhone}
                     disabled={savingPhone}
                     className="bg-brand-blue hover:bg-brand-blue-dark px-10 h-14 font-black rounded-2xl shadow-xl shadow-brand-blue/20 text-sm whitespace-nowrap shrink-0"
                   >
                     {savingPhone ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Mettre à jour"}
                   </Button>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
