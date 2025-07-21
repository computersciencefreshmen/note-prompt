'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, LoginRequest, RegisterRequest } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 测试模式：默认用户，直接登录状态
const testUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
  user_type: 'pro',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(testUser) // 直接设置为已登录
  const [loading, setLoading] = useState(false) // 无需加载状态

  // 测试模式：直接成功的登录
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    setUser(testUser)
    return { success: true }
  }

  // 测试模式：直接成功的注册
  const register = async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    setUser(testUser)
    return { success: true }
  }

  // 测试模式：不允许登出
  const logout = (): void => {
    // 保持登录状态，不做任何操作
  }

  // 刷新用户信息
  const refreshUser = async (): Promise<void> => {
    // 保持测试用户
    setUser(testUser)
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
