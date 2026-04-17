"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Mail, Lock, Eye, EyeOff, Building, User, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'client' | 'driver'>('client')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
         const { data: profile } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', session.user.id)
           .maybeSingle()
         
         if (profile) {
            if (profile.role === 'admin') router.push('/admin')
            else if (profile.role === 'driver') router.push('/driver')
            else router.push('/client')
         }
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (profileError) throw profileError

        if (profile?.role === 'admin') router.push('/admin')
        else if (profile?.role === 'driver') router.push('/driver')
        else router.push('/client')
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-[480px] border-none shadow-premium bg-white rounded-[50px] overflow-hidden">
        <div className="bg-slate-900 p-10 text-white text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-brand-orange p-2 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter">J'ARRIVE</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Bon retour !</h1>
          <p className="text-gray-400 text-sm font-medium">Connectez-vous pour gérer vos livraisons.</p>
        </div>

        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-3">
             {[
               { id: 'client', label: 'Client', icon: User },
               { id: 'driver', label: 'Livreur', icon: Truck },
             ].map((r) => (
               <button
                 key={r.id}
                 onClick={() => setRole(r.id as any)}
                 className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                   role === r.id 
                   ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' 
                   : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                 }`}
               >
                 <r.icon className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
               </button>
             ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-16 pl-12 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-brand-blue/20"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-16 pl-12 pr-12 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-brand-blue/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right">
                <Link href="#" className="text-xs font-bold text-gray-400 hover:text-brand-blue transition-colors">Mot de passe oublié ?</Link>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black text-xl shadow-xl shadow-brand-blue/20 transition-all active:scale-95 flex gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Se Connecter"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm font-medium text-gray-500">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-brand-blue font-black hover:underline underline-offset-4">
                Inscrivez-vous ici
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
