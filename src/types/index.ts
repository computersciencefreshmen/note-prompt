// === 编辑模式相关类型 ===
export type EditMode = 'normal' | 'professional'

export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  structure: {
    role?: string
    background?: string
    task: string
    format?: string
    examples?: string[]
    constraints?: string[]
  }
}

export interface NormalModeData {
  title: string
  objective: string
  context?: string
  style?: string
  tone?: string
  format?: string
  examples?: string
}

export interface ProfessionalModeData {
  title: string
  content: string
  role?: string
  background?: string
  task: string
  format?: string
  outputStyle?: string
  constraints?: string[]
  examples?: string[]
  variables?: Record<string, string>
}

export interface EditorSettings {
  mode: EditMode
  autoSave: boolean
  aiAssistance: boolean
  showTemplates: boolean
  showStructureGuide: boolean
}

// === 用户认证相关类型 ===
export interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
  user_type: 'free' | 'pro'
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    token: string
  }
  error?: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  avatar_url?: string
  user_type: 'free' | 'pro'
  created_at: string
}

// === 收藏功能相关类型 ===
export interface Favorite {
  id: number
  user_id: number
  prompt_id: number
  created_at: string
}

// === 公共提示词相关类型 ===
export interface PublicPrompt {
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
  is_favorited?: boolean
}

export interface PublicPromptCategory {
  id: number
  name: string
  description?: string
  prompt_count: number
}

// === 用户提示词统计 ===
export interface UserStats {
  total_prompts: number
  total_folders: number
  total_favorites: number
  monthly_usage: number
  max_prompts: number // 根据用户类型限制
}

// === API权限检查 ===
export interface PermissionCheck {
  can_create_prompt: boolean
  can_favorite: boolean
  can_use_ai_optimize: boolean
  remaining_ai_usage: number
}

export interface Prompt {
  id: number
  title: string
  content: string
  folder_id: number
  tags: Tag[]
  updatedAt: string
  user_id?: number
  is_public?: boolean
}

export interface Folder {
  id: number
  name: string
  parent_id: number | null
  children?: Folder[]
  user_id?: number
}

export interface Tag {
  id: number
  name: string
}

// 创建/更新Prompt的请求数据
export interface CreatePromptData {
  title: string
  content: string
  folder_id: number
  tags: string[] // 标签名数组
  is_public?: boolean
}

export interface UpdatePromptData {
  title?: string
  content?: string
  folder_id?: number
  tags?: string[]
  is_public?: boolean
}

// 创建文件夹的请求数据
export interface CreateFolderData {
  name: string
  parent_id: number | null
}

// Prompt优化请求数据
export interface OptimizePromptData {
  original_prompt: string
}

export interface OptimizePromptResponse {
  optimized_prompt: string
}

// 查询参数
export interface PromptQueryParams {
  folder_id?: number
  tag_name?: string
  search?: string
  page?: number
  limit?: number
}

export interface PublicPromptQueryParams {
  category?: string
  search?: string
  sort?: 'latest' | 'popular' | 'featured'
  page?: number
  limit?: number
}

// API响应包装
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data?: {
    items: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}

// === AI优化功能相关类型 ===

// 对话消息类型
export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

// AI优化API响应类型
export interface AIOptimizeResponse {
  success: boolean
  originalPrompt?: string
  optimizedPrompt: string
  conversationId?: string
  error?: string
}

// 多轮优化API响应类型
export interface AIMultiTurnOptimizeResponse {
  success: boolean
  optimizedPrompt: string
  conversationHistory: ConversationMessage[]
  round: number
  error?: string
}

// AI优化请求类型
export interface AIOptimizeRequest {
  prompt: string
  userRequirement?: string
}

// 多轮优化请求类型
export interface AIMultiTurnOptimizeRequest {
  originalPrompt: string
  currentPrompt: string
  userFeedback: string
  conversationHistory: ConversationMessage[]
}
