import { NextRequest, NextResponse } from 'next/server'

// 内存文件夹数据
let folders = [
  {
    id: 1,
    name: "默认文件夹",
    parent_id: null,
    user_id: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "工作项目",
    parent_id: null,
    user_id: 1,
    created_at: new Date().toISOString()
  }
]

let nextFolderId = 3

// GET - 获取文件夹列表（无认证）
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: folders
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取文件夹失败' },
      { status: 500 }
    )
  }
}

// POST - 创建文件夹（无认证）
export async function POST(request: NextRequest) {
  try {
    const { name, parent_id } = await request.json()

    const newFolder = {
      id: nextFolderId++,
      name: name || "新文件夹",
      parent_id: parent_id || null,
      user_id: 1,
      created_at: new Date().toISOString()
    }

    folders.push(newFolder)

    return NextResponse.json({
      success: true,
      data: newFolder
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建文件夹失败' },
      { status: 500 }
    )
  }
}
