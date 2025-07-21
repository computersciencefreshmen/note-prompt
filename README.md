# Note Prompt - AI提示词管理平台

一个现代化的AI提示词管理平台，支持本地AI模型集成、智能优化、多用户协作和完整的Docker化部署。

## 🚀 项目特性

### 📝 核心功能
- **提示词管理**: 创建、编辑、分类、搜索个人提示词库
- **AI智能优化**: 集成本地Ollama模型和在线API，自动优化提示词质量
- **公共提示词库**: 分享和发现优质社区提示词
- **文件夹管理**: 层级文件夹组织，支持拖拽移动
- **收藏点赞**: 收藏喜欢的提示词，点赞优质内容

### 🤖 AI模型支持
- **本地模型**: 支持Ollama本地部署（DeepSeek-R1:32B等）
- **在线API**: DeepSeek、Kimi、通义千问备用支持
- **智能切换**: 本地模型失败时自动切换在线备用
- **多轮对话**: 支持多轮优化和反馈机制

### 🔧 技术栈
- **前端**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Node.js
- **数据库**: MySQL/PostgreSQL双数据库支持
- **UI组件**: shadcn/ui, Radix UI
- **部署**: Docker + Docker Compose + Nginx
- **AI集成**: Python + LangChain + Ollama

## 📦 快速开始

### 方式一：Docker部署（推荐）

#### 1. 克隆项目
```bash
git clone https://github.com/computersciencefreshmen/note-prompt.git
cd note-prompt
```

#### 2. 配置环境变量
```bash
cp .env.example .env.production
```

编辑 `.env.production` 文件：
```bash
# MySQL数据库配置
MYSQL_HOST=192.168.3.13
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=note_prompt

# 本地AI模型配置
OLLAMA_HOST=47.107.173.5
OLLAMA_PORT=11434
OLLAMA_MODEL=deepseek-r1:32b

# API密钥（可选）
DEEPSEEK_API_KEY=your_deepseek_api_key
KIMI_API_KEY=your_kimi_api_key

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters_long
```

#### 3. 初始化数据库
```bash
mysql -h 192.168.3.13 -u root -p note_prompt < database/mysql-schema.sql
```

#### 4. 一键部署
```bash
chmod +x deploy.sh
./deploy.sh
```

#### 5. 访问应用
- 主应用: http://your_server_ip
- API健康检查: http://your_server_ip/api/health

### 方式二：本地开发

#### 1. 安装依赖
```bash
bun install
# 或
npm install
```

#### 2. 启动开发服务器
```bash
bun dev
# 或
npm run dev
```

#### 3. 访问应用
打开 [http://localhost:3000](http://localhost:3000)

## 🐳 Docker部署详情

### 服务架构
- **note-prompt-app**: 主应用服务（Node.js + Python AI）
- **nginx**: 反向代理和负载均衡
- **redis**: 缓存服务
- **mysql**: 数据库（外部）

### 端口配置
- **80**: Web访问端口（外部）
- **443**: HTTPS端口（可选）
- **3000**: 应用端口（内部）
- **6379**: Redis端口（内部）

### 服务管理
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f note-prompt-app

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新部署
git pull origin main && ./deploy.sh
```

## 📁 项目结构

```
note-prompt/
├── src/                          # 源代码目录
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API路由
│   │   ├── public/               # 公共提示词页面
│   │   ├── prompts/              # 个人提示词页面
│   │   └── ...
│   ├── components/               # React组件
│   ├── lib/                      # 工具函数
│   └── types/                    # TypeScript类型定义
├── ai-optimizer/                 # AI优化服务
│   └── ai_service.py            # Python AI服务
├── database/                     # 数据库脚本
│   └── mysql-schema.sql         # MySQL表结构
├── nginx/                        # Nginx配置
│   └── nginx.conf               # 反向代理配置
├── docker-compose.yml           # Docker服务编排
├── Dockerfile                   # Docker镜像构建
├── deploy.sh                    # 一键部署脚本
└── DOCKER_DEPLOYMENT_GUIDE.md   # 详细部署指南
```

## 🔧 配置说明

### 数据库配置
支持MySQL和PostgreSQL双数据库：

```bash
# MySQL配置
MYSQL_HOST=192.168.3.13
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# PostgreSQL配置（备用）
DATABASE_URL="postgresql://user:password@host:port/database"
```

### AI模型配置
```bash
# 本地Ollama模型（主要）
OLLAMA_HOST=47.107.173.5
OLLAMA_PORT=11434
OLLAMA_MODEL=deepseek-r1:32b

# 在线API（备用）
DEEPSEEK_API_KEY=your_key
KIMI_API_KEY=your_key
DASHSCOPE_API_KEY=your_key
```

## 🚀 功能演示

### 1. 提示词管理
- 创建和编辑提示词
- 文件夹分类管理
- 拖拽移动到文件夹
- 搜索和筛选

### 2. AI智能优化
- 一键AI优化提示词
- 多轮对话优化
- 自定义优化要求
- 本地模型 + 在线备用

### 3. 公共提示词库
- 浏览社区提示词
- 标签筛选和搜索
- 一键导入到个人库
- 点赞和收藏

### 4. 协作功能
- 发布个人提示词到公共库
- 社区互动和分享
- 使用统计和分析

## 🛠️ 开发指南

### 本地开发环境
```bash
# 安装依赖
bun install

# 启动开发服务器
bun dev

# 代码格式化
bun run format

# 类型检查
bun run lint
```

### 构建生产版本
```bash
# 构建应用
bun run build

# 启动生产服务器
bun start
```

### Docker本地构建
```bash
# 构建镜像
docker build -t note-prompt .

# 运行容器
docker run -p 3000:3000 note-prompt
```

## 📊 性能优化

### 前端优化
- Next.js App Router
- 组件懒加载
- 图片优化
- 缓存策略

### 后端优化
- API响应缓存
- 数据库连接池
- Redis缓存
- Nginx压缩

### 部署优化
- 多阶段Docker构建
- 镜像体积优化
- 服务监控
- 自动重启

## 🔒 安全特性

- JWT身份认证
- API速率限制
- SQL注入防护
- XSS攻击防护
- HTTPS支持
- 环境变量管理

## 📈 监控和维护

### 日志管理
```bash
# 查看应用日志
docker-compose logs -f note-prompt-app

# 查看Nginx日志
docker-compose logs -f nginx

# 查看系统资源
docker stats
```

### 数据备份
```bash
# 备份MySQL数据库
mysqldump -h 192.168.3.13 -u root -p note_prompt > backup.sql

# 备份应用数据
tar -czf data_backup.tar.gz data/
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Ollama](https://ollama.ai/) - 本地AI模型部署
- [LangChain](https://langchain.com/) - AI应用开发框架

## 📞 支持

如果您遇到问题或有建议，请：

1. 查看 [部署指南](DOCKER_DEPLOYMENT_GUIDE.md)
2. 提交 [Issue](https://github.com/computersciencefreshmen/note-prompt/issues)
3. 参与 [Discussions](https://github.com/computersciencefreshmen/note-prompt/discussions)

---

**Made with ❤️ by [computersciencefreshmen](https://github.com/computersciencefreshmen)**
