import { NextRequest, NextResponse } from 'next/server'

// 内存收藏数据
let favorites = [
  { id: 1, user_id: 1, prompt_id: 2, created_at: new Date().toISOString() }
]

let nextFavId = 2

// GET - 获取收藏列表（无认证）
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        items: favorites,
        total: favorites.length
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取收藏列表失败' },
      { status: 500 }
    )
  }
}

// POST - 添加收藏（无认证）
export async function POST(request: NextRequest) {
  try {
    const { prompt_id } = await request.json()

    // 检查是否已收藏
    const existing = favorites.find(f => f.prompt_id === prompt_id)
    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing
      })
    }

    const newFavorite = {
      id: nextFavId++,
      user_id: 1,
      prompt_id,
      created_at: new Date().toISOString()
    }

    favorites.push(newFavorite)

    return NextResponse.json({
      success: true,
      data: newFavorite
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '添加收藏失败' },
      { status: 500 }
    )
  }
}
