"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Phone, MapPin, Briefcase, Camera, ShieldCheck, Star } from "lucide-react"
import { useState } from "react"

export default function ProfilPage() {
  const [isPro, setIsPro] = useState(false)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
        <div className="flex gap-2">
           <Button 
            variant={!isPro ? "primary" : "outline"} 
            onClick={() => setIsPro(false)}
            className={!isPro ? "bg-brand-blue" : "border-gray-200 text-slate-600"}
           >
             Particulier
           </Button>
           <Button 
            variant={isPro ? "primary" : "outline"} 
            onClick={() => setIsPro(true)}
            className={isPro ? "bg-brand-orange" : "border-gray-200 text-slate-600"}
           >
             Professionnel
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border border-gray-100 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl font-bold text-brand-blue border-4 border-white shadow-xl">
                  JB
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity flex items-center justify-center">
                  <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">Jean Bakoula</h3>
              <p className="text-sm text-gray-500 font-medium">Membre depuis Avril 2026</p>
              
              <div className="mt-6 w-full space-y-3">
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-bold text-gray-400 uppercase">Note Client</span>
                    <div className="flex items-center gap-1 text-brand-orange">
                       <Star className="w-4 h-4 fill-current" />
                       <span className="text-sm font-bold text-slate-900">4.8</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                    <div className="flex items-center gap-1 text-green-600">
                       <ShieldCheck className="w-4 h-4" />
                       <span className="text-sm font-bold">Vérifié</span>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-50 bg-gray-50/20">
              <CardTitle className="text-lg">Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Prénom</label>
                  <Input defaultValue="Jean" className="bg-gray-50/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nom</label>
                  <Input defaultValue="Bakoula" className="bg-gray-50/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <Input defaultValue="jean@mail.cg" className="pl-10 bg-gray-50/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Téléphone</label>
                <div className="relative">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <Input defaultValue="+242 06 123 4567" className="pl-10 bg-gray-50/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {isPro && (
            <Card className="border-2 border-brand-orange/20 shadow-sm bg-white">
              <CardHeader className="border-b border-orange-50 bg-orange-50/30">
                <CardTitle className="text-lg text-brand-orange flex items-center gap-2">
                   <Briefcase className="w-5 h-5" /> Profil Professionnel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nom de l'entreprise</label>
                  <Input placeholder="Ex: Bakoula Bakery" className="bg-gray-50/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Numéro RCCM</label>
                    <Input placeholder="CG-BZV-..." className="bg-gray-50/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Secteur</label>
                    <Input placeholder="Restauration, Commerce..." className="bg-gray-50/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4">
             <Button variant="outline" className="border-gray-200">Annuler</Button>
             <Button className="bg-brand-blue shadow-lg shadow-brand-blue/20 px-8">Enregistrer les modifications</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
