'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PromptCard from '@/components/PromptCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { Prompt, Folder, Tag, PromptQueryParams } from '@/types'

export default function PublicPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      if (loading) return // 跳过初始加载时的过滤

      try {
        const params: PromptQueryParams = {}
        if (searchQuery) params.search = searchQuery
        if (selectedFolderId) params.folder_id = selectedFolderId
        if (selectedTags.length > 0) params.tag_name = selectedTags[0] // API只支持单个标签

        const promptsData = await api.prompts.getPrompts(params)
        setPrompts(promptsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : '搜索失败')
      }
    }

    const debounceTimer = setTimeout(loadFilteredPrompts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedFolderId, selectedTags, loading])

  // 创建文件夹映射以显示文件夹名称
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

  // 扁平化文件夹列表用于选择器
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

  const handleImport = async (prompt: Prompt) => {
    try {
      // 创建一个新的提示词副本到用户的库中
      const importData = {
        title: `${prompt.title} (导入)`,
        content: prompt.content,
        folder_id: selectedFolderId || folders[0]?.id || 1, // 使用选中的文件夹或第一个文件夹
        tags: prompt.tags.map(tag => tag.name)
      }

      await api.prompts.createPrompt(importData)

      // 显示成功消息
      alert('提示词已成功导入到你的库中!')
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败')
    }
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [tagName] // 目前只支持单选
    )
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            提示词合集
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            探索、复制并使用这些精选的提示词来激发你的创造力
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500 mb-8">
            {loading ? (
              <span>加载中...</span>
            ) : (
              <span>共 {prompts.length} 个提示词</span>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
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
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Create Button */}
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-base"
            onClick={() => router.push('/prompts/new')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-2">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
            创建提示词
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-8">
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

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 8).map(tag => (
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
            {prompts.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopy}
                onImport={handleImport}
                showActions={true}
                showImportButton={true}
                folderName={folderMap.get(prompt.folder_id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && prompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto">
                <path d="M15.5 14H20.5L22 15.5V18.5C22 19.6 21.1 20.5 20 20.5H4C2.9 20.5 2 19.6 2 18.5V5.5C2 4.4 2.9 3.5 4 3.5H13L15.5 6V14ZM14 6.83L13.17 6H4V18.5H20V15H14V6.83Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到提示词</h3>
            <p className="text-gray-500 mb-4">尝试调整搜索条件或清除筛选器</p>
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              清除筛选器
            </Button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">Note Prompt</h3>
            <p className="text-sm text-gray-500 mb-6">
              让AI提示词管理变得简单。支持收藏、打标签和使用场景记录，并对所有内容进行全面搜索。
            </p>

            <div className="flex justify-center space-x-8 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">产品</h4>
                <ul className="space-y-1 text-gray-500">
                  <li><a href="#" className="hover:text-gray-700">功能特色</a></li>
                  <li><a href="#" className="hover:text-gray-700">隐私政策</a></li>
                  <li><a href="#" className="hover:text-gray-700">使用条款</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">支持</h4>
                <ul className="space-y-1 text-gray-500">
                  <li><a href="#" className="hover:text-gray-700">功能建议</a></li>
                  <li><a href="#" className="hover:text-gray-700">更新日志</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">友情链接</h4>
                <ul className="space-y-1 text-gray-500">
                  <li><a href="#" className="hover:text-gray-700">PromptCoder - 代码提示词</a></li>
                  <li><a href="#" className="hover:text-gray-700">PromptGuide - 提示词指南</a></li>
                  <li><a href="#" className="hover:text-gray-700">AIshort - 优质 Prompt 合集</a></li>
                  <li><a href="#" className="hover:text-gray-700">Promptate - Prompt社区</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400">
              © 2025 Note Prompt. 版权所有
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
