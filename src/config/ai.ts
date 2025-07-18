// AI 模型配置
export const aiConfig = {
  // 通义千问配置
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

请直接返回优化后的提示词，不要包含额外的解释说明。`
  }
}

// 获取API请求配置
export function getAIRequestConfig() {
  const apiKey = process.env.DASHSCOPE_API_KEY

  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY environment variable is not configured')
  }

  return {
    baseURL: aiConfig.qwen.baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    model: aiConfig.qwen.model,
    temperature: aiConfig.qwen.temperature,
    max_tokens: aiConfig.qwen.maxTokens,
    top_p: aiConfig.qwen.topP,
  }
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
