import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { RegisterRequest, AuthResponse } from '@/types'
import db from '@/lib/database'

const JWT_SECRET = process.env.JWT_SECRET || 'note-prompt-secret-2024'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { username, email, password } = body

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名、邮箱和密码都是必填项'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '密码长度至少6位'
      }, { status: 400 })
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await db.getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名已存在'
      }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await db.getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '邮箱已注册'
      }, { status: 400 })
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const newUser = await db.createUser({
      username,
      email,
      password_hash: passwordHash,
      user_type: 'free'
    })

    // 为新用户创建默认文件夹
    await db.createFolder({
      name: '默认文件夹',
      user_id: newUser.id
    })

    // 创建用户统计记录
    await db.createUserStats(newUser.id)

    // 生成JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      user_type: newUser.user_type,
      is_active: newUser.is_active || true,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      data: {
        user: userResponse,
        token
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: '注册失败，请稍后重试'
    }, { status: 500 })
  }
}
