import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { RegisterRequest, AuthResponse } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { username, email, password } = body

    if (!username || !email || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名、邮箱和密码不能为空'
      }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '邮箱格式不正确'
      }, { status: 400 })
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '密码长度至少为6位'
      }, { status: 400 })
    }

    // 调用后端API进行用户注册
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<AuthResponse>({
        success: false,
        error: errorData.message || '注册失败'
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
    console.error('Register error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
