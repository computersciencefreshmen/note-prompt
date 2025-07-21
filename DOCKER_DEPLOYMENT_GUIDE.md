# Note Prompt Docker部署指南

本指南将帮助你将Note Prompt应用完全Docker化部署到本地服务器。

## 📋 系统要求

### 硬件要求
- **CPU**: 4核心以上
- **内存**: 8GB以上
- **存储**: 50GB以上可用空间
- **网络**: 稳定的网络连接

### 软件要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Docker支持的任何Linux发行版
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

## 🛠 环境准备

### 1. 安装Docker和Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录以应用用户组更改
newgrp docker
```

### 2. 检查Docker安装

```bash
docker --version
docker-compose --version
```

## 🔧 配置说明

### 1. 数据库配置

#### MySQL数据库 (推荐)
- **地址**: 192.168.3.13:3306
- **用户**: root
- **密码**: 你的数据库密码
- **数据库**: note_prompt

#### 初始化数据库
```bash
# 连接到MySQL服务器
mysql -h 192.168.3.13 -u root -p

# 执行数据库初始化脚本
source database/mysql-schema.sql
```

### 2. AI模型配置

#### 本地Ollama模型 (主要)
- **地址**: 47.107.173.5:11434
- **模型**: deepseek-r1:32b
- **温度**: 0.1

#### 在线API (备用)
- **DeepSeek API**: sk-7fe6130f05e44d91868a02e8b9ff6413
- **Kimi API**: sk-grUEo1tFSbHBpIhGAODPiPk8HtsU2ItuZGyc7MRiCbRODo5Z

### 3. 端口配置

#### 需要开放的端口
- **3000**: 应用端口 (内部)
- **80**: Web访问端口 (外部)
- **443**: HTTPS端口 (可选)
- **6379**: Redis端口 (内部)

#### 防火墙配置
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 🚀 部署步骤

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd note-prompt
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env.production

# 编辑配置文件
nano .env.production
```

**必须配置的环境变量**:
```bash
# MySQL数据库配置
MYSQL_PASSWORD=your_mysql_password_here

# JWT密钥 (32字符以上的随机字符串)
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters_long

# API密钥 (如需要)
DEEPSEEK_API_KEY=your_deepseek_api_key
KIMI_API_KEY=your_kimi_api_key
```

### 3. 执行部署
```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 4. 验证部署
```bash
# 检查服务状态
docker-compose ps

# 查看应用日志
docker-compose logs -f note-prompt-app

# 测试应用访问
curl http://localhost/api/health
```

## 📁 目录结构

```
note-prompt/
├── ai-optimizer/           # AI优化Python服务
│   └── ai_service.py
├── database/               # 数据库脚本
│   └── mysql-schema.sql
├── nginx/                  # Nginx配置
│   └── nginx.conf
├── src/                    # 应用源码
├── Dockerfile              # Docker镜像构建文件
├── docker-compose.yml      # 服务编排配置
├── deploy.sh              # 自动部署脚本
├── .env.production        # 生产环境配置
└── DOCKER_DEPLOYMENT_GUIDE.md  # 部署指南
```

## 🔍 监控和维护

### 1. 查看服务状态
```bash
# 查看所有服务状态
docker-compose ps

# 查看特定服务日志
docker-compose logs -f note-prompt-app
docker-compose logs -f nginx
docker-compose logs -f redis
```

### 2. 服务管理命令
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

### 3. 数据备份
```bash
# 备份MySQL数据库
mysqldump -h 192.168.3.13 -u root -p note_prompt > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份应用数据
tar -czf data_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/
```

## 🔧 故障排除

### 1. 容器启动失败
```bash
# 查看详细错误日志
docker-compose logs note-prompt-app

# 检查镜像构建
docker-compose build --no-cache note-prompt-app
```

### 2. 数据库连接失败
- 检查MySQL服务是否正常运行
- 验证网络连接: `telnet 192.168.3.13 3306`
- 检查数据库凭据和权限

### 3. AI服务不可用
- 检查本地Ollama服务: `curl http://47.107.173.5:11434/api/version`
- 验证API密钥是否有效
- 查看AI服务日志

### 4. 网络访问问题
- 检查防火墙配置
- 验证Nginx配置
- 确保端口映射正确

## 📈 性能优化

### 1. 系统优化
```bash
# 调整文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化内核参数
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
sysctl -p
```

### 2. Docker优化
```bash
# 清理未使用的Docker资源
docker system prune -a

# 限制日志大小
# 在docker-compose.yml中添加logging配置
```

### 3. 应用优化
- 配置Redis缓存
- 启用Nginx压缩
- 优化数据库查询

## 🔒 安全建议

### 1. 网络安全
- 使用防火墙限制端口访问
- 配置HTTPS证书
- 定期更新SSL/TLS配置

### 2. 应用安全
- 定期更新Docker镜像
- 使用强密码和API密钥
- 启用访问日志记录

### 3. 数据安全
- 定期备份数据
- 加密敏感数据
- 限制数据库访问权限

## 📞 支持

如果遇到问题，请检查：
1. 系统日志: `journalctl -u docker`
2. 应用日志: `docker-compose logs`
3. 网络连接: 确保所有服务可达

## 🔄 更新升级

### 更新应用
```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy.sh
```

### 数据库迁移
```bash
# 如有数据库结构更新，执行迁移脚本
mysql -h 192.168.3.13 -u root -p note_prompt < database/migration.sql
```

---

**部署完成后，你的应用将在以下地址可用**:
- 主应用: http://localhost
- API文档: http://localhost/api/health
- 管理界面: http://localhost:3000

**祝你部署成功！** 🎉
