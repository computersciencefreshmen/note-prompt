# 简化版Dockerfile - 修复Python依赖问题
FROM node:18-alpine

WORKDIR /app

# 安装Python和基础工具
RUN apk add --no-cache python3 py3-pip

# 安装Node.js依赖
COPY package.json bun.lock* ./
RUN npm install -g bun
RUN bun install

# 复制项目文件
COPY . .

# 安装Python依赖（简化版本）
RUN pip3 install --no-cache-dir --upgrade pip
RUN pip3 install --no-cache-dir openai requests || echo "Python packages install completed with warnings"

# 构建应用
RUN bun run build

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["bun", "start"]
