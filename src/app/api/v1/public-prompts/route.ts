import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { PaginatedResponse, PublicPrompt, ApiResponse } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 获取公共提示词列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const queryParams = new URLSearchParams()

  if (searchParams.get('category')) queryParams.append('category', searchParams.get('category')!)
  if (searchParams.get('search')) queryParams.append('search', searchParams.get('search')!)
  if (searchParams.get('sort')) queryParams.append('sort', searchParams.get('sort')!)
  if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!)
  if (searchParams.get('limit')) queryParams.append('limit', searchParams.get('limit')!)

  try {
    const response = await fetch(`${API_BASE_URL}/api/public-prompts?${queryParams}`)

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取公共提示词失败'
      }, { status: response.status })
    }

    const data = await response.json()

    // 如果用户已登录，检查收藏状态
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const authResult = await requireAuth(request)
      if (!('error' in authResult)) {
        const { user, token } = authResult

        // 获取用户收藏状态
        const favoriteResponse = await fetch(`${API_BASE_URL}/api/favorites/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: user.id,
            prompt_ids: data.data.items.map((p: PublicPrompt) => p.id)
          })
        })

        if (favoriteResponse.ok) {
          const favoriteData = await favoriteResponse.json()
          data.data.items = data.data.items.map((prompt: PublicPrompt) => ({
            ...prompt,
            is_favorited: favoriteData.favorites.includes(prompt.id)
          }))
        }
      }
    }

    return NextResponse.json<PaginatedResponse<PublicPrompt>>(data)

  } catch (error) {
    console.error('Get public prompts error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
