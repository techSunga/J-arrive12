"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Send, User, CheckCheck, ShieldCheck, Loader2, MessageCircle } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [contacts, setContacts] = useState<any[]>([])
  const [activeContact, setActiveContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Define message fetcher
  const fetchMessages = useCallback(async (contactId: string) => {
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
  }, [])

  // 2. Define history fetcher
  const fetchChatHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      const contactIds = Array.from(new Set(msgs?.flatMap(m => [m.sender_id, m.receiver_id]).filter(id => id !== user.id) || []))

      if (contactIds.length > 0) {
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', contactIds)

        if (userProfiles) {
          setContacts(userProfiles)
          // Set first contact as active if none selected
          if (!activeContact && userProfiles.length > 0) {
            setActiveContact(userProfiles[0])
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeContact])

  // 3. Main real-time subscription
  useEffect(() => {
    fetchChatHistory()
    
    const channel = supabase
      .channel(`admin_chat_updates-${Math.random()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as any;
        fetchChatHistory()
        
        // If message is for/from current active contact, refresh messages
        if (activeContact && (newMessage.sender_id === activeContact.id || newMessage.receiver_id === activeContact.id)) {
          fetchMessages(activeContact.id)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeContact, fetchMessages, fetchChatHistory])

  // 4. Fetch messages when active contact changes
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id)
    }
  }, [activeContact, fetchMessages])

  // 5. Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
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
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement du centre de support...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Sidebar Channels */}
      <Card className="w-96 border-none shadow-premium bg-white flex flex-col overflow-hidden rounded-[32px]">
        <div className="p-8 border-b border-gray-50 bg-slate-900 text-white">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
             <MessageCircle className="w-6 h-6 text-brand-orange" /> Tickets Support
           </h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input className="pl-10 h-10 bg-white/10 border-none text-white placeholder:text-white/20" placeholder="Rechercher..." />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           {contacts.length === 0 ? (
             <div className="p-12 text-center">
               <p className="text-sm text-gray-400 font-bold">Aucune conversation active.</p>
             </div>
           ) : contacts.map((contact) => (
             <button 
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`w-full p-6 flex items-center gap-4 border-b border-gray-50 hover:bg-gray-50 transition-all text-left ${activeContact?.id === contact.id ? 'bg-blue-50/50 border-r-4 border-r-brand-blue' : ''}`}
             >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-slate-900 uppercase">
                  {contact.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="font-bold text-slate-900 truncate">{contact.full_name}</p>
                   <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest">{contact.role}</p>
                </div>
             </button>
           ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 border-none shadow-premium bg-white flex flex-col overflow-hidden rounded-[40px]">
         {activeContact ? (
           <>
              <div className="p-6 border-b border-gray-50 flex justify-between items-center px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold uppercase">
                        {activeContact.full_name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{activeContact.full_name} <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2 uppercase font-black">{activeContact.role}</span></p>
                        <p className="text-[10px] text-green-500 font-black uppercase">Session Active</p>
                    </div>
                  </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/30">
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_id !== activeContact.id
                    return (
                      <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-5 rounded-[24px] shadow-sm ${isMe ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-gray-100'}`}>
                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                            <p className={`text-[9px] font-bold mt-2 ${isMe ? 'text-white/40' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="p-8 border-t border-gray-50">
                  <form onSubmit={handleSendMessage} className="flex gap-4">
                    <Input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 h-16 bg-gray-50 border-none rounded-2xl px-8 text-slate-900 font-medium" 
                      placeholder="Répondre au ticket..." 
                    />
                    <Button 
                      type="submit"
                      disabled={sending || !inputText.trim()}
                      className="h-16 px-10 rounded-2xl bg-brand-blue shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                    </Button>
                  </form>
              </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
              <MessageCircle className="w-16 h-16 text-gray-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-900">Sélectionnez une conversation</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-xs">Choisissez un utilisateur dans la liste pour commencer à chatter.</p>
           </div>
         )}
      </Card>
    </div>
  )
}
