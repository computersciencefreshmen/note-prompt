import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ApiResponse, UserStats } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 获取用户统计信息
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取用户统计失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<ApiResponse<UserStats>>(data)

  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
