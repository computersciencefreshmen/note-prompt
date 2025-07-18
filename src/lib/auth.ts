import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

interface TokenPayload {
  userId: number
  username: string
  userType: 'free' | 'pro'
  iat: number
  exp: number
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token)
  if (!payload) return null

  try {
    // 从后端获取最新用户信息
    const response = await fetch(`${API_BASE_URL}/api/users/${payload.userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) return null

    return await response.json()
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<{ user: User; token: string } | { error: string; status: number }> {
  const token = getTokenFromRequest(request)

  if (!token) {
    return { error: '未提供认证令牌', status: 401 }
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return { error: '无效的认证令牌', status: 401 }
  }

  return { user, token }
}

export function checkPermission(user: User, permission: string): boolean {
  switch (permission) {
    case 'ai_optimize':
      return user.user_type === 'pro'
    case 'unlimited_prompts':
      return user.user_type === 'pro'
    case 'favorite':
      return true // 所有用户都可以收藏
    case 'create_prompt':
      return true // 所有用户都可以创建提示词
    default:
      return false
  }
}

export const FREE_USER_LIMITS = {
  max_prompts: 50,
  max_ai_usage_per_month: 10,
  max_folders: 10
}

export const PRO_USER_LIMITS = {
  max_prompts: -1, // 无限制
  max_ai_usage_per_month: -1, // 无限制
  max_folders: -1 // 无限制
}

export function getUserLimits(userType: 'free' | 'pro') {
  return userType === 'pro' ? PRO_USER_LIMITS : FREE_USER_LIMITS
}
