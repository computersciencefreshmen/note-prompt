import { NextRequest, NextResponse } from 'next/server'

// 内存点赞数据
let likes = [
  { id: 1, user_id: 1, prompt_id: 1, created_at: new Date().toISOString() }
]

let nextLikeId = 2

// POST - 切换点赞状态（无认证）
export async function POST(request: NextRequest) {
  try {
    const { prompt_id } = await request.json()

    // 检查是否已点赞
    const existingIndex = likes.findIndex(l => l.prompt_id === prompt_id)

    if (existingIndex > -1) {
      // 取消点赞
      likes.splice(existingIndex, 1)
      return NextResponse.json({
        success: true,
        data: { prompt_id, is_liked: false, action: 'unliked' }
      })
    } else {
      // 添加点赞
      const newLike = {
        id: nextLikeId++,
        user_id: 1,
        prompt_id,
        created_at: new Date().toISOString()
      }
      likes.push(newLike)

      return NextResponse.json({
        success: true,
        data: { prompt_id, is_liked: true, action: 'liked' }
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '点赞操作失败' },
      { status: 500 }
    )
  }
}
