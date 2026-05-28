'use client';

// 用户配对组件 - 实现情侣之间的配对功能
// 用户通过输入伴侣的邮箱来建立连接

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Pairing({ currentUserId, userEmail }: { currentUserId: string; userEmail: string }) {
  const [partnerEmail, setPartnerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePairRequest = async () => {
    if (!partnerEmail.trim()) {
      setError('请输入伴侣邮箱');
      return;
    }

    if (partnerEmail === userEmail) {
      setError('不能输入自己的邮箱哦~');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 检查是否已经向该邮箱发送过配对请求
      const existingRequestsQuery = query(
        collection(db, 'pairRequests'),
        where('requesterId', '==', currentUserId),
        where('targetEmail', '==', partnerEmail.trim())
      );

      const existingRequests = await getDocs(existingRequestsQuery);

      if (!existingRequests.empty) {
        const request = existingRequests.docs[0].data();
        if (request.status === 'accepted') {
          setError('你们已经是情侣了~');
        } else if (request.status === 'pending') {
          setError('配对请求待处理中，请耐心等待');
        }
        setLoading(false);
        return;
      }

      // 检查目标用户是否存在
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', partnerEmail.trim())
      );

      const userSnapshot = await getDocs(usersQuery);

      if (userSnapshot.empty) {
        setError('该邮箱尚未注册，请先让您的伴侣注册账号');
        setLoading(false);
        return;
      }

      const targetUser = userSnapshot.docs[0];

      // 检查对方是否已经和其他人配对
      if (targetUser.data().partnerId) {
        setError('该用户已经配对了，请确认邮箱是否正确');
        setLoading(false);
        return;
      }

      // 创建配对请求
      await addDoc(collection(db, 'pairRequests'), {
        requesterId: currentUserId,
        requesterEmail: userEmail,
        targetEmail: partnerEmail.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert('配对请求已发送！请通知您的伴侣查看并接受请求');
      setPartnerEmail('');
      setLoading(false);

      // TODO: 这里可以添加发送邮件通知功能
    } catch (error) {
      console.error('发送配对请求失败:', error);
      setError('发送失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💕</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            建立你们的专属空间
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            输入您伴侣的邮箱，开始你们的甜蜜旅程
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              伴侣的邮箱
            </label>
            <input
              type="email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePairRequest()}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handlePairRequest}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-medium"
          >
            {loading ? '发送中...' : '发送配对请求'}
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <p>您的伴侣将会收到配对请求通知</p>
          </div>
        </div>
      </div>
    </div>
  );
}