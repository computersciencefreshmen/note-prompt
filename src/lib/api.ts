import {
  Prompt,
  Folder,
  Tag,
  CreatePromptData,
  UpdatePromptData,
  CreateFolderData,
  OptimizePromptData,
  OptimizePromptResponse,
  PromptQueryParams
} from '@/types'

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

// 通用请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

// Prompt API
export const promptApi = {
  // 获取Prompt列表
  async getPrompts(params?: PromptQueryParams): Promise<Prompt[]> {
    const query = new URLSearchParams()
    if (params?.folder_id) query.append('folder_id', params.folder_id.toString())
    if (params?.tag_name) query.append('tag_name', params.tag_name)
    if (params?.search) query.append('search', params.search)

    const queryString = query.toString()
    const endpoint = `/prompts/${queryString ? `?${queryString}` : ''}`

    return apiRequest<Prompt[]>(endpoint)
  },

  // 获取单个Prompt
  async getPrompt(id: number): Promise<Prompt> {
    return apiRequest<Prompt>(`/prompts/${id}`)
  },

  // 创建Prompt
  async createPrompt(data: CreatePromptData): Promise<Prompt> {
    return apiRequest<Prompt>('/prompts/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新Prompt
  async updatePrompt(id: number, data: UpdatePromptData): Promise<Prompt> {
    return apiRequest<Prompt>(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除Prompt
  async deletePrompt(id: number): Promise<void> {
    await apiRequest(`/prompts/${id}`, {
      method: 'DELETE',
    })
  },
}

// 文件夹API
export const folderApi = {
  // 获取文件夹树
  async getFolders(): Promise<Folder[]> {
    return apiRequest<Folder[]>('/folders/')
  },

  // 创建文件夹
  async createFolder(data: CreateFolderData): Promise<Folder> {
    return apiRequest<Folder>('/folders/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// 标签API
export const tagApi = {
  // 获取所有标签
  async getTags(): Promise<Tag[]> {
    return apiRequest<Tag[]>('/tags/')
  },
}

// Dify优化API
export const difyApi = {
  // 优化Prompt
  async optimizePrompt(data: OptimizePromptData & { title?: string }): Promise<OptimizePromptResponse> {
    return apiRequest<OptimizePromptResponse>('/dify/optimize-prompt', {
      method: 'POST',
      body: JSON.stringify({
        original_prompt: data.original_prompt,
        title: data.title || '提示词优化'
      }),
    })
  },
}

// 导出所有API
export const api = {
  prompts: promptApi,
  folders: folderApi,
  tags: tagApi,
  dify: difyApi,
}
