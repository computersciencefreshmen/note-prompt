import bcrypt from 'bcryptjs'

// 内存数据存储
let memoryDB = {
  users: [] as DBUser[],
  prompts: [] as DBPrompt[],
  folders: [] as DBFolder[],
  favorites: [] as DBFavorite[],
  counters: { users: 0, prompts: 0, folders: 0, favorites: 0 }
}

// 数据类型定义
export interface DBUser {
  id: number
  username: string
  email: string
  password_hash: string
  user_type: 'free' | 'pro'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface DBPrompt {
  id: number
  title: string
  content: string
  user_id: number
  folder_id: number
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DBFolder {
  id: number
  name: string
  user_id: number
  parent_id: number | null
  created_at: string
}

export interface DBFavorite {
  id: number
  user_id: number
  prompt_id: number
  created_at: string
}

export interface DBPublicPrompt {
  id: number
  title: string
  content: string
  description?: string
  author: string
  author_id: number
  category: string
  tags: string[]
  likes_count: number
  views_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

// 数据库操作类
export class SimpleDB {
  private static getNextId(collection: keyof typeof memoryDB.counters): number {
    memoryDB.counters[collection]++
    return memoryDB.counters[collection]
  }

  // 用户操作
  static async createUser(data: Omit<DBUser, 'id' | 'created_at' | 'updated_at'>): Promise<DBUser> {
    const id = this.getNextId('users')
    const now = new Date().toISOString()

    const user: DBUser = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    }

    memoryDB.users.push(user)
    return user
  }

  static async findUserByUsername(username: string): Promise<DBUser | null> {
    return memoryDB.users.find(u => u.username === username) || null
  }

  static async findUserByEmail(email: string): Promise<DBUser | null> {
    return memoryDB.users.find(u => u.email === email) || null
  }

  static async findUserById(id: number): Promise<DBUser | null> {
    return memoryDB.users.find(u => u.id === id) || null
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  // 提示词操作
  static async createPrompt(data: Omit<DBPrompt, 'id' | 'created_at' | 'updated_at'>): Promise<DBPrompt> {
    const id = this.getNextId('prompts')
    const now = new Date().toISOString()

    const prompt: DBPrompt = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    }

    memoryDB.prompts.push(prompt)
    return prompt
  }

  static async findPromptsByUserId(userId: number, params?: {
    folder_id?: number
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: DBPrompt[], total: number }> {
    let filteredPrompts = memoryDB.prompts.filter(p => p.user_id === userId)

    if (params?.folder_id) {
      filteredPrompts = filteredPrompts.filter(p => p.folder_id === params.folder_id)
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredPrompts = filteredPrompts.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower)
      )
    }

    const total = filteredPrompts.length
    const page = params?.page || 1
    const limit = params?.limit || 12
    const startIndex = (page - 1) * limit
    const items = filteredPrompts.slice(startIndex, startIndex + limit)

    return { items, total }
  }

  static async findPromptById(id: number): Promise<DBPrompt | null> {
    return memoryDB.prompts.find(p => p.id === id) || null
  }

  static async updatePrompt(id: number, data: Partial<Omit<DBPrompt, 'id' | 'created_at'>>): Promise<DBPrompt | null> {
    const index = memoryDB.prompts.findIndex(p => p.id === id)
    if (index === -1) return null

    memoryDB.prompts[index] = {
      ...memoryDB.prompts[index],
      ...data,
      updated_at: new Date().toISOString()
    }

    return memoryDB.prompts[index]
  }

  static async deletePrompt(id: number): Promise<boolean> {
    const index = memoryDB.prompts.findIndex(p => p.id === id)
    if (index === -1) return false

    memoryDB.prompts.splice(index, 1)
    return true
  }

  // 文件夹操作
  static async createFolder(data: Omit<DBFolder, 'id' | 'created_at'>): Promise<DBFolder> {
    const id = this.getNextId('folders')

    const folder: DBFolder = {
      ...data,
      id,
      created_at: new Date().toISOString()
    }

    memoryDB.folders.push(folder)
    return folder
  }

  static async findFoldersByUserId(userId: number): Promise<DBFolder[]> {
    return memoryDB.folders.filter(f => f.user_id === userId)
  }

  // 收藏操作
  static async createFavorite(userId: number, promptId: number): Promise<DBFavorite> {
    const id = this.getNextId('favorites')

    const favorite: DBFavorite = {
      id,
      user_id: userId,
      prompt_id: promptId,
      created_at: new Date().toISOString()
    }

    memoryDB.favorites.push(favorite)
    return favorite
  }

  static async findFavoritesByUserId(userId: number): Promise<DBFavorite[]> {
    return memoryDB.favorites.filter(f => f.user_id === userId)
  }

  static async deleteFavorite(userId: number, promptId: number): Promise<boolean> {
    const index = memoryDB.favorites.findIndex(f => f.user_id === userId && f.prompt_id === promptId)
    if (index === -1) return false

    memoryDB.favorites.splice(index, 1)
    return true
  }

  // 公共提示词（示例数据）
  static async getPublicPrompts(params?: {
    category?: string
    search?: string
    sort?: 'latest' | 'popular' | 'featured'
    page?: number
    limit?: number
  }): Promise<{ items: DBPublicPrompt[], total: number }> {
    const samplePrompts: DBPublicPrompt[] = [
      {
        id: 1,
        title: '专业文案写作助手',
        content: '你是一位专业的文案写作专家，擅长创作各种类型的营销文案、产品描述和广告语。请根据用户的需求，创作出吸引人且专业的文案内容。',
        description: '专业的文案写作助手，帮你创作高质量的营销文案',
        author: '文案大师',
        author_id: 1,
        category: 'writing',
        tags: ['文案', '营销', '写作'],
        likes_count: 156,
        views_count: 2340,
        is_featured: true,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      },
      {
        id: 2,
        title: '代码审查专家',
        content: '你是一位经验丰富的高级软件工程师，专门负责代码审查工作。请仔细分析用户提供的代码，从代码质量、最佳实践、安全性等维度进行评估。',
        description: '专业的代码审查工具，提供详细的代码质量分析',
        author: '代码导师',
        author_id: 2,
        category: 'coding',
        tags: ['代码审查', '编程', '质量'],
        likes_count: 89,
        views_count: 1520,
        is_featured: false,
        created_at: '2024-01-14T10:30:00Z',
        updated_at: '2024-01-14T10:30:00Z'
      }
    ]

    let filteredPrompts = [...samplePrompts]

    if (params?.category && params.category !== 'all') {
      filteredPrompts = filteredPrompts.filter(p => p.category === params.category)
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredPrompts = filteredPrompts.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower)
      )
    }

    const total = filteredPrompts.length
    const page = params?.page || 1
    const limit = params?.limit || 12
    const startIndex = (page - 1) * limit
    const items = filteredPrompts.slice(startIndex, startIndex + limit)

    return { items, total }
  }

  // 初始化默认数据
  static async initializeDefaultData(): Promise<void> {
    // 如果已有用户，跳过初始化
    if (memoryDB.users.length > 0) return

    // 创建默认管理员用户
    const hashedPassword = await this.hashPassword('admin123')
    const adminUser = await this.createUser({
      username: 'admin',
      email: 'admin@noteprompt.com',
      password_hash: hashedPassword,
      user_type: 'pro'
    })

    // 为管理员创建默认文件夹
    await this.createFolder({
      name: '默认文件夹',
      user_id: adminUser.id,
      parent_id: null
    })
  }
}
