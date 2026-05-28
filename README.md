# 💕 情侣专属应用

这是一个专为情侣设计的即时通讯应用，支持实时消息、学习打卡、虚拟宠物等功能。

**使用自建轻量级后端，完全自主控制，免费无限使用！**

## ✨ 核心特性

- 💬 **实时消息** - 即时通讯，支持消息已读状态
- 👥 **情侣配对** - 通过邮箱安全配对，确保隐私
- 📱 **多端同步** - 电脑、手机多端登录，数据实时同步
- 🌙 **深色模式** - 支持深色和浅色主题切换
- 🚀 **完全自主** - 自建后端，无需第三方服务
- 🔒 **数据私密** - 所有数据存储在你自己的服务器

## 🚀 快速开始

### 一键启动

```bash
# 安装依赖
npm install

# 同时启动前端和后端服务器
npm run dev:all
```

然后访问 [http://localhost:3000](http://localhost:3000)

### 手动启动

```bash
# 终端 1 - 启动后端服务器
npm run server

# 终端 2 - 启动前端开发服务器
npm run dev
```

## 📱 使用指南

### 初次使用

1. **注册账号** - 使用邮箱、昵称和密码注册
2. **发送配对请求** - 输入你伴侣的邮箱发送配对请求
3. **接受请求** - 你的伴侣在应用中接受配对请求
4. **开始聊天** - 配对成功后即可开始聊天

### 多设备使用

- 在不同设备上使用相同的账号登录
- 消息会实时同步到所有设备
- 支持同时多设备在线

## 🛠️ 技术架构

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 现代化样式

### 后端
- **Node.js** - JavaScript 运行环境
- **Express.js** - Web 框架
- **SQLite** - 嵌入式数据库
- **WebSocket** - 实时通信

## 📦 项目结构

```
couple-app/
├── src/                    # 前端源码
│   ├── app/               # Next.js 应用目录
│   ├── components/        # React 组件
│   │   ├── Auth.tsx      # 认证组件
│   │   ├── Chat.tsx      # 聊天组件
│   │   ├── Pairing.tsx   # 配对组件
│   │   └── PairRequests.tsx  # 配对请求管理
│   └── lib/              # 工具库
│       └── api.ts        # API 客户端
├── server/                # 后端源码
│   ├── server.js         # Express 服务器
│   ├── database.js       # SQLite 数据库
│   └── couple-app.db    # 数据库文件（自动生成）
├── public/               # 静态资源
└── .env.local           # 环境变量配置
```

## 🌐 API 接口

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 配对功能
- `POST /api/pair-requests` - 发送配对请求
- `GET /api/pair-requests` - 获取配对请求
- `POST /api/pair-requests/:id/accept` - 接受配对请求

### 消息功能
- `POST /api/messages` - 发送消息
- `GET /api/messages` - 获取消息历史
- `PUT /api/messages/:id/read` - 标记消息已读

## 🔧 配置说明

### 环境变量

编辑 `.env.local` 文件：

```env
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 端口配置

- **前端**：http://localhost:3000
- **后端 API**：http://localhost:3001
- **WebSocket**：ws://localhost:3001

## 🚢 部署指南

### 推荐部署方案

**前端：Vercel（免费）**
- 一键部署 Next.js 应用
- 自动 HTTPS
- 全球 CDN

**后端：Render.com 或 Railway.app（免费）**
- 免费托管 Node.js 应用
- 自动重启
- 稳定可靠

详细部署指南请查看 [SELF_HOSTED_SETUP.md](SELF_HOSTED_SETUP.md)

## 🎯 未来功能

- [ ] 学习/上班打卡功能
- [ ] 虚拟宠物养成
- [ ] 文件和图片分享
- [ ] 语音消息
- [ ] 视频通话
- [ ] 共同日历
- [ ] 重要纪念日提醒
- [ ] 心情日记
- [ ] 共同账本
- [ ] 游戏互动

## 📚 文档

- [SELF_HOSTED_SETUP.md](SELF_HOSTED_SETUP.md) - 自建后端配置指南
- [package.json](package.json) - 项目依赖和脚本

## 🔒 安全说明

### 当前状态
- **开发模式** - 适合测试和开发
- **密码存储** - 当前使用明文存储，仅用于开发

### 生产环境建议
- 密码加密（bcrypt）
- 启用 HTTPS
- 添加输入验证
- 实现速率限制
- CORS 保护

## 🤝 贡献

欢迎提出建议和功能请求！

## 📄 许可证

MIT License

---

**开发者备注**:
- 这是一个学习项目，专注于情侣之间的互动体验
- 使用自建后端，数据完全私密可控
- 代码中包含详细的中文注释
- 界面设计注重温暖和浪漫的氛围
- 完全免费，无需任何第三方服务

**开始使用你们专属的数字空间吧！** 💕