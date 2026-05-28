'use client';

// 认证组件 - 处理用户登录和注册
// 简化版本：使用邮箱作为主要标识

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  const handleAuth = async () => {
    if (!email.trim()) {
      setError('请输入邮箱');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      setError('请输入昵称');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 检查用户是否存在
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.trim())
      );

      const userSnapshot = await getDocs(usersQuery);

      if (isLogin) {
        // 登录模式
        if (userSnapshot.empty) {
          setError('该邮箱尚未注册，请先注册');
          setLoading(false);
          return;
        }

        const user = userSnapshot.docs[0];
        const userId = user.id;

        // 保存用户信息到 localStorage（简化版认证）
        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', user.data().displayName);

        alert('登录成功！');
        router.refresh();
      } else {
        // 注册模式
        if (!userSnapshot.empty) {
          setError('该邮箱已注册，请直接登录');
          setLoading(false);
          return;
        }

        // 创建新用户
        const userRef = await addDoc(collection(db, 'users'), {
          email: email.trim(),
          displayName: displayName.trim(),
          createdAt: serverTimestamp(),
        });

        // 保存用户信息到 localStorage
        localStorage.setItem('userId', userRef.id);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', displayName);

        alert('注册成功！');
        router.refresh();
      }

      setLoading(false);
    } catch (error) {
      console.error('认证失败:', error);
      setError('操作失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💑</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {isLogin ? '欢迎回来' : '创建你们的专属空间'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? '登录继续你们的甜蜜旅程' : '注册开启新的故事'}
          </p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                昵称
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="输入你的昵称"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-medium"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-pink-500 hover:text-pink-600 font-medium"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}