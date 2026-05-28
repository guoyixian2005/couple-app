'use client';

// 配对请求管理组件 - 查看和处理收到的配对请求
// 用户可以接受或拒绝收到的配对请求

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RequestData {
  id: string;
  requesterId: string;
  requesterEmail: string;
  targetEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export default function PairRequests({
  currentUserId,
  userEmail
}: {
  currentUserId: string;
  userEmail: string;
}) {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 监听配对请求变化
  useEffect(() => {
    const q = query(
      collection(db, 'pairRequests'),
      where('targetEmail', '==', userEmail)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedRequests: RequestData[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'pending') {
          loadedRequests.push({
            id: doc.id,
            requesterId: data.requesterId,
            requesterEmail: data.requesterEmail,
            targetEmail: data.targetEmail,
            status: data.status,
            createdAt: data.createdAt,
          } as RequestData);
        }
      });

      setRequests(loadedRequests);
      setLoading(false);
    }, (error) => {
      console.error('监听配对请求失败:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail]);

  // 接受配对请求
  const handleAccept = async (requestId: string, requesterId: string) => {
    try {
      // 获取请求者的信息
      const requesterRef = doc(db, 'users', requesterId);
      const requesterSnap = await getDoc(requesterRef);

      if (!requesterSnap.exists()) {
        alert('请求者不存在，请重试');
        return;
      }

      const currentUserRef = doc(db, 'users', currentUserId);
      const requestRef = doc(db, 'pairRequests', requestId);

      // 更新用户的 partnerId
      await updateDoc(currentUserRef, {
        partnerId: requesterId
      });

      await updateDoc(requesterRef, {
        partnerId: currentUserId
      });

      // 更新请求状态
      await updateDoc(requestRef, {
        status: 'accepted'
      });

      alert('配对成功！即将跳转到聊天页面...');
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error('接受配对请求失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 拒绝配对请求
  const handleReject = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'pairRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected'
      });

      alert('已拒绝该配对请求');
    } catch (error) {
      console.error('拒绝配对请求失败:', error);
      alert('操作失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 dark:text-gray-400">
            暂时没有收到配对请求
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          💕 配对请求
        </h1>

        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                      💝
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {request.requesterEmail}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        想要与你建立情侣关系
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    请求时间：{request.createdAt?.toDate()?.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request.id, request.requesterId)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
                  >
                    接受
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}