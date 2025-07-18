'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PromptEditor from '@/components/PromptEditor'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function NewPromptPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 检查登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // 保存新提示词
  const handleSave = async (data: { title: string; content: string; mode?: string }) => {
    setSaving(true)
    setError('')

    try {
      const createData = {
        title: data.title,
        content: data.content,
        folder_id: 1, // 默认文件夹ID，可以根据需要修改
        tags: [], // 可以根据需要添加标签
        is_public: false
      }

      const response = await api.prompts.create(createData)

      if (response.success) {
        router.push('/prompts')
      } else {
        setError(response.error || '创建失败')
      }
    } catch (err) {
      console.error('Failed to create prompt:', err)
      setError('创建失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  // 取消创建
  const handleCancel = () => {
    router.push('/prompts')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-2">验证用户...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 会重定向到登录页
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className="border-red-200 bg-red-50 max-w-sm">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <PromptEditor
        onSave={handleSave}
        onCancel={handleCancel}
        loading={saving}
      />
    </div>
  )
}
