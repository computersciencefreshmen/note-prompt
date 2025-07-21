'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PromptCard from '@/components/PromptCard'
import Header from '@/components/Header'
import { PublicPrompt } from '@/types'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Star, Heart, Loader2, BookOpen } from 'lucide-react'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<PublicPrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState('')

  // 检查登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // 获取收藏列表
  const fetchFavorites = async (pageNum: number = 1) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const response = await api.favorites.list(pageNum, 12)

      if (response.success && response.data) {
        if (pageNum === 1) {
          setFavorites(response.data.items)
        } else {
          setFavorites(prev => [...prev, ...response.data!.items])
        }
        setTotalPages(response.data.totalPages)
        setHasMore(response.data.page < response.data.totalPages)
      } else {
        setError(response.error || '获取收藏列表失败')
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err)
      setError('获取收藏列表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (user) {
      fetchFavorites(1)
    }
  }, [user])

  // 加载更多
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchFavorites(nextPage)
  }

  // 处理收藏变化
  const handleFavoriteChange = () => {
    // 重新加载收藏列表
    setPage(1)
    fetchFavorites(1)
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            我的收藏
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            这里是您收藏的所有优质提示词，随时取用，提升工作效率
          </p>
        </div>

        {/* 统计信息 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-semibold">
                    {favorites.length} 个收藏
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => router.push('/public')}
                className="flex items-center"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                发现更多
              </Button>
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

        {/* 收藏列表 */}
        {loading && favorites.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">正在加载收藏...</span>
          </div>
        ) : (
          <>
            {favorites.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {favorites.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      type="public"
                      onFavoriteChange={handleFavoriteChange}
                    />
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
                  <Star className="h-24 w-24 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  还没有收藏任何提示词
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  在公共提示词库中发现优质内容，点击⭐按钮即可收藏到这里
                </p>
                <div className="space-x-4">
                  <Button
                    onClick={() => router.push('/public')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    浏览公共提示词
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/prompts/new')}
                  >
                    创建我的提示词
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
