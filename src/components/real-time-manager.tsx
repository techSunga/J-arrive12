"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, AlertCircle, X, ShieldCheck, Package, UserPlus, RefreshCcw } from 'lucide-react'

type NotifType = 'info' | 'success' | 'warning' | 'error'

type Notification = {
  id: string
  title: string
  message: string
  type: NotifType
}

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertCircle,
  info: Bell,
}

const COLOR_MAP: Record<NotifType, string> = {
  success: 'bg-green-50/95 border-green-200 text-green-900',
  error:   'bg-red-50/95 border-red-200 text-red-900',
  warning: 'bg-orange-50/95 border-orange-200 text-orange-900',
  info:    'bg-blue-50/95 border-blue-200 text-blue-900',
}

const ICON_COLOR_MAP: Record<NotifType, string> = {
  success: 'bg-green-100 text-green-600',
  error:   'bg-red-100 text-red-600',
  warning: 'bg-orange-100 text-orange-600',
  info:    'bg-blue-100 text-brand-blue',
}

export function RealTimeManager() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notif: Omit<Notification, 'id'>, duration = 6000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications(prev => [{ ...notif, id }, ...prev].slice(0, 5)) // max 5 visible

    // Browser Notification
    if (document.visibilityState === 'hidden') {
      sendBrowserNotification(notif.title, notif.message)
    }

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, duration)
  }

  const sendBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192x192.png' })
    }
  }

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    let missionSub: any = null
    let profileSub: any = null
    let newUserSub: any = null
    let chatSub: any = null

    async function setupSubscriptions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) return

      // ── MISSIONS subscription ──────────────────────────────────
      missionSub = supabase
        .channel('rtm-missions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
          const newMission = payload.new as any
          const oldMission = payload.old as any

          // ── CLIENT logic ──
          if (profile.role === 'client' && newMission?.client_id === user.id) {
            if (payload.eventType === 'UPDATE') {
              const transitions: Record<string, { title: string; message: string; type: NotifType }> = {
                accepted:  { title: '✅ Mission Acceptée !', message: 'Un livreur a pris en charge votre commande.', type: 'success' },
                picked_up: { title: '📦 Colis Récupéré', message: 'Votre colis est en route vers la destination.', type: 'info' },
                delivered: { title: '🎉 Colis Livré !', message: 'Votre commande a été remise avec succès.', type: 'success' },
                cancelled: { title: '❌ Mission Annulée', message: 'Votre mission a été annulée.', type: 'error' },
              }
              const notif = transitions[newMission.status]
              if (notif && oldMission?.status !== newMission.status) {
                addNotification(notif)
              }
            }
          }

          // ── DRIVER logic ──
          if (profile.role === 'driver') {
            if (payload.eventType === 'INSERT' && newMission?.status === 'pending') {
              addNotification({
                title: '🚀 Nouvelle Mission Disponible !',
                message: `Type : ${newMission.type} • ${newMission.origin_address || 'Départ défini'} → ${newMission.dest_address || 'Arrivée définie'}`,
                type: 'info',
              })
            }
            if (payload.eventType === 'UPDATE' && newMission?.driver_id === user.id) {
              if (newMission.status === 'cancelled') {
                addNotification({
                  title: '❌ Mission Annulée',
                  message: 'Le client a annulé la commande qui vous était assignée.',
                  type: 'error',
                })
              }
            }
          }

          // ── ADMIN logic — missions ──
          if (profile.role === 'admin') {
            if (payload.eventType === 'INSERT') {
              addNotification({
                title: '📦 Nouvelle Commande',
                message: `Commande #${newMission.id?.slice(0, 8).toUpperCase()} • ${newMission.type} enregistrée.`,
                type: 'info',
              })
            }
            if (payload.eventType === 'UPDATE' && oldMission?.status !== newMission?.status) {
              const statusLabels: Record<string, string> = {
                accepted:  'Commande acceptée par un livreur',
                picked_up: 'Colis récupéré — en transit',
                delivered: 'Commande livrée avec succès ✅',
                cancelled: 'Commande annulée',
              }
              const label = statusLabels[newMission.status]
              if (label) {
                addNotification({
                  title: `Commande #${newMission.id?.slice(0, 8).toUpperCase()}`,
                  message: label,
                  type: newMission.status === 'delivered' ? 'success' : newMission.status === 'cancelled' ? 'error' : 'info',
                })
              }
            }
          }
        })
        .subscribe()

      // ── PROFILES subscription ──────────────────────────────────
      profileSub = supabase
        .channel('rtm-profiles')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        }, (payload) => {
          const newProf = payload.new as any
          const oldProf = payload.old as any

          // Profile verification notification (for drivers)
          if (!oldProf?.is_verified && newProf?.is_verified) {
            addNotification({
              title: '🛡️ Compte Vérifié !',
              message: "Votre dossier a été validé par l'administration. Vous pouvez accepter des missions.",
              type: 'success',
            }, 8000)
          }
        })
        .subscribe()

      // ── ADMIN: new user/driver registrations ──────────────────
      if (profile.role === 'admin') {
        newUserSub = supabase
          .channel('rtm-admin-new-profiles')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'profiles',
          }, (payload) => {
            const p = payload.new as any
            if (p.role === 'driver') {
              addNotification({
                title: '👤 Nouveau Livreur Inscrit',
                message: `${p.full_name || 'Un nouveau livreur'} nécessite une vérification de dossier.`,
                type: 'warning',
              })
            } else {
              addNotification({
                title: '🆕 Nouvel Utilisateur',
                message: `${p.full_name || 'Un client'} vient de rejoindre la plateforme.`,
                type: 'info',
              })
            }
          })
          .subscribe()
      }

      // ── CHAT subscription ──────────────────────────────────
      chatSub = supabase
        .channel('rtm-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const msg = payload.new as any
          if (msg.sender_id !== user.id) {
            // Check if user is part of the mission
            supabase.from('missions')
              .select('id')
              .eq('id', msg.mission_id)
              .or(`client_id.eq.${user.id},driver_id.eq.${user.id}`)
              .single()
              .then(({ data }) => {
                if (data) {
                  addNotification({
                    title: '💬 Nouveau Message',
                    message: msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content,
                    type: 'info'
                  })
                }
              })
          }
        })
        .subscribe()
    }

    setupSubscriptions()

    return () => {
      if (missionSub) supabase.removeChannel(missionSub)
      if (profileSub) supabase.removeChannel(profileSub)
      if (newUserSub) supabase.removeChannel(newUserSub)
      if (chatSub) supabase.removeChannel(chatSub)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => {
          const Icon = ICON_MAP[n.type]
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border-2 flex gap-3 items-start backdrop-blur-md ${COLOR_MAP[n.type]}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${ICON_COLOR_MAP[n.type]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black leading-tight mb-0.5">{n.title}</h4>
                <p className="text-xs font-medium opacity-75 leading-relaxed">{n.message}</p>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4 opacity-40" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
