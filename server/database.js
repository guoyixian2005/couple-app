// 数据库初始化和管理
// 使用 SQLite 作为数据库

const Database = require('better-sqlite3');
const path = require('path');

// 创建数据库实例
const db = new Database(path.join(__dirname, 'couple-app.db'));

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表结构
function initDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL,
      partner_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partner_id) REFERENCES users(id)
    )
  `);

  // 消息表
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);

  // 配对请求表
  db.exec(`
    CREATE TABLE IF NOT EXISTS pair_requests (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL,
      requester_email TEXT NOT NULL,
      target_email TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requester_id) REFERENCES users(id)
    )
  `);

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_pair_requests_target ON pair_requests(target_email);
    CREATE INDEX IF NOT EXISTS idx_pair_requests_status ON pair_requests(status);
  `);

  console.log('✅ 数据库初始化完成');
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = {
  db,
  initDatabase,
  generateId
};