// lib/auth.ts - Fixed authentication functions
import { api } from './api'

export interface User {
  
  
  id: string
  name: string
  email: string
  role: "employee" | "team_leader" | "hr_manager" | "cfo" | "ceo" | "department_admin" | "system_admin"
  department: "IT" | "Sales" | "HR" | "Finance" | "Admin"
}

// Login function that stores token
export const authenticate = async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
  try {
    const response = await api.post('/login', { email, password })

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }

    return {
      user: response.data.user,
      token: response.data.token
    }
  } catch (error) {
    console.error('Authentication failed:', error)
    return null
  }
}

// Get current user (for checking auth status)
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/user')
    return response.data
  } catch (error) {
    console.error('Failed to get current user:', error)
    // Clear invalid token
    localStorage.removeItem('auth_token')
    return null
  }
}

// Logout function
export const logout = async (): Promise<boolean> => {
  try {
    await api.post('/logout')
    localStorage.removeItem('auth_token')
    return true
  } catch (error) {
    console.error('Logout failed:', error)
    // Clear token anyway
    localStorage.removeItem('auth_token')
    return false
  }
}
