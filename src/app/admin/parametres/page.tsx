"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Settings, User, Key, Save, Loader2, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminParametresPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [profile, setProfile] = useState({
    id: "",
    full_name: "",
    phone: "",
    email: ""
  })

  // Platform settings state from database
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    auto_assign_drivers: true,
    require_kyc: true,
    admin_notifications: true,
    base_fee: 1000,
    price_per_km: 500,
    commission_rate: 15
  })

  useEffect(() => {
    fetchData()

    // Realtime subscription to settings table
    const channel = supabase.channel('platform_settings_rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings' }, (payload) => {
        setSettings(payload.new as any)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch admin profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          email: user.email || ""
        })
      }

      // Fetch global platform settings
      const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 1)
        .single()
        
      if (settingsData) {
        setSettings({
          maintenance_mode: settingsData.maintenance_mode,
          auto_assign_drivers: settingsData.auto_assign_drivers,
          require_kyc: settingsData.require_kyc,
          admin_notifications: settingsData.admin_notifications,
          base_fee: settingsData.base_fee,
          price_per_km: settingsData.price_per_km,
          commission_rate: settingsData.commission_rate
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess("")

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq('id', profile.id)

      if (error) throw error
      
      setSuccess("Profil mis à jour avec succès")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de la mise à jour du profil.")
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = async (key: keyof typeof settings, value?: any) => {
    const newValue = value !== undefined ? value : !settings[key]
    // Optimistic UI update
    setSettings(prev => ({ ...prev, [key]: newValue }))
    
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({ [key]: newValue, updated_at: new Date().toISOString() })
        .eq('id', 1)

      if (error) throw error
      toast.success("Configuration modifiée.")
    } catch (err: any) {
      console.error(err)
      toast.error("Erreur: " + err.message)
      // Revert optimism if failed
      setSettings(prev => ({ ...prev, [key]: settings[key] }))
    }
  }

  const handleResetPassword = async () => {
    try {
      if (!profile.email) {
        toast.error("Email administrateur introuvable.")
        return
      }
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      toast.success("Lien de réinitialisation envoyé avec succès.")
    } catch (err: any) {
      console.error(err)
      toast.error("Erreur: " + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement des paramètres...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres</h1>
          <p className="text-gray-500 font-medium">Configuration globale et préférences administrateur</p>
        </div>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-2xl border border-green-100 font-bold text-sm shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[32px]">
            <CardHeader className="bg-gray-50/20 border-b border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 text-brand-blue rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-black text-slate-900">Profil Administrateur</CardTitle>
              </div>
              <CardDescription className="text-gray-500 font-medium ml-12">Vos informations de connexion et de contact.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Nom complet</Label>
                    <Input 
                      value={profile.full_name} 
                      onChange={e => setProfile({...profile, full_name: e.target.value})}
                      className="h-12 bg-gray-50 border-gray-100 rounded-xl font-bold px-4 focus:ring-brand-blue" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Numéro de téléphone</Label>
                    <Input 
                      value={profile.phone} 
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      className="h-12 bg-gray-50 border-gray-100 rounded-xl font-bold px-4 focus:ring-brand-blue" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Adresse Email</Label>
                    <Input 
                      disabled 
                      value={profile.email} 
                      className="h-12 bg-gray-100 border-gray-200 rounded-xl font-bold px-4 text-gray-500 cursor-not-allowed" 
                    />
                    <p className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-1.5">
                      <HelpCircle className="w-3 h-3" /> L&apos;email ne peut être modifié que via le portail de sécurité primaire.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-slate-900 text-white rounded-2xl h-12 px-8 font-black hover:bg-slate-800 transition-all flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder le profil
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-red-100 shadow-sm bg-white overflow-hidden rounded-[32px]">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div>
                   <h3 className="text-lg font-black text-red-600 mb-1 flex items-center gap-2">
                    <Key className="w-5 h-5" /> Mode Réinitialisation de Mot de passe
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">Envoyez un lien sécurisé à votre adresse email pour changer votre mot de passe d&apos;accès.</p>
                </div>
                <Button onClick={handleResetPassword} variant="outline" className="border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 hover:text-red-700 whitespace-nowrap">
                  Générer le lien
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - System Config */}
        <div className="space-y-8">
          
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[32px]">
            <CardHeader className="bg-slate-900 text-white p-8">
              <div className="flex items-center gap-3 mb-1">
                <Settings className="w-5 h-5 text-brand-orange" />
                <CardTitle className="text-xl font-black">Plateforme</CardTitle>
              </div>
              <CardDescription className="text-slate-400 font-medium">Configurations globales de J&apos;ARRIVE.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                
                <div className="p-6 flex items-start justify-between cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => handleSettingChange('auto_assign_drivers')}>
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 mb-0.5">Assignation Automatique</p>
                    <p className="text-xs text-gray-400 font-medium">Le système propose automatiquement la mission au livreur le plus proche.</p>
                  </div>
                  <Switch checked={settings.auto_assign_drivers} onCheckedChange={() => handleSettingChange('auto_assign_drivers')} className="shrink-0 mt-1" />
                </div>

                <div className="p-6 flex items-start justify-between cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => handleSettingChange('require_kyc')}>
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 mb-0.5">Approbation Stricte (KYC)</p>
                    <p className="text-xs text-gray-400 font-medium">Bloquer les livreurs non vérifiés jusqu&apos;à ce qu&apos;un admin ait validé leurs documents.</p>
                  </div>
                  <Switch checked={settings.require_kyc} onCheckedChange={() => handleSettingChange('require_kyc')} className="shrink-0 mt-1" />
                </div>

                <div className="p-6 flex items-start justify-between cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => handleSettingChange('admin_notifications')}>
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 mb-0.5">Notifications Admin Live</p>
                    <p className="text-xs text-gray-400 font-medium">Recevoir les pings en temps réel lorsqu&apos;un nouvel utilisateur ou une mission arrive.</p>
                  </div>
                  <Switch checked={settings.admin_notifications} onCheckedChange={() => handleSettingChange('admin_notifications')} className="shrink-0 mt-1" />
                </div>
                
                <div className="p-6">
                   <p className="font-bold text-slate-900 mb-4">Tarification (FCFA)</p>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center group">
                         <Label className="text-xs text-gray-400 font-bold uppercase shrink-0">Frais de base</Label>
                         <div className="flex items-center group-hover:bg-gray-50 rounded-lg p-1 transition-all">
                            <input 
                              type="number" 
                              className="w-20 text-right bg-transparent font-black text-brand-blue outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={settings.base_fee}
                              onBlur={(e) => handleSettingChange('base_fee', parseInt(e.target.value))}
                              onChange={(e) => setSettings({...settings, base_fee: parseInt(e.target.value)})}
                            />
                            <span className="text-[10px] font-black text-gray-300 ml-1">FCFA</span>
                         </div>
                      </div>
                      <div className="flex justify-between items-center group">
                         <Label className="text-xs text-gray-400 font-bold uppercase shrink-0">Prix / KM</Label>
                         <div className="flex items-center group-hover:bg-gray-50 rounded-lg p-1 transition-all">
                            <input 
                              type="number" 
                              className="w-20 text-right bg-transparent font-black text-brand-blue outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={settings.price_per_km}
                              onBlur={(e) => handleSettingChange('price_per_km', parseInt(e.target.value))}
                              onChange={(e) => setSettings({...settings, price_per_km: parseInt(e.target.value)})}
                            />
                            <span className="text-[10px] font-black text-gray-300 ml-1">FCFA</span>
                         </div>
                      </div>
                      <div className="flex justify-between items-center group">
                         <Label className="text-xs text-gray-400 font-bold uppercase shrink-0">Commission</Label>
                         <div className="flex items-center group-hover:bg-gray-50 rounded-lg p-1 transition-all">
                            <input 
                              type="number" 
                              className="w-20 text-right bg-transparent font-black text-brand-orange outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={settings.commission_rate}
                              onBlur={(e) => handleSettingChange('commission_rate', parseInt(e.target.value))}
                              onChange={(e) => setSettings({...settings, commission_rate: parseInt(e.target.value)})}
                            />
                            <span className="text-[10px] font-black text-gray-300 ml-1">%</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border shadow-sm overflow-hidden rounded-[32px] transition-colors ${settings.maintenance_mode ? 'border-red-500/50 bg-red-50/50' : 'border-brand-orange/20 bg-orange-50/30'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="pr-4">
                  <h3 className={`font-black flex items-center gap-2 mb-1 ${settings.maintenance_mode ? 'text-red-700' : 'text-slate-900'}`}>
                    <AlertTriangle className={`w-4 h-4 ${settings.maintenance_mode ? 'text-red-500' : 'text-brand-orange'}`} /> Mode Maintenance
                  </h3>
                  <p className={`text-xs font-medium ${settings.maintenance_mode ? 'text-red-600/70' : 'text-gray-500'}`}>Désactiver les commandes client et suspendre temporairement les opérations logistiques.</p>
                </div>
                <Switch 
                  checked={settings.maintenance_mode} 
                  onCheckedChange={() => handleSettingChange('maintenance_mode')}
                  className="data-[state=checked]:bg-red-500 mt-1 shrink-0" 
                />
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
