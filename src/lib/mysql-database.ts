import mysql from 'mysql2/promise';

class MySQLDB {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '192.168.3.13',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'note_prompt',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+08:00',
    });
  }

  private buildConnectionString(): string {
    const host = process.env.MYSQL_HOST || '192.168.3.13';
    const port = process.env.MYSQL_PORT || '3306';
    const database = process.env.MYSQL_DATABASE || 'note_prompt';
    const username = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';

    return `mysql://${username}:${password}@${host}:${port}/${database}`;
  }

  async query(sql: string, params?: any[]) {
    const connection = await this.pool.getConnection();
    try {
      const [rows, fields] = await connection.execute(sql, params);
      return { rows, fields };
    } finally {
      connection.release();
    }
  }

  async end() {
    await this.pool.end();
  }

  // 用户相关方法
  async createUser(userData: { username: string; email: string; password_hash: string; user_type?: string }) {
    const { username, email, password_hash, user_type = 'free' } = userData;
    const result = await this.query(
      'INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, user_type]
    );

    // MySQL返回的insertId
    const insertId = (result.rows as any).insertId;
    const newUser = await this.getUserById(insertId);
    return newUser;
  }

  async getUserByEmail(email: string) {
    const result = await this.query('SELECT * FROM users WHERE email = ?', [email]);
    return (result.rows as any[])[0];
  }

  async getUserByUsername(username: string) {
    const result = await this.query('SELECT * FROM users WHERE username = ?', [username]);
    return (result.rows as any[])[0];
  }

  async getUserById(id: number) {
    const result = await this.query('SELECT * FROM users WHERE id = ?', [id]);
    return (result.rows as any[])[0];
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
      'INSERT INTO prompts (title, content, description, user_id, folder_id, category_id, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, description, user_id, folder_id, category_id, is_public]
    );

    const insertId = (result.rows as any).insertId;
    const newPrompt = await this.getPromptById(insertId);
    return newPrompt;
  }

  async getPromptsByUserId(userId: number, isPublic?: boolean) {
    let query = 'SELECT * FROM prompts WHERE user_id = ?';
    const params: any[] = [userId];

    if (isPublic !== undefined) {
      query += ' AND is_public = ?';
      params.push(isPublic);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.query(query, params);
    return result.rows as any[];
  }

  async getPublicPrompts(limit = 50, offset = 0) {
    const result = await this.query(
      'SELECT p.*, u.username, u.avatar_url FROM prompts p JOIN users u ON p.user_id = u.id WHERE p.is_public = true ORDER BY p.created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return result.rows as any[];
  }

  async getPromptById(id: number) {
    const result = await this.query(
      'SELECT p.*, u.username, u.avatar_url FROM prompts p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [id]
    );
    return (result.rows as any[])[0];
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
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const result = await this.query(
      `UPDATE prompts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    const updatedPrompt = await this.getPromptById(id);
    return updatedPrompt;
  }

  async deletePrompt(id: number) {
    const promptToDelete = await this.getPromptById(id);
    await this.query('DELETE FROM prompts WHERE id = ?', [id]);
    return promptToDelete;
  }

  // 文件夹相关方法
  async createFolder(folderData: { name: string; user_id: number; parent_id?: number }) {
    const { name, user_id, parent_id } = folderData;
    const result = await this.query(
      'INSERT INTO folders (name, user_id, parent_id) VALUES (?, ?, ?)',
      [name, user_id, parent_id]
    );

    const insertId = (result.rows as any).insertId;
    const newFolder = await this.query('SELECT * FROM folders WHERE id = ?', [insertId]);
    return (newFolder.rows as any[])[0];
  }

  async getFoldersByUserId(userId: number) {
    const result = await this.query('SELECT * FROM folders WHERE user_id = ? ORDER BY created_at ASC', [userId]);
    return result.rows as any[];
  }

  // 分类相关方法
  async getCategories() {
    const result = await this.query('SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC');
    return result.rows as any[];
  }

  // 收藏相关方法
  async addFavorite(userId: number, promptId: number) {
    try {
      const result = await this.query(
        'INSERT INTO favorites (user_id, prompt_id) VALUES (?, ?)',
        [userId, promptId]
      );
      const insertId = (result.rows as any).insertId;
      const newFavorite = await this.query('SELECT * FROM favorites WHERE id = ?', [insertId]);
      return (newFavorite.rows as any[])[0];
    } catch (error: any) {
      // 处理重复键错误
      if (error.code === 'ER_DUP_ENTRY') {
        return null; // 已存在，不重复添加
      }
      throw error;
    }
  }

  async removeFavorite(userId: number, promptId: number) {
    const favoriteToDelete = await this.query(
      'SELECT * FROM favorites WHERE user_id = ? AND prompt_id = ?',
      [userId, promptId]
    );

    await this.query(
      'DELETE FROM favorites WHERE user_id = ? AND prompt_id = ?',
      [userId, promptId]
    );

    return (favoriteToDelete.rows as any[])[0];
  }

  async getFavoritesByUserId(userId: number) {
    const result = await this.query(
      'SELECT p.*, u.username, u.avatar_url FROM favorites f JOIN prompts p ON f.prompt_id = p.id JOIN users u ON p.user_id = u.id WHERE f.user_id = ? ORDER BY f.created_at DESC',
      [userId]
    );
    return result.rows as any[];
  }

  // 点赞相关方法
  async addLike(userId: number, promptId: number) {
    try {
      const result = await this.query(
        'INSERT INTO likes (user_id, prompt_id) VALUES (?, ?)',
        [userId, promptId]
      );
      const insertId = (result.rows as any).insertId;
      const newLike = await this.query('SELECT * FROM likes WHERE id = ?', [insertId]);
      return (newLike.rows as any[])[0];
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return null;
      }
      throw error;
    }
  }

  async removeLike(userId: number, promptId: number) {
    const likeToDelete = await this.query(
      'SELECT * FROM likes WHERE user_id = ? AND prompt_id = ?',
      [userId, promptId]
    );

    await this.query(
      'DELETE FROM likes WHERE user_id = ? AND prompt_id = ?',
      [userId, promptId]
    );

    return (likeToDelete.rows as any[])[0];
  }

  // 用户统计相关方法
  async createUserStats(userId: number) {
    try {
      const result = await this.query(
        'INSERT INTO user_usage_stats (user_id) VALUES (?)',
        [userId]
      );
      const insertId = (result.rows as any).insertId;
      const newStats = await this.query('SELECT * FROM user_usage_stats WHERE id = ?', [insertId]);
      return (newStats.rows as any[])[0];
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return this.getUserStats(userId);
      }
      throw error;
    }
  }

  async getUserStats(userId: number) {
    const result = await this.query('SELECT * FROM user_usage_stats WHERE user_id = ?', [userId]);
    return (result.rows as any[])[0];
  }

  async updateUserStats(userId: number, updates: Partial<{
    ai_optimize_count: number;
    monthly_usage: number;
  }>) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await this.query(
      `UPDATE user_usage_stats SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [...values, userId]
    );

    const updatedStats = await this.getUserStats(userId);
    return updatedStats;
  }
}

// 创建单例实例
const mysqlDb = new MySQLDB();

export default mysqlDb;
