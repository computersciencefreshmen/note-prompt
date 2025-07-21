'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Plus,
  Minus,
  FileText,
  Layers,
  Variable,
  CheckSquare,
  Lightbulb,
  Save,
  Tag,
  X,
  Sparkles,
  Eye
} from 'lucide-react'
import { ProfessionalModeData } from '@/types'

interface ProfessionalEditorProps {
  data: ProfessionalModeData
  onChange: (data: ProfessionalModeData) => void
  onPreview?: () => void
  onOptimize?: (prompt: string) => void
  onSave?: () => void
  loading?: boolean
  tags?: string[]
  onTagsChange?: (tags: string[]) => void
  availableTags?: string[]
}

export default function ProfessionalEditor({
  data,
  onChange,
  onPreview,
  onOptimize,
  onSave,
  loading = false,
  tags = [],
  onTagsChange,
  availableTags = []
}: ProfessionalEditorProps) {
  const [showGuide, setShowGuide] = useState(true)
  const [newTag, setNewTag] = useState('')

  const handleFieldChange = (field: keyof ProfessionalModeData, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  // 标签管理函数
  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && onTagsChange) {
      onTagsChange([...tags, tag])
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    if (onTagsChange) {
      onTagsChange(tags.filter(tag => tag !== tagToRemove))
    }
  }

  // 约束条件管理
  const addConstraint = () => {
    const newConstraints = [...(data.constraints || []), '']
    handleFieldChange('constraints', newConstraints)
  }

  const updateConstraint = (index: number, value: string) => {
    const newConstraints = [...(data.constraints || [])]
    newConstraints[index] = value
    handleFieldChange('constraints', newConstraints)
  }

  const removeConstraint = (index: number) => {
    const newConstraints = data.constraints?.filter((_, i) => i !== index) || []
    handleFieldChange('constraints', newConstraints)
  }

  // 示例管理
  const addExample = () => {
    const newExamples = [...(data.examples || []), '']
    handleFieldChange('examples', newExamples)
  }

  const updateExample = (index: number, value: string) => {
    const newExamples = [...(data.examples || [])]
    newExamples[index] = value
    handleFieldChange('examples', newExamples)
  }

  const removeExample = (index: number) => {
    const newExamples = data.examples?.filter((_, i) => i !== index) || []
    handleFieldChange('examples', newExamples)
  }

  // 变量管理
  const addVariable = (key: string = '') => {
    const newVariables = { ...(data.variables || {}), [key || `变量${Object.keys(data.variables || {}).length + 1}`]: '' }
    handleFieldChange('variables', newVariables)
  }

  const updateVariable = (oldKey: string, newKey: string, value: string) => {
    const newVariables = { ...(data.variables || {}) }
    if (oldKey !== newKey) {
      delete newVariables[oldKey]
    }
    newVariables[newKey] = value
    handleFieldChange('variables', newVariables)
  }

  const removeVariable = (key: string) => {
    const newVariables = { ...(data.variables || {}) }
    delete newVariables[key]
    handleFieldChange('variables', newVariables)
  }

  const handleOptimize = () => {
    if (data.content && onOptimize) {
      onOptimize(data.content)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className="space-y-6">
      {/* 专业模式提示 */}
      {showGuide && (
        <Alert className="border-purple-200 bg-purple-50">
          <Settings className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <div className="flex items-center justify-between">
              <span>专业模式：完全自主控制，支持结构化编辑和高级功能。</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuide(false)}
                className="text-purple-600 hover:text-purple-700"
              >
                知道了
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提示词标题 *
            </label>
            <Input
              value={data.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="输入提示词标题"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              完整提示词内容 *
            </label>
            <Textarea
              value={data.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              placeholder="输入完整的提示词内容，支持Markdown格式"
              rows={8}
              disabled={loading}
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              支持Markdown格式。您可以直接编辑或使用下方结构化编辑功能。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 标签管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            标签管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              添加标签
            </label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="输入新标签"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(newTag)
                  }
                }}
                disabled={loading}
              />
              <Button
                onClick={() => addTag(newTag)}
                disabled={!newTag || loading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                添加
              </Button>
            </div>
          </div>

          {/* 预设标签快速选择 */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                常用标签
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    disabled={tags.includes(tag) || loading}
                    className="text-xs"
                  >
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 当前标签 */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前标签
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 结构化编辑 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            结构化编辑
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                角色设定
              </label>
              <Textarea
                value={data.role || ''}
                onChange={(e) => handleFieldChange('role', e.target.value)}
                placeholder="定义AI扮演的角色，如：专业的文案策划师"
                rows={3}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                背景信息
              </label>
              <Textarea
                value={data.background || ''}
                onChange={(e) => handleFieldChange('background', e.target.value)}
                placeholder="提供相关背景和上下文信息"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务描述 *
            </label>
            <Textarea
              value={data.task}
              onChange={(e) => handleFieldChange('task', e.target.value)}
              placeholder="详细描述需要完成的任务"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输出格式
              </label>
              <Textarea
                value={data.format || ''}
                onChange={(e) => handleFieldChange('format', e.target.value)}
                placeholder="指定输出的格式要求，如：JSON、表格、列表等"
                rows={3}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输出风格
              </label>
              <Textarea
                value={data.outputStyle || ''}
                onChange={(e) => handleFieldChange('outputStyle', e.target.value)}
                placeholder="描述期望的输出风格和语调"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 约束条件 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2" />
              约束条件
            </div>
            <Button size="sm" onClick={addConstraint} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.constraints?.map((constraint, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={constraint}
                onChange={(e) => updateConstraint(index, e.target.value)}
                placeholder={`约束条件 ${index + 1}`}
                disabled={loading}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeConstraint(index)}
                disabled={loading}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!data.constraints || data.constraints.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">
              暂无约束条件，点击"添加"按钮添加
            </p>
          )}
        </CardContent>
      </Card>

      {/* 示例参考 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              示例参考
            </div>
            <Button size="sm" onClick={addExample} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.examples?.map((example, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  示例 {index + 1}
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeExample(index)}
                  disabled={loading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={example}
                onChange={(e) => updateExample(index, e.target.value)}
                placeholder="输入示例内容"
                rows={3}
                disabled={loading}
              />
            </div>
          ))}
          {(!data.examples || data.examples.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">
              暂无示例，点击"添加"按钮添加示例
            </p>
          )}
        </CardContent>
      </Card>

      {/* 变量定义 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Variable className="h-5 w-5 mr-2" />
              变量定义
            </div>
            <Button size="sm" onClick={() => addVariable()} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data.variables || {}).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Input
                value={key}
                onChange={(e) => updateVariable(key, e.target.value, value)}
                placeholder="变量名"
                className="w-1/3"
                disabled={loading}
              />
              <Input
                value={value}
                onChange={(e) => updateVariable(key, key, e.target.value)}
                placeholder="变量说明"
                className="flex-1"
                disabled={loading}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeVariable(key)}
                disabled={loading}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!data.variables || Object.keys(data.variables).length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">
              暂无变量定义，点击"添加"按钮添加变量
            </p>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onSave && (
          <Button
            onClick={handleSave}
            disabled={loading || !data.title || !data.content}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? '保存中...' : '保存提示词'}
          </Button>
        )}


      </div>

      {/* 预览区域 */}
      {data.content && (
        <Card className="bg-gray-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">内容预览</CardTitle>
              <Button
                onClick={handleOptimize}
                disabled={loading || !data.content}
                size="sm"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {loading ? 'AI优化中...' : 'AI智能优化'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {data.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
