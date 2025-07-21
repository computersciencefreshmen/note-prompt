import { NextRequest, NextResponse } from 'next/server'

// 内存用户资料数据
let userProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
  user_type: 'pro',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// GET - 获取用户资料（无认证）
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: userProfile
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取用户资料失败' },
      { status: 500 }
    )
  }
}

// PUT - 更新用户资料（无认证）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // 更新允许的字段
    if (body.username) userProfile.username = body.username
    if (body.email) userProfile.email = body.email
    if (body.avatar_url) userProfile.avatar_url = body.avatar_url

    userProfile.updated_at = new Date().toISOString()

    return NextResponse.json({
      success: true,
      data: userProfile,
      message: '资料更新成功'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新用户资料失败' },
      { status: 500 }
    )
  }
}
