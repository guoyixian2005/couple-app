'use client';

// 聊天组件 - 实现情侣之间的实时消息功能
// 使用 WebSocket 实时通信
// 改进：发送者标识、自定义昵称、功能导航栏

import { useState, useEffect, useRef } from 'react';
import { api, wsClient } from '@/lib/api';

interface ChatProps {
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
  onLogout?: () => void;
}

export default function Chat({ currentUserId, partnerId, currentUserName, onLogout }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerNickname, setPartnerNickname] = useState('亲爱的');
  const [editingNickname, setEditingNickname] = useState(false);
  const [currentTab, setCurrentTab] = useState('chat'); // 当前选中的功能标签
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 加载伴侣昵称
  useEffect(() => {
    const savedNickname = localStorage.getItem('partnerNickname');
    if (savedNickname) {
      setPartnerNickname(savedNickname);
    }
  }, []);

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

      // 调试：查看服务器返回的原始数据
      console.log('服务器返回的原始消息数据:', data);
      console.log('第一条消息:', data[0]);

      const loadedMessages = data.map((msg: any) => {
        // 调试：查看每条消息的映射
        console.log('映射消息:', {
          原始消息: msg,
          映射后的senderId: msg.sender_id || msg.senderId,
          所有字段: Object.keys(msg)
        });

        return {
          id: msg.id,
          content: msg.content,
          senderId: msg.sender_id || msg.senderId,
          receiverId: msg.receiver_id || msg.receiverId,
          timestamp: new Date(msg.created_at || msg.createdAt),
          read: msg.read === 1,
        };
      });

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

        if (message.senderId === partnerId && message.receiverId === currentUserId) {
          // 对方发送的消息 - 直接添加
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === message.id);
            if (!exists) {
              const newMsg = {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                timestamp: new Date(message.createdAt),
                read: message.read,
              };

              console.log('添加对方的新消息:', newMsg);
              return [...prev, newMsg];
            }
            return prev;
          });

          setTimeout(scrollToBottom, 100);
        } else if (message.senderId === currentUserId && message.receiverId === partnerId) {
          // 自己发送的消息 - 替换临时消息
          setMessages((prev) => {
            // 找到最接近的临时消息（按时间）
            const tempMessage = prev.find(msg => msg.id.startsWith('temp-') &&
              Math.abs(new Date(msg.timestamp).getTime() - Date.now()) < 5000);

            if (tempMessage) {
              console.log('替换临时消息:', tempMessage.id, '→', message.id);
              return prev.map(msg =>
                msg.id === tempMessage.id
                  ? {
                      id: message.id,
                      content: message.content,
                      senderId: message.senderId,
                      receiverId: message.receiverId,
                      timestamp: new Date(message.createdAt),
                      read: message.read,
                    }
                  : msg
              );
            }
            return prev;
          });
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

    const messageContent = newMessage.trim();

    try {
      // 立即将消息添加到列表中（乐观更新）
      const tempMessage = {
        id: `temp-${Date.now()}`, // 临时ID
        content: messageContent,
        senderId: currentUserId,
        receiverId: partnerId,
        timestamp: new Date(),
        read: false,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage('');

      // 发送到服务器
      await api.sendMessage(currentUserId, partnerId, messageContent);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送失败，请重试');
      // 如果发送失败，移除临时消息
      setMessages((prev) => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
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

  // 保存昵称
  const handleSaveNickname = () => {
    if (partnerNickname.trim()) {
      localStorage.setItem('partnerNickname', partnerNickname.trim());
      setEditingNickname(false);
      alert('昵称修改成功！');
    }
  };

  // 功能标签内容
  const renderTabContent = () => {
    switch (currentTab) {
      case 'chat':
        return renderChatContent();
      case 'food':
        return renderPlaceholderContent('🍽️', '点餐功能', '敬请期待...');
      case 'checkin':
        return renderPlaceholderContent('📋', '学习打卡', '即将上线...');
      case 'pet':
        return renderPlaceholderContent('🐱', '虚拟宠物', '开发中...');
      default:
        return renderChatContent();
    }
  };

  // 聊天内容
  const renderChatContent = () => (
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

          // 调试信息
          console.log('消息调试:', {
            消息发送者ID: message.senderId,
            当前用户ID: currentUserId,
            是否当前用户: isCurrentUser,
            内容: message.content
          });

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
              onClick={() => !isCurrentUser && !message.read && markAsRead(message.id)}
            >
              <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 头像 */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-base ${
                  isCurrentUser
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                }`}>
                  {isCurrentUser ? '我' : 'TA'}
                </div>

                {/* 消息内容 */}
                <div className="flex flex-col max-w-full">
                  {/* 发送者名称 - 更明显的显示 */}
                  <div className={`text-sm mb-1 font-semibold ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    <span className={`${
                      isCurrentUser
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {isCurrentUser ? currentUserName : partnerNickname}
                    </span>
                  </div>

                  {/* 消息气泡 - 微信风格 */}
                  <div
                    className={`px-4 py-3 shadow-md ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-l-lg rounded-tr-lg rounded-br-lg'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-r-lg rounded-tl-lg rounded-bl-lg border border-gray-200 dark:border-gray-600'
                    } ${!isCurrentUser && !message.read ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                  >
                    <p className="break-words text-base leading-relaxed">{message.content}</p>
                    <div
                      className={`text-xs mt-2 flex items-center gap-1 ${
                        isCurrentUser ? 'text-pink-100 justify-end' : 'text-gray-500 dark:text-gray-400 justify-start'
                      }`}
                    >
                      <span>{message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      {isCurrentUser && (
                        <span className="text-sm">
                          {message.read ? ' ✓✓' : ' ✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  // 占位符内容（用于未实现的功能）
  const renderPlaceholderContent = (icon: string, title: string, description: string) => (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
      <div className="text-8xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-lg">{description}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部标题栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              ❤️
            </div>
            <div>
              {editingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={partnerNickname}
                    onChange={(e) => setPartnerNickname(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveNickname()}
                    className="text-lg font-semibold text-gray-800 dark:text-white border-b-2 border-pink-500 focus:outline-none dark:bg-gray-800"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingNickname(false);
                      const saved = localStorage.getItem('partnerNickname');
                      setPartnerNickname(saved || '亲爱的');
                    }}
                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    我和{partnerNickname}
                  </h2>
                  <button
                    onClick={() => setEditingNickname(true)}
                    className="text-xs text-pink-500 hover:text-pink-600"
                    title="点击修改昵称"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '连接中...' : '在线'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString()}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
              >
                登出
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      {renderTabContent()}

      {/* 底部功能导航栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-md border-t border-gray-200 dark:border-gray-700">
        {/* 聊天输入框 - 只在聊天标签显示 */}
        {currentTab === 'chat' && (
          <div className="p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`给${partnerNickname}发送消息...`}
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
        )}

        {/* 功能标签导航 */}
        <div className="flex justify-around py-2">
          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              currentTab === 'chat'
                ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'text-gray-500 hover:text-pink-500 dark:text-gray-400'
            }`}
          >
            <span className="text-2xl">💬</span>
            <span className="text-xs">聊天</span>
          </button>

          <button
            onClick={() => setCurrentTab('food')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              currentTab === 'food'
                ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'text-gray-500 hover:text-pink-500 dark:text-gray-400'
            }`}
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-xs">点餐</span>
          </button>

          <button
            onClick={() => setCurrentTab('checkin')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              currentTab === 'checkin'
                ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'text-gray-500 hover:text-pink-500 dark:text-gray-400'
            }`}
          >
            <span className="text-2xl">📋</span>
            <span className="text-xs">打卡</span>
          </button>

          <button
            onClick={() => setCurrentTab('pet')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              currentTab === 'pet'
                ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'text-gray-500 hover:text-pink-500 dark:text-gray-400'
            }`}
          >
            <span className="text-2xl">🐱</span>
            <span className="text-xs">宠物</span>
          </button>
        </div>
      </div>
    </div>
  );
}