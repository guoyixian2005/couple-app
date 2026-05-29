// LowDB 数据库管理
// 使用 JSON 文件存储，无需编译

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 数据库文件路径
const dbPath = path.join(__dirname, 'couple-app.json');

// 初始化数据库
const adapter = new FileSync(dbPath);
const db = low(adapter);

// 初始化数据结构
function initDatabase() {
  // 初始化用户表
  db.defaults({
    users: [],
    messages: [],
    pairRequests: []
  }).write();

  console.log('✅ LowDB 数据库初始化完成');
}

// 生成唯一ID
function generateId() {
  return uuidv4();
}

module.exports = {
  db,
  initDatabase,
  generateId
};