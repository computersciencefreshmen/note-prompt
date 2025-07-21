import { Pool } from 'pg';

class PostgreSQLDB {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || this.buildConnectionString(),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  private buildConnectionString(): string {
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = process.env.POSTGRES_PORT || '5432';
    const database = process.env.POSTGRES_DATABASE || 'note_prompt';
    const username = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || '';

    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async end() {
    await this.pool.end();
  }

  // 用户相关方法
  async createUser(userData: { username: string; email: string; password_hash: string; user_type?: string }) {
    const { username, email, password_hash, user_type = 'free' } = userData;
    const result = await this.query(
      'INSERT INTO users (username, email, password_hash, user_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, password_hash, user_type]
    );
    return result.rows[0];
  }

  async getUserByEmail(email: string) {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async getUserByUsername(username: string) {
    const result = await this.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  async getUserById(id: number) {
    const result = await this.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  // 提示词相关方法
  async createPrompt(promptData: {
    title: string;
    content: string;
    description?: string;
    user_id: number;
    folder_id: number;
    category_id?: number;
    is_public?: boolean;
  }) {
    const { title, content, description, user_id, folder_id, category_id, is_public = false } = promptData;
    const result = await this.query(
      'INSERT INTO prompts (title, content, description, user_id, folder_id, category_id, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, content, description, user_id, folder_id, category_id, is_public]
    );
    return result.rows[0];
  }

  async getPromptsByUserId(userId: number, isPublic?: boolean) {
    let query = 'SELECT * FROM prompts WHERE user_id = $1';
    const params = [userId];

    if (isPublic !== undefined) {
      query += ' AND is_public = $2';
      params.push(isPublic);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.query(query, params);
    return result.rows;
  }

  async getPublicPrompts(limit = 50, offset = 0) {
    const result = await this.query(
      'SELECT p.*, u.username, u.avatar_url FROM prompts p JOIN users u ON p.user_id = u.id WHERE p.is_public = true ORDER BY p.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async getPromptById(id: number) {
    const result = await this.query(
      'SELECT p.*, u.username, u.avatar_url FROM prompts p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );
    return result.rows[0];
  }

  async updatePrompt(id: number, updates: Partial<{
    title: string;
    content: string;
    description: string;
    folder_id: number;
    category_id: number;
    is_public: boolean;
  }>) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await this.query(
      `UPDATE prompts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deletePrompt(id: number) {
    const result = await this.query('DELETE FROM prompts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // 文件夹相关方法
  async createFolder(folderData: { name: string; user_id: number; parent_id?: number }) {
    const { name, user_id, parent_id } = folderData;
    const result = await this.query(
      'INSERT INTO folders (name, user_id, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, user_id, parent_id]
    );
    return result.rows[0];
  }

  async getFoldersByUserId(userId: number) {
    const result = await this.query('SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
    return result.rows;
  }

  // 分类相关方法
  async getCategories() {
    const result = await this.query('SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC');
    return result.rows;
  }

  // 收藏相关方法
  async addFavorite(userId: number, promptId: number) {
    const result = await this.query(
      'INSERT INTO favorites (user_id, prompt_id) VALUES ($1, $2) ON CONFLICT (user_id, prompt_id) DO NOTHING RETURNING *',
      [userId, promptId]
    );
    return result.rows[0];
  }

  async removeFavorite(userId: number, promptId: number) {
    const result = await this.query(
      'DELETE FROM favorites WHERE user_id = $1 AND prompt_id = $2 RETURNING *',
      [userId, promptId]
    );
    return result.rows[0];
  }

  async getFavoritesByUserId(userId: number) {
    const result = await this.query(
      'SELECT p.*, u.username, u.avatar_url FROM favorites f JOIN prompts p ON f.prompt_id = p.id JOIN users u ON p.user_id = u.id WHERE f.user_id = $1 ORDER BY f.created_at DESC',
      [userId]
    );
    return result.rows;
  }

  // 点赞相关方法
  async addLike(userId: number, promptId: number) {
    const result = await this.query(
      'INSERT INTO likes (user_id, prompt_id) VALUES ($1, $2) ON CONFLICT (user_id, prompt_id) DO NOTHING RETURNING *',
      [userId, promptId]
    );
    return result.rows[0];
  }

  async removeLike(userId: number, promptId: number) {
    const result = await this.query(
      'DELETE FROM likes WHERE user_id = $1 AND prompt_id = $2 RETURNING *',
      [userId, promptId]
    );
    return result.rows[0];
  }

  // 用户统计相关方法
  async createUserStats(userId: number) {
    const result = await this.query(
      'INSERT INTO user_usage_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING RETURNING *',
      [userId]
    );
    return result.rows[0];
  }

  async getUserStats(userId: number) {
    const result = await this.query('SELECT * FROM user_usage_stats WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  async updateUserStats(userId: number, updates: Partial<{
    ai_optimize_count: number;
    monthly_usage: number;
  }>) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await this.query(
      `UPDATE user_usage_stats SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );
    return result.rows[0];
  }
}

// 创建单例实例
const db = new PostgreSQLDB();

export default db;
