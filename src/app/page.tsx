'use client';

// 主页面 - 根据用户状态显示不同组件
// 这是应用的入口点，处理整个用户流程：认证 → 配对请求 → 配对/等待配对 → 聊天

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Auth from '@/components/Auth';
import PairRequests from '@/components/PairRequests';
import Pairing from '@/components/Pairing';
import Chat from '@/components/Chat';

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 检查用户登录状态
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');

    if (userId && email) {
      setCurrentUserId(userId);
      setUserEmail(email);
      setUserName(name || '');

      // 监听用户的 partnerId 变化
      const userRef = doc(db, 'users', userId);
      const unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setPartnerId(data.partnerId || null);
        }
      });

      // 检查是否有待处理的配对请求
      const requestsQuery = query(
        collection(db, 'pairRequests'),
        where('targetEmail', '==', email)
      );

      const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        let hasPending = false;
        snapshot.forEach((doc) => {
          if (doc.data().status === 'pending') {
            hasPending = true;
          }
        });
        setHasPendingRequests(hasPending);
      });

      setLoading(false);

      return () => {
        unsubscribeUser();
        unsubscribeRequests();
      };
    } else {
      setLoading(false);
    }
  }, []);

  // 登出函数
  const handleLogout = () => {
    localStorage.clear();
    router.reload();
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // 未登录：显示认证页面
  if (!currentUserId) {
    return <Auth />;
  }

  // 已登录且有待处理请求：显示配对请求列表
  if (hasPendingRequests && !partnerId) {
    return <PairRequests currentUserId={currentUserId} userEmail={userEmail} />;
  }

  // 已登录但未配对且没有待处理请求：显示配对页面
  if (!partnerId) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
          >
            登出
          </button>
        </div>
        <Pairing currentUserId={currentUserId} userEmail={userEmail} />
      </div>
    );
  }

  // 已配对：显示聊天界面
  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
        >
          登出
        </button>
      </div>
      <Chat
        currentUserId={currentUserId}
        partnerId={partnerId}
        currentUserName={userName}
      />
    </div>
  );
}