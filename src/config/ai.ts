// AI 模型配置
export const aiConfig = {
  // 本地模型配置（优先使用）
  local: {
    host: process.env.OLLAMA_HOST || '47.107.173.5',
    port: process.env.OLLAMA_PORT || '11434',
    model: process.env.OLLAMA_MODEL || 'deepseek-r1:32b',
    temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.1'),
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '120'),
  },

  // DeepSeek在线配置
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-reasoner',
    temperature: 0.3,
    maxTokens: 2048,
  },

  // Kimi在线配置
  kimi: {
    baseURL: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    temperature: 0.3,
    maxTokens: 2048,
  },

  // 通义千问配置（备用）
  qwen: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',  // 可选: qwen-max, qwen-plus, qwen-turbo
    temperature: 0.7,    // 创造性 0-1，0.7 平衡创造性和准确性
    maxTokens: 2000,     // 最大输出长度
    topP: 0.9,          // 核心采样参数
  },

  // 系统提示词配置
  prompts: {
    optimize: `你是一个专业的AI提示词优化专家。请帮助用户优化提示词，使其更加清晰、准确和有效。

优化原则：
1. 保持原意的基础上，让表达更加清晰准确
2. 补充必要的上下文信息
3. 优化语言表达和逻辑结构
4. 确保提示词具有较好的可执行性
5. 如果是中文提示词，保持中文输出；如果是英文提示词，保持英文输出

请直接返回优化后的提示词，不要包含额外的解释说明。`,

    multiTurn: `你是一个专业的AI提示词优化专家。用户已经有了一个提示词的初版优化，现在需要根据用户的反馈进行进一步改进。

当前任务：
1. 理解用户对当前提示词的反馈和要求
2. 在保持提示词核心功能的基础上，根据用户反馈进行调整
3. 确保优化后的提示词更符合用户的具体需求
4. 如果是中文提示词，保持中文输出；如果是英文提示词，保持英文输出

请直接返回优化后的提示词，不要包含额外的解释说明。`,

    // 电碳业务专用提示词
    carbon: `你是专为电碳领域量身打造的智能助手。你能精准理解电碳行业术语，快速解答交易碳、碳核算、节能减排等专业问题，还能实时分析电碳数据，提供趋势预测与决策建议。无论是企业碳管理，还是政策解读，都能轻松应对。请根据用户的需求提供专业、准确的回答。`
  }
}

// 获取API请求配置
export function getAIRequestConfig(modelType: 'local' | 'deepseek' | 'kimi' | 'qwen' = 'local') {
  if (modelType === 'local') {
    // 本地模型配置
    return {
      type: 'local',
      config: aiConfig.local,
    }
  }

  // 在线模型配置
  const apiKeys = {
    deepseek: process.env.DEEPSEEK_API_KEY,
    kimi: process.env.KIMI_API_KEY,
    qwen: process.env.DASHSCOPE_API_KEY,
  }

  const apiKey = apiKeys[modelType]
  if (!apiKey) {
    throw new Error(`${modelType.toUpperCase()}_API_KEY environment variable is not configured`)
  }

  const configs = {
    deepseek: {
      baseURL: aiConfig.deepseek.baseURL,
      model: aiConfig.deepseek.model,
      temperature: aiConfig.deepseek.temperature,
      max_tokens: aiConfig.deepseek.maxTokens,
    },
    kimi: {
      baseURL: aiConfig.kimi.baseURL,
      model: aiConfig.kimi.model,
      temperature: aiConfig.kimi.temperature,
      max_tokens: aiConfig.kimi.maxTokens,
    },
    qwen: {
      baseURL: aiConfig.qwen.baseURL,
      model: aiConfig.qwen.model,
      temperature: aiConfig.qwen.temperature,
      max_tokens: aiConfig.qwen.maxTokens,
      top_p: aiConfig.qwen.topP,
    },
  }

  return {
    type: 'online',
    ...configs[modelType],
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  }
}

// 调用本地AI服务
export async function callLocalAI(text: string, modelType: string = 'local', modelName?: string) {
  const { spawn } = require('child_process')
  const path = require('path')

  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'ai-optimizer', 'ai_service.py')
    const inputData = JSON.stringify({
      text,
      model_type: modelType,
      model_name: modelName,
    })

    const python = spawn('python3', [pythonScript, inputData])
    let output = ''
    let error = ''

    python.stdout.on('data', (data: Buffer) => {
      output += data.toString()
    })

    python.stderr.on('data', (data: Buffer) => {
      error += data.toString()
    })

    python.on('close', (code: number) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (e) {
          reject(new Error(`Failed to parse AI response: ${output}`))
        }
      } else {
        reject(new Error(`AI service failed: ${error}`))
      }
    })
  })
}

// 模型参数预设
export const modelPresets = {
  creative: {
    temperature: 0.9,
    top_p: 0.9,
    description: '更有创意，适合创作类提示词'
  },
  balanced: {
    temperature: 0.7,
    top_p: 0.9,
    description: '平衡创造性和准确性（推荐）'
  },
  precise: {
    temperature: 0.3,
    top_p: 0.8,
    description: '更加准确，适合技术类提示词'
  }
}
