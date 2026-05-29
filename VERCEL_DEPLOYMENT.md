# 情侣应用 Vercel 部署指南

## 📋 部署前准备

### 1. Vercel账号准备
- 访问 [vercel.com](https://vercel.com)
- 使用GitHub账号登录（推荐）
- 免费账号足够使用

### 2. 代码检查
✅ Next.js 14.2.18 - 支持最新特性  
✅ React 18.3.1 - 现代React特性  
✅ WebSocket配置 - 连接到服务器后端  
✅ API配置 - 指向阿里云服务器  

## 🚀 部署步骤

### 方法一：通过Vercel网站部署（推荐新手）

1. **连接GitHub**
   - 在Vercel dashboard点击"Add New Project"
   - 选择"Import Git Repository"
   - 连接你的GitHub账号

2. **导入项目**
   - 选择couple-app项目
   - 如果还没有推送到GitHub，先推送代码：
   ```bash
   cd "/Users/guoyixian/Desktop/我和小娜的APP/couple-app"
   git init
   git add .
   git commit -m "准备Vercel部署"
   # 推送到GitHub（需要先在GitHub创建仓库）
   ```

3. **配置项目**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **设置环境变量**
   - 在环境变量设置中添加：
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `http://47.108.180.179:3001`

5. **部署**
   - 点击"Deploy"按钮
   - 等待构建完成（约2-3分钟）
   - 获得部署地址：`https://your-app-name.vercel.app`

### 方法二：通过Vercel CLI部署（推荐开发者）

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd "/Users/guoyixian/Desktop/我和小娜的APP/couple-app"
   vercel
   ```

4. **配置环境变量**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # 输入值: http://47.108.180.179:3001
   ```

5. **重新部署**
   ```bash
   vercel --prod
   ```

## 🔧 部署后配置

### 1. 自定义域名（可选）
- 在Vercel dashboard选择项目
- 进入Settings → Domains
- 添加自定义域名并配置DNS

### 2. 环境变量管理
- 生产环境: `vercel env add NEXT_PUBLIC_API_URL production`
- 预览环境: `vercel env add NEXT_PUBLIC_API_URL preview`
- 开发环境: `vercel env add NEXT_PUBLIC_API_URL development`

### 3. 监控和日志
- 在Vercel dashboard查看部署日志
- 设置错误监控（Vercel Analytics）
- 配置性能监控

## 🌍 部署架构

```
用户设备 → Vercel CDN (全球加速) → Next.js前端 → 阿里云后端API
                  ↓                                  ↓
            静态资源托管                      数据存储 + WebSocket
```

## 🔍 测试检查清单

部署完成后请测试：

- [ ] 页面能正常加载
- [ ] 用户注册/登录功能
- [ ] 发送配对请求
- [ ] 接受配对请求
- [ ] 实时消息收发
- [ ] WebSocket连接稳定
- [ ] 自定义昵称功能
- [ ] 底部导航栏功能
- [ ] 移动端响应式布局

## 📱 访问地址

部署完成后你会获得：
- **生产地址**: `https://your-project-name.vercel.app`
- **预览地址**: 每次Git推送都会生成新的预览链接
- **自定义域名**: 可配置自己的域名

## ⚠️ 注意事项

1. **HTTPS连接**: Vercel自动提供HTTPS，但后端API是HTTP，可能有混合内容警告
2. **WebSocket**: 确保防火墙允许WebSocket连接
3. **CORS**: 后端需要允许Vercel域名的跨域请求
4. **环境变量**: 确保`NEXT_PUBLIC_API_URL`正确配置

## 🔄 更新部署

每次代码更新：
```bash
git add .
git commit -m "更新描述"
git push
# Vercel会自动重新部署
```

## 🎉 部署成功标志

看到这些说明部署成功：
- Vercel显示✅ Deployed
- 可以通过域名访问应用
- 所有功能正常工作
- 控制台没有连接错误