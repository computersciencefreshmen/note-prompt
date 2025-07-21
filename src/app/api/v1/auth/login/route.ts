import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { LoginRequest, AuthResponse } from '@/types'
import db from '@/lib/database'

const JWT_SECRET = process.env.JWT_SECRET || 'note-prompt-secret-2024'

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

    // 查找用户（支持用户名或邮箱登录）
    let dbUser = await db.getUserByUsername(username)
    if (!dbUser) {
      dbUser = await db.getUserByEmail(username)
    }

    if (!dbUser) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, dbUser.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 })
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: dbUser.id,
        username: dbUser.username,
        userType: dbUser.user_type
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = dbUser
    const authResponse: AuthResponse = {
      success: true,
      data: {
        user: userWithoutPassword,
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
