// 类型定义文件
// 定义应用中使用的所有数据类型

// 消息类型
export interface Message {
  id: string;                    // 消息唯一ID
  content: string;              // 消息内容
  senderId: string;              // 发送者ID
  receiverId: string;            // 接收者ID
  timestamp: Date;               // 发送时间
  read: boolean;                 // 是否已读
}

// 用户类型
export interface User {
  id: string;                    // 用户唯一ID
  email: string;                 // 邮箱
  displayName: string;           // 显示名称
  avatar?: string;               // 头像URL
  partnerId?: string;            // 伴侣ID（如果已配对）
  createdAt: Date;               // 账号创建时间
}

// 配对请求类型
export interface PairRequest {
  id: string;                    // 请求ID
  requesterId: string;           // 发起请求的用户ID
  requesterEmail: string;         // 发起请求的邮箱
  targetEmail: string;           // 目标用户邮箱
  status: 'pending' | 'accepted' | 'rejected';  // 请求状态
  createdAt: Date;               // 创建时间
}