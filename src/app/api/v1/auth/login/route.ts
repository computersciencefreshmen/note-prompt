import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { LoginRequest, AuthResponse } from '@/types'
import { SimpleDB } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export async function POST(request: NextRequest) {
  try {
    // 初始化默认数据
    await SimpleDB.initializeDefaultData()

    const body: LoginRequest = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名和密码不能为空'
      }, { status: 400 })
    }

    // 查找用户
    const dbUser = await SimpleDB.findUserByUsername(username)
    if (!dbUser) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 })
    }

    // 验证密码
    const isPasswordValid = await SimpleDB.verifyPassword(password, dbUser.password_hash)
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
