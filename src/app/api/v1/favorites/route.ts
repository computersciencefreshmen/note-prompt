import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ApiResponse, PaginatedResponse, PublicPrompt } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult
  const { searchParams } = new URL(request.url)

  const queryParams = new URLSearchParams()
  queryParams.append('user_id', user.id.toString())

  if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!)
  if (searchParams.get('limit')) queryParams.append('limit', searchParams.get('limit')!)

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取收藏列表失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<PaginatedResponse<PublicPrompt>>(data)

  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult

  try {
    const body = await request.json()
    const { prompt_id } = body

    if (!prompt_id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '提示词ID不能为空'
      }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: user.id,
        prompt_id
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: errorData.message || '添加收藏失败'
      }, { status: response.status })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true
    })

  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
