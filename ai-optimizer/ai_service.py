#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
from langchain_community.llms import Ollama
import asyncio
from openai import AsyncOpenAI
import logging
import re
from datetime import datetime
import time
from collections import deque
import os

# ========== 配置信息 ==========
analysis_config = {
    'host': os.getenv('OLLAMA_HOST', '47.107.173.5'),  # 本地模型服务器地址
    'port': os.getenv('OLLAMA_PORT', '11434'),  # 本地模型服务器端口
    'model': os.getenv('OLLAMA_MODEL', 'deepseek-r1:32b'),  # 本地模型名称
    'temperature': float(os.getenv('OLLAMA_TEMPERATURE', '0.1')),  # 模型生成文本的多样性控制参数
    'timeout': int(os.getenv('OLLAMA_TIMEOUT', '120')),  # 请求超时时间（秒）

    # DeepSeek在线配置
    'deepseek_api_base': "https://api.deepseek.com/v1",
    'deepseek_system_prompt': "电碳业务AI小助手，是专为电碳领域量身打造的智能工具。它能精准理解电碳行业术语，快速解答交易碳、碳核算、节能减排等专业问题，还能实时分析电碳数据，提供趋势预测与决策建议。无论是企业碳管理，还是政策解读，都能轻松应对。简单易用，随时随地助力用户掌握电碳动态，提升工作效率，是电碳从业者不可或缺的智能伙伴。",

    # Kimi配置
    'kimi_api_base': "https://api.moonshot.cn/v1"
}

# ========== 配置结束 ==========

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEYS = {
    "online_kimi": [os.getenv('KIMI_API_KEY', 'sk-grUEo1tFSbHBpIhGAODPiPk8HtsU2ItuZGyc7MRiCbRODo5Z')],
    "online_deepseek": [os.getenv('DEEPSEEK_API_KEY', 'sk-7fe6130f05e44d91868a02e8b9ff6413')]
}

MAX_WAIT_TIME = 300

# 重构密钥状态管理
key_status = {}
for model_type, keys in API_KEYS.items():
    for key in keys:
        key_status[key] = {
            "busy": False,
            "last_used": None,
            "usage_count": 0,
            "model_type": model_type
        }

lock = asyncio.Lock()
waiting_queue = deque()

async def get_available_key_with_queue(model_type):
    """获取指定模型类型的可用API密钥 - 支持排队等待"""
    async with lock:
        available_keys = [
            key for key, status in key_status.items()
            if status["model_type"] == model_type and not status["busy"]
        ]

        if available_keys:
            chosen_key = min(available_keys, key=lambda k: key_status[k]["last_used"] or datetime.min)
            key_status[chosen_key]["busy"] = True
            key_status[chosen_key]["last_used"] = datetime.now()
            key_status[chosen_key]["usage_count"] += 1
            logger.info(f"立即获得{model_type} API密钥: {chosen_key}")
            return chosen_key

        wait_future = asyncio.get_event_loop().create_future()
        waiting_queue.append((model_type, wait_future))
        try:
            await asyncio.wait_for(wait_future, timeout=MAX_WAIT_TIME)
            async with lock:
                available_keys = [
                    key for key, status in key_status.items()
                    if status["model_type"] == model_type and not status["busy"]
                ]
                if available_keys:
                    chosen_key = min(available_keys, key=lambda k: key_status[k]["last_used"] or datetime.min)
                    key_status[chosen_key]["busy"] = True
                    key_status[chosen_key]["last_used"] = datetime.now()
                    key_status[chosen_key]["usage_count"] += 1
                    logger.info(f"等待后获得{model_type} API密钥: {chosen_key}")
                    return chosen_key
                else:
                    logger.warning(f"等待结束但仍未获得{model_type}可用密钥")
                    return None
        except asyncio.TimeoutError:
            logger.warning(f"{model_type}请求等待超时")
            return None

async def mark_key_free(api_key):
    """标记密钥为空闲并通知等待队列"""
    async with lock:
        key_status[api_key]["busy"] = False

        model_type = key_status[api_key]["model_type"]
        for i, (queue_type, future) in enumerate(waiting_queue):
            if queue_type == model_type and not future.done():
                waiting_queue.remove((queue_type, future))
                future.set_result(True)
                logger.info(f"{model_type} API密钥释放，通知队列中的下一个请求，剩余队列长度: {len(waiting_queue)}")
                break

def init_ollama_connection_pool(base_url, model_name, temperature):
    """初始化Ollama连接池"""
    return Ollama(
        base_url=base_url,
        model=model_name,
        temperature=temperature
    )

def format_text_layout(text):
    """清除文本中的特殊字符并格式化"""
    text = re.sub(r'#|\*|-{2,}', '', text)
    text = re.sub(r'[ \t]{2,}', '', text)
    text = re.sub(' ', '', text)
    text = text.strip()

    lines = text.splitlines()
    non_empty_lines = [line for line in lines if line.strip() != '']

    cleaned_text = '\n'.join(non_empty_lines)
    cleaned_text = re.sub(r'[ \t]*\n[ \t]*', '\n', cleaned_text)

    paragraphs = cleaned_text.split('\n')
    indented_paragraphs = ['    ' + paragraph for paragraph in paragraphs]
    cleaned_text = '\n'.join(indented_paragraphs)
    cleaned_text = re.sub(r'<think>.*?</think>', '', cleaned_text, flags=re.DOTALL)

    return cleaned_text

async def call_online_model(model_type, api_key, text, model_name):
    """调用在线模型API的统一处理函数"""
    try:
        if model_type == "online_kimi":
            base_url = analysis_config['kimi_api_base']
            system_prompt = analysis_config['deepseek_system_prompt']
        elif model_type == "online_deepseek":
            base_url = analysis_config['deepseek_api_base']
            system_prompt = analysis_config['deepseek_system_prompt']
        else:
            raise ValueError(f"不支持的在线模型类型: {model_type}")

        client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        completion = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"{model_type} API调用失败: {str(e)}")
        raise

async def optimize_text_content(text, model_type='local', model_name=None, retries=5, apply_formatting=True):
    """优化文本内容的异步函数"""
    attempts = 0
    start_time = time.time()

    if model_name is None:
        model_name = analysis_config['model'] if model_type == 'local' else "deepseek-chat"

    while attempts < retries:
        try:
            if model_type == 'local':
                llm_pool = init_ollama_connection_pool(
                    base_url=f"http://{analysis_config['host']}:{analysis_config['port']}",
                    model_name=model_name,
                    temperature=analysis_config['temperature']
                )
                response = llm_pool.generate(prompts=[text])
                if response and hasattr(response, 'generations') and len(response.generations) > 0:
                    generated_text = response.generations[0][0].text.strip()
                else:
                    raise Exception("本地模型未返回有效内容")

            elif model_type in ('online_kimi', 'online_deepseek'):
                api_key = await get_available_key_with_queue(model_type)
                if not api_key:
                    raise Exception(f"无法获得{model_type}的有效API密钥")

                try:
                    generated_text = await call_online_model(model_type, api_key, text, model_name)
                finally:
                    await mark_key_free(api_key)
            else:
                return (False, {
                    'status_message': '无效的模型类型选择。',
                    'original': text,
                    'processing_time': round(time.time() - start_time, 2)
                })

            processed_text = format_text_layout(generated_text) if apply_formatting else generated_text

            return (True, {
                'status_message': f'调用{model_type}优化成功！',
                'original': text,
                'optimized': processed_text,
                'processing_time': round(time.time() - start_time, 2)
            })
        except Exception as e:
            attempts += 1
            error_msg = f"尝试 {attempts}/{retries} 失败: {str(e)}"
            logger.error(error_msg)

            if attempts < retries:
                await asyncio.sleep(2 ** attempts)
            else:
                return (False, {
                    'status_message': '调用AI优化失败，经过多次尝试后仍无法完成操作。',
                    'original': text,
                    'error': str(e),
                    'processing_time': round(time.time() - start_time, 2)
                })

def sync_optimize_text_content(text, model_type='local', model_name=None, retries=10, apply_formatting=True):
    """同步版本的文本优化函数"""
    return asyncio.run(optimize_text_content(
        text,
        model_type=model_type,
        model_name=model_name,
        retries=retries,
        apply_formatting=apply_formatting
    ))

if __name__ == "__main__":
    # 从命令行参数获取输入
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
        text = input_data.get('text', '')
        model_type = input_data.get('model_type', 'local')
        model_name = input_data.get('model_name', None)

        result = sync_optimize_text_content(text, model_type, model_name)
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(json.dumps({"error": "No input provided"}, ensure_ascii=False))
