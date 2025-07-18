import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ApiResponse } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 移除收藏
export async function DELETE(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult
  const promptId = params.promptId

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/${promptId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: errorData.message || '移除收藏失败'
      }, { status: response.status })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true
    })

  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
