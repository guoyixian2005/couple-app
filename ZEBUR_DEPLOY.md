# Zeabur 部署指南

## 🚀 Zeabur 是什么？

Zeabur 是国内领先的云平台，提供：
- ✅ 国内访问速度快
- ✅ 免费额度充足
- ✅ 支持直接部署，无需 GitHub
- ✅ 操作简单，注册快速

## 📝 部署步骤

### 第一步：注册 Zeabur 账号

1. 访问：[https://zeabur.com](https://zeabur.com)
2. 点击右上角"注册"
3. 使用邮箱或手机号注册
4. 完成邮箱验证

### 第二步：创建项目

1. 登录后进入控制台
2. 点击"创建新项目"
3. 输入项目名称：`couple-app`

### 第三步：部署后端服务

1. 在项目中点击"创建服务"
2. 选择"预构建服务"或"从源码部署"
3. 上传当前项目文件夹
4. Zeabur 会自动检测 Node.js 项目

**配置服务：**
- **根目录**: `/`
- **启动命令**: `node server/server.js`
- **端口**: `8080`

**设置环境变量（如果需要）：**
- `NODE_ENV` = `production`
- `PORT` = `8080`

### 第四步：部署前端服务

1. 再次点击"创建服务"
2. 选择"预构建服务"或"从源码部署"
3. 上传当前项目文件夹

**配置服务：**
- **根目录**: `/`
- **启动命令**: `npm run start`（或 `next start`）
- **端口**: `3000`

**设置环境变量：**
- `NEXT_PUBLIC_API_URL` = 你的后端服务地址（后面获取）

### 第五步：获取公网地址

1. 部署完成后，Zeabur 会为每个服务分配一个公网地址
2. 后端地址类似：`https://your-backend.zeabur.app`
3. 前端地址类似：`https://your-frontend.zeabur.app`

### 第六步：配置前端环境变量

1. 进入前端服务设置
2. 添加环境变量：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.zeabur.app
   ```
3. 重新部署前端服务

## 🔧 替代部署方式

### 方式一：使用 Zeabur CLI（推荐）

如果你熟悉命令行：

```bash
# 安装 Zeabur CLI
npm install -g zeabur

# 登录
zeabur login

# 部署
zeabur deploy
```

### 方式二：直接上传文件

1. 将项目文件夹压缩为 zip
2. 在 Zeabur 控制台选择"从文件部署"
3. 上传 zip 文件

## 📱 部署完成后

1. **获取应用地址**
   - 前端地址：类似 `https://couple-app-xxx.zeabur.app`
   - 后端地址：类似 `https://couple-app-backend-xxx.zeabur.app`

2. **测试应用**
   - 在不同设备上打开前端地址
   - 注册账号并测试功能

3. **分享给伴侣**
   - 将前端地址发送给伴侣
   - 开始跨设备通信

## 🎯 部署结构示例

**Zeabur 项目结构：**
```
couple-app 项目
├── couple-app-backend      # 后端服务
│   └── https://xxx.zeabur.app
└── couple-app-frontend      # 前端服务
    └── https://yyy.zeabur.app
```

## ⚡ 快速开始

1. **注册账号**：[https://zeabur.com](https://zeabur.com)
2. **创建项目**：在控制台创建新项目
3. **上传代码**：直接上传当前项目文件夹
4. **配置服务**：按照上面的配置设置
5. **获取地址**：部署完成后获取公网地址
6. **开始使用**：在任何设备上访问应用

## 💡 免费额度说明

Zeabur 免费套餐：
- **CPU**: 0.5 Core
- **内存**: 512MB RAM
- **存储**: 1GB
- **流量**: 每月 100GB

对于情侣应用来说完全够用！

## 🔒 安全建议

1. **添加密码保护**（如果需要）
   - 在 Zeabur 控制台设置访问密码

2. **自定义域名**（可选）
   - 在设置中绑定自己的域名

3. **定期备份数据库**
   - 下载 Zeabur 上的数据库文件

## 🆘 遇到问题？

### 常见问题

1. **部署失败**
   - 检查 package.json 是否正确
   - 确认启动命令正确
   - 查看 Zeabur 部署日志

2. **服务无法访问**
   - 检查服务状态是否为"运行中"
   - 确认端口配置正确
   - 查看服务日志排查错误

3. **前后端无法通信**
   - 确认环境变量配置正确
   - 检查 CORS 设置

## 📞 获取帮助

- Zeabur 文档：[https://zeabur.com/docs](https://zeabur.com/docs)
- Zeabur 社区：[https://discord.gg/zeabur](https://discord.gg/zeabur)

开始部署吧！几分钟内你们就能在任何设备上互相通信了！🎉