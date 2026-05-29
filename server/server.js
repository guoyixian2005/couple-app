// 主服务器文件 - 使用 LowDB
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { db, initDatabase } = require('./database');

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
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const userId = urlParams.get('userId');

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
    const existingUser = db.get('users').find({ email }).value();
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 创建新用户
    const userId = generateId();
    db.get('users').push({
      id: userId,
      email,
      password,
      displayName,
      partnerId: null,
      createdAt: new Date().toISOString()
    }).write();

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
    const user = db.get('users').find({ email, password }).value();

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        partnerId: user.partnerId
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
    const user = db.get('users').find({ id: req.params.userId }).value();

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      partnerId: user.partnerId
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
    const existingRequest = db.get('pairRequests')
      .find({ requesterId, targetEmail, status: 'pending' }).value();

    if (existingRequest) {
      return res.status(400).json({ error: '配对请求待处理中' });
    }

    // 检查目标用户是否存在
    const targetUser = db.get('users').find({ email: targetEmail }).value();
    if (!targetUser) {
      return res.status(404).json({ error: '目标用户不存在' });
    }

    if (targetUser.partnerId) {
      return res.status(400).json({ error: '该用户已配对' });
    }

    // 创建配对请求
    const requestId = generateId();
    db.get('pairRequests').push({
      id: requestId,
      requesterId,
      requesterEmail,
      targetEmail,
      status: 'pending',
      createdAt: new Date().toISOString()
    }).write();

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

    const requests = db.get('pairRequests')
      .filter({ targetEmail: email, status: 'pending' })
      .orderBy(['createdAt'], ['desc'])
      .value();

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
    const request = db.get('pairRequests').find({ id: requestId }).value();
    if (!request) {
      return res.status(404).json({ error: '配对请求不存在' });
    }

    if (request.targetEmail !== req.body.email) {
      return res.status(403).json({ error: '无权接受此请求' });
    }

    // 更新用户配对状态
    const requesterId = request.requesterId;

    db.get('users').find({ id: userId }).assign({ partnerId: requesterId }).write();
    db.get('users').find({ id: requesterId }).assign({ partnerId: userId }).write();

    // 更新配对请求状态
    db.get('pairRequests').find({ id: requestId }).assign({ status: 'accepted' }).write();

    // 通知双方用户
    sendToUsers([userId, requesterId], {
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

    db.get('pairRequests').find({ id: requestId }).assign({ status: 'rejected' }).write();

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
    db.get('messages').push({
      id: messageId,
      content,
      senderId,
      receiverId,
      read: false,
      createdAt: new Date().toISOString()
    }).write();

    // 获取消息详情
    const message = db.get('messages').find({ id: messageId }).value();

    // 实时推送给接收者
    sendToUser(receiverId, {
      type: 'new_message',
      message
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

    const messages = db.get('messages')
      .filter(message =>
        (message.senderId === userId && message.receiverId === partnerId) ||
        (message.senderId === partnerId && message.receiverId === userId)
      )
      .orderBy(['createdAt'], ['asc'])
      .take(100)
      .value();

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

    db.get('messages').find({ id: messageId }).assign({ read: true }).write();

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