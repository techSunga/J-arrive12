"use client"

import { useState } from "react"
import { MessageSquare, X, Send, Truck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function Chatbot({ asNavbarItem = false }: { asNavbarItem?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui avec J\'ARRIVE ?' }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })

      if (!response.ok) {
        console.error("Chat API error status:", response.status);
        throw new Error("API error");
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.text }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'bot', text: "Désolé, je rencontre des difficultés techniques actuellement. Veuillez réessayer plus tard ou nous appeler au +242 06 621 73 95." }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <>
      {asNavbarItem ? (
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="relative text-slate-600 hover:text-brand-orange transition-colors flex items-center gap-2 font-bold p-2"
        >
          <div className="relative">
             <MessageSquare className="w-5 h-5" />
             <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-orange rounded-full border-2 border-white" />
          </div>
          <span className="hidden md:inline text-sm">Aide</span>
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-brand-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white"
        >
          <MessageSquare className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 w-96 h-[500px] bg-white rounded-3xl shadow-premium z-50 flex flex-col overflow-hidden border border-gray-100"
          >
            <div className="p-4 bg-brand-blue text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                     <Truck className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-sm font-bold">Assistant J'ARRIVE</p>
                     <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">En ligne</p>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
               </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                       m.role === 'user' 
                         ? 'bg-brand-blue text-white rounded-tr-none' 
                         : 'bg-white shadow-sm border border-gray-100 rounded-tl-none text-slate-700'
                     }`}>
                        {m.text}
                     </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                     <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-none p-3 flex gap-1">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                  </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
               <Input 
                 placeholder="Écrivez votre message..." 
                 className="bg-gray-100 border-none rounded-xl h-11 text-slate-900" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={handleKeyPress}
               />
               <Button 
                 onClick={handleSend}
                 disabled={isTyping}
                 size="icon" 
                 className="bg-brand-orange shrink-0 hover:bg-brand-orange-dark shadow-md shadow-brand-orange/20"
               >
                  <Send className="w-4 h-4" />
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
