"use client"
import { createContext, useContext, useState, useEffect } from "react"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize user data from localStorage on mount
    const initializeUser = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }
      
      const authData = localStorage.getItem('auth_data')
      
      if (authData) {
        try {
          const userData = JSON.parse(authData)
          const formattedUser = {
            id: userData.user_id,
            name: userData.user_name,
            email: userData.user_email,
            isSuperAdmin: userData.is_super_admin === 'true',
            user_type: userData.user_type,
            token: userData.admin_token
          }
          setUser(formattedUser)
        } catch (error) {
          console.error('Error parsing auth data:', error)
          localStorage.removeItem('auth_data')
        }
      }
      
      setIsLoading(false)
    }

    initializeUser()
  }, [])

  const updateUser = (userData) => {
    setUser(userData)
  }

  const clearUser = () => {
    setUser(null)
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_data')
    }
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: updateUser, 
      clearUser, 
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
