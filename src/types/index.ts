export interface Prompt {
  id: number
  title: string
  content: string
  folder_id: number
  tags: Tag[]
  updatedAt: string
}

export interface Folder {
  id: number
  name: string
  parent_id: number | null
  children?: Folder[]
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
}

export interface UpdatePromptData {
  title?: string
  content?: string
  folder_id?: number
  tags?: string[]
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
}

// API响应包装
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
