'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, LoginRequest, RegisterRequest } from '@/types'
import { api } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 从localStorage获取用户信息
  const getUserFromStorage = (): User | null => {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem('user_info')
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  // 保存用户信息到localStorage
  const saveUserToStorage = (userData: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_info', JSON.stringify(userData))
    }
  }

  // 清除用户信息
  const clearUserFromStorage = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_info')
    }
  }

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      const token = api.auth.getToken()
      const storedUser = getUserFromStorage()

      if (token && storedUser) {
        setUser(storedUser)
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  // 登录
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.auth.login(credentials)

      if (response.success && response.data) {
        setUser(response.data.user)
        saveUserToStorage(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : '登录失败' }
    }
  }

  // 注册
  const register = async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.auth.register(data)

      if (response.success && response.data) {
        setUser(response.data.user)
        saveUserToStorage(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || '注册失败' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error instanceof Error ? error.message : '注册失败' }
    }
  }

  // 登出
  const logout = (): void => {
    api.auth.logout()
    setUser(null)
    clearUserFromStorage()
  }

  // 刷新用户信息
  const refreshUser = async (): Promise<void> => {
    const token = api.auth.getToken()
    if (!token) {
      setUser(null)
      clearUserFromStorage()
      return
    }

    // 这里可以调用后端API获取最新用户信息
    // 暂时保持当前用户信息不变
    const storedUser = getUserFromStorage()
    if (storedUser) {
      setUser(storedUser)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
