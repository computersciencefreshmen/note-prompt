import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { LoginRequest, AuthResponse } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名和密码不能为空'
      }, { status: 400 })
    }

    // 调用后端API进行用户验证
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<AuthResponse>({
        success: false,
        error: errorData.message || '登录失败'
      }, { status: response.status })
    }

    const userData = await response.json()

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: userData.id,
        username: userData.username,
        userType: userData.user_type
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const authResponse: AuthResponse = {
      success: true,
      data: {
        user: userData,
        token
      }
    }

    return NextResponse.json(authResponse)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
