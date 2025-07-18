'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, Download, Edit, Trash2, User, Eye, Heart, Calendar } from 'lucide-react'
import { PublicPrompt, Prompt } from '@/types'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface PromptCardProps {
  prompt: PublicPrompt | Prompt
  type: 'public' | 'user'
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onFavoriteChange?: () => void
}

export default function PromptCard({
  prompt,
  type,
  onEdit,
  onDelete,
  onFavoriteChange
}: PromptCardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isFavorited, setIsFavorited] = useState(
    type === 'public' ? (prompt as PublicPrompt).is_favorited || false : false
  )

  const isPublicPrompt = type === 'public'
  const publicPrompt = prompt as PublicPrompt
  const userPrompt = prompt as Prompt

  const handleFavorite = async () => {
    if (!user) {
      setMessage('请先登录才能收藏')
      return
    }

    setLoading(true)
    try {
      if (isFavorited) {
        await api.favorites.remove(prompt.id)
        setIsFavorited(false)
        setMessage('已取消收藏')
      } else {
        await api.favorites.add(prompt.id)
        setIsFavorited(true)
        setMessage('收藏成功')
      }
      onFavoriteChange?.()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleImport = async () => {
    if (!user) {
      setMessage('请先登录才能导入')
      return
    }

    setLoading(true)
    try {
      await api.publicPrompts.import(prompt.id)
      setMessage('导入成功！已添加到您的提示词库')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '导入失败')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleEdit = () => {
    onEdit?.(prompt.id)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个提示词吗？')) return

    setLoading(true)
    try {
      await api.prompts.delete(prompt.id)
      setMessage('删除成功')
      onDelete?.(prompt.id)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除失败')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return ''
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {prompt.title}
          </CardTitle>
          <div className="flex items-center space-x-2 ml-2">
            {isPublicPrompt && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                disabled={loading}
                className={`p-1 ${isFavorited ? 'text-yellow-500' : 'text-gray-400'}`}
              >
                <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {isPublicPrompt && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{publicPrompt.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{publicPrompt.views_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{publicPrompt.likes_count}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(publicPrompt.created_at)}</span>
            </div>
          </div>
        )}

        {!isPublicPrompt && userPrompt.updatedAt && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>更新于 {formatDate(userPrompt.updatedAt)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* 描述或内容预览 */}
          {isPublicPrompt && publicPrompt.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {publicPrompt.description}
            </p>
          )}

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-700 line-clamp-3">
              {prompt.content}
            </p>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {isPublicPrompt ? (
              publicPrompt.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))
            ) : (
              userPrompt.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))
            )}

            {isPublicPrompt && (
              <Badge variant="outline" className="text-xs">
                {publicPrompt.category}
              </Badge>
            )}

            {isPublicPrompt && publicPrompt.is_featured && (
              <Badge className="text-xs bg-yellow-100 text-yellow-800">
                精选
              </Badge>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              {isPublicPrompt ? (
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  导入
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 消息提示 */}
          {message && (
            <Alert className="mt-2">
              <AlertDescription className="text-sm">
                {message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
