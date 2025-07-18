'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  User,
  Zap,
  Settings,
  Code2,
  Sparkles,
  Eye,
  Save,
  ArrowLeft,
  Info
} from 'lucide-react'
import { EditMode, NormalModeData, ProfessionalModeData, Prompt } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import NormalEditor from './NormalEditor'
import ProfessionalEditor from './ProfessionalEditor'

interface PromptEditorProps {
  prompt?: Prompt // 编辑模式时传入
  onSave: (data: { title: string; content: string; mode: EditMode }) => void
  onCancel: () => void
  loading?: boolean
}

export default function PromptEditor({
  prompt,
  onSave,
  onCancel,
  loading = false
}: PromptEditorProps) {
  const { user } = useAuth()
  const [editMode, setEditMode] = useState<EditMode>('normal')
  const [normalData, setNormalData] = useState<NormalModeData>({
    title: '',
    objective: '',
    context: '',
    style: '',
    tone: '',
    format: '',
    examples: ''
  })
  const [professionalData, setProfessionalData] = useState<ProfessionalModeData>({
    title: '',
    content: '',
    task: '',
    role: '',
    background: '',
    format: '',
    outputStyle: '',
    constraints: [],
    examples: [],
    variables: {}
  })
  const [showModeInfo, setShowModeInfo] = useState(true)

  // 初始化数据（编辑模式）
  useEffect(() => {
    if (prompt) {
      setNormalData(prev => ({
        ...prev,
        title: prompt.title,
        objective: prompt.content.slice(0, 200) // 简化显示
      }))
      setProfessionalData(prev => ({
        ...prev,
        title: prompt.title,
        content: prompt.content,
        task: prompt.content
      }))
    }
  }, [prompt])

  const handleModeChange = (mode: EditMode) => {
    setEditMode(mode)

    // 在模式切换时同步数据
    if (mode === 'professional' && normalData.title) {
      setProfessionalData(prev => ({
        ...prev,
        title: normalData.title,
        task: normalData.objective,
        background: normalData.context || '',
        content: generateNormalPrompt()
      }))
    } else if (mode === 'normal' && professionalData.title) {
      setNormalData(prev => ({
        ...prev,
        title: professionalData.title,
        objective: professionalData.task
      }))
    }
  }

  const generateNormalPrompt = (): string => {
    let prompt = ''

    if (normalData.objective) {
      prompt += `目标：${normalData.objective}\n\n`
    }

    if (normalData.context) {
      prompt += `背景：${normalData.context}\n\n`
    }

    if (normalData.style || normalData.tone) {
      prompt += `要求：`
      if (normalData.style) prompt += `使用${normalData.style}的风格`
      if (normalData.style && normalData.tone) prompt += `，`
      if (normalData.tone) prompt += `保持${normalData.tone}的语调`
      prompt += `\n\n`
    }

    if (normalData.format) {
      prompt += `输出格式：${normalData.format}\n\n`
    }

    if (normalData.examples) {
      prompt += `参考示例：${normalData.examples}\n\n`
    }

    return prompt.trim()
  }

  const handleSave = () => {
    const currentData = editMode === 'normal' ? normalData : professionalData
    const finalContent = editMode === 'normal' ? generateNormalPrompt() : professionalData.content

    const saveData = {
      title: currentData.title,
      content: finalContent,
      mode: editMode,
      ...(editMode === 'normal' ? { normalModeData: normalData } : { professionalModeData: professionalData })
    }

    onSave(saveData)
  }

  const handlePreview = () => {
    const content = editMode === 'normal' ? generateNormalPrompt() : professionalData.content
    if (content) {
      // 这里可以打开预览模态框或导航到预览页面
      console.log('Preview content:', content)
    }
  }

  const handleOptimize = async (promptContent: string) => {
    // 调用AI优化API
    try {
      // const result = await api.ai.optimizePrompt({ prompt: promptContent })
      // 这里处理AI优化结果
      console.log('Optimize prompt:', promptContent)
    } catch (error) {
      console.error('Optimize error:', error)
    }
  }

  const canSave = editMode === 'normal'
    ? normalData.title && normalData.objective
    : professionalData.title && professionalData.content

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 头部区域 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {prompt ? '编辑提示词' : '创建提示词'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {editMode === 'normal' ? '普通模式：简化操作，AI智能辅助' : '专业模式：完全自主控制，高度自定义'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* 用户类型提示 */}
          {user && (
            <Badge variant={user.user_type === 'pro' ? 'default' : 'secondary'}>
              {user.user_type === 'pro' ? '专业版用户' : '免费版用户'}
            </Badge>
          )}

          {/* 保存按钮 */}
          <Button
            onClick={handleSave}
            disabled={!canSave || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 模式选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>选择编辑模式</span>
            {showModeInfo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModeInfo(false)}
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 普通模式 */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                editMode === 'normal'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleModeChange('normal')}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">普通模式</h3>
                  <p className="text-sm text-gray-600">适合新手用户</p>
                </div>
                {editMode === 'normal' && (
                  <Badge className="ml-auto">当前</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 text-green-500 mr-2" />
                  <span>AI智能辅助优化</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-blue-500 mr-2" />
                  <span>简化编辑界面</span>
                </div>
                <div className="flex items-center">
                  <Settings className="h-4 w-4 text-purple-500 mr-2" />
                  <span>预设模板和选项</span>
                </div>
              </div>
            </div>

            {/* 专业模式 */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                editMode === 'professional'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleModeChange('professional')}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Code2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">专业模式</h3>
                  <p className="text-sm text-gray-600">适合有经验的用户</p>
                </div>
                {editMode === 'professional' && (
                  <Badge className="ml-auto">当前</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Settings className="h-4 w-4 text-purple-500 mr-2" />
                  <span>完全自主控制</span>
                </div>
                <div className="flex items-center">
                  <Code2 className="h-4 w-4 text-indigo-500 mr-2" />
                  <span>结构化编辑</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 mr-2" />
                  <span>高级自定义功能</span>
                </div>
              </div>
            </div>
          </div>

          {/* 模式详细说明 */}
          {showModeInfo && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>普通模式特点：</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• 界面简洁，操作直观</li>
                      <li>• AI自动优化和补全</li>
                      <li>• 提供模板和预设选项</li>
                      <li>• 学习成本低，快速上手</li>
                    </ul>
                  </div>
                  <div>
                    <strong>专业模式特点：</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• 完整编辑器，功能全面</li>
                      <li>• 不主动修改用户内容</li>
                      <li>• 支持结构化编辑</li>
                      <li>• 适合复杂提示词构建</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 编辑器内容 */}
      {editMode === 'normal' ? (
        <NormalEditor
          data={normalData}
          onChange={setNormalData}
          onPreview={handlePreview}
          onOptimize={handleOptimize}
          loading={loading}
        />
      ) : (
        <ProfessionalEditor
          data={professionalData}
          onChange={setProfessionalData}
          onPreview={handlePreview}
          loading={loading}
        />
      )}
    </div>
  )
}
