"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Mail, Lock, User, Phone, Building, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'particular' | 'pro' | 'driver'>('particular')
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    company: ""
  })

  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            role: role,
            company: formData.company
          }
        }
      })

      if (authError) throw authError
      
      if (data.user) {
        // Manually insert into profiles to ensure it exists immediately
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: formData.name,
              phone: formData.phone,
              role: role,
              company: formData.company,
              email: formData.email
            }
          ])
        
        if (profileError) {
          console.error("Profile creation error:", profileError)
          // We don't throw here to avoid blocking registration if the trigger already worked
        }
      }

      // Automatic role-based redirection
      if (role === 'driver') {
        router.push('/driver')
      } else {
        router.push('/client')
      }

    } catch (err: any) {
      setError(err.message || "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
           <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="bg-brand-orange p-1.5 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
           </Link>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Créer votre compte</h1>
           <p className="text-gray-500 font-medium mt-2">Rejoignez la révolution logistique au Congo</p>
        </div>

        <div className="mb-12 flex justify-center gap-4">
           {[1, 2].map((s) => (
             <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                   {s}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? 'text-brand-blue' : 'text-gray-400'}`}>
                   {s === 1 ? 'Choisir Profil' : 'Informations'}
                </span>
                {s === 1 && <div className="w-12 h-px bg-gray-100 mx-2" />}
             </div>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {step === 1 ? (
             <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
             >
                {[
                  { id: 'particular', title: 'Particulier', desc: 'Pour vos besoins personnels', icon: User, color: 'brand-blue' },
                  { id: 'pro', title: 'Professionnel', desc: 'E-commerçants & Restos', icon: Building, color: 'brand-blue' },
                  { id: 'driver', title: 'Livreur', desc: 'Devenir partenaire', icon: Truck, color: 'brand-orange' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                        setRole(p.id as any)
                        setStep(2)
                    }}
                    className={`p-8 rounded-[32px] border-2 text-left transition-all hover:scale-[1.03] group ${
                        role === p.id 
                            ? `border-brand-${p.id === 'driver' ? 'orange' : 'blue'} bg-white shadow-xl` 
                            : 'border-gray-50 bg-gray-50/30'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                         p.id === 'driver' ? 'bg-orange-50 text-brand-orange' : 'bg-blue-50 text-brand-blue'
                     }`}>
                        <p.icon className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-2">{p.title}</h3>
                     <p className="text-xs text-gray-400 font-medium leading-relaxed">{p.desc}</p>
                  </button>
                ))}
             </motion.div>
           ) : (
             <motion.form
              key="step2"
              onSubmit={handleRegister}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 max-w-lg mx-auto"
             >
                <Card className="border border-gray-100 shadow-premium overflow-hidden bg-white">
                   <CardContent className="p-8 space-y-6">
                      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold">{error}</div>}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom Complet</label>
                            <div className="relative">
                               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Jean Bakoula" 
                                className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold" 
                                required 
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                            <div className="relative">
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <Input 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="06 000 00 00" 
                                className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold" 
                                required 
                               />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                         <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                type="email" 
                                placeholder="jean@exemple.com" 
                                className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold" 
                                required 
                            />
                         </div>
                      </div>

                      {role === 'pro' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l'entreprise</label>
                            <div className="relative">
                               <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <Input 
                                value={formData.company}
                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                placeholder="Bakoula Électronique" 
                                className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold" 
                                required 
                               />
                            </div>
                        </div>
                      )}

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
                         <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                type="password" 
                                placeholder="••••••••" 
                                className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold" 
                                required 
                            />
                         </div>
                      </div>

                      <div className="pt-4 space-y-4">
                         <Button 
                          disabled={loading}
                          className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl border-none ${
                            role === 'driver' ? 'bg-brand-orange shadow-brand-orange/20' : 'bg-brand-blue shadow-brand-blue/20'
                          }`}
                         >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <span className="flex items-center gap-2">Terminer l'inscription <CheckCircle2 className="w-5 h-5" /></span>
                            )}
                         </Button>
                         <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-bold text-gray-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Retour</button>
                      </div>
                   </CardContent>
                </Card>
             </motion.form>
           )}
        </AnimatePresence>

        <div className="text-center mt-12">
            <p className="text-sm text-gray-500 font-medium">
                Vous avez déjà un compte ? {" "}
                <Link href="/auth/login" className="text-brand-blue font-bold hover:underline">Se connecter</Link>
            </p>
        </div>
      </div>
    </div>
  )
}
