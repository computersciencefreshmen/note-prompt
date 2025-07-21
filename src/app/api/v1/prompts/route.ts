import { NextRequest, NextResponse } from 'next/server'

// 内存数据存储
let prompts = [
  {
    id: 1,
    title: "万能写作助手",
    content: "请帮我写一篇关于{{主题}}的文章，要求：\n1. 语言简洁明了\n2. 逻辑清晰\n3. 包含实例说明\n4. 字数控制在{{字数}}字左右",
    description: "适用于各种主题的文章创作",
    folder_id: 1,
    user_id: 1,
    category_id: 1,
    tags: ["写作", "文案"],
    is_public: true,
    likes_count: 15,
    views_count: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_liked: false,
    is_favorited: false
  },
  {
    id: 2,
    title: "代码审查专家",
    content: "请审查以下代码，重点关注：\n1. 代码质量和可读性\n2. 潜在的bug和安全问题\n3. 性能优化建议\n\n代码：\n```{{语言}}\n{{代码}}\n```",
    description: "专业代码审查助手",
    folder_id: 1,
    user_id: 1,
    category_id: 2,
    tags: ["编程", "代码审查"],
    is_public: false,
    likes_count: 8,
    views_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_liked: false,
    is_favorited: true
  }
]

let nextId = 3

// GET - 获取提示词列表（无认证）
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

// POST - 创建新提示词（无认证）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newPrompt = {
      id: nextId++,
      title: body.title || "新提示词",
      content: body.content || "",
      description: body.description || "",
      folder_id: body.folder_id || 1,
      user_id: 1,
      category_id: body.category_id || 1,
      tags: body.tags || [],
      is_public: body.is_public || false,
      likes_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_liked: false,
      is_favorited: false
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
