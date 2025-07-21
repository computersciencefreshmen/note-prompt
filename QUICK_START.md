# 🚀 Note Prompt 快速开始指南

## 📋 部署前准备

### 系统要求
- Docker 20.10+
- Docker Compose 2.0+
- MySQL数据库（外部）
- Ollama服务器（可选）

### 需要的信息
为了成功部署，请准备以下信息：

#### 1. 数据库信息
- **主机地址**: 192.168.3.13
- **端口**: 3306
- **用户名**: root
- **密码**: [你的MySQL密码]
- **数据库名**: note_prompt

#### 2. AI模型信息（可选）
- **Ollama服务器**: 47.107.173.5:11434
- **模型名称**: deepseek-r1:32b
- **API密钥**: DeepSeek、Kimi等（备用）

#### 3. 服务器信息
- **部署服务器IP**: [你的服务器地址]
- **开放端口**: 80, 443（可选）

## ⚡ 5分钟快速部署

### Step 1: 克隆项目
```bash
git clone https://github.com/computersciencefreshmen/note-prompt.git
cd note-prompt
```

### Step 2: 配置环境变量
```bash
# 复制配置模板
cp .env.example .env.production

# 编辑配置文件
nano .env.production
```

**必须配置的变量：**
```bash
# 数据库密码（必填）
MYSQL_PASSWORD=你的MySQL密码

# JWT密钥（必填，32字符以上）
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters_long

# API密钥（可选，建议配置）
DEEPSEEK_API_KEY=your_deepseek_api_key
KIMI_API_KEY=your_kimi_api_key
```

### Step 3: 初始化数据库
```bash
# 连接MySQL并创建数据库
mysql -h 192.168.3.13 -u root -p
CREATE DATABASE note_prompt;
USE note_prompt;
SOURCE database/mysql-schema.sql;
```

### Step 4: 一键部署
```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 执行部署（自动构建和启动所有服务）
./deploy.sh
```

### Step 5: 验证部署
```bash
# 检查服务状态
docker-compose ps

# 访问应用
curl http://你的服务器IP/api/health

# 或在浏览器中访问
http://你的服务器IP
```

## 🔧 常见问题

### Q1: 部署失败怎么办？
```bash
# 查看详细日志
docker-compose logs note-prompt-app

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### Q2: 无法访问应用？
- 检查防火墙设置
- 确认端口80已开放
- 检查服务器IP地址

### Q3: 数据库连接失败？
- 确认MySQL服务正常运行
- 检查网络连接：`telnet 192.168.3.13 3306`
- 验证用户名密码正确

### Q4: AI优化不工作？
- 检查Ollama服务：`curl http://47.107.173.5:11434/api/version`
- 配置在线API密钥作为备用
- 查看AI服务日志

## 📱 快速使用

### 1. 注册账号
访问 http://你的服务器IP/register

### 2. 创建提示词
- 进入"我的提示词"页面
- 点击"新建提示词"
- 输入标题和内容

### 3. AI优化
- 在编辑页面点击"AI优化"
- 等待优化完成
- 可以继续多轮优化

### 4. 分享提示词
- 在提示词卡片上点击"发布"
- 确认发布到公共库
- 其他用户可以搜索和导入

## 🛠️ 管理命令

### 服务管理
```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新应用
git pull origin main && ./deploy.sh
```

### 数据备份
```bash
# 备份数据库
mysqldump -h 192.168.3.13 -u root -p note_prompt > backup_$(date +%Y%m%d).sql

# 备份应用数据
tar -czf app_backup_$(date +%Y%m%d).tar.gz data/
```

## 🚀 生产环境建议

### 安全设置
- 配置HTTPS证书
- 定期更新密码
- 限制数据库访问权限
- 启用防火墙

### 性能优化
- 监控服务器资源
- 定期清理日志
- 备份重要数据
- 更新Docker镜像

### 监控告警
- 设置服务状态监控
- 配置磁盘空间告警
- 监控数据库性能
- 记录访问日志

---

**部署完成后，你将拥有一个功能完整的AI提示词管理平台！** 🎉
