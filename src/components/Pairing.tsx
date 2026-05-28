'use client';

// 用户配对组件 - 实现情侣之间的配对功能
// 使用自建后端 API

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

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
      await api.sendPairRequest(currentUserId, userEmail, partnerEmail.trim());
      alert('配对请求已发送！请通知您的伴侣查看并接受请求');
      setPartnerEmail('');
      setLoading(false);

    } catch (error: any) {
      console.error('发送配对请求失败:', error);
      setError(error.message || '发送失败，请重试');
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