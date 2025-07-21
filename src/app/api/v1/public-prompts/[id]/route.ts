import { NextRequest, NextResponse } from 'next/server'

// 内存公共提示词数据
const publicPrompts = [
  {
    id: 1,
    title: "万能写作助手",
    content: "请帮我写一篇关于{{主题}}的文章，要求：\n1. 语言简洁明了\n2. 逻辑清晰\n3. 包含实例说明\n4. 字数控制在{{字数}}字左右",
    description: "适用于各种主题的文章创作，可自定义主题和字数要求",
    author: "AI助手",
    author_id: 1,
    category: "1",
    tags: ["写作", "文案", "通用"],
    likes_count: 128,
    views_count: 1520,
    is_featured: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "代码审查专家",
    content: "请审查以下代码，重点关注：\n1. 代码质量和可读性\n2. 潜在的bug和安全问题\n3. 性能优化建议\n4. 最佳实践建议\n\n代码：\n```{{语言}}\n{{代码}}\n```\n\n请提供详细的审查报告和改进建议。",
    description: "专业的代码审查助手，帮助提升代码质量",
    author: "技术专家",
    author_id: 2,
    category: "2",
    tags: ["编程", "代码审查", "质量"],
    likes_count: 96,
    views_count: 890,
    is_featured: true,
    created_at: "2024-01-16T14:30:00Z",
    updated_at: "2024-01-16T14:30:00Z"
  }
]

// GET - 获取单个公共提示词详情（无认证）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const prompt = publicPrompts.find(p => p.id === id)

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '公共提示词不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量（模拟）
    prompt.views_count += 1

    return NextResponse.json({
      success: true,
      data: prompt
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取公共提示词详情失败' },
      { status: 500 }
    )
  }
}
