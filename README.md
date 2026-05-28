# 💕 情侣专属应用

这是一个专为情侣设计的即时通讯应用，支持实时消息、学习打卡、虚拟宠物等功能。

## ✨ 当前功能

- 💬 **实时消息** - 即时通讯，支持消息已读状态
- 👥 **情侣配对** - 通过邮箱安全配对，确保隐私
- 📱 **多端同步** - 电脑、手机多端登录，数据实时同步
- 🌙 **深色模式** - 支持深色和浅色主题切换

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Firebase

按照 `FIREBASE_SETUP.md` 文件的说明设置 Firebase 项目，然后创建 `.env.local` 文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入你的 Firebase 配置信息。

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📱 使用说明

### 初次使用

1. **注册账号** - 使用邮箱和昵称注册
2. **发送配对请求** - 输入你伴侣的邮箱发送配对请求  
3. **接受请求** - 你的伴侣在应用中接受配对请求
4. **开始聊天** - 配对成功后即可开始聊天

### 多端使用

- 在不同设备上使用相同的邮箱登录即可
- 消息和数据会自动同步到所有设备

## 🛠️ 技术栈

- **前端**: Next.js 15 + React 18 + TypeScript
- **样式**: Tailwind CSS  
- **后端**: Firebase (Firestore + Authentication)
- **实时通信**: Firestore Realtime Database

## 📦 项目结构

```
couple-app/
├── src/
│   ├── app/              # Next.js 应用目录
│   │   ├── page.tsx      # 主页面
│   │   └── layout.tsx    # 布局组件
│   ├── components/       # React 组件
│   │   ├── Auth.tsx      # 认证组件
│   │   ├── Chat.tsx      # 聊天组件
│   │   ├── Pairing.tsx   # 配对组件
│   │   └── PairRequests.tsx  # 配对请求管理
│   ├── lib/              # 工具库
│   │   └── firebase.ts   # Firebase 配置
│   └── types/            # TypeScript 类型定义
│       └── index.ts
├── public/               # 静态资源
└── .env.local           # 环境变量配置（需自行创建）
```

## 🔒 安全说明

### 当前状态
- **测试模式**: 数据库规则较为宽松，适合开发测试
- **认证**: 简化的邮箱认证（生产环境建议使用完整 Firebase Auth）

### 生产环境建议
1. 启用完整的 Firebase Authentication
2. 设置严格的 Firestore 安全规则
3. 启用邮箱验证
4. 添加速率限制
5. 设置 Cloud Firestore 位置
6. 启用备份和监控

## 🎯 未来功能计划

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

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提出建议和功能请求！

---

**开发者备注**: 
- 这是一个学习项目，专注于情侣之间的互动体验
- 代码中包含了详细的中文注释，便于理解和修改
- 界面设计注重温暖和浪漫的氛围