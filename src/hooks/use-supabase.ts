"use client"

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─────────────────────────────────────────────
// Hook: Current user profile (with real-time)
// ─────────────────────────────────────────────
export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (!error) setProfile(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let subscription: any = null

    async function init() {
      await fetchProfile()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        subscription = supabase
          .channel(`profile-${user.id}`)
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
            (payload) => { setProfile(payload.new) }
          )
          .subscribe()
      }
    }

    init()
    return () => { if (subscription) supabase.removeChannel(subscription) }
  }, [fetchProfile])

  return { profile, loading, refreshProfile: fetchProfile }
}

// ─────────────────────────────────────────────
// Hook: Missions (role-filtered + real-time)
// ─────────────────────────────────────────────
export function useMissions(role: string) {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMissions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase.from('missions').select('*, client:client_id(full_name, phone), driver:driver_id(full_name, phone)')

    if (role === 'client') {
      query = query.eq('client_id', user.id)
    } else if (role === 'driver') {
      query = query.or(`status.eq.pending,driver_id.eq.${user.id}`)
    }
    // admin gets all

    const { data, error } = await query.order('created_at', { ascending: false })
    if (!error) setMissions(data || [])
    setLoading(false)
  }, [role])

  useEffect(() => {
    fetchMissions()
    const subscription = supabase
      .channel(`missions-${role}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchMissions()
      })
      .subscribe()
    return () => { supabase.removeChannel(subscription) }
  }, [fetchMissions, role])

  return { missions, loading, refresh: fetchMissions }
}

// ─────────────────────────────────────────────
// Hook: Admin — All stats dashboard KPIs
// ─────────────────────────────────────────────
export function useAdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDrivers: 0,
    revenue: 0,
    activeMissions: 0,
    pendingMissions: 0,
    deliveredToday: 0,
  })
  const [recentMissions, setRecentMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const [
        { count: userCount },
        { count: driverCount },
        { data: revenueData },
        { count: activeMissionCount },
        { count: pendingCount },
        { data: missions },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
        supabase.from('missions').select('price_fcfa').eq('payment_status', 'paid'),
        supabase.from('missions').select('*', { count: 'exact', head: true }).in('status', ['accepted', 'picked_up']),
        supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('missions').select('*, client:client_id(full_name, phone), driver:driver_id(full_name, phone)')
          .order('created_at', { ascending: false }).limit(15),
      ])

      const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.price_fcfa || 0), 0) || 0

      setStats({
        totalUsers: userCount || 0,
        activeDrivers: driverCount || 0,
        revenue: totalRevenue,
        activeMissions: activeMissionCount || 0,
        pendingMissions: pendingCount || 0,
        deliveredToday: 0,
      })
      setRecentMissions(missions || [])
    } catch (err) {
      console.error('Admin stats fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    const missionsSub = supabase
      .channel('admin-stats-missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, fetchStats)
      .subscribe()

    const profilesSub = supabase
      .channel('admin-stats-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .subscribe()

    return () => {
      supabase.removeChannel(missionsSub)
      supabase.removeChannel(profilesSub)
    }
  }, [fetchStats])

  return { stats, recentMissions, loading, refresh: fetchStats }
}

// ─────────────────────────────────────────────
// Hook: Admin — All profiles (optionally by role)
// ─────────────────────────────────────────────
export function useAllProfiles(roleFilter?: string) {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProfiles = useCallback(async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (roleFilter) query = query.eq('role', roleFilter)

      const { data, error } = await query
      if (!error) setProfiles(data || [])
    } catch (err) {
      console.error('Profiles fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [roleFilter])

  useEffect(() => {
    fetchProfiles()

    const sub = supabase
      .channel(`all-profiles-${roleFilter || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfiles()
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [fetchProfiles, roleFilter])

  return { profiles, loading, refresh: fetchProfiles }
}

// ─────────────────────────────────────────────
// Hook: Admin — Financial data from missions
// ─────────────────────────────────────────────
export function useAdminFinances() {
  const [finances, setFinances] = useState({
    totalVolume: 0,
    margin: 0,           // 15% commission
    driverPayouts: 0,    // 85% to drivers
    systemCosts: 0,
    paidCount: 0,
    pendingPaymentCount: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFinances = useCallback(async () => {
    try {
      const [missionsRes, withdrawalsRes] = await Promise.all([
        supabase
          .from('missions')
          .select('*, client:client_id(full_name), driver:driver_id(full_name)')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('withdrawals')
          .select('*, driver:driver_id(full_name, phone)')
          .order('created_at', { ascending: false })
          .limit(50)
      ])

      const missions = missionsRes.data || []
      const withdrawalData = withdrawalsRes.data || []

      const totalVolume = missions.reduce((acc, m) => acc + (m.price_fcfa || 0), 0)
      const paidMissions = missions.filter(m => m.payment_status === 'paid')
      const paidVolume = paidMissions.reduce((acc, m) => acc + (m.price_fcfa || 0), 0)
      const margin = Math.floor(paidVolume * 0.15)
      const driverPayouts = Math.floor(paidVolume * 0.85)
      const paidCount = paidMissions.length
      const pendingPaymentCount = missions.filter(m => m.payment_status === 'unpaid' && m.status === 'delivered').length

      setFinances({
        totalVolume,
        margin,
        driverPayouts,
        systemCosts: Math.floor(totalVolume * 0.03),
        paidCount,
        pendingPaymentCount,
      })
      setTransactions(missions)
      setWithdrawals(withdrawalData)
    } catch (err) {
      console.error('Finance fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFinances()

    const missionsSub = supabase
      .channel('admin-finances-missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, fetchFinances)
      .subscribe()

    const withdrawalsSub = supabase
      .channel('admin-finances-withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchFinances)
      .subscribe()

    return () => { 
      supabase.removeChannel(missionsSub)
      supabase.removeChannel(withdrawalsSub)
    }
  }, [fetchFinances])

  return { finances, transactions, withdrawals, loading, refresh: fetchFinances }
}

// ─────────────────────────────────────────────
// Hook: Admin — Pending verification count for bell badge
// ─────────────────────────────────────────────
export function useAdminNotificationCount() {
  const [pendingVerifications, setPendingVerifications] = useState(0)
  const [pendingMissions, setPendingMissions] = useState(0)

  const fetch = useCallback(async () => {
    const [{ count: vCount }, { count: mCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('role', 'driver').eq('is_verified', false),
      supabase.from('missions').select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])
    setPendingVerifications(vCount || 0)
    setPendingMissions(mCount || 0)
  }, [])

  useEffect(() => {
    fetch()

    const profileSub = supabase
      .channel(`admin-notif-profiles-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetch)
      .subscribe()

    const missionSub = supabase
      .channel(`admin-notif-missions-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, fetch)
      .subscribe()

    return () => {
      supabase.removeChannel(profileSub)
      supabase.removeChannel(missionSub)
    }
  }, [fetch])

  return { pendingVerifications, pendingMissions, total: pendingVerifications + pendingMissions }
}
// ─────────────────────────────────────────────
// Hook: Client — Mission status updates for bell badge
// ─────────────────────────────────────────────
export function useClientNotificationCount() {
  const [count, setCount] = useState(0)

  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { count: mCount } = await supabase.from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .in('status', ['accepted', 'picked_up'])
    
    setCount(mCount || 0)
  }, [])

  useEffect(() => {
    fetch()
    const sub = supabase
      .channel(`client-notif-missions-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [fetch])

  return { count }
}

// ─────────────────────────────────────────────
// Hook: Driver — Available missions for bell badge
// ─────────────────────────────────────────────
export function useDriverNotificationCount() {
  const [count, setCount] = useState(0)

  const fetch = useCallback(async () => {
    const { count: mCount } = await supabase.from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    setCount(mCount || 0)
  }, [])

  useEffect(() => {
    fetch()
    const sub = supabase
      .channel(`driver-notif-missions-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [fetch])

  return { count }
}
