import { NextRequest, NextResponse } from 'next/server'
import { getAIRequestConfig, aiConfig } from '@/config/ai'
import { ConversationMessage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { originalPrompt, currentPrompt, userFeedback, conversationHistory } = await request.json()

    if (!originalPrompt || !currentPrompt || !userFeedback) {
      return NextResponse.json(
        { error: 'originalPrompt, currentPrompt, and userFeedback are required' },
        { status: 400 }
      )
    }

    // 获取AI配置
    const config = getAIRequestConfig()
    const systemPrompt = aiConfig.prompts.multiTurn

    // 构建对话历史
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: `当前提示词版本：\n${currentPrompt}\n\n用户反馈和改进要求：\n${userFeedback}\n\n请根据反馈优化这个提示词。`
      }
    ]

    // 调用通义千问API
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const optimizedPrompt = data.choices[0]?.message?.content

    if (!optimizedPrompt) {
      throw new Error('No response from AI model')
    }

    // 更新对话历史
    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: `当前提示词版本：\n${currentPrompt}\n\n用户反馈和改进要求：\n${userFeedback}`
      },
      {
        role: 'assistant',
        content: optimizedPrompt.trim()
      }
    ]

    // 计算轮次
    const round = Math.floor(updatedHistory.length / 2)

    return NextResponse.json({
      success: true,
      optimizedPrompt: optimizedPrompt.trim(),
      conversationHistory: updatedHistory,
      round
    })

  } catch (error) {
    console.error('Multi-turn optimization error:', error)
    return NextResponse.json(
      {
        error: 'Failed to optimize prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
