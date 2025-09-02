import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // ⚠️ PROTECTED FUNCTION - DO NOT MODIFY OR ADD ASYNC OPERATIONS
  // This is a Supabase auth state change listener that must remain synchronous
  const handleAuthStateChange = (event, session) => {
    // SYNC OPERATIONS ONLY - NO ASYNC/AWAIT ALLOWED
    if (session?.user) {
      // Only set user profile if we have both user and profile data
      fetchUserProfile(session?.user?.id).then(() => {
        setUser(session.user);
      });
    } else {
      setUser(null)
      setUserProfile(null)
    }
    setLoading(false)
  }

  const fetchUserProfile = async (userId) => {
    try {
      // First try to fetch existing profile
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()
      
      if (error && error?.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }
  
      // If no profile exists, create a default one
      if (!data) {
        const { data: newProfile, error: createError } = await supabase?.from('user_profiles')?.insert([
          {
            id: userId,
            name: user?.email?.split('@')[0] || 'New User',
            email: user?.email,
            role: 'user',
            theme_preference: 'light',
            created_at: new Date().toISOString()
          }
        ]).select()?.single()
        
        if (createError) {
          console.error('Error creating default profile:', createError)
          return
        }
        
        setUserProfile(newProfile)
      } else {
        setUserProfile(data)
      }
      // Only set user state after we have the profile data
      setUser(user)
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      setUser(null)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session - Use Promise chain
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session?.user)
          fetchUserProfile(session?.user?.id)
        }
        setLoading(false)
      })

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(handleAuthStateChange)

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email, password, options = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: options?.userData || {}
        }
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()
      return { error }
    } catch (err) {
      return { error: err }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No authenticated user')

      const { data, error } = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', user?.id)?.select()?.single()

      if (error) throw error

      setUserProfile(data)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin: userProfile?.role === 'admin',
    theme: userProfile?.theme_preference || 'light'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}