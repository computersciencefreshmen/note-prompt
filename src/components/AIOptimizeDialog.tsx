'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { ConversationMessage } from '@/types'

interface AIOptimizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  originalPrompt: string
  onOptimizedResult: (optimizedPrompt: string) => void
}

export default function AIOptimizeDialog({
  open,
  onOpenChange,
  originalPrompt,
  onOptimizedResult
}: AIOptimizeDialogProps) {
  const [step, setStep] = useState<'initial' | 'result' | 'feedback'>('initial')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [editablePrompt, setEditablePrompt] = useState('')
  const [userFeedback, setUserFeedback] = useState('')
  const [userRequirement, setUserRequirement] = useState('')
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [round, setRound] = useState(0)
  const [error, setError] = useState('')

  // 重置对话状态
  const resetDialog = () => {
    setStep('initial')
    setOptimizedPrompt('')
    setEditablePrompt('')
    setUserFeedback('')
    setUserRequirement('')
    setConversationHistory([])
    setRound(0)
    setError('')
  }

  // 第一轮AI优化
  const handleFirstOptimize = async () => {
    if (!originalPrompt.trim()) {
      setError('请先输入提示词内容')
      return
    }

    setIsOptimizing(true)
    setError('')

    try {
      const result = await api.ai.optimizePrompt({
        prompt: originalPrompt,
        userRequirement: userRequirement.trim() || undefined
      })

      if (result.success) {
        setOptimizedPrompt(result.optimizedPrompt)
        setEditablePrompt(result.optimizedPrompt)
        setStep('result')
        setRound(1)
        // 初始化对话历史
        setConversationHistory([
          {
            role: 'user',
            content: userRequirement ? `原始提示词：${originalPrompt}\n\n特殊要求：${userRequirement}` : `原始提示词：${originalPrompt}`
          },
          {
            role: 'assistant',
            content: result.optimizedPrompt
          }
        ])
      } else {
        setError(result.error || 'AI优化失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI优化失败')
    } finally {
      setIsOptimizing(false)
    }
  }

  // 多轮优化
  const handleMultiTurnOptimize = async () => {
    if (!userFeedback.trim()) {
      setError('请输入您的反馈和修改要求')
      return
    }

    setIsOptimizing(true)
    setError('')

    try {
      const result = await api.ai.optimizePromptMultiTurn({
        originalPrompt,
        currentPrompt: editablePrompt,
        userFeedback: userFeedback.trim(),
        conversationHistory
      })

      if (result.success) {
        setOptimizedPrompt(result.optimizedPrompt)
        setEditablePrompt(result.optimizedPrompt)
        setConversationHistory(result.conversationHistory)
        setRound(result.round)
        setUserFeedback('')
        setStep('result')
      } else {
        setError(result.error || 'AI优化失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI优化失败')
    } finally {
      setIsOptimizing(false)
    }
  }

  // 采纳优化结果
  const handleAdoptResult = () => {
    onOptimizedResult(editablePrompt)
    onOpenChange(false)
    resetDialog()
  }

  // 继续优化
  const handleContinueOptimize = () => {
    setStep('feedback')
  }

  // 关闭对话框
  const handleClose = () => {
    onOpenChange(false)
    resetDialog()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-2 text-purple-500">
              <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            AI提示词优化 {round > 0 && <Badge variant="secondary" className="ml-2">第{round}轮</Badge>}
          </DialogTitle>
          <DialogDescription>
            {step === 'initial' && 'AI将帮助您优化提示词，让其更加清晰准确和有效'}
            {step === 'result' && '优化完成！您可以编辑结果或继续优化'}
            {step === 'feedback' && '请告诉AI您希望如何进一步改进这个提示词'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* 原始提示词 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">原始提示词：</h4>
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 max-h-32 overflow-y-auto">
              {originalPrompt}
            </div>
          </div>

          {/* 初始优化界面 */}
          {step === 'initial' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="userRequirement" className="block text-sm font-medium text-gray-700 mb-2">
                  特殊要求（可选）：
                </label>
                <Input
                  id="userRequirement"
                  placeholder="例如：让语言更专业，增加具体的例子，简化表达等..."
                  value={userRequirement}
                  onChange={(e) => setUserRequirement(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 优化结果界面 */}
          {step === 'result' && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                AI优化后（可编辑）：
              </h4>
              <Textarea
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                className="min-h-32 bg-purple-50 border-purple-200 focus:border-purple-300"
                placeholder="您可以在这里编辑优化后的提示词..."
              />
              <p className="text-xs text-gray-500 mt-1">
                您可以直接编辑上面的内容，或点击"继续优化"让AI进一步改进
              </p>
            </div>
          )}

          {/* 反馈界面 */}
          {step === 'feedback' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">当前版本：</h4>
                <div className="p-3 bg-purple-50 rounded-lg text-sm text-gray-800 max-h-32 overflow-y-auto border border-purple-200">
                  {editablePrompt}
                </div>
              </div>

              <div>
                <label htmlFor="userFeedback" className="block text-sm font-medium text-gray-700 mb-2">
                  您的反馈和改进要求：
                </label>
                <Textarea
                  id="userFeedback"
                  placeholder="例如：太复杂了，请简化一下；需要增加更多细节；语言不够专业；格式需要调整等..."
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isOptimizing}>
            取消
          </Button>

          <div className="space-x-2">
            {step === 'initial' && (
              <Button
                onClick={handleFirstOptimize}
                disabled={isOptimizing || !originalPrompt.trim()}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isOptimizing ? '优化中...' : '开始优化'}
              </Button>
            )}

            {step === 'result' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleContinueOptimize}
                  disabled={isOptimizing}
                >
                  继续优化
                </Button>
                <Button
                  onClick={handleAdoptResult}
                  disabled={isOptimizing}
                  className="bg-green-500 hover:bg-green-600"
                >
                  采纳结果
                </Button>
              </>
            )}

            {step === 'feedback' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep('result')}
                  disabled={isOptimizing}
                >
                  返回
                </Button>
                <Button
                  onClick={handleMultiTurnOptimize}
                  disabled={isOptimizing || !userFeedback.trim()}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {isOptimizing ? '优化中...' : '提交反馈'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
