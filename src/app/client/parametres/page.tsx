"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Bell, Shield, Smartphone, Globe, Eye, EyeOff, Save, Loader2, User } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function ParametresPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq('id', profile.id)

      if (error) throw error
      alert("Profil mis à jour avec succès !")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Erreur lors de la mise à jour.")
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    { id: 'profil', title: "Mon Profil", icon: User },
    { id: 'notifications', title: "Notifications", icon: Bell },
    { id: 'securite', title: "Sécurité", icon: Shield },
  ]
  const [activeSection, setActiveSection] = useState('profil')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
         <p className="mt-4 text-gray-400 font-bold">Chargement de vos réglages...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres du Compte</h1>
        <p className="text-gray-500 font-medium tracking-tight">Gérez votre identité et vos préférences J'ARRIVE</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-3">
           {sections.map((s) => (
             <button 
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] text-sm font-black transition-all ${
                activeSection === s.id 
                  ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' 
                  : 'text-gray-400 hover:bg-gray-100/50 hover:text-slate-900'
              }`}
             >
               <s.icon className={`w-5 h-5 ${activeSection === s.id ? 'text-white' : 'text-gray-300'}`} />
               {s.title}
             </button>
           ))}
        </aside>

        <div className="lg:col-span-3 space-y-8">
           {activeSection === 'profil' && (
             <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[32px]">
                <CardHeader className="bg-gray-50/20 border-b border-gray-50 p-8">
                   <CardTitle className="text-xl font-black text-slate-900">Informations Personnelles</CardTitle>
                   <CardDescription className="text-gray-400 font-medium">Ces informations seront visibles par les livreurs lors de vos missions.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                   <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom complet</label>
                           <Input 
                            value={profile?.full_name || ''} 
                            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                            className="h-14 bg-gray-50 border-none font-black text-sm px-6 rounded-2xl shadow-inner focus:ring-brand-blue/20" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Numéro de téléphone</label>
                           <Input 
                            value={profile?.phone || ''} 
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="h-14 bg-gray-50 border-none font-black text-sm px-6 rounded-2xl shadow-inner focus:ring-brand-blue/20" 
                           />
                        </div>
                      </div>
                      <div className="pt-6 flex justify-end">
                         <Button type="submit" disabled={saving} className="h-14 px-10 bg-brand-blue rounded-2xl font-black text-sm shadow-xl shadow-brand-blue/20 transition-all hover:scale-105 active:scale-95">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> Enregistrer les modifications</>}
                         </Button>
                      </div>
                   </form>
                </CardContent>
             </Card>
           )}

           {activeSection === 'securite' && (
             <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[32px]">
                <CardHeader className="bg-gray-50/20 border-b border-gray-50 p-8">
                   <CardTitle className="text-xl font-black text-slate-900">Sécurité</CardTitle>
                   <CardDescription className="text-gray-400 font-medium">Mettez à jour votre mot de passe régulièrement.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Mot de passe actuel</label>
                      <div className="relative">
                         <Input type={showPass ? "text" : "password"} className="h-14 bg-gray-50 border-none px-6 font-black rounded-2xl shadow-inner pr-16" placeholder="••••••••" />
                         <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue">
                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                         </button>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nouveau mot de passe</label>
                         <Input type="password" placeholder="••••••••" className="h-14 bg-gray-50 border-none px-6 font-black rounded-2xl shadow-inner" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Confirmer</label>
                         <Input type="password" placeholder="••••••••" className="h-14 bg-gray-50 border-none px-6 font-black rounded-2xl shadow-inner" />
                      </div>
                   </div>

                   <div className="pt-8 flex justify-end">
                      <Button className="h-14 px-10 bg-slate-900 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10">
                         Changer le mot de passe
                      </Button>
                   </div>
                </CardContent>
             </Card>
           )}

           <Card className="border-none shadow-premium bg-white rounded-[32px]">
              <CardHeader className="bg-gray-50/20 border-b border-gray-50 p-8">
                 <CardTitle className="text-xl font-black">Préférences de Notification</CardTitle>
                 <CardDescription className="text-gray-400 font-medium">Choisissez comment rester informé.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   "Recevoir des mises à jour sur l'état des commandes",
                   "Alertes de nouvelles offres et promotions",
                   "Notifications de sécurité de compte",
                 ].map((pref, i) => (
                   <div key={i} className="flex items-center justify-between py-2">
                      <span className="text-sm font-black text-slate-700">{pref}</span>
                      <div className="relative inline-flex h-7 w-12 items-center rounded-full bg-brand-blue cursor-pointer">
                         <span className="inline-block h-5 w-5 translate-x-6 transform rounded-full bg-white transition shadow-sm" />
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
