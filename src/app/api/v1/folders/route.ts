import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { CreateFolderData, ApiResponse, Folder } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// 获取用户文件夹列表
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult

  try {
    const response = await fetch(`${API_BASE_URL}/api/folders?user_id=${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取文件夹失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<ApiResponse<Folder[]>>(data)

  } catch (error) {
    console.error('Get folders error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 创建新文件夹
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { user, token } = authResult

  try {
    const body: CreateFolderData = await request.json()

    const folderData = {
      ...body,
      user_id: user.id
    }

    const response = await fetch(`${API_BASE_URL}/api/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(folderData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: errorData.message || '创建文件夹失败'
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json<ApiResponse<Folder>>(data)

  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
