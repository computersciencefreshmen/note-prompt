'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Code,
  Eye,
  Plus,
  Minus,
  FileText,
  Layers,
  Variable,
  CheckSquare,
  Lightbulb
} from 'lucide-react'
import { ProfessionalModeData } from '@/types'

interface ProfessionalEditorProps {
  data: ProfessionalModeData
  onChange: (data: ProfessionalModeData) => void
  onPreview?: () => void
  loading?: boolean
}

export default function ProfessionalEditor({
  data,
  onChange,
  onPreview,
  loading = false
}: ProfessionalEditorProps) {
  const [showGuide, setShowGuide] = useState(true)

  const handleFieldChange = (field: keyof ProfessionalModeData, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

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

  const generateStructuredPrompt = (): string => {
    let prompt = ''

    if (data.role) {
      prompt += `# 角色设定\n${data.role}\n\n`
    }

    if (data.background) {
      prompt += `# 背景信息\n${data.background}\n\n`
    }

    if (data.task) {
      prompt += `# 任务描述\n${data.task}\n\n`
    }

    if (data.constraints && data.constraints.length > 0) {
      prompt += `# 约束条件\n`
      data.constraints.forEach((constraint, index) => {
        if (constraint.trim()) {
          prompt += `${index + 1}. ${constraint}\n`
        }
      })
      prompt += '\n'
    }

    if (data.format) {
      prompt += `# 输出格式\n${data.format}\n\n`
    }

    if (data.outputStyle) {
      prompt += `# 输出风格\n${data.outputStyle}\n\n`
    }

    if (data.examples && data.examples.length > 0) {
      prompt += `# 示例参考\n`
      data.examples.forEach((example, index) => {
        if (example.trim()) {
          prompt += `示例${index + 1}：\n${example}\n\n`
        }
      })
    }

    if (data.variables && Object.keys(data.variables).length > 0) {
      prompt += `# 变量说明\n`
      Object.entries(data.variables).forEach(([key, value]) => {
        if (value.trim()) {
          prompt += `{${key}}: ${value}\n`
        }
      })
    }

    return prompt.trim()
  }

  return (
    <div className="space-y-6">
      {/* 专业模式提示 */}
      {showGuide && (
        <Alert className="border-purple-200 bg-purple-50">
          <Settings className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <div className="flex items-center justify-between">
              <span>专业模式：完全自主控制，不会自动修改您的内容。支持结构化编辑和高级功能。</span>
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

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">基础信息</TabsTrigger>
          <TabsTrigger value="structure">结构定义</TabsTrigger>
          <TabsTrigger value="advanced">高级设置</TabsTrigger>
          <TabsTrigger value="preview">预览导出</TabsTrigger>
        </TabsList>

        {/* 基础信息 */}
        <TabsContent value="basic" className="space-y-4">
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
                  placeholder="输入完整的提示词内容，或使用右侧结构化编辑功能"
                  rows={12}
                  disabled={loading}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  支持Markdown格式。您可以直接编辑或使用结构化编辑功能。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 结构定义 */}
        <TabsContent value="structure" className="space-y-4">
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

              <div className="text-center">
                <Button
                  onClick={() => {
                    const structuredPrompt = generateStructuredPrompt()
                    handleFieldChange('content', structuredPrompt)
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  <Code className="h-4 w-4 mr-2" />
                  生成结构化提示词
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 高级设置 */}
        <TabsContent value="advanced" className="space-y-4">
          {/* 约束条件 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2" />
                  约束条件
                </div>
                <Button size="sm" onClick={addConstraint} disabled={loading}>
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
                <Button size="sm" onClick={addExample} disabled={loading}>
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
                <Button size="sm" onClick={() => addVariable()} disabled={loading}>
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
        </TabsContent>

        {/* 预览导出 */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  预览
                </div>
                <Button onClick={onPreview} disabled={loading || !data.content}>
                  预览效果
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {data.content || '请在基础信息或结构定义中输入内容'}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* 导出选项 */}
          <Card>
            <CardHeader>
              <CardTitle>导出选项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Button variant="outline" disabled={!data.content}>
                  导出为文本
                </Button>
                <Button variant="outline" disabled={!data.content}>
                  导出为Markdown
                </Button>
                <Button variant="outline" disabled={!data.content}>
                  复制到剪贴板
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
