'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PromptCard from '@/components/PromptCard'
import Header from '@/components/Header'
import { PublicPrompt, PublicPromptQueryParams } from '@/types'
import { api } from '@/lib/api'
import { Search, Filter, Loader2 } from 'lucide-react'

export default function PublicPromptsPage() {
  const [prompts, setPrompts] = useState<PublicPrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'featured'>('latest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchPrompts = async (params: PublicPromptQueryParams = {}) => {
    setLoading(true)
    try {
      const response = await api.publicPrompts.list({
        search: searchTerm || undefined,
        category: category || undefined,
        sort: sortBy,
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
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchPrompts({ page: 1 })
  }, [searchTerm, category, sortBy])

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  // 分类筛选
  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value)
    setPage(1)
  }

  // 排序变化
  const handleSortChange = (value: 'latest' | 'popular' | 'featured') => {
    setSortBy(value)
    setPage(1)
  }

  // 加载更多
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPrompts({ page: nextPage })
  }

  // 收藏状态变化时刷新数据
  const handleFavoriteChange = () => {
    fetchPrompts({ page: 1 })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            公共提示词库
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现和导入由社区贡献的优质AI提示词，提升您的AI交互体验
          </p>
        </div>

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
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 分类筛选 */}
              <div className="w-full md:w-48">
                <Select value={category || 'all'} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    <SelectItem value="writing">写作助手</SelectItem>
                    <SelectItem value="coding">编程开发</SelectItem>
                    <SelectItem value="marketing">营销推广</SelectItem>
                    <SelectItem value="education">教育学习</SelectItem>
                    <SelectItem value="business">商务办公</SelectItem>
                    <SelectItem value="creative">创意设计</SelectItem>
                    <SelectItem value="analysis">数据分析</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 排序方式 */}
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">最新发布</SelectItem>
                    <SelectItem value="popular">最受欢迎</SelectItem>
                    <SelectItem value="featured">精选推荐</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提示词网格 */}
        {loading && prompts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">正在加载提示词...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  type="public"
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>

            {/* 空状态 */}
            {prompts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  未找到相关提示词
                </h3>
                <p className="text-gray-600">
                  尝试调整搜索条件或浏览其他分类
                </p>
              </div>
            )}

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
        )}
      </main>
    </div>
  )
}
