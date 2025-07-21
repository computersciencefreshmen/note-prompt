import { NextRequest, NextResponse } from 'next/server'
import { getAIRequestConfig, aiConfig, callLocalAI } from '@/config/ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, userRequirement, modelType = 'local', modelName } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    let userMessage = `请优化以下提示词：\n\n${prompt}`

    if (userRequirement) {
      userMessage += `\n\n用户特殊要求：${userRequirement}`
    }

    let optimizedPrompt: string
    let processingTime = 0
    const startTime = Date.now()

    try {
      if (modelType === 'local') {
        // 使用本地AI服务
        const result = await callLocalAI(userMessage, 'local', modelName)

        if (Array.isArray(result) && result[0] === true) {
          // 成功响应格式: [true, {optimized: string, processing_time: number, ...}]
          optimizedPrompt = result[1].optimized
          processingTime = result[1].processing_time || 0
        } else if (Array.isArray(result) && result[0] === false) {
          // 失败响应格式: [false, {status_message: string, error?: string, ...}]
          throw new Error(result[1].status_message || 'Local AI service failed')
        } else {
          throw new Error('Unexpected response format from local AI service')
        }
      } else {
        // 使用在线AI服务
        const config = getAIRequestConfig(modelType as 'deepseek' | 'kimi' | 'qwen')
        const systemPrompt = modelType === 'local' ? aiConfig.prompts.carbon : aiConfig.prompts.optimize

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
            ...(config.top_p && { top_p: config.top_p })
          })
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const data = await response.json()
        optimizedPrompt = data.choices[0]?.message?.content

        if (!optimizedPrompt) {
          throw new Error('No response from AI model')
        }

        processingTime = (Date.now() - startTime) / 1000
      }

      return NextResponse.json({
        success: true,
        originalPrompt: prompt,
        optimizedPrompt: optimizedPrompt.trim(),
        modelType,
        modelName: modelName || 'default',
        processingTime: Math.round(processingTime * 100) / 100,
        conversationId: generateConversationId()
      })

    } catch (aiError) {
      // 如果本地AI失败，尝试使用在线备用服务
      if (modelType === 'local') {
        console.warn('Local AI failed, trying online backup:', aiError)

        try {
          const backupConfig = getAIRequestConfig('deepseek')
          const response = await fetch(`${backupConfig.baseURL}/chat/completions`, {
            method: 'POST',
            headers: backupConfig.headers,
            body: JSON.stringify({
              model: backupConfig.model,
              messages: [
                {
                  role: 'system',
                  content: aiConfig.prompts.optimize
                },
                {
                  role: 'user',
                  content: userMessage
                }
              ],
              temperature: backupConfig.temperature,
              max_tokens: backupConfig.max_tokens
            })
          })

          if (response.ok) {
            const data = await response.json()
            optimizedPrompt = data.choices[0]?.message?.content

            if (optimizedPrompt) {
              return NextResponse.json({
                success: true,
                originalPrompt: prompt,
                optimizedPrompt: optimizedPrompt.trim(),
                modelType: 'deepseek',
                modelName: 'backup',
                processingTime: (Date.now() - startTime) / 1000,
                conversationId: generateConversationId(),
                warning: 'Local AI unavailable, used online backup service'
              })
            }
          }
        } catch (backupError) {
          console.error('Backup AI also failed:', backupError)
        }
      }

      throw aiError
    }

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
