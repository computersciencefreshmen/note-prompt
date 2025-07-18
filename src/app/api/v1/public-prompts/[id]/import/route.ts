import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ApiResponse, Prompt } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 导入公共提示词到用户库
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult
  const publicPromptId = params.id

  try {
    const body = await request.json()
    const { folder_id } = body

    const response = await fetch(`${API_BASE_URL}/api/public-prompts/${publicPromptId}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: user.id,
        folder_id: folder_id || null
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: errorData.message || '导入提示词失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<ApiResponse<Prompt>>({
      success: true,
      data: data.prompt
    })

  } catch (error) {
    console.error('Import prompt error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
