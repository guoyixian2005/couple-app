// API 客户端
// 与自建后端服务器通信

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || '请求失败');
    }

    return response.json();
  }

  // 用户认证
  async register(email: string, password: string, displayName: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getUser(userId: string) {
    return this.request(`/api/users/${userId}`);
  }

  // 配对功能
  async sendPairRequest(requesterId: string, requesterEmail: string, targetEmail: string) {
    return this.request('/api/pair-requests', {
      method: 'POST',
      body: JSON.stringify({ requesterId, requesterEmail, targetEmail }),
    });
  }

  async getPairRequests(email: string) {
    return this.request(`/api/pair-requests?email=${encodeURIComponent(email)}`);
  }

  async acceptPairRequest(requestId: string, userId: string, email: string) {
    return this.request(`/api/pair-requests/${requestId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
    });
  }

  async rejectPairRequest(requestId: string) {
    return this.request(`/api/pair-requests/${requestId}/reject`, {
      method: 'POST',
    });
  }

  // 消息功能
  async sendMessage(senderId: string, receiverId: string, content: string) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ senderId, receiverId, content }),
    });
  }

  async getMessages(userId: string, partnerId: string) {
    return this.request(
      `/api/messages?userId=${userId}&partnerId=${partnerId}`
    );
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // 健康检查
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const api = new ApiClient();

// WebSocket 客户端
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string) {
    this.userId = userId;

    try {
      this.ws = new WebSocket(`ws://localhost:3001?userId=${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket 连接成功');
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
      };

    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`WebSocket 重连中... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(this.userId!);
      }, delay);
    }
  }

  onMessage(callback: (data: any) => void) {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('解析 WebSocket 消息失败:', error);
        }
      };
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.userId = null;
    }
  }
}

export const wsClient = new WebSocketClient();