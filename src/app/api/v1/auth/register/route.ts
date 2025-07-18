import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { RegisterRequest, AuthResponse } from '@/types'
import { SimpleDB } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export async function POST(request: NextRequest) {
  try {
    // 初始化默认数据
    await SimpleDB.initializeDefaultData()

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

    // 检查用户名是否已存在
    const existingUserByUsername = await SimpleDB.findUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名已存在'
      }, { status: 409 })
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await SimpleDB.findUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '邮箱已被注册'
      }, { status: 409 })
    }

    // 加密密码
    const hashedPassword = await SimpleDB.hashPassword(password)

    // 创建用户
    const newUser = await SimpleDB.createUser({
      username,
      email,
      password_hash: hashedPassword,
      user_type: 'free' // 默认为免费用户
    })

    // 为新用户创建默认文件夹
    await SimpleDB.createFolder({
      name: '默认文件夹',
      user_id: newUser.id,
      parent_id: null
    })

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        username: newUser.username,
        userType: newUser.user_type
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = newUser
    const authResponse: AuthResponse = {
      success: true,
      data: {
        user: userWithoutPassword,
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
