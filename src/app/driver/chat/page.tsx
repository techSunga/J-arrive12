"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Send, User, CheckCheck, Truck, ShieldCheck, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function DriverChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [contacts, setContacts] = useState<any[]>([])
  const [activeContact, setActiveContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchContacts()
    
    const channel = supabase
      .channel('driver_chat_updates')
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
        .channel(`driver_messages:${activeContact.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
        }, (payload) => {
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

      // 2. Fetch clients from active/recent missions
      const { data: missions } = await supabase
        .from('missions')
        .select(`client_id, client:profiles!client_id(id, full_name, role)`)
        .eq('driver_id', user.id)
        .neq('status', 'delivered')

      const uniqueClients = Array.from(new Set(missions?.map(m => m.client) || []))

      const allContacts = []
      if (admin) allContacts.push({ ...admin, name: "Support J'ARRIVE", isSupport: true })
      allContacts.push(...uniqueClients.map((c: any) => ({ ...c, name: c.full_name })))

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
      toast.error("Erreur de chargement")
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
      fetchMessages(activeContact.id)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement de vos messages...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4 md:gap-8 flex-col md:flex-row">
      <Card className="w-full md:w-80 lg:w-96 border-none shadow-premium bg-white flex flex-col overflow-hidden rounded-[32px]">
        <div className="p-6 border-b border-gray-50 bg-slate-900 text-white">
           <h2 className="text-xl font-bold mb-4">Messages</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input className="pl-10 h-10 bg-white/10 border-none text-white placeholder:text-white/20" placeholder="Rechercher..." />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[300px] md:max-h-none">
           {contacts.length === 0 ? (
             <div className="p-8 text-center text-gray-400 font-bold">Aucune discussion.</div>
           ) : contacts.map((contact) => (
             <button 
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`w-full p-5 flex items-center gap-4 border-b border-gray-50 hover:bg-gray-50 transition-all text-left ${activeContact?.id === contact.id ? 'bg-orange-50/50 border-r-4 border-r-brand-orange' : ''}`}
             >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${contact.isSupport ? 'bg-slate-900' : 'bg-brand-blue'}`}>
                  {contact.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="font-bold text-slate-900 truncate">{contact.name}</p>
                   <p className="text-[10px] text-brand-orange font-black uppercase tracking-widest">{contact.isSupport ? "Support Client" : "Client"}</p>
                </div>
             </button>
           ))}
        </div>
      </Card>

      <Card className="flex-1 border-none shadow-premium bg-white flex flex-col overflow-hidden rounded-[40px]">
         {activeContact ? (
           <>
              <div className="p-5 border-b border-gray-50 flex items-center gap-4 bg-gray-50/10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${activeContact.isSupport ? 'bg-slate-900' : 'bg-brand-blue'}`}>
                      {activeContact.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{activeContact.name}</p>
                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">En ligne</p>
                  </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_id !== activeContact.id
                    return (
                      <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-[20px] shadow-sm ${isMe ? 'bg-brand-orange text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-gray-100'}`}>
                            <p className="text-sm font-medium">{msg.text}</p>
                            <p className={`text-[9px] font-bold mt-2 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="p-6 border-t border-gray-50">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-4">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 h-14 bg-gray-50 border-none rounded-2xl px-6 font-medium" 
                      placeholder="Message..." 
                    />
                    <Button 
                      disabled={sending || !inputText.trim()}
                      className="h-14 w-14 rounded-2xl bg-brand-orange shadow-lg shadow-brand-orange/20"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                    </Button>
                  </form>
              </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400 font-bold">
              Sélectionnez une discussion
           </div>
         )}
      </Card>
    </div>
  )
}
