import { NextRequest, NextResponse } from 'next/server'

// 内存用户统计数据
const userStats = {
  id: 1,
  user_id: 1,
  ai_optimize_count: 5,
  monthly_usage: 12,
  last_reset_date: new Date().toDateString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// GET - 获取用户统计（无认证）
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: userStats
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}

// PUT - 更新用户统计（无认证）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // 更新统计数据
    if (body.ai_optimize_count !== undefined) {
      userStats.ai_optimize_count = body.ai_optimize_count
    }
    if (body.monthly_usage !== undefined) {
      userStats.monthly_usage = body.monthly_usage
    }

    userStats.updated_at = new Date().toISOString()

    return NextResponse.json({
      success: true,
      data: userStats
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新统计数据失败' },
      { status: 500 }
    )
  }
}
