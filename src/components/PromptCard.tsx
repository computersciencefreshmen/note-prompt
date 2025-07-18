'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Prompt } from '@/types'

interface PromptCardProps {
  prompt: Prompt
  onCopy?: (content: string) => void
  onEdit?: (id: number) => void
  onDelete?: (prompt: Prompt) => void
  onImport?: (prompt: Prompt) => void
  showActions?: boolean
  folderName?: string
  showImportButton?: boolean // 是否显示导入按钮（公共页面显示，个人页面不显示）
}

export default function PromptCard({
  prompt,
  onCopy,
  onEdit,
  onDelete,
  onImport,
  showActions = true,
  folderName,
  showImportButton = false
}: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const [imported, setImported] = useState(false)

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(prompt.content)
    } else {
      await navigator.clipboard.writeText(prompt.content)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = async () => {
    if (onImport) {
      onImport(prompt)
      setImported(true)
      setTimeout(() => setImported(false), 2000)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime()) || !dateStr) {
        return null // 不显示无效日期
      }
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      }).format(date)
    } catch (error) {
      return null // 不显示错误日期
    }
  }

  const formattedDate = formatDate(prompt.updatedAt)

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1 pr-2">
            {prompt.title}
          </h3>
          {showActions && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Import Button - 在最前面 */}
              {showImportButton && onImport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImport}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="导入到我的提示词库"
                >
                  {imported ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 9H15L13 7H9C7.9 7 7 7.9 7 9V19C7 20.1 7.9 21 9 21H19C20.1 21 21 20.1 21 19V11C21 9.9 20.1 9 19 9ZM19 19H9V9H12.17L14.17 11H19V19Z" fill="currentColor"/>
                      <path d="M14 13H12V15H14V13Z" fill="currentColor"/>
                    </svg>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
                title="复制内容"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                  </svg>
                )}
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(prompt.id)}
                  className="h-8 w-8 p-0"
                  title="编辑"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                  </svg>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(prompt)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  title="删除"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                  </svg>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  #{tag.name}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Folder and Date - 只在有内容时显示 */}
          {(folderName || formattedDate) && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              {folderName && (
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {folderName}
                </span>
              )}
              {formattedDate && (
                <time dateTime={prompt.updatedAt}>
                  {formattedDate}
                </time>
              )}
              {!folderName && formattedDate && (
                <span></span> // 占位符，让日期靠右对齐
              )}
            </div>
          )}

          {/* Content Preview */}
          <div className="text-sm text-gray-700 line-clamp-3">
            {prompt.content}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// New Prompt Card for creation
export function NewPromptCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      className="h-full border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
          </svg>
        </div>
        <span className="text-sm font-medium">新建提示词</span>
      </div>
    </Card>
  )
}
