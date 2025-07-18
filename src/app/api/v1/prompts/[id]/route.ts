import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { UpdatePromptData, ApiResponse, Prompt } from '@/types'
import { SimpleDB } from '@/lib/db'

// 获取单个提示词
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })

  try {
    const dbPrompt = await SimpleDB.findPromptById(parseInt(params.id))
    if (!dbPrompt || dbPrompt.user_id !== authResult.user.id) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: '提示词不存在' }, { status: 404 })
    }

    const prompt: Prompt = {
      id: dbPrompt.id,
      title: dbPrompt.title,
      content: dbPrompt.content,
      folder_id: dbPrompt.folder_id,
      tags: dbPrompt.tags.map((tag, index) => ({ id: index, name: tag })),
      updatedAt: dbPrompt.updated_at,
      user_id: dbPrompt.user_id,
      is_public: dbPrompt.is_public
    }
    return NextResponse.json<ApiResponse<Prompt>>({ success: true, data: prompt })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// 更新提示词
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })

  try {
    const body: UpdatePromptData = await request.json()
    const updated = await SimpleDB.updatePrompt(parseInt(params.id), { ...body, tags: body.tags || [] })

    if (!updated || updated.user_id !== authResult.user.id) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: '更新失败' }, { status: 404 })
    }

    const prompt: Prompt = {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      folder_id: updated.folder_id,
      tags: updated.tags.map((tag, index) => ({ id: index, name: tag })),
      updatedAt: updated.updated_at,
      user_id: updated.user_id,
      is_public: updated.is_public
    }
    return NextResponse.json<ApiResponse<Prompt>>({ success: true, data: prompt })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// 删除提示词
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })

  try {
    const success = await SimpleDB.deletePrompt(parseInt(params.id))
    return NextResponse.json<ApiResponse<null>>({ success })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
