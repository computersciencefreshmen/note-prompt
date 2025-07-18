import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { CreatePromptData, PaginatedResponse, Prompt, ApiResponse } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 获取用户提示词列表
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult
  const { searchParams } = new URL(request.url)

  const queryParams = new URLSearchParams()
  queryParams.append('user_id', user.id.toString())

  if (searchParams.get('folder_id')) queryParams.append('folder_id', searchParams.get('folder_id')!)
  if (searchParams.get('search')) queryParams.append('search', searchParams.get('search')!)
  if (searchParams.get('tag_name')) queryParams.append('tag_name', searchParams.get('tag_name')!)
  if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!)
  if (searchParams.get('limit')) queryParams.append('limit', searchParams.get('limit')!)

  try {
    const response = await fetch(`${API_BASE_URL}/api/prompts?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取提示词失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<PaginatedResponse<Prompt>>(data)

  } catch (error) {
    console.error('Get prompts error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 创建新提示词
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult

  try {
    const body: CreatePromptData = await request.json()

    // 添加用户ID到创建数据
    const promptData = {
      ...body,
      user_id: user.id
    }

    const response = await fetch(`${API_BASE_URL}/api/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promptData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: errorData.message || '创建提示词失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<ApiResponse<Prompt>>(data)

  } catch (error) {
    console.error('Create prompt error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
