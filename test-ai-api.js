// AI优化API测试脚本
// 使用方法：node test-ai-api.js

const testPrompts = [
  {
    prompt: "帮我写一篇文章",
    userRequirement: "要求专业且有逻辑性"
  },
  {
    prompt: "请审查我的代码，找出问题",
    userRequirement: "重点关注性能和安全"
  },
  {
    prompt: "写个产品介绍",
    userRequirement: "突出卖点，吸引用户"
  }
];

async function testAIOptimize(baseUrl, testCase, index) {
  console.log(`\n🧪 测试用例 ${index + 1}: ${testCase.prompt}`);
  console.log('⏳ 发送请求...');

  try {
    const response = await fetch(`${baseUrl}/api/v1/ai/optimize-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ 测试成功！');
      console.log('📝 原始提示词:', testCase.prompt);
      console.log('✨ 优化结果:', data.optimizedPrompt.substring(0, 200) + '...');
      console.log('🆔 会话ID:', data.conversationId);
      return true;
    } else {
      console.log('❌ 测试失败:', data.error || data.details);
      return false;
    }
  } catch (error) {
    console.log('💥 请求错误:', error.message);
    return false;
  }
}

async function runAllTests() {
  // 可以改为您的部署URL
  const baseUrl = process.argv[2] || 'http://localhost:3000';

  console.log('🚀 开始AI优化功能测试');
  console.log('🌐 测试地址:', baseUrl);
  console.log('📊 测试用例数量:', testPrompts.length);

  let successCount = 0;

  for (let i = 0; i < testPrompts.length; i++) {
    const success = await testAIOptimize(baseUrl, testPrompts[i], i);
    if (success) successCount++;

    // 延迟1秒避免请求过快
    if (i < testPrompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📈 测试结果汇总:');
  console.log(`✅ 成功: ${successCount}/${testPrompts.length}`);
  console.log(`❌ 失败: ${testPrompts.length - successCount}/${testPrompts.length}`);

  if (successCount === testPrompts.length) {
    console.log('🎉 所有测试通过！AI优化功能工作正常');
  } else {
    console.log('⚠️  部分测试失败，请检查配置');
  }
}

// 如果在Node.js环境中运行
if (typeof fetch === 'undefined') {
  console.log('请在浏览器中运行此脚本，或安装node-fetch');
  console.log('npm install node-fetch');
  process.exit(1);
}

runAllTests();
