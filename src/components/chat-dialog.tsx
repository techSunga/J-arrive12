"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader2, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ChatDialogProps {
  missionId: string
  currentUserId: string
  otherUserName: string
  trigger?: React.ReactNode
}

export function ChatDialog({ missionId, currentUserId, otherUserName, trigger }: ChatDialogProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`chat-${missionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `mission_id=eq.${missionId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [missionId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: true })
    
    setMessages(data || [])
    setLoading(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage("")

    try {
      const { error } = await supabase.from('messages').insert({
        mission_id: missionId,
        sender_id: currentUserId,
        content
      })
      if (error) throw error
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex gap-2">
            <MessageCircle className="w-4 h-4" /> Chat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] h-[600px] p-0 flex flex-col border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
        <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-black border border-white/10">
              {otherUserName.charAt(0)}
            </div>
            <div>
              <DialogTitle className="text-white font-black">{otherUserName}</DialogTitle>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">En ligne · Mission J'ARRIVE</p>
            </div>
          </div>
        </DialogHeader>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-[10px] font-bold uppercase">Chargement du chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-40">
              <MessageCircle className="w-12 h-12" />
              <p className="text-xs font-bold px-10">Envoyez un message pour démarrer la discussion.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender_id === currentUserId
              return (
                <div 
                  key={msg.id || i}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    isMine 
                      ? 'bg-brand-blue text-white rounded-tr-none' 
                      : 'bg-white text-slate-900 rounded-tl-none border border-gray-100'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    <p className={`text-[8px] mt-1 font-bold uppercase opacity-50 ${isMine ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form 
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-gray-100 shrink-0 flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 h-12 bg-gray-50 border-none rounded-xl font-medium"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark shadow-lg shadow-brand-blue/20"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
