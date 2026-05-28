// LeanCloud 配置文件
// 这个文件用于配置 LeanCloud 连接

import AV from 'leancloud-storage';

// 初始化 LeanCloud 应用
// 使用环境变量配置，保证安全性
const initLeanCloud = () => {
  try {
    AV.init({
      appId: process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID || '',
      appKey: process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY || '',
      serverURL: process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL || 'https://api.leancloud.cn',
    });
    console.log('LeanCloud 初始化成功');
  } catch (error) {
    console.error('LeanCloud 初始化失败:', error);
  }
};

// 初始化 LeanCloud
initLeanCloud();

// 导出 LeanCloud 实例和必要的类
export default AV;
export { AV };

// 数据类名常量 - 用于创建和查询数据表
export const CLASS_NAMES = {
  USERS: '_User',                    // 用户表（LeanCloud 内置）
  MESSAGES: 'Message',               // 消息表
  PAIR_REQUESTS: 'PairRequest',      // 配对请求表
};

// 辅助函数：创建消息对象
export const createMessage = (data: {
  content: string;
  senderId: string;
  receiverId: string;
}) => {
  const Message = AV.Object.extend(CLASS_NAMES.MESSAGES);
  const message = new Message();

  message.set('content', data.content);
  message.set('senderId', data.senderId);
  message.set('receiverId', data.receiverId);
  message.set('read', false);

  return message;
};

// 辅助函数：创建配对请求对象
export const createPairRequest = (data: {
  requesterId: string;
  requesterEmail: string;
  targetEmail: string;
}) => {
  const PairRequest = AV.Object.extend(CLASS_NAMES.PAIR_REQUESTS);
  const request = new PairRequest();

  request.set('requesterId', data.requesterId);
  request.set('requesterEmail', data.requesterEmail);
  request.set('targetEmail', data.targetEmail);
  request.set('status', 'pending');

  return request;
};