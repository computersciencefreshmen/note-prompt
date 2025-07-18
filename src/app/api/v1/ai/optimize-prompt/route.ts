import { NextRequest, NextResponse } from 'next/server'
import { getAIRequestConfig, aiConfig } from '@/config/ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, userRequirement } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // 获取AI配置
    const config = getAIRequestConfig()
    const systemPrompt = aiConfig.prompts.optimize

    let userMessage = `请优化以下提示词：\n\n${prompt}`

    if (userRequirement) {
      userMessage += `\n\n用户特殊要求：${userRequirement}`
    }

    // 调用通义千问API
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
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

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      optimizedPrompt: optimizedPrompt.trim(),
      conversationId: generateConversationId()
    })

  } catch (error) {
    console.error('Prompt optimization error:', error)
    return NextResponse.json(
      {
        error: 'Failed to optimize prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
