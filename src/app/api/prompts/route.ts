import { NextRequest, NextResponse } from 'next/server'

// 简单内存存储，测试用
let prompts = [
  {
    id: 1,
    title: "示例提示词1",
    content: "这是一个示例提示词内容",
    description: "示例描述",
    folder_id: 1,
    category_id: 1,
    is_public: true,
    likes_count: 5,
    views_count: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "示例提示词2",
    content: "另一个示例提示词内容",
    description: "另一个描述",
    folder_id: 1,
    category_id: 2,
    is_public: true,
    likes_count: 3,
    views_count: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let nextId = 3

// GET - 获取提示词列表
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        items: prompts,
        total: prompts.length,
        page: 1,
        limit: 12,
        totalPages: 1
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取提示词失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新提示词
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newPrompt = {
      id: nextId++,
      title: body.title || "新提示词",
      content: body.content || "",
      description: body.description || "",
      folder_id: body.folder_id || 1,
      category_id: body.category_id || 1,
      is_public: body.is_public || false,
      likes_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    prompts.push(newPrompt)

    return NextResponse.json({
      success: true,
      data: newPrompt
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建提示词失败' },
      { status: 500 }
    )
  }
}
