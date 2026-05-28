'use client';

// 聊天组件 - 实现情侣之间的实时消息功能
// 使用 WebSocket 实时通信

import { useState, useEffect, useRef } from 'react';
import { api, wsClient } from '@/lib/api';

interface ChatProps {
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
}

export default function Chat({ currentUserId, partnerId, currentUserName }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 加载初始消息
  useEffect(() => {
    loadMessages();
    setupWebSocket();
  }, [currentUserId, partnerId]);

  // 加载消息
  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getMessages(currentUserId, partnerId);
      const loadedMessages = data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        timestamp: new Date(msg.created_at),
        read: msg.read === 1,
      }));

      setMessages(loadedMessages);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('加载消息失败:', error);
      setLoading(false);
    }
  };

  // 设置 WebSocket 实时监听
  const setupWebSocket = () => {
    wsClient.connect(currentUserId);

    wsClient.onMessage((data) => {
      console.log('收到实时消息:', data);

      if (data.type === 'new_message') {
        const message = data.message;
        if ((message.senderId === currentUserId && message.receiverId === partnerId) ||
            (message.senderId === partnerId && message.receiverId === currentUserId)) {

          const newMsg = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            timestamp: new Date(message.createdAt),
            read: message.read,
          };

          setMessages((prev) => [...prev, newMsg]);
          setTimeout(scrollToBottom, 100);
        }
      }
    });
  };

  // 每次消息更新后自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息函数
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.sendMessage(currentUserId, partnerId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送失败，请重试');
    }
  };

  // 标记消息为已读
  const markAsRead = async (messageId: string) => {
    try {
      await api.markMessageAsRead(messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
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