import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { CreatePromptData, PaginatedResponse, Prompt, ApiResponse } from '@/types'
import { SimpleDB } from '@/lib/db'

// 获取用户提示词列表
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult
  const { searchParams } = new URL(request.url)

  const params = {
    folder_id: searchParams.get('folder_id') ? parseInt(searchParams.get('folder_id')!) : undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12
  }

  try {
    const result = await SimpleDB.findPromptsByUserId(user.id, params)

    // 转换格式以匹配前端期望的数据结构
    const formattedPrompts: Prompt[] = result.items.map(dbPrompt => ({
      id: dbPrompt.id,
      title: dbPrompt.title,
      content: dbPrompt.content,
      folder_id: dbPrompt.folder_id,
      tags: dbPrompt.tags.map((tag, index) => ({ id: index, name: tag })),
      updatedAt: dbPrompt.updated_at,
      user_id: dbPrompt.user_id,
      is_public: dbPrompt.is_public
    }))

    const response: PaginatedResponse<Prompt> = {
      success: true,
      data: {
        items: formattedPrompts,
        total: result.total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(result.total / params.limit)
      }
    }

    return NextResponse.json(response)

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

  const { user } = authResult

  try {
    const body: CreatePromptData = await request.json()

    // 验证必需字段
    if (!body.title || !body.content) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '标题和内容不能为空'
      }, { status: 400 })
    }

    // 创建提示词
    const dbPrompt = await SimpleDB.createPrompt({
      title: body.title,
      content: body.content,
      user_id: user.id,
      folder_id: body.folder_id || 1,
      tags: body.tags || [],
      is_public: body.is_public || false
    })

    // 转换格式
    const formattedPrompt: Prompt = {
      id: dbPrompt.id,
      title: dbPrompt.title,
      content: dbPrompt.content,
      folder_id: dbPrompt.folder_id,
      tags: dbPrompt.tags.map((tag, index) => ({ id: index, name: tag })),
      updatedAt: dbPrompt.updated_at,
      user_id: dbPrompt.user_id,
      is_public: dbPrompt.is_public
    }

    return NextResponse.json<ApiResponse<Prompt>>({
      success: true,
      data: formattedPrompt
    })

  } catch (error) {
    console.error('Create prompt error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
