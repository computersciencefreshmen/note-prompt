import { NextRequest, NextResponse } from 'next/server'

// 内存数据（引用公共提示词）
const publicPrompts = [
  {
    id: 1,
    title: "万能写作助手",
    content: "请帮我写一篇关于{{主题}}的文章，要求：\n1. 语言简洁明了\n2. 逻辑清晰\n3. 包含实例说明\n4. 字数控制在{{字数}}字左右",
    description: "适用于各种主题的文章创作，可自定义主题和字数要求",
    author: "AI助手",
    category: "1",
    tags: ["写作", "文案", "通用"]
  },
  {
    id: 2,
    title: "代码审查专家",
    content: "请审查以下代码，重点关注：\n1. 代码质量和可读性\n2. 潜在的bug和安全问题\n3. 性能优化建议\n4. 最佳实践建议\n\n代码：\n```{{语言}}\n{{代码}}\n```\n\n请提供详细的审查报告和改进建议。",
    description: "专业的代码审查助手，帮助提升代码质量",
    author: "技术专家",
    category: "2",
    tags: ["编程", "代码审查", "质量"]
  }
]

// 用户提示词存储（内存）
let userPrompts = [
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
    updated_at: new Date().toISOString()
  }
]

let nextId = 2

// POST - 导入公共提示词（无认证）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const publicPrompt = publicPrompts.find(p => p.id === id)

    if (!publicPrompt) {
      return NextResponse.json(
        { success: false, error: '公共提示词不存在' },
        { status: 404 }
      )
    }

    // 导入到用户提示词
    const importedPrompt = {
      id: nextId++,
      title: publicPrompt.title,
      content: publicPrompt.content,
      description: publicPrompt.description,
      folder_id: 1, // 默认文件夹
      user_id: 1,
      category_id: parseInt(publicPrompt.category),
      tags: publicPrompt.tags,
      is_public: false, // 导入后默认私有
      likes_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    userPrompts.push(importedPrompt)

    return NextResponse.json({
      success: true,
      data: importedPrompt,
      message: '导入成功'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '导入失败' },
      { status: 500 }
    )
  }
}
