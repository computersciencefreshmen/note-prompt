import { NextRequest, NextResponse } from 'next/server'

// 硬编码公共提示词数据，测试用
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
  },
  {
    id: 3,
    title: "个性化学习计划",
    content: "请为我制定一个关于{{学习目标}}的详细学习计划：\n\n**个人背景：**\n- 当前水平：{{当前水平}}\n- 可用时间：{{每周时间}}小时/周\n- 学习期限：{{期限}}\n\n**请提供：**\n1. 学习路径规划\n2. 阶段性目标设定\n3. 推荐学习资源\n4. 时间安排建议\n5. 进度检查方法",
    description: "根据个人情况制定专属学习计划",
    author: "教育专家",
    author_id: 3,
    category: "3",
    tags: ["学习", "计划", "个性化"],
    likes_count: 74,
    views_count: 645,
    is_featured: false,
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z"
  },
  {
    id: 4,
    title: "营销文案生成器",
    content: "请为{{产品名称}}创作营销文案：\n\n**产品信息：**\n- 产品类型：{{产品类型}}\n- 目标用户：{{目标用户}}\n- 核心卖点：{{核心卖点}}\n- 推广渠道：{{推广渠道}}\n\n**文案要求：**\n1. 吸引人的标题\n2. 突出产品优势\n3. 创造紧迫感\n4. 明确的行动号召\n5. 适合{{推广渠道}}的风格",
    description: "专业营销文案创作，提升转化率",
    author: "营销专家",
    author_id: 4,
    category: "4",
    tags: ["营销", "文案", "转化"],
    likes_count: 52,
    views_count: 420,
    is_featured: false,
    created_at: "2024-01-18T16:45:00Z",
    updated_at: "2024-01-18T16:45:00Z"
  },
  {
    id: 5,
    title: "创意设计灵感",
    content: "我需要为{{项目类型}}设计创意方案：\n\n**项目背景：**\n- 设计主题：{{设计主题}}\n- 目标受众：{{目标受众}}\n- 风格偏好：{{风格偏好}}\n- 应用场景：{{应用场景}}\n\n**请提供：**\n1. 3-5个创意概念\n2. 设计元素建议\n3. 色彩方案推荐\n4. 排版布局思路\n5. 创意亮点说明",
    description: "激发设计灵感，提供创意方向",
    author: "设计师",
    author_id: 5,
    category: "5",
    tags: ["设计", "创意", "灵感"],
    likes_count: 38,
    views_count: 315,
    is_featured: false,
    created_at: "2024-01-19T11:20:00Z",
    updated_at: "2024-01-19T11:20:00Z"
  },
  {
    id: 6,
    title: "数据分析报告",
    content: "请帮我分析以下数据并生成报告：\n\n**数据概述：**\n- 数据类型：{{数据类型}}\n- 分析目标：{{分析目标}}\n- 时间范围：{{时间范围}}\n\n**分析要求：**\n1. 数据概况总结\n2. 关键指标分析\n3. 趋势变化识别\n4. 异常情况说明\n5. 结论和建议\n\n**数据：**\n{{数据内容}}",
    description: "专业数据分析，生成清晰报告",
    author: "数据分析师",
    author_id: 6,
    category: "6",
    tags: ["数据分析", "报告", "洞察"],
    likes_count: 29,
    views_count: 248,
    is_featured: false,
    created_at: "2024-01-20T13:30:00Z",
    updated_at: "2024-01-20T13:30:00Z"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'latest'
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let filteredPrompts = [...publicPrompts]

    // 分类筛选
    if (category && category !== '0') {
      filteredPrompts = filteredPrompts.filter(p => p.category === category)
    }

    // 搜索筛选
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPrompts = filteredPrompts.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // 排序
    if (sort === 'popular') {
      filteredPrompts.sort((a, b) => b.likes_count - a.likes_count)
    } else if (sort === 'featured') {
      filteredPrompts.sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    } else {
      // 默认按最新排序
      filteredPrompts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    // 分页
    const total = filteredPrompts.length
    const startIndex = (page - 1) * limit
    const items = filteredPrompts.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages
      }
    })

  } catch (error) {
    console.error('获取公共提示词失败:', error)
    return NextResponse.json(
      { success: false, error: '获取公共提示词列表失败' },
      { status: 500 }
    )
  }
}
