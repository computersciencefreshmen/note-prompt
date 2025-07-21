# Vercel 部署配置指南

## 📝 重要：环境变量配置

### 🚨 关键问题修复

❌ **错误的配置格式**（Vercel 不支持）：
```bash
DATABASE_URL=postgresql://postgres.${POSTGRES_HOST}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DATABASE}
```

✅ **正确的配置格式**：

### 选项 1：使用完整 DATABASE_URL（推荐）

在 Vercel Dashboard → 项目设置 → Environment Variables 中添加：

```bash
DATABASE_URL=postgresql://postgres:henryyang2025*@db.xxx.supabase.co:5432/postgres
DASHSCOPE_API_KEY=your_dashscope_api_key_here
NODE_ENV=production
```

**请将以下占位符替换为您的真实信息：**
- `henryyang2025*` → 您的实际 Supabase 密码
- `db.xxx.supabase.co` → 您的实际 Supabase 主机地址

### 选项 2：使用单独变量（备选方案）

如果您偏好使用单独的变量：

```bash
POSTGRES_HOST=your_actual_host.supabase.co
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password
DASHSCOPE_API_KEY=your_dashscope_api_key_here
NODE_ENV=production
```

## 🚀 Vercel 部署步骤

### 1. 创建 Supabase 数据库表

在 Supabase SQL Editor 中执行：`.same/complete-database-schema.sql`

### 2. 配置 Vercel 环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 删除任何格式错误的 `DATABASE_URL`
5. 添加正确的环境变量（参考上面的选项 1）

### 3. 获取 Supabase 连接信息

在 Supabase 项目中：
1. 进入 **Settings** → **Database**
2. 找到 **Connection pooling** 部分
3. 使用 **Connection string** 格式：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 4. 验证配置

部署后，检查：
- [ ] 用户注册功能是否正常
- [ ] 数据库连接是否成功
- [ ] API 接口是否响应正常

## 🔧 故障排查

### 常见错误

1. **Connection timeout**
   - 检查 DATABASE_URL 格式是否正确
   - 确认 Supabase 项目是否已激活

2. **Authentication failed**
   - 验证密码是否正确
   - 确认用户名是否为 `postgres`

3. **SSL connection error**
   - 生产环境会自动启用 SSL
   - 无需额外配置

### 测试数据库连接

创建一个简单的健康检查 API：

```typescript
// pages/api/health.ts
import db from '@/lib/database';

export default async function handler(req, res) {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ status: 'Database connection failed', error: error.message });
  }
}
```

## 📋 部署检查清单

- [ ] Supabase 数据库表已创建
- [ ] Vercel 环境变量已正确配置
- [ ] DATABASE_URL 格式正确
- [ ] DASHSCOPE_API_KEY 已设置
- [ ] 项目部署成功
- [ ] 数据库连接测试通过
- [ ] 用户注册功能正常

## 🎯 立即行动

**请现在就执行以下步骤：**

1. 获取您的真实 Supabase 连接信息
2. 将 `postgresql://postgres:[henryyang2025*]@db.xxx.supabase.co:5432/postgres` 中的占位符替换为真实值
3. 在 Vercel 中设置正确的 DATABASE_URL
4. 重新部署项目
5. 测试用户注册功能
