# Firebase 设置指南

这个应用需要 Firebase 来提供实时数据库和用户管理功能。按照以下步骤设置 Firebase：

## 步骤 1：创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "添加项目" 或 "创建项目"
3. 输入项目名称（例如："couple-app"）
4. 选择或创建 Google Analytics 账户（可选）
5. 点击 "创建项目"
6. 等待项目创建完成

## 步骤 2：启用 Authentication

1. 在 Firebase Console 中，点击左侧菜单的 "Authentication"
2. 点击 "开始使用"
3. 在 "Sign-in method" 标签页中，启用 "Email/Password"
4. 点击 "保存"

## 步骤 3：设置 Cloud Firestore

1. 点击左侧菜单的 "Firestore Database"
2. 点击 "创建数据库"
3. 选择 "以测试模式启动"（开发模式）
4. 选择数据库位置（建议选择离你最近的区域）
5. 点击 "启用"

## 步骤 4：获取配置信息

1. 点击项目概览中的 "Web 图标"（</>）添加 Web 应用
2. 输入应用名称（例如："couple-app-web"）
3. 不勾选 "Firebase Hosting"
4. 点击 "注册应用"
5. 复制配置信息，你会看到类似这样的代码：

```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

## 步骤 5：配置环境变量

1. 在项目根目录创建 `.env.local` 文件
2. 复制 `.env.local.example` 的内容
3. 用你的实际配置替换占位符：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

## 步骤 6：设置 Firestore 规则（安全）

在测试模式下，数据库是公开的。为了安全，建议设置以下规则：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 配对请求的访问规则
    match /pairRequests/{requestId} {
      allow read: if request.auth != null && (
        resource.data.requesterId == request.auth.uid || 
        resource.data.targetEmail == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.requesterId == request.auth.uid || 
        resource.data.targetEmail == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email
      );
    }
    
    // 对话消息的访问规则
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null && (
        conversationId.contains(request.auth.uid)
      );
    }
  }
}
```

## 完成！

设置完成后，你可以：
1. 运行 `npm run dev` 启动开发服务器
2. 在浏览器中打开 `http://localhost:3000`
3. 注册两个账号来测试情侣配对功能

## 故障排除

### 问题：无法连接到 Firebase
- 检查 `.env.local` 文件是否正确配置
- 确保在 Firebase Console 中启用了 Firestore 和 Authentication

### 问题：消息无法发送
- 确保 Firestore 数据库已创建
- 检查浏览器控制台的错误信息

### 问题：实时更新不工作
- 确认 Firestore 规则允许读写操作
- 检查网络连接

## 下一步

设置完成后，你可以开始添加更多功能：
- 学习/上班打卡
- 虚拟宠物
- 文件分享
- 视频通话
- 等等...