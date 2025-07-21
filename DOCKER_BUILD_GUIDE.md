# 🐳 Docker构建和部署指南

## 📦 Docker镜像构建

### 本地构建
```bash
# 克隆项目
git clone https://github.com/computersciencefreshmen/note-prompt.git
cd note-prompt

# 构建Docker镜像
docker build -t note-prompt:latest .

# 查看构建的镜像
docker images | grep note-prompt
```

### 多平台构建（推荐）
```bash
# 创建多平台构建器
docker buildx create --name multiarch --use

# 多平台构建
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t note-prompt:latest \
  --load .
```

## 🚀 Docker Hub发布

### 准备工作
1. 注册 [Docker Hub](https://hub.docker.com/) 账号
2. 创建仓库：`your-username/note-prompt`

### 构建和推送
```bash
# 登录Docker Hub
docker login

# 打标签
docker tag note-prompt:latest your-username/note-prompt:latest
docker tag note-prompt:latest your-username/note-prompt:v1.0.0

# 推送到Docker Hub
docker push your-username/note-prompt:latest
docker push your-username/note-prompt:v1.0.0
```

### 使用发布的镜像
```bash
# 拉取镜像
docker pull your-username/note-prompt:latest

# 运行容器
docker run -d \
  --name note-prompt \
  -p 3000:3000 \
  -e MYSQL_HOST=192.168.3.13 \
  -e MYSQL_PASSWORD=your_password \
  your-username/note-prompt:latest
```

## 🔧 本地快速部署

### 方式一：使用docker-compose（推荐）
```bash
# 克隆项目
git clone https://github.com/computersciencefreshmen/note-prompt.git
cd note-prompt

# 配置环境变量
cp .env.example .env.production
# 编辑 .env.production 设置数据库密码等

# 一键部署
./deploy.sh
```

### 方式二：手动Docker部署
```bash
# 1. 构建镜像
docker build -t note-prompt .

# 2. 创建网络
docker network create note-prompt-network

# 3. 启动Redis
docker run -d \
  --name note-prompt-redis \
  --network note-prompt-network \
  redis:7-alpine

# 4. 启动应用
docker run -d \
  --name note-prompt-app \
  --network note-prompt-network \
  -p 3000:3000 \
  -e MYSQL_HOST=192.168.3.13 \
  -e MYSQL_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  note-prompt

# 5. 启动Nginx（可选）
docker run -d \
  --name note-prompt-nginx \
  --network note-prompt-network \
  -p 80:80 \
  -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

## 🛠️ 环境变量配置

### 必需变量
```bash
# 数据库配置
MYSQL_HOST=192.168.3.13
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=note_prompt

# 安全配置
JWT_SECRET=your_jwt_secret_key_32_characters_minimum
```

### 可选变量
```bash
# AI模型配置
OLLAMA_HOST=47.107.173.5
OLLAMA_PORT=11434
OLLAMA_MODEL=deepseek-r1:32b

# 在线API密钥
DEEPSEEK_API_KEY=your_deepseek_api_key
KIMI_API_KEY=your_kimi_api_key
DASHSCOPE_API_KEY=your_dashscope_api_key

# 应用配置
NODE_ENV=production
PORT=3000
```

## 📊 Docker镜像详情

### 镜像结构
```dockerfile
# 基于Node.js 18 Alpine镜像
FROM node:18-alpine

# 集成Python环境支持AI功能
RUN apk add --no-cache python3 py3-pip

# 多阶段构建优化镜像大小
# Stage 1: 依赖安装
# Stage 2: Python依赖
# Stage 3: 应用构建
# Stage 4: 生产运行环境
```

### 镜像优化
- **多阶段构建**：减少最终镜像大小
- **Alpine基础镜像**：更小更安全
- **依赖缓存**：优化构建速度
- **权限控制**：非root用户运行

### 镜像大小
- **完整镜像**：~500MB
- **包含组件**：Node.js + Python + AI库 + 应用代码
- **优化后**：生产就绪，包含所有依赖

## 🔍 容器管理

### 查看容器状态
```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看容器日志
docker logs note-prompt-app

# 实时跟踪日志
docker logs -f note-prompt-app
```

### 容器操作
```bash
# 进入容器
docker exec -it note-prompt-app sh

# 重启容器
docker restart note-prompt-app

# 停止容器
docker stop note-prompt-app

# 删除容器
docker rm note-prompt-app
```

### 性能监控
```bash
# 查看容器资源使用
docker stats note-prompt-app

# 查看容器详细信息
docker inspect note-prompt-app
```

## 🚨 故障排除

### 常见问题

#### 1. 容器无法启动
```bash
# 查看详细错误
docker logs note-prompt-app

# 检查镜像是否存在
docker images | grep note-prompt

# 重新构建镜像
docker build --no-cache -t note-prompt .
```

#### 2. 数据库连接失败
```bash
# 检查网络连通性
docker exec note-prompt-app ping 192.168.3.13

# 测试数据库连接
docker exec note-prompt-app nc -zv 192.168.3.13 3306
```

#### 3. 端口访问问题
```bash
# 检查端口映射
docker port note-prompt-app

# 测试端口连通性
curl http://localhost:3000/api/health
```

### 调试模式
```bash
# 以调试模式运行
docker run -it --rm \
  -p 3000:3000 \
  -e DEBUG=* \
  note-prompt \
  sh
```

## 📈 生产部署建议

### 性能优化
- 使用多核CPU进行并行构建
- 配置适当的内存限制
- 启用Docker层缓存
- 使用nginx反向代理

### 安全建议
- 定期更新基础镜像
- 使用非root用户运行
- 限制容器权限
- 扫描镜像漏洞

### 监控和日志
- 集成日志聚合系统
- 配置健康检查
- 监控容器资源使用
- 设置告警机制

## 🔄 CI/CD集成

### GitHub Actions示例
```yaml
name: Build and Push Docker Image
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build Docker image
      run: docker build -t note-prompt .
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push your-username/note-prompt:latest
```

---

**Docker化部署让应用部署更简单、更可靠！** 🐳
