"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, authenticate } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session and validate token
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("auth_token")
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Invalid stored user data:', error)
        localStorage.removeItem("user")
        localStorage.removeItem("auth_token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    const result = await authenticate(email, password)
    if (result && result.user && result.token) {
      setUser(result.user)
      localStorage.setItem("user", JSON.stringify(result.user))
      localStorage.setItem("auth_token", result.token)
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("auth_token")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
