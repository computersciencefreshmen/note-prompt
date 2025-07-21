'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import PromptCard from '@/components/PromptCard'
import Header from '@/components/Header'
import { Prompt, Folder, PromptQueryParams, UserStats } from '@/types'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import {
  Search,
  Plus,
  FolderPlus,
  Folder as FolderIcon,
  FileText,
  Loader2,
  BarChart3,
  Sparkles,
  Upload,
  Move
} from 'lucide-react'

export default function PromptsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // 状态管理
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 搜索和筛选
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // 新建文件夹
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderLoading, setNewFolderLoading] = useState(false)

  // 拖拽状态
  const [draggedPromptId, setDraggedPromptId] = useState<number | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null)

  // 发布到公共提示词
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [selectedPromptForPublish, setSelectedPromptForPublish] = useState<Prompt | null>(null)
  const [publishLoading, setPublishLoading] = useState(false)

  // 检查登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // 获取用户统计
  const fetchUserStats = async () => {
    try {
      const response = await api.user.getStats()
      if (response.success && response.data) {
        setUserStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  // 获取文件夹列表
  const fetchFolders = async () => {
    try {
      const response = await api.folders.list()
      if (response.success && response.data) {
        setFolders(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  }

  // 获取提示词列表
  const fetchPrompts = async (params: PromptQueryParams = {}) => {
    setLoading(true)
    setError('')

    try {
      const response = await api.prompts.list({
        search: searchTerm || undefined,
        folder_id: selectedFolderId,
        page: page,
        limit: 12,
        ...params
      })

      if (response.success && response.data) {
        if (params.page === 1) {
          setPrompts(response.data.items)
        } else {
          setPrompts(prev => [...prev, ...response.data!.items])
        }
        setTotalPages(response.data.totalPages)
        setHasMore(response.data.page < response.data.totalPages)
      } else {
        setError(response.error || '获取提示词失败')
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err)
      setError('获取提示词失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (user) {
      Promise.all([
        fetchUserStats(),
        fetchFolders(),
        fetchPrompts({ page: 1 })
      ])
    }
  }, [user])

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    if (user) {
      setPage(1)
      fetchPrompts({ page: 1 })
    }
  }, [searchTerm, selectedFolderId, user])

  // 创建新文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    setNewFolderLoading(true)
    try {
      const response = await api.folders.create({
        name: newFolderName.trim(),
        parent_id: null
      })

      if (response.success) {
        setNewFolderName('')
        setShowNewFolderDialog(false)
        fetchFolders() // 重新加载文件夹列表
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
    } finally {
      setNewFolderLoading(false)
    }
  }

  // 编辑提示词
  const handleEdit = (id: number) => {
    router.push(`/prompts/edit/${id}`)
  }

  // 删除提示词
  const handleDelete = (id: number) => {
    setPrompts(prev => prev.filter(p => p.id !== id))
    if (userStats) {
      setUserStats({
        ...userStats,
        total_prompts: userStats.total_prompts - 1
      })
    }
  }

  // 加载更多
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPrompts({ page: nextPage })
  }

  // 拖拽开始
  const handleDragStart = (promptId: number) => {
    setDraggedPromptId(promptId)
  }

  // 拖拽到文件夹上方
  const handleDragOver = (e: React.DragEvent, folderId: number) => {
    e.preventDefault()
    setDragOverFolderId(folderId)
  }

  // 拖拽离开文件夹
  const handleDragLeave = () => {
    setDragOverFolderId(null)
  }

  // 放置到文件夹
  const handleDrop = async (e: React.DragEvent, folderId: number) => {
    e.preventDefault()
    setDragOverFolderId(null)

    if (!draggedPromptId) return

    try {
      const response = await api.prompts.update(draggedPromptId, {
        folder_id: folderId
      })

      if (response.success) {
        // 更新本地状态
        setPrompts(prev => prev.map(p =>
          p.id === draggedPromptId
            ? { ...p, folder_id: folderId }
            : p
        ))
        setError('')
        alert('提示词已移动到新文件夹')
      }
    } catch (error) {
      console.error('Failed to move prompt:', error)
      setError('移动提示词失败')
    } finally {
      setDraggedPromptId(null)
    }
  }

  // 发布到公共提示词
  const handlePublishPrompt = (prompt: Prompt) => {
    setSelectedPromptForPublish(prompt)
    setShowPublishDialog(true)
  }

  // 确认发布
  const confirmPublish = async () => {
    if (!selectedPromptForPublish) return

    setPublishLoading(true)
    try {
      const response = await api.prompts.update(selectedPromptForPublish.id, {
        is_public: true
      })

      if (response.success) {
        alert('提示词已发布到公共提示词库！')
        setShowPublishDialog(false)
        setSelectedPromptForPublish(null)
        // 刷新提示词列表
        fetchPrompts({ page: 1 })
      }
    } catch (error) {
      console.error('Failed to publish prompt:', error)
      alert('发布失败，请重试')
    } finally {
      setPublishLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 会重定向到登录页
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的提示词</h1>
            <p className="text-gray-600 mt-2">管理和优化您的AI提示词库</p>
          </div>

          <Button
            onClick={() => router.push('/prompts/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建提示词
          </Button>
        </div>

        {/* 统计卡片 */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总提示词</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.total_prompts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FolderIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">文件夹</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.total_folders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">本月优化</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.monthly_usage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">收藏数</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.total_favorites}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 搜索和筛选区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">搜索和筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索提示词标题、内容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 文件夹筛选 */}
              <div className="w-full md:w-64">
                <Select
                  value={selectedFolderId?.toString() || 'all'}
                  onValueChange={(value) => setSelectedFolderId(value === 'all' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择文件夹" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部文件夹</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 新建文件夹 */}
              <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    新建文件夹
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新建文件夹</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="输入文件夹名称"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowNewFolderDialog(false)}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleCreateFolder}
                        disabled={!newFolderName.trim() || newFolderLoading}
                      >
                        {newFolderLoading ? '创建中...' : '创建'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 文件夹拖放区域 */}
        {draggedPromptId && (
          <Card className="mb-8 border-2 border-dashed border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700 flex items-center">
                <Move className="h-5 w-5 mr-2" />
                拖动到文件夹
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      dragOverFolderId === folder.id
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                  >
                    <div className="flex items-center">
                      <FolderIcon className="h-6 w-6 text-gray-500 mr-2" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 提示词列表 */}
        {loading && prompts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">正在加载提示词...</span>
          </div>
        ) : (
          <>
            {prompts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      draggable
                      onDragStart={() => handleDragStart(prompt.id)}
                      className="cursor-move"
                    >
                      <PromptCard
                        prompt={prompt}
                        type="user"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPublish={() => handlePublishPrompt(prompt)}
                      />
                    </div>
                  ))}
                </div>

                {/* 加载更多按钮 */}
                {hasMore && (
                  <div className="text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          加载中...
                        </>
                      ) : (
                        '加载更多'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* 空状态 */
              <div className="text-center py-16">
                <div className="text-gray-400 mb-6">
                  <FileText className="h-24 w-24 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  还没有创建任何提示词
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  开始创建您的第一个AI提示词，享受智能化的工作体验
                </p>
                <div className="space-x-4">
                  <Button
                    onClick={() => router.push('/prompts/new')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    创建提示词
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/public')}
                  >
                    浏览公共提示词
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 发布到公共提示词对话框 */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布到公共提示词库</DialogTitle>
          </DialogHeader>
          {selectedPromptForPublish && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">提示词信息</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedPromptForPublish.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedPromptForPublish.description}</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>注意：</strong>发布后的提示词将对所有用户可见，且无法撤回。请确保内容符合社区规范。
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPublishDialog(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={confirmPublish}
                  disabled={publishLoading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {publishLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      发布中...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      确认发布
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
