'use client';

// 聊天组件 - 实现情侣之间的实时消息功能
// 这个组件包含消息列表、发送框、实时更新等功能

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message } from '@/types';

interface ChatProps {
  currentUserId: string;      // 当前用户ID
  partnerId: string;          // 伴侣ID
  currentUserName: string;     // 当前用户名称
}

export default function Chat({ currentUserId, partnerId, currentUserName }: ChatProps) {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);    // 消息列表
  const [newMessage, setNewMessage] = useState('');           // 新消息内容
  const [loading, setLoading] = useState(true);              // 加载状态
  const messagesEndRef = useRef<HTMLDivElement>(null);       // 消息列表底部引用

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 监听消息变化 - 实现实时更新
  useEffect(() => {
    setLoading(true);

    // 创建消息查询（按时间排序）
    const messagesQuery = query(
      collection(db, 'conversations', `${currentUserId}_${partnerId}`, 'messages'),
      orderBy('timestamp', 'asc')
    );

    // 实时监听消息变化
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages: Message[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId,
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
        } as Message);
      });

      setMessages(loadedMessages);
      setLoading(false);
      scrollToBottom();
    }, (error) => {
      console.error('监听消息失败:', error);
      setLoading(false);
    });

    // 清理函数：组件卸载时取消监听
    return () => unsubscribe();
  }, [currentUserId, partnerId]);

  // 每次消息更新后自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息函数
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;  // 空消息不发送

    try {
      // 添加新消息到数据库
      await addDoc(
        collection(db, 'conversations', `${currentUserId}_${partnerId}`, 'messages'),
        {
          content: newMessage.trim(),
          senderId: currentUserId,
          receiverId: partnerId,
          timestamp: serverTimestamp(),  // 使用服务器时间
          read: false,
        }
      );

      setNewMessage('');  // 清空输入框

      // TODO: 这里可以添加发送通知功能
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送失败，请重试');
    }
  };

  // 标记消息为已读
  const markAsRead = async (messageId: string) => {
    try {
      const messageRef = doc(
        db,
        'conversations',
        `${currentUserId}_${partnerId}`,
        'messages',
        messageId
      );
      await updateDoc(messageRef, { read: true });
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部标题栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            ❤️
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              我和亲爱的
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? '连接中...' : '在线'}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">💕</div>
            <p>开始你们的甜蜜对话吧~</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                onClick={() => !isCurrentUser && !message.read && markAsRead(message.id)}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } ${!isCurrentUser && !message.read ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <p className="break-words">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-pink-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {isCurrentUser && (message.read ? ' ✓✓' : ' ✓')}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入框 */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入你的消息..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}