'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb, Sparkles, FileText, Eye, Save, Tag, X } from 'lucide-react'
import { NormalModeData, PromptTemplate } from '@/types'

interface NormalEditorProps {
  data: NormalModeData
  onChange: (data: NormalModeData) => void
  onPreview?: () => void
  onOptimize?: (prompt: string) => void
  onSave?: () => void
  loading?: boolean
  tags?: string[]
  onTagsChange?: (tags: string[]) => void
  availableTags?: string[]
}

// 预设模板
const templates: PromptTemplate[] = [
  {
    id: 'writing',
    name: '写作助手',
    description: '帮助写文章、邮件等文字内容',
    category: 'writing',
    structure: {
      task: '写一篇关于{主题}的{文体}',
      format: '使用{风格}的语调，长度约{字数}字'
    }
  },
  {
    id: 'analysis',
    name: '分析解答',
    description: '分析问题并提供解决方案',
    category: 'analysis',
    structure: {
      task: '分析{问题}并提供{数量}个解决方案',
      format: '每个方案包含原因分析和具体步骤'
    }
  },
  {
    id: 'creative',
    name: '创意设计',
    description: '生成创意想法和设计概念',
    category: 'creative',
    structure: {
      task: '为{项目}设计{数量}个创意方案',
      format: '每个方案包含核心理念和实现方式'
    }
  },
  {
    id: 'learning',
    name: '学习指导',
    description: '制定学习计划和教学内容',
    category: 'learning',
    structure: {
      task: '制定{科目}的{时长}学习计划',
      format: '包含学习目标、进度安排和评估方法'
    }
  }
]

// 预设选项
const styleOptions = [
  { value: 'professional', label: '专业正式' },
  { value: 'casual', label: '轻松随意' },
  { value: 'friendly', label: '友好亲切' },
  { value: 'creative', label: '创意生动' },
  { value: 'academic', label: '学术严谨' }
]

const toneOptions = [
  { value: 'neutral', label: '中性客观' },
  { value: 'enthusiastic', label: '热情积极' },
  { value: 'calm', label: '冷静理性' },
  { value: 'humorous', label: '轻松幽默' },
  { value: 'serious', label: '严肃认真' }
]

const formatOptions = [
  { value: 'paragraph', label: '段落文本' },
  { value: 'list', label: '列表格式' },
  { value: 'steps', label: '步骤说明' },
  { value: 'qa', label: '问答形式' },
  { value: 'table', label: '表格展示' }
]

export default function NormalEditor({
  data,
  onChange,
  onPreview,
  onOptimize,
  onSave,
  loading = false,
  tags = [],
  onTagsChange,
  availableTags = []
}: NormalEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showTips, setShowTips] = useState(true)
  const [newTag, setNewTag] = useState('')

  const handleFieldChange = (field: keyof NormalModeData, value: string) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const applyTemplate = (template: PromptTemplate) => {
    const newData: NormalModeData = {
      ...data,
      title: template.name,
      objective: template.structure.task,
      format: template.structure.format
    }
    onChange(newData)
    setSelectedTemplate(template.id)
  }

  const generatePrompt = (): string => {
    let prompt = ''

    if (data.objective) {
      prompt += `目标：${data.objective}\n\n`
    }

    if (data.context) {
      prompt += `背景：${data.context}\n\n`
    }

    if (data.style || data.tone) {
      prompt += `要求：`
      if (data.style) prompt += `使用${styleOptions.find(s => s.value === data.style)?.label}的风格`
      if (data.style && data.tone) prompt += `，`
      if (data.tone) prompt += `保持${toneOptions.find(t => t.value === data.tone)?.label}的语调`
      prompt += `\n\n`
    }

    if (data.format) {
      const formatLabel = formatOptions.find(f => f.value === data.format)?.label
      prompt += `输出格式：${formatLabel}\n\n`
    }

    if (data.examples) {
      prompt += `参考示例：${data.examples}\n\n`
    }

    return prompt.trim()
  }

  const handleOptimize = () => {
    const prompt = generatePrompt()
    if (prompt && onOptimize) {
      onOptimize(prompt)
    }
  }

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

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className="space-y-6">
      {/* 提示和模板选择 */}
      {showTips && (
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>普通模式：简化编辑，AI智能辅助优化。选择模板快速开始！</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTips(false)}
                className="text-blue-600 hover:text-blue-700"
              >
                知道了
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 模板选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            选择模板（可选）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => applyTemplate(template)}
              >
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提示词标题 *
            </label>
            <Input
              value={data.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="给你的提示词起个名字"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标描述 *
            </label>
            <Textarea
              value={data.objective}
              onChange={(e) => handleFieldChange('objective', e.target.value)}
              placeholder="描述你希望AI完成什么任务，例如：写一篇关于环保的文章"
              rows={3}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              清楚描述你的需求，AI会更好地理解并完成任务
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              背景信息（可选）
            </label>
            <Textarea
              value={data.context || ''}
              onChange={(e) => handleFieldChange('context', e.target.value)}
              placeholder="提供相关背景信息，帮助AI更好理解情境"
              rows={2}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* 标签管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
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

      {/* 风格设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">风格设置</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写作风格
            </label>
            <Select
              value={data.style || ''}
              onValueChange={(value) => handleFieldChange('style', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择风格" />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语调设置
            </label>
            <Select
              value={data.tone || ''}
              onValueChange={(value) => handleFieldChange('tone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择语调" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输出格式
            </label>
            <Select
              value={data.format || ''}
              onValueChange={(value) => handleFieldChange('format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择格式" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 示例说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">示例说明（可选）</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.examples || ''}
            onChange={(e) => handleFieldChange('examples', e.target.value)}
            placeholder="提供一些示例，帮助AI理解你的期望输出"
            rows={3}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onSave && (
          <Button
            onClick={handleSave}
            disabled={loading || !data.title || !data.objective}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? '保存中...' : '保存提示词'}
          </Button>
        )}




      </div>

      {/* 生成的提示词预览 */}
      {(data.title || data.objective) && (
        <Card className="bg-gray-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">生成预览</CardTitle>
              <Button
                onClick={handleOptimize}
                disabled={loading || !data.objective}
                size="sm"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {loading ? 'AI优化中...' : 'AI智能优化'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {generatePrompt() || '请填写目标描述以生成提示词预览'}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
