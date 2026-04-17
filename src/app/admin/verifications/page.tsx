"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, CheckCircle2, XCircle, Eye, User, Calendar, ExternalLink, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminVerifications() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    fetchDrivers()
    
    const channel = supabase
      .channel('admin:verifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchDrivers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (selectedDriver) {
      fetchDocuments(selectedDriver.id)
    }
  }, [selectedDriver])

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrivers(data || [])
      if (data && data.length > 0 && !selectedDriver) {
        setSelectedDriver(data[0])
      }
    } catch (error) {
      console.error("Error fetching drivers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async (driverId: string) => {
    setLoadingDocs(true)
    try {
      const { data, error } = await supabase.storage
        .from('driver-documents')
        .list(`documents/${driverId}`)

      if (error) throw error
      
      const docsWithUrls = await Promise.all((data || []).map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
          .from('driver-documents')
          .getPublicUrl(`documents/${driverId}/${file.name}`)
        return { name: file.name, url: publicUrl }
      }))

      setDocuments(docsWithUrls)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', id)

      if (error) throw error
      setSelectedDriver(prev => prev ? { ...prev, is_verified: true } : null)
      toast.success("Conducteur approuvé !")
    } catch (error: any) {
      toast.error("Erreur lors de l'approbation: " + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm("Voulez-vous vraiment rejeter ce dossier ?")) return
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: false }) // Reset verification (could also add a 'rejected' status)
        .eq('id', id)

      if (error) throw error
      toast.info("Dossier rejeté.")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const pendingDrivers = drivers.filter(d => !d.is_verified)
  const verifiedCount = drivers.filter(d => d.is_verified).length

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Vérifications de Sécurité</h1>
          <p className="text-gray-500 font-medium">Validation des documents de bord des livreurs partenaires</p>
        </div>
        <div className="flex px-6 py-2 bg-slate-900 rounded-2xl text-white items-center gap-4">
           <div className="text-center">
              <p className="text-[10px] font-black opacity-40 uppercase">En attente</p>
              <p className="text-xl font-black">{pendingDrivers.length}</p>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <div className="text-center">
              <p className="text-[10px] font-black opacity-40 uppercase">Approuvés</p>
              <p className="text-xl font-black">{verifiedCount}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
               <div className="w-1.5 h-6 bg-brand-orange rounded-full" />
               Dossiers en attente
            </h3>
            
            {loading ? (
              <div className="p-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-blue" />
              </div>
            ) : pendingDrivers.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-gray-100 bg-gray-50/50 rounded-[32px]">
                <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">Tous les dossiers sont à jour !</p>
              </Card>
            ) : (
              <AnimatePresence>
                {pendingDrivers.map((p, i) => (
                  <motion.div 
                   key={p.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   transition={{ delay: i * 0.1 }}
                  >
                    <Card 
                      className={`border shadow-premium bg-white transition-all cursor-pointer group ${selectedDriver?.id === p.id ? 'border-brand-blue ring-1 ring-brand-blue/20' : 'border-white hover:border-brand-blue/20'}`}
                      onClick={() => setSelectedDriver(p)}
                    >
                       <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-blue border border-gray-100 group-hover:bg-blue-50">
                                <User className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="font-bold text-slate-900 leading-tight">{p.full_name}</p>
                                <p className="text-xs text-brand-orange font-bold mt-1">Dossier à vérifier</p>
                                <p className="text-[10px] text-gray-400 font-medium">{p.phone} • {new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                             </div>
                          </div>
                          <Button variant="outline" className="rounded-xl border-gray-100 h-10 px-6 font-bold text-xs flex gap-2">
                             Examiner <Eye className="w-4 h-4" />
                          </Button>
                       </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
         </div>

         {selectedDriver && !selectedDriver.is_verified && (
            <Card className="border border-white shadow-premium bg-white p-0 overflow-hidden sticky top-28 rounded-[32px]">
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="flex justify-between items-start mb-10">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Aperçu du dossier</p>
                        <h2 className="text-2xl font-black">{selectedDriver.full_name}</h2>
                     </div>
                     <span className="bg-brand-orange text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">DRIVER_ID: {selectedDriver.id.slice(0,8)}</span>
                  </div>
                  
                  <div className="aspect-[1.6/1] bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative group">
                     {loadingDocs ? (
                       <div className="absolute inset-0 flex items-center justify-center">
                         <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                       </div>
                     ) : documents.length > 0 ? (
                        <div className="p-4 grid grid-cols-2 gap-4 h-full overflow-y-auto">
                          {documents.map((doc, idx) => (
                            <a 
                              key={idx} 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="aspect-[4/3] bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-brand-orange transition-all relative group/doc"
                            >
                              <img src={doc.url} alt={doc.name} className="w-full h-full object-cover opacity-60 group-hover/doc:opacity-100 transition-opacity" />
                              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-[8px] font-black truncate">{doc.name}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                     ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                         <FileText className="w-12 h-12 text-white/10 mb-4" />
                         <p className="text-sm font-bold text-white/40">Aucun document téléchargé</p>
                       </div>
                     )}
                  </div>
               </div>

               <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Détenteur</p>
                           <p className="text-sm font-bold text-slate-900">{selectedDriver.full_name}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Téléphone</p>
                           <p className="text-sm font-bold text-slate-900">{selectedDriver.phone}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date d'inscription</p>
                           <p className="text-sm font-bold text-slate-900">{new Date(selectedDriver.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Localisation</p>
                           <p className="text-sm font-bold text-slate-900">Brazzaville, Congo</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 flex gap-4 border-t border-gray-50">
                     <Button 
                        variant="outline" 
                        onClick={() => handleReject(selectedDriver.id)}
                        disabled={processing}
                        className="flex-1 h-14 border-red-100 text-red-500 font-black flex gap-2"
                     >
                        <XCircle className="w-5 h-5" /> REJETER
                     </Button>
                     <Button 
                        onClick={() => handleApprove(selectedDriver.id)}
                        disabled={processing}
                        className="flex-1 h-14 bg-green-600 text-white font-black shadow-xl shadow-green-100 border-none flex gap-2 hover:bg-green-700"
                     >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> APPROUVER</>}
                     </Button>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
    </div>
  )
}
