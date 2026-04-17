"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Send, User, CheckCheck, Truck, ShieldCheck, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [contacts, setContacts] = useState<any[]>([])
  const [activeContact, setActiveContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchContacts()
    
    // Global subscription for new messages to update contact list "last message"
    const channel = supabase
      .channel('chat_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchContacts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id)
      
      const sub = supabase
        .channel(`messages:${activeContact.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=eq.${activeContact.id},receiver_id=eq.${activeContact.id}` // This filter is tricky for both ways, sub usually better without filter for simple apps
        }, (payload) => {
          // Check if payload belongs to this conversation
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()
      
      return () => {
        supabase.removeChannel(sub)
      }
    }
  }, [activeContact])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch support (admin)
      const { data: admin } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .limit(1)
        .single()

      // 2. Fetch drivers from active missions
      const { data: missions } = await supabase
        .from('missions')
        .select(`driver_id, driver:profiles!driver_id(id, full_name, role)`)
        .eq('client_id', user.id)
        .not('driver_id', 'is', null)
        .neq('status', 'delivered')

      const uniqueDrivers = Array.from(new Set(missions?.map(m => m.driver) || []))

      const allContacts = []
      if (admin) allContacts.push({ ...admin, name: "Support Client", isSupport: true })
      allContacts.push(...uniqueDrivers.map((d: any) => ({ ...d, name: d.full_name })))

      setContacts(allContacts)
      if (allContacts.length > 0 && !activeContact) {
        setActiveContact(allContacts[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      toast.error("Erreur lors du chargement des messages")
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeContact) return
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: activeContact.id,
          text: inputText.trim()
        })

      if (error) throw error
      setInputText("")
      fetchMessages(activeContact.id) // Refetch to sync local state immediately
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Ouverture de vos discussions...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-8">
      {/* Sidebar - Chat List */}
      <Card className="w-96 border border-gray-100 shadow-sm bg-white flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50">
           <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-10 h-10 bg-gray-50/50 border-none" placeholder="Rechercher une discussion..." />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           {contacts.length === 0 ? (
             <div className="p-8 text-center">
               <p className="text-xs text-gray-400 font-bold">Aucune discussion active.</p>
             </div>
           ) : contacts.map((contact) => (
             <button 
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`w-full p-6 flex items-center gap-4 border-b border-gray-50 hover:bg-gray-50 transition-all text-left ${activeContact?.id === contact.id ? 'bg-blue-50/50 border-r-4 border-r-brand-blue' : ''}`}
             >
                <div className="relative">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${contact.isSupport ? 'bg-slate-900' : 'bg-brand-orange'}`}>
                      {contact.name?.charAt(0) || "U"}
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-slate-900 truncate">{contact.name}</p>
                   </div>
                   <p className="text-xs text-brand-blue font-bold mb-1">{contact.isSupport ? "Support J'ARRIVE" : "Livreur"}</p>
                </div>
             </button>
           ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 border border-gray-100 shadow-premium bg-white flex flex-col overflow-hidden">
         {activeContact ? (
           <>
              {/* Top Header */}
              <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${activeContact.isSupport ? 'bg-slate-900' : 'bg-brand-orange'}`}>
                        {activeContact.name?.charAt(0) || "U"}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{activeContact.name}</p>
                          {activeContact.isSupport && <ShieldCheck className="w-4 h-4 text-brand-blue" />}
                        </div>
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">En ligne</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-brand-blue font-bold">Signaler</Button>
              </div>

              {/* Messages area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_id !== activeContact.id
                    return (
                      <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-4 rounded-3xl shadow-sm ${isMe ? 'bg-brand-blue text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-gray-100'}`}>
                            <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-2 ${isMe ? 'justify-end text-white/70' : 'text-gray-400'}`}>
                              <p className="text-[10px] font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              {isMe && <CheckCheck className="w-3 h-3" />}
                            </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Input Box */}
              <div className="p-6 border-t border-gray-50 bg-white shadow-2xl">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-4">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 h-14 bg-gray-50 border-none rounded-2xl px-6 text-slate-900 font-medium" 
                      placeholder="Écrivez votre message ici..." 
                    />
                    <Button 
                      disabled={sending || !inputText.trim()}
                      className="h-14 w-14 rounded-2xl bg-brand-blue shadow-lg shadow-brand-blue/20 flex items-center justify-center group"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />}
                    </Button>
                  </form>
              </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <User className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pas de discussion sélectionnée</h3>
              <p className="text-gray-400 max-w-xs mx-auto">Choisissez un contact dans la liste pour commencer à discuter.</p>
           </div>
         )}
      </Card>
    </div>
  )
}
