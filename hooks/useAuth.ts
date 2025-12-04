'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'curator' | 'admin'
  is_premium: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }))

      if (session?.user) {
        // Fetch user profile
        fetchProfile(session.user.id)
      } else {
        setState((prev) => ({ ...prev, loading: false }))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }))

      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setState((prev) => ({ ...prev, profile: null, loading: false }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setState((prev) => ({ ...prev, profile: data, loading: false }))
    } catch (error) {
      console.error('Error fetching profile:', error)
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; username?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single()

    if (error) throw error

    setState((prev) => ({ ...prev, profile: data }))
    return data
  }

  const isAdmin = state.profile?.role === 'admin'
  const isCurator = state.profile?.role === 'curator' || isAdmin
  const isPremium = state.profile?.is_premium || false

  return {
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    isAuthenticated: !!state.user,
    isAdmin,
    isCurator,
    isPremium,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
