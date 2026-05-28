# 自建后端配置指南

这个应用使用完全自主的轻量级后端，无需任何第三方服务！

## 🎯 为什么选择自建后端？

- ✅ **完全自主控制** - 数据完全私密，存储在你自己的服务器
- ✅ **免费无限使用** - 无需付费，无流量限制
- ✅ **国内访问稳定** - 无需翻墙，访问速度快
- ✅ **技术简单** - 使用 Node.js + SQLite，易于维护
- ✅ **易于部署** - 可部署在任何支持 Node.js 的平台

## 🚀 快速开始

### 1. 启动应用

**方式一：同时启动前端和后端（推荐）**
```bash
npm run dev:all
```

**方式二：分别启动**
```bash
# 终端 1 - 启动后端服务器
npm run server

# 终端 2 - 启动前端开发服务器
npm run dev
```

### 2. 访问应用

打开浏览器访问：[http://localhost:3000](http://localhost:3000)

### 3. 开始测试

1. 注册两个不同的账号
2. 用一个账号发送配对请求
3. 用另一个账号接受请求
4. 开始聊天！

## 📊 技术架构

### 后端技术栈
- **Node.js** - JavaScript 运行环境
- **Express.js** - Web 框架
- **SQLite** - 嵌入式数据库
- **WebSocket** - 实时通信

### 前端技术栈
- **Next.js** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

## 🔧 配置说明

### 环境变量

编辑 `.env.local` 文件：

```env
# 后端 API 地址（默认配置，通常不需要修改）
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 数据库

数据库文件会自动创建在 `server/couple-app.db`

**数据库结构：**

1. **users 表** - 用户信息
   - id: 用户唯一标识
   - email: 邮箱
   - password: 密码
   - display_name: 显示名称
   - partner_id: 伴侣ID

2. **messages 表** - 消息记录
   - id: 消息唯一标识
   - content: 消息内容
   - sender_id: 发送者ID
   - receiver_id: 接收者ID
   - read: 是否已读

3. **pair_requests 表** - 配对请求
   - id: 请求唯一标识
   - requester_id: 发起者ID
   - requester_email: 发起者邮箱
   - target_email: 目标邮箱
   - status: 请求状态

## 🌐 API 接口

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/users/:userId` - 获取用户信息

### 配对功能
- `POST /api/pair-requests` - 发送配对请求
- `GET /api/pair-requests?email=` - 获取配对请求
- `POST /api/pair-requests/:id/accept` - 接受配对请求
- `POST /api/pair-requests/:id/reject` - 拒绝配对请求

### 消息功能
- `POST /api/messages` - 发送消息
- `GET /api/messages?userId=&partnerId=` - 获取消息
- `PUT /api/messages/:id/read` - 标记消息已读

### WebSocket
- 连接地址：`ws://localhost:3001?userId=用户ID`
- 实时事件：
  - `new_message` - 新消息通知
  - `new_pair_request` - 新配对请求
  - `pair_accepted` - 配对成功

## 🚢 部署指南

### 部署到 Vercel（推荐前端）

1. 在 Vercel 创建新项目
2. 连接你的 GitHub 仓库
3. 设置环境变量：
   ```
   NEXT_PUBLIC_API_URL=你的后端服务器地址
   ```
4. 部署完成！

### 部署后端服务器

#### 方案 1：Render.com（免费）
1. 在 Render.com 创建新的 Web Service
2. 连接 GitHub 仓库
3. 设置启动命令：`node server/server.js`
4. 部署完成，获得你的后端地址

#### 方案 2：Railway.app（免费）
1. 在 Railway.app 创建新项目
2. 部署 from GitHub
3. 自动检测 Node.js 项目
4. 部署完成！

#### 方案 3：自己的服务器
```bash
# 在服务器上克隆项目
git clone your-repo-url
cd couple-app

# 安装依赖
npm install

# 启动服务器（建议使用 PM2）
npm install -g pm2
pm2 start server/server.js --name couple-app
pm2 save
pm2 startup
```

## 🔒 安全建议

### 生产环境部署前：

1. **密码加密**
   - 当前密码以明文存储，建议使用 bcrypt
   - 在 `server/server.js` 中添加密码加密

2. **HTTPS**
   - 使用 HTTPS 证书保护数据传输
   - 可使用 Let's Encrypt 免费证书

3. **输入验证**
   - 加强邮箱格式验证
   - 限制消息长度
   - 防止 SQL 注入

4. **访问控制**
   - 添加 CORS 限制
   - 实现速率限制
   - 添加请求签名验证

## 📱 数据管理

### 备份数据库
```bash
# 备份数据库文件
cp server/couple-app.db server/couple-app.db.backup
```

### 查看数据库内容
```bash
# 安装 SQLite 工具
npm install -g sqlite3

# 打开数据库
sqlite3 server/couple-app.db

# 查看表结构
.schema

# 查询数据
SELECT * FROM users;
SELECT * FROM messages;
```

### 清空测试数据
```bash
# 删除数据库文件，重启服务器会自动创建新的
rm server/couple-app.db
```

## 🐛 故障排除

### 问题：后端服务器无法启动
- 检查端口 3001 是否被占用
- 查看错误日志
- 确认所有依赖已安装

### 问题：WebSocket 连接失败
- 确认后端服务器正常运行
- 检查浏览器控制台错误信息
- 验证 WebSocket 地址配置正确

### 问题：消息无法实时更新
- 检查 WebSocket 连接状态
- 确认用户 ID 正确传递
- 查看后端日志

### 问题：数据库错误
- 确认 server 目录有写入权限
- 检查数据库文件是否损坏
- 重新创建数据库文件

## 🎉 完成！

现在你拥有了一个完全自主的情侣应用！

- 💬 实时消息功能
- 👥 情侣配对系统
- 📱 多端同步支持
- 🔒 数据完全私密
- 🚀 免费无限使用

开始享受你们专属的数字空间吧！💕