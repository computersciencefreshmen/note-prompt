import { NextRequest, NextResponse } from 'next/server'

// 引用同一个内存数据（这里需要从上级路由引用，简化处理）
let favorites = [
  { id: 1, user_id: 1, prompt_id: 2, created_at: new Date().toISOString() }
]

// DELETE - 取消收藏（无认证）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const promptId = parseInt(params.promptId)

    // 找到并删除收藏
    const index = favorites.findIndex(f => f.prompt_id === promptId)
    if (index > -1) {
      favorites.splice(index, 1)
    }

    return NextResponse.json({
      success: true,
      data: { prompt_id: promptId, is_favorited: false }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '取消收藏失败' },
      { status: 500 }
    )
  }
}
