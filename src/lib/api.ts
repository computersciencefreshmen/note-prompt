import {
  AIOptimizeRequest,
  AIOptimizeResponse,
  AIMultiTurnOptimizeRequest,
  AIMultiTurnOptimizeResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  CreatePromptData,
  UpdatePromptData,
  Prompt,
  PublicPrompt,
  ApiResponse,
  PaginatedResponse,
  PromptQueryParams,
  PublicPromptQueryParams,
  Folder,
  CreateFolderData,
  UserProfile,
  UserStats,
  Category
} from '@/types'

// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

// 获取存储的token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// 设置认证token
function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

// 清除认证token
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

// 通用API请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 用户认证相关API
export const auth = {
  // 用户登录
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (result.success && result.data?.token) {
      setAuthToken(result.data.token)
    }

    return result
  },

  // 用户注册
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const result = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (result.success && result.data?.token) {
      setAuthToken(result.data.token)
    }

    return result
  },

  // 退出登录
  logout: (): void => {
    clearAuthToken()
  },

  // 检查登录状态
  isLoggedIn: (): boolean => {
    return getAuthToken() !== null
  },

  // 获取当前token
  getToken: (): string | null => {
    return getAuthToken()
  }
}

// 用户资料相关API
export const user = {
  // 获取用户资料
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return apiRequest<ApiResponse<UserProfile>>('/user/profile')
  },

  // 更新用户资料
  updateProfile: async (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    return apiRequest<ApiResponse<UserProfile>>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 获取用户统计
  getStats: async (): Promise<ApiResponse<UserStats>> => {
    return apiRequest<ApiResponse<UserStats>>('/user/stats')
  }
}

// 文件夹管理相关API
export const folders = {
  // 获取文件夹列表
  list: async (): Promise<ApiResponse<Folder[]>> => {
    return apiRequest<ApiResponse<Folder[]>>('/folders')
  },

  // 创建文件夹
  create: async (data: CreateFolderData): Promise<ApiResponse<Folder>> => {
    return apiRequest<ApiResponse<Folder>>('/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// 提示词管理相关API
export const prompts = {
  // 获取用户提示词列表
  list: async (params?: PromptQueryParams): Promise<PaginatedResponse<Prompt>> => {
    const queryParams = new URLSearchParams()
    if (params?.folder_id) queryParams.append('folder_id', params.folder_id.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.tag_name) queryParams.append('tag_name', params.tag_name)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const endpoint = `/prompts${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiRequest<PaginatedResponse<Prompt>>(endpoint)
  },

  // 获取单个提示词
  get: async (id: number): Promise<ApiResponse<Prompt>> => {
    return apiRequest<ApiResponse<Prompt>>(`/prompts/${id}`)
  },

  // 创建提示词
  create: async (data: CreatePromptData): Promise<ApiResponse<Prompt>> => {
    return apiRequest<ApiResponse<Prompt>>('/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新提示词
  update: async (id: number, data: UpdatePromptData): Promise<ApiResponse<Prompt>> => {
    return apiRequest<ApiResponse<Prompt>>(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除提示词
  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiRequest<ApiResponse<null>>(`/prompts/${id}`, {
      method: 'DELETE',
    })
  }
}

// 公共提示词相关API
export const publicPrompts = {
  // 获取公共提示词列表
  list: async (params?: PublicPromptQueryParams): Promise<PaginatedResponse<PublicPrompt>> => {
    const queryParams = new URLSearchParams()
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const endpoint = `/public-prompts${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiRequest<PaginatedResponse<PublicPrompt>>(endpoint)
  },

  // 导入公共提示词到用户库
  import: async (id: number, folderId?: number): Promise<ApiResponse<Prompt>> => {
    return apiRequest<ApiResponse<Prompt>>(`/public-prompts/${id}/import`, {
      method: 'POST',
      body: JSON.stringify({ folder_id: folderId }),
    })
  }
}

// 收藏功能相关API
export const favorites = {
  // 获取收藏列表
  list: async (page?: number, limit?: number): Promise<PaginatedResponse<PublicPrompt>> => {
    const queryParams = new URLSearchParams()
    if (page) queryParams.append('page', page.toString())
    if (limit) queryParams.append('limit', limit.toString())

    const endpoint = `/favorites${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiRequest<PaginatedResponse<PublicPrompt>>(endpoint)
  },

  // 添加收藏
  add: async (promptId: number): Promise<ApiResponse<null>> => {
    return apiRequest<ApiResponse<null>>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ prompt_id: promptId }),
    })
  },

  // 移除收藏
  remove: async (promptId: number): Promise<ApiResponse<null>> => {
    return apiRequest<ApiResponse<null>>(`/favorites/${promptId}`, {
      method: 'DELETE',
    })
  }
}

// 点赞功能相关API
export const likes = {
  // 添加点赞
  add: async (promptId: number): Promise<ApiResponse<{prompt_id: number, likes_count: number, is_liked: boolean}>> => {
    return apiRequest<ApiResponse<{prompt_id: number, likes_count: number, is_liked: boolean}>>('/likes', {
      method: 'POST',
      body: JSON.stringify({ prompt_id: promptId }),
    })
  },

  // 取消点赞
  remove: async (promptId: number): Promise<ApiResponse<{prompt_id: number, likes_count: number, is_liked: boolean}>> => {
    return apiRequest<ApiResponse<{prompt_id: number, likes_count: number, is_liked: boolean}>>(`/likes?prompt_id=${promptId}`, {
      method: 'DELETE',
    })
  }
}

// 分类相关API
export const categories = {
  // 获取所有分类
  list: async (): Promise<ApiResponse<Category[]>> => {
    return apiRequest<ApiResponse<Category[]>>('/categories')
  }
}

// AI相关API
export const ai = {
  // 单轮提示词优化
  optimizePrompt: async (data: AIOptimizeRequest): Promise<AIOptimizeResponse> => {
    return apiRequest<AIOptimizeResponse>('/ai/optimize-prompt', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 多轮提示词优化
  optimizePromptMultiTurn: async (data: AIMultiTurnOptimizeRequest): Promise<AIMultiTurnOptimizeResponse> => {
    return apiRequest<AIMultiTurnOptimizeResponse>('/ai/optimize-prompt-multiturn', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// 导出所有API方法
export const api = {
  auth,
  user,
  folders,
  prompts,
  publicPrompts,
  favorites,
  likes,
  categories,
  ai
}
