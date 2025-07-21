-- MySQL数据库表结构
-- 确保数据库使用UTF8MB4编码
CREATE DATABASE IF NOT EXISTS note_prompt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE note_prompt;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  user_type ENUM('free', 'premium', 'admin') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文件夹表
CREATE TABLE IF NOT EXISTS folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  parent_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 提示词表
CREATE TABLE IF NOT EXISTS prompts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  folder_id INT NOT NULL,
  category_id INT DEFAULT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_folder_id (folder_id),
  INDEX idx_category_id (category_id),
  INDEX idx_public (is_public),
  INDEX idx_created_at (created_at),
  FULLTEXT idx_search (title, content, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prompt_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_prompt (user_id, prompt_id),
  INDEX idx_user_id (user_id),
  INDEX idx_prompt_id (prompt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prompt_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_prompt_like (user_id, prompt_id),
  INDEX idx_user_id (user_id),
  INDEX idx_prompt_id (prompt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户使用统计表
CREATE TABLE IF NOT EXISTS user_usage_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  ai_optimize_count INT DEFAULT 0,
  monthly_usage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认分类数据
INSERT INTO categories (name, description, color, sort_order) VALUES
('AI写作', 'AI辅助内容创作和写作优化', '#8b5cf6', 1),
('编程开发', '代码生成、调试和技术文档', '#06b6d4', 2),
('商业营销', '市场推广、产品描述和商业策划', '#10b981', 3),
('学习教育', '知识问答、学习辅导和教学设计', '#f59e0b', 4),
('创意设计', '创意思维、设计灵感和艺术创作', '#ef4444', 5),
('数据分析', '数据处理、分析报告和可视化', '#6366f1', 6),
('生活助手', '日常生活、健康建议和实用工具', '#84cc16', 7),
('专业领域', '法律、医疗、金融等专业咨询', '#f97316', 8);

-- 创建默认管理员用户（密码: admin123）
INSERT INTO users (username, email, password_hash, user_type) VALUES
('admin', 'admin@notePrompt.com', '$2b$10$rQ3yQ3yQ3yQ3yQ3yQ3yQ3O', 'admin');

-- 获取管理员用户ID
SET @admin_id = LAST_INSERT_ID();

-- 为管理员创建默认文件夹
INSERT INTO folders (name, user_id) VALUES
('我的提示词', @admin_id),
('工作相关', @admin_id),
('学习笔记', @admin_id);

-- 获取默认文件夹ID
SET @default_folder_id = (SELECT id FROM folders WHERE user_id = @admin_id AND name = '我的提示词');

-- 插入示例公开提示词
INSERT INTO prompts (title, content, description, user_id, folder_id, category_id, is_public) VALUES
('代码优化助手', '你是一个专业的代码优化专家。请帮助我优化以下代码，提高其性能、可读性和可维护性：\n\n[在这里粘贴你的代码]\n\n请提供：\n1. 优化后的代码\n2. 主要优化点说明\n3. 性能提升预期', '帮助开发者优化代码质量和性能', @admin_id, @default_folder_id, 2, true),
('文案创作大师', '你是一个富有创意的文案创作专家。请根据以下要求创作文案：\n\n产品/服务：[描述你的产品或服务]\n目标受众：[描述目标用户群体]\n文案用途：[广告、推广、介绍等]\n语调风格：[正式/活泼/专业/亲切等]\n\n请提供3个不同风格的文案版本供选择。', '专业的营销文案创作助手', @admin_id, @default_folder_id, 3, true),
('学习计划制定师', '你是一个专业的学习规划师。请帮我制定一个详细的学习计划：\n\n学习目标：[你想学习的内容]\n当前水平：[你的现有基础]\n可用时间：[每日/每周可投入时间]\n学习期限：[预期完成时间]\n\n请提供：\n1. 分阶段学习计划\n2. 每个阶段的具体目标\n3. 推荐的学习资源\n4. 进度评估方法', '帮助制定个性化学习计划', @admin_id, @default_folder_id, 4, true),
('数据分析专家', '你是一个数据分析专家。请帮我分析以下数据并提供洞察：\n\n数据描述：[描述你的数据类型和来源]\n分析目的：[你想了解什么]\n关注指标：[重点关注的数据指标]\n\n请提供：\n1. 数据趋势分析\n2. 关键发现和洞察\n3. 可行的建议和策略\n4. 可视化建议', '专业的数据分析和洞察服务', @admin_id, @default_folder_id, 6, true);

-- 创建用户统计记录
INSERT INTO user_usage_stats (user_id) VALUES (@admin_id);
