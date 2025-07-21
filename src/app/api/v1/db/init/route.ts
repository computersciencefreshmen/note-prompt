import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // 创建用户表
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(10) DEFAULT 'free' CHECK (user_type IN ('free', 'pro')),
        avatar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建分类表
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(20) DEFAULT 'blue',
        icon VARCHAR(50),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建文件夹表
    await db.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建标签表
    await db.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(64) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建提示词表
    await db.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        is_public BOOLEAN DEFAULT FALSE,
        likes_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建提示词标签关联表
    await db.query(`
      CREATE TABLE IF NOT EXISTS prompt_tags (
        prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (prompt_id, tag_id)
      )
    `)

    // 创建点赞表
    await db.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, prompt_id)
      )
    `)

    // 创建收藏表
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, prompt_id)
      )
    `)

    // 创建用户使用统计表
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_usage_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        ai_optimize_count INTEGER DEFAULT 0,
        monthly_usage INTEGER DEFAULT 0,
        last_reset_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 插入默认分类数据
    await db.query(`
      INSERT INTO categories (name, description, color, icon, sort_order) VALUES
      ('写作助手', '各类文案、文章、创意写作相关的提示词', 'blue', 'pen', 1),
      ('编程开发', '代码生成、调试、架构设计等编程相关', 'green', 'code', 2),
      ('教育学习', '学习计划、知识总结、教学辅助工具', 'purple', 'book', 3),
      ('商业营销', '营销策划、商业分析、客服支持等', 'orange', 'briefcase', 4),
      ('创意设计', '设计理念、创意思维、艺术创作辅助', 'pink', 'palette', 5),
      ('数据分析', '数据处理、统计分析、报告生成', 'cyan', 'chart', 6),
      ('生活助手', '日常生活、健康建议、旅行规划等', 'yellow', 'home', 7),
      ('其他', '未分类或其他类型的提示词', 'gray', 'more', 99)
      ON CONFLICT (name) DO NOTHING
    `)

    // 插入常用标签
    await db.query(`
      INSERT INTO tags (name) VALUES
      ('文案写作'), ('营销策划'), ('代码审查'), ('学习计划'), ('数据分析'),
      ('创意设计'), ('商业分析'), ('教育培训'), ('生活助手'), ('工作效率'),
      ('技术开发'), ('产品设计'), ('用户体验'), ('项目管理'), ('团队协作')
      ON CONFLICT (name) DO NOTHING
    `)

    return NextResponse.json({
      success: true,
      message: '数据库初始化完成'
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
