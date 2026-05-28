// Firebase 配置文件
// 这个文件用于配置 Firebase 连接

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase 配置对象
// 你需要在 Firebase Console 中创建项目并获取这些配置信息
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 初始化 Firebase 应用
// 使用单例模式，避免重复初始化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 获取 Firestore 实例（用于数据库操作）
export const db = getFirestore(app);

// 获取 Auth 实例（用于用户认证）
export const auth = getAuth(app);

// 导出 app 实例
export default app;