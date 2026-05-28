// 主服务器文件
// 包含 Express API 和 WebSocket 实时通信

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { db, initDatabase, generateId } = require('./database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化数据库
initDatabase();

// 存储在线用户的 WebSocket 连接
const clients = new Map(); // userId -> ws

// WebSocket 连接处理
wss.on('connection', (ws, req) => {
  const userId = req.url.split('?userId=')[1];

  if (userId) {
    clients.set(userId, ws);
    console.log(`✅ 用户 ${userId} 已连接`);

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`❌ 用户 ${userId} 已断开`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket 错误: ${error}`);
    });
  }
});

// 广播消息到特定用户
function sendToUser(userId, data) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
}

// 广播消息到多个用户
function sendToUsers(userIds, data) {
  userIds.forEach(userId => sendToUser(userId, data));
}

// ==================== API 路由 ====================

// 用户注册
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    // 检查邮箱是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 创建新用户
    const userId = generateId();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, display_name)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, email, password, displayName);

    res.json({
      success: true,
      user: {
        id: userId,
        email,
        displayName
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    // 查找用户
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        partnerId: user.partner_id
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取用户信息
app.get('/api/users/:userId', (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, display_name, partner_id FROM users WHERE id = ?')
      .get(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      partnerId: user.partner_id
    });
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 发送配对请求
app.post('/api/pair-requests', (req, res) => {
  try {
    const { requesterId, requesterEmail, targetEmail } = req.body;

    if (!requesterId || !targetEmail) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    if (requesterEmail === targetEmail) {
      return res.status(400).json({ error: '不能与自己配对' });
    }

    // 检查是否已经发送过请求
    const existingRequest = db.prepare(`
      SELECT * FROM pair_requests
      WHERE requester_id = ? AND target_email = ? AND status = 'pending'
    `).get(requesterId, targetEmail);

    if (existingRequest) {
      return res.status(400).json({ error: '配对请求待处理中' });
    }

    // 检查目标用户是否存在
    const targetUser = db.prepare('SELECT id, partner_id FROM users WHERE email = ?').get(targetEmail);
    if (!targetUser) {
      return res.status(404).json({ error: '目标用户不存在' });
    }

    if (targetUser.partner_id) {
      return res.status(400).json({ error: '该用户已配对' });
    }

    // 创建配对请求
    const requestId = generateId();
    const stmt = db.prepare(`
      INSERT INTO pair_requests (id, requester_id, requester_email, target_email)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(requestId, requesterId, requesterEmail, targetEmail);

    // 通知目标用户
    sendToUser(targetUser.id, {
      type: 'new_pair_request',
      requestId,
      requesterEmail
    });

    res.json({ success: true, requestId });
  } catch (error) {
    console.error('发送配对请求错误:', error);
    res.status(500).json({ error: '发送配对请求失败' });
  }
});

// 获取配对请求
app.get('/api/pair-requests', (req, res) => {
  try {
    const { email } = req.query;

    const requests = db.prepare(`
      SELECT * FROM pair_requests
      WHERE target_email = ? AND status = 'pending'
      ORDER BY created_at DESC
    `).all(email);

    res.json(requests);
  } catch (error) {
    console.error('获取配对请求错误:', error);
    res.status(500).json({ error: '获取配对请求失败' });
  }
});

// 接受配对请求
app.post('/api/pair-requests/:requestId/accept', (req, res) => {
  try {
    const { userId } = req.body;
    const { requestId } = req.params;

    // 获取配对请求
    const request = db.prepare('SELECT * FROM pair_requests WHERE id = ?').get(requestId);
    if (!request) {
      return res.status(404).json({ error: '配对请求不存在' });
    }

    if (request.target_email !== req.body.email) {
      return res.status(403).json({ error: '无权接受此请求' });
    }

    // 更新用户配对状态
    db.prepare('UPDATE users SET partner_id = ? WHERE id = ?').run(request.requester_id, userId);
    db.prepare('UPDATE users SET partner_id = ? WHERE id = ?').run(userId, request.requester_id);

    // 更新配对请求状态
    db.prepare('UPDATE pair_requests SET status = ? WHERE id = ?').run('accepted', requestId);

    // 通知双方用户
    sendToUsers([userId, request.requester_id], {
      type: 'pair_accepted',
      partnerId: userId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('接受配对请求错误:', error);
    res.status(500).json({ error: '接受配对请求失败' });
  }
});

// 拒绝配对请求
app.post('/api/pair-requests/:requestId/reject', (req, res) => {
  try {
    const { requestId } = req.params;

    db.prepare('UPDATE pair_requests SET status = ? WHERE id = ?').run('rejected', requestId);

    res.json({ success: true });
  } catch (error) {
    console.error('拒绝配对请求错误:', error);
    res.status(500).json({ error: '拒绝配对请求失败' });
  }
});

// 发送消息
app.post('/api/messages', (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    // 保存消息到数据库
    const messageId = generateId();
    const stmt = db.prepare(`
      INSERT INTO messages (id, content, sender_id, receiver_id)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(messageId, content, senderId, receiverId);

    // 获取消息详情
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);

    // 实时推送给接收者
    sendToUser(receiverId, {
      type: 'new_message',
      message: {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        read: message.read,
        createdAt: message.created_at
      }
    });

    res.json({ success: true, messageId });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 获取消息
app.get('/api/messages', (req, res) => {
  try {
    const { userId, partnerId } = req.query;

    const messages = db.prepare(`
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      LIMIT 100
    `).all(userId, partnerId, partnerId, userId);

    res.json(messages);
  } catch (error) {
    console.error('获取消息错误:', error);
    res.status(500).json({ error: '获取消息失败' });
  }
});

// 标记消息为已读
app.put('/api/messages/:messageId/read', (req, res) => {
  try {
    const { messageId } = req.params;

    db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(messageId);

    res.json({ success: true });
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({ error: '标记消息已读失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 WebSocket 服务运行在 ws://localhost:${PORT}`);
});

module.exports = { app, server };