'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PromptCard, { NewPromptCard } from '@/components/PromptCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { Prompt, Folder, Tag, PromptQueryParams } from '@/types'

export default function PromptsPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null)

  // 搜索和过滤状态
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 加载初始数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [promptsData, foldersData, tagsData] = await Promise.all([
          api.prompts.getPrompts(),
          api.folders.getFolders(),
          api.tags.getTags()
        ])

        setPrompts(promptsData)
        setFolders(foldersData)
        setTags(tagsData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // 根据过滤条件重新加载数据
  useEffect(() => {
    const loadFilteredPrompts = async () => {
      if (loading) return

      try {
        const params: PromptQueryParams = {}
        if (searchQuery) params.search = searchQuery
        if (selectedFolderId) params.folder_id = selectedFolderId
        if (selectedTags.length > 0) params.tag_name = selectedTags[0]

        const promptsData = await api.prompts.getPrompts(params)
        setPrompts(promptsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : '搜索失败')
      }
    }

    const debounceTimer = setTimeout(loadFilteredPrompts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedFolderId, selectedTags, loading])

  // 创建文件夹映射
  const folderMap = useMemo(() => {
    const map = new Map<number, string>()

    const addFoldersToMap = (folderList: Folder[]) => {
      folderList.forEach(folder => {
        map.set(folder.id, folder.name)
        if (folder.children) {
          addFoldersToMap(folder.children)
        }
      })
    }

    addFoldersToMap(folders)
    return map
  }, [folders])

  // 扁平化文件夹列表
  const flatFolders = useMemo(() => {
    const flat: Folder[] = []

    const addFolders = (folderList: Folder[], level = 0) => {
      folderList.forEach(folder => {
        flat.push({ ...folder, name: '  '.repeat(level) + folder.name })
        if (folder.children) {
          addFolders(folder.children, level + 1)
        }
      })
    }

    addFolders(folders)
    return flat
  }, [folders])

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
  }

  const handleEdit = (id: number) => {
    router.push(`/prompts/edit/${id}`)
  }

  const handleDeleteClick = (prompt: Prompt) => {
    setPromptToDelete(prompt)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!promptToDelete) return

    try {
      await api.prompts.deletePrompt(promptToDelete.id)
      setPrompts(prev => prev.filter(p => p.id !== promptToDelete.id))
      setDeleteDialogOpen(false)
      setPromptToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [tagName]
    )
  }

  const handleNewPrompt = () => {
    router.push('/prompts/new')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedFolderId(undefined)
    setSelectedTags([])
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">提示词库</h1>
            <p className="text-gray-600 mt-1">管理你的提示词集合</p>
          </div>
          <div className="text-sm text-gray-500">
            {loading ? (
              <span>加载中...</span>
            ) : (
              <span>共 {prompts.length} 个提示词</span>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <Input
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category and Tag Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Folder Filter */}
            <div className="min-w-[200px]">
              <Select
                value={selectedFolderId?.toString() || "all"}
                onValueChange={(value) => setSelectedFolderId(value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择文件夹" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部文件夹</SelectItem>
                  {flatFolders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Management */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600"
                onClick={() => router.push('/tags')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
                  <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7V17C3 18.1 3.9 19 5 19H16C16.67 19 17.27 18.67 17.63 18.16L22 12L17.63 5.84ZM16 17H5V7H16L19.55 12L16 17Z" fill="currentColor"/>
                </svg>
                标签管理
              </Button>

              {/* Tag Filters */}
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleTag(tag.name)}
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedFolderId || selectedTags.length > 0) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                清除筛选器
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        )}

        {/* Prompts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Prompt Card */}
            <NewPromptCard onClick={handleNewPrompt} />

            {/* User's Prompts */}
            {prompts.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                showActions={true}
                showImportButton={false}
                folderName={folderMap.get(prompt.folder_id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && prompts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">开始创建你的第一个提示词</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              创建和管理你的提示词集合，让AI工作流程更加高效
            </p>
            <Button onClick={handleNewPrompt} className="bg-green-500 hover:bg-green-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
              </svg>
              创建提示词
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>
                你确定要删除提示词 "{promptToDelete?.title}" 吗？此操作无法撤销。
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                删除
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
