# 🔧 Cloudflare Pages 环境变量配置指南

## 📍 第一步：进入 Cloudflare Pages 配置

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单 → **Workers & Pages**
3. 找到您的 **aimagica2** 项目，点击进入
4. 点击 **Settings** 标签
5. 左侧菜单选择 **Environment variables**

## 🔐 第二步：配置必需的环境变量

### Google OAuth 配置
需要先在 Google Cloud Console 设置：

1. **获取 Google OAuth 凭据：**
   - 访问：https://console.developers.google.com/
   - 创建项目或选择现有项目
   - 启用 **Google+ API** 和 **Google OAuth2 API**
   - 凭据 → 创建凭据 → OAuth 2.0 客户端 ID
   - 应用程序类型：Web 应用程序
   - 授权重定向 URI：`https://your-domain.pages.dev/auth/callback`

2. **在 Cloudflare Pages 添加变量：**
   ```
   变量名: GOOGLE_CLIENT_ID
   值: 你的Google客户端ID
   
   变量名: GOOGLE_CLIENT_SECRET  
   值: 你的Google客户端密钥
   
   变量名: NEXT_PUBLIC_GOOGLE_CLIENT_ID
   值: 你的Google客户端ID（与第一个相同）
   
   变量名: JWT_SECRET
   值: 32位随机字符串（如：abc123xyz789def456ghi012jkl345mn）
   ```

### Supabase 数据库配置

1. **获取 Supabase 凭据：**
   - 访问：https://supabase.com/dashboard
   - 创建新项目或选择现有项目
   - Settings → API → 复制项目 URL 和密钥

2. **在 Cloudflare Pages 添加变量：**
   ```
   变量名: NEXT_PUBLIC_SUPABASE_URL
   值: https://your-project-id.supabase.co
   
   变量名: NEXT_PUBLIC_SUPABASE_ANON_KEY
   值: 你的Supabase匿名密钥
   
   变量名: SUPABASE_SERVICE_ROLE_KEY
   值: 你的Supabase服务角色密钥
   ```

## 🌐 第三步：配置网站 URL

```
变量名: NEXT_PUBLIC_SITE_URL
值: https://your-domain.pages.dev

变量名: NEXT_PUBLIC_API_BASE_URL  
值: https://your-domain.pages.dev/api
```

## ☁️ 第四步：配置 Cloudflare R2 存储（可选）

如果需要图片存储功能：

1. **设置 R2 存储桶：**
   - Cloudflare Dashboard → R2 Object Storage
   - Create bucket → 命名为 `aimagica-images`
   - 管理R2 API令牌 → 创建API令牌

2. **添加 R2 环境变量：**
   ```
   变量名: CLOUDFLARE_R2_ENDPOINT
   值: https://your-account-id.r2.cloudflarestorage.com
   
   变量名: CLOUDFLARE_R2_ACCESS_KEY_ID
   值: 你的R2访问密钥ID
   
   变量名: CLOUDFLARE_R2_SECRET_ACCESS_KEY
   值: 你的R2秘密访问密钥
   
   变量名: CLOUDFLARE_R2_BUCKET_NAME
   值: aimagica-images
   ```

## 🎯 第五步：保存并重新部署

1. **保存环境变量**后，点击页面下方的 **Save** 按钮
2. 返回 **Deployments** 标签
3. 点击最新部署右侧的 **...** → **Retry deployment**
4. 等待重新部署完成

## ⚡ 快速配置检查清单

**最小配置（应用能运行）：**
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET  
- ✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID
- ✅ JWT_SECRET
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_SITE_URL

**完整配置（全部功能）：**
- ✅ 上述所有变量
- ✅ Cloudflare R2 相关变量
- ✅ PAYMENT_SECURITY_SECRET

## 🔍 常见问题

**Q: 我在哪里查看配置是否生效？**
A: 部署完成后访问 `https://your-domain.pages.dev/debug-api`，会显示环境变量状态

**Q: 为什么配置后还是报错？**
A: 确保变量名完全正确（区分大小写），并且重新部署了项目

**Q: NEXT_PUBLIC_ 开头的变量有什么特殊？**
A: 这些变量会嵌入到前端代码中，可以在浏览器中访问，不要放敏感信息

## 📞 需要帮助？

如果配置过程中遇到问题，可以：
1. 检查变量名是否正确拼写
2. 确认Google OAuth重定向URI设置正确
3. 验证Supabase项目配置
4. 查看Cloudflare Pages部署日志