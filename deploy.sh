#!/bin/bash

# Note Prompt Docker部署脚本
set -e

echo "🚀 开始部署 Note Prompt 应用..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env.production ]; then
    echo "⚠️ 未找到 .env.production 文件，使用默认配置"
    cp .env.example .env.production
fi

# 提示用户配置数据库密码
echo "📋 请确保已在 .env.production 中配置以下信息："
echo "   - MYSQL_PASSWORD (MySQL数据库密码)"
echo "   - JWT_SECRET (JWT密钥)"
echo "   - API Keys (如需要在线AI服务)"

read -p "是否已完成配置？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先完成配置后再运行部署脚本"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建镜像
echo "🔨 构建应用镜像..."
docker-compose build --no-cache

# 创建必要的目录
echo "📁 创建数据目录..."
mkdir -p data
mkdir -p nginx/ssl

# 初始化数据库（如果需要）
echo "🗄️ 准备数据库..."
if [ -f database/mysql-schema.sql ]; then
    echo "请手动执行 database/mysql-schema.sql 来初始化MySQL数据库"
fi

# 启动服务
echo "▶️ 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 健康检查
echo "🔍 检查服务状态..."
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ 应用启动成功！"
    echo "🌐 访问地址: http://localhost"
    echo "📊 管理面板: http://localhost:3000"
else
    echo "❌ 应用启动失败，请检查日志："
    docker-compose logs note-prompt-app
    exit 1
fi

# 显示运行状态
echo "📈 服务状态:"
docker-compose ps

echo "🎉 部署完成！"
echo ""
echo "📚 使用说明:"
echo "  - 查看日志: docker-compose logs -f"
echo "  - 停止服务: docker-compose down"
echo "  - 重启服务: docker-compose restart"
echo "  - 更新应用: ./deploy.sh"
echo ""
echo "🔧 配置说明:"
echo "  - 应用端口: 3000"
echo "  - Web端口: 80"
echo "  - Redis端口: 6379"
echo "  - 数据目录: ./data"
echo ""
echo "⚠️ 注意事项:"
echo "  - 请确保防火墙开放了必要的端口"
echo "  - 生产环境建议配置HTTPS和域名"
echo "  - 定期备份数据库和数据目录"
