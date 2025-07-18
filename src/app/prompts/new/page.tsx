'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { CreatePromptData, Folder } from '@/types'

export default function NewPromptPage() {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreatePromptData>({
    title: '',
    content: '',
    folder_id: 0,
    tags: []
  })
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // AI优化相关状态
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedContent, setOptimizedContent] = useState('')
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false)

  // 加载文件夹数据
  useEffect(() => {
    const loadFolders = async () => {
      try {
        setLoading(true)
        const foldersData = await api.folders.getFolders()
        setFolders(foldersData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载文件夹失败')
      } finally {
        setLoading(false)
      }
    }

    loadFolders()
  }, [])

  // 扁平化文件夹列表用于选择器
  const flatFolders = (() => {
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
  })()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '标题是必填项'
    }

    if (!formData.content.trim()) {
      newErrors.content = '提示词内容是必填项'
    }

    if (!formData.folder_id) {
      newErrors.folder_id = '请选择一个文件夹'
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await api.prompts.createPrompt(formData)
      router.push('/prompts')
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // AI优化功能
  const handleOptimize = async () => {
    if (!formData.content.trim()) {
      setError('请先输入提示词内容')
      return
    }

    setIsOptimizing(true)
    try {
      const result = await api.dify.optimizePrompt({
        original_prompt: formData.content,
        title: formData.title || '提示词优化'
      })
      setOptimizedContent(result.optimized_prompt)
      setShowOptimizeDialog(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI优化失败')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleAdoptOptimized = () => {
    setFormData(prev => ({ ...prev, content: optimizedContent }))
    setShowOptimizeDialog(false)
    setOptimizedContent('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault()
      addTag()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && folders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">创建新提示词</h1>
          <p className="text-gray-600 mt-1">创建一个新的提示词以添加到你的集合中</p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  placeholder="为你的提示词起一个清晰的标题"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                )}
              </div>

              {/* Content with AI Optimize */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    提示词内容 <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOptimize}
                    disabled={isOptimizing || !formData.content.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isOptimizing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        AI优化中...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                          <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
                        </svg>
                        AI一键美化
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="在这里输入你的提示词内容，可以包含具体的指令、上下文要求等"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className={`min-h-[200px] ${validationErrors.content ? 'border-red-500' : ''}`}
                />
                {validationErrors.content && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.content}</p>
                )}
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
                  </svg>
                  提示：使用 {'{'}{'{'} 变量名 {'}'}{'}'}  语法可以创建动态变量，点击"AI一键美化"优化你的提示词
                </div>
              </div>

              {/* Folder Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文件夹 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.folder_id ? formData.folder_id.toString() : ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, folder_id: parseInt(value) }))}
                >
                  <SelectTrigger className={validationErrors.folder_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="选择文件夹" />
                  </SelectTrigger>
                  <SelectContent>
                    {flatFolders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.folder_id && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.folder_id}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="添加标签..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      添加
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                            </svg>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              取消
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSubmitting ? '创建中...' : '创建提示词'}
            </Button>
          </div>
        </form>

        {/* AI Optimize Dialog */}
        <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-2 text-purple-500">
                  <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                AI优化建议
              </DialogTitle>
              <DialogDescription>
                AI为你优化了提示词内容，你可以选择采纳或保持原内容。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">原始内容：</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 max-h-32 overflow-y-auto">
                  {formData.content}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI优化后：</h4>
                <div className="p-3 bg-purple-50 rounded-lg text-sm text-gray-800 max-h-32 overflow-y-auto border border-purple-200">
                  {optimizedContent}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowOptimizeDialog(false)}>
                保持原内容
              </Button>
              <Button
                onClick={handleAdoptOptimized}
                className="bg-purple-500 hover:bg-purple-600"
              >
                采纳并替换
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
