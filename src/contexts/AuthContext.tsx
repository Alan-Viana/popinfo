import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true

    if (isSupabaseEnabled() && supabase) {
      // Check Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (mounted) {
          if (session) {
            setIsAuthenticated(true)
          } else {
            // Check local fallback
            const token = localStorage.getItem('popinfo_auth_token')
            if (token) setIsAuthenticated(true)
          }
        }
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          if (session) {
            setIsAuthenticated(true)
          } else {
            // Keep authenticated if local token exists (hybrid mode)
            const token = localStorage.getItem('popinfo_auth_token')
            setIsAuthenticated(!!token)
          }
        }
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    } else {
      const token = localStorage.getItem('popinfo_auth_token')
      setIsAuthenticated(Boolean(token))
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    let supabaseError = null

    // 1. Try Supabase Login First
    if (isSupabaseEnabled() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })
      
      if (!error && data.session) {
        setIsAuthenticated(true)
        // Clear local fallback token if exists to avoid confusion
        localStorage.removeItem('popinfo_auth_token')
        return { success: true }
      }
      
      if (error) {
        console.error('Erro Supabase:', error)
        supabaseError = error.message
      }
    } else {
      supabaseError = 'Supabase não configurado ou offline'
    }

    // 2. Fallback to Local Admin (Only if Supabase fails or user not found)
    // This allows admin access even if Supabase is offline/misconfigured
    if (email.trim() === 'admin@popinfo.dev' && password.trim() === 'aA@admin26') {
      console.log('Admin login: Using local bypass')
      localStorage.setItem('popinfo_auth_token', 'admin-fallback-token')
      setIsAuthenticated(true)
      
      // If Supabase is enabled but login failed, warn the user they are in local mode
      if (isSupabaseEnabled() && supabase) {
        return { 
          success: true, 
          error: 'Atenção: Login realizado apenas localmente. Funcionalidades do banco de dados (excluir/editar) podem não funcionar.' 
        }
      }
      return { success: true }
    }

    return { 
      success: false, 
      error: supabaseError || 'Erro desconhecido ao tentar logar.'
    }
  }

  const logout = () => {
    localStorage.removeItem('popinfo_auth_token')
    if (isSupabaseEnabled() && supabase) {
      supabase.auth.signOut().then(() => {
        setIsAuthenticated(false)
      })
    } else {
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
