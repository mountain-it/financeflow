import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const { userProfile, updateProfile, user } = useAuth()
  const [theme, setTheme] = useState('light')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get theme from user profile or local storage
    const savedTheme = userProfile?.theme_preference || 
                      localStorage.getItem('theme') || 
                      'light'
    
    setTheme(savedTheme)
    
    // Apply theme to document
    if (savedTheme === 'dark') {
      document.documentElement?.classList?.add('dark')
    } else {
      document.documentElement?.classList?.remove('dark')
    }
  }, [userProfile?.theme_preference])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setLoading(true)

    try {
      // Update theme locally first for immediate UI feedback
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      
      if (newTheme === 'dark') {
        document.documentElement?.classList?.add('dark')
      } else {
        document.documentElement?.classList?.remove('dark')
      }

      // Update user profile if authenticated
      if (user && updateProfile) {
        await updateProfile({ 
          theme_preference: newTheme 
        })
      }
    } catch (error) {
      console.error('Error updating theme:', error)
      // Revert on error
      setTheme(theme)
      localStorage.setItem('theme', theme)
      if (theme === 'dark') {
        document.documentElement?.classList?.add('dark')
      } else {
        document.documentElement?.classList?.remove('dark')
      }
    } finally {
      setLoading(false)
    }
  }

  const setThemePreference = async (newTheme) => {
    if (newTheme === theme) return
    
    setLoading(true)
    
    try {
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      
      if (newTheme === 'dark') {
        document.documentElement?.classList?.add('dark')
      } else {
        document.documentElement?.classList?.remove('dark')
      }

      if (user && updateProfile) {
        await updateProfile({ 
          theme_preference: newTheme 
        })
      }
    } catch (error) {
      console.error('Error setting theme preference:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setThemePreference,
    loading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}