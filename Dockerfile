# 多阶段构建：支持Node.js和Python
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN npm install -g bun
RUN bun install --frozen-lockfile

# Python环境阶段
FROM python:3.11-slim AS python-deps
WORKDIR /app
RUN pip install --no-cache-dir \
    langchain-community \
    asyncio \
    openai \
    ollama

# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g bun
RUN bun run build

# 运行阶段
FROM node:18-alpine AS runner
WORKDIR /app

# 安装Python和必要的包
RUN apk add --no-cache python3 py3-pip
RUN pip3 install --no-cache-dir \
    langchain-community \
    asyncio \
    openai \
    requests

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制AI优化模块
COPY --chown=nextjs:nodejs ./ai-optimizer ./ai-optimizer

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
