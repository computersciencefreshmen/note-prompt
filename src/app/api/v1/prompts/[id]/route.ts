import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { UpdatePromptData, ApiResponse, Prompt } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 获取单个提示词
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult
  const promptId = params.id

  try {
    const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '提示词不存在或无权访问'
      }, { status: response.status })
    }

    const data = await response.json()

    // 检查用户是否有权限访问此提示词
    if (data.user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无权访问此提示词'
      }, { status: 403 })
    }

    return NextResponse.json<ApiResponse<Prompt>>(data)

  } catch (error) {
    console.error('Get prompt error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 更新提示词
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult
  const promptId = params.id

  try {
    const body: UpdatePromptData = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...body,
        user_id: user.id
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: errorData.message || '更新提示词失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<ApiResponse<Prompt>>(data)

  } catch (error) {
    console.error('Update prompt error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 删除提示词
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult
  const promptId = params.id

  try {
    const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: errorData.message || '删除提示词失败'
      }, { status: response.status })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true
    })

  } catch (error) {
    console.error('Delete prompt error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
