# Cloudflare Pages 配置指南

## 🚀 项目基本设置

### 仓库连接
- **GitHub 仓库**: `https://github.com/asce0110/aimagica2.git`
- **分支**: `main`
- **根目录**: `/`

### 构建配置
- **构建命令**: `npm run build:pages`
- **构建输出目录**: `out`
- **Node.js 版本**: `18.x`
- **框架预设**: None

## 🔐 环境变量配置

> **重要提示**: 实际的API密钥和配置值请从项目的 `.env.local` 文件中获取，本文档仅提供配置模板格式。

### Supabase 数据库配置 (必需)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Google OAuth 配置 (必需)
```
GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
```

### NextAuth 配置 (必需)
```
NEXTAUTH_URL=https://aimagica2.pages.dev
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### Cloudflare R2 存储配置 (必需)
```
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=ai-sketch
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=ai-sketch
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://images.aimagica.ai
```

### CDN 和网站配置
```
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_BASE_URL=https://images.aimagica.ai
NEXT_PUBLIC_SITE_URL=https://aimagica2.pages.dev
NODE_ENV=production
```

## 📝 配置步骤

### 1. 在 Cloudflare Pages 控制台中
1. 进入项目 → Settings → Environment variables
2. 逐一添加上述所有환境变量
3. 确保生产环境 (Production) 和预览环境 (Preview) 都配置了相同的变量

### 2. 重新部署
1. 配置完环境变量后，进入 Deployments 页面
2. 点击 "Retry deployment" 或 "Create deployment"
3. 选择最新的 commit (应该包含 Fredoka One 字体和魔法主题)

## 🎯 验证重点

部署成功后，检查以下要素：
- ✅ 网站使用 Fredoka One 字体
- ✅ 魔法主题色彩方案正确显示 (#f5f1e8, #2d3e2d, #d4a574)
- ✅ 最新的 UI 组件和功能正常工作
- ✅ 用户认证和数据库连接正常

## 🚨 注意事项

1. **NEXTAUTH_URL** 必须改为 `https://aimagica2.pages.dev`
2. **NODE_ENV** 必须设置为 `production`
3. 确保所有环境变量都没有尾随空格
4. 如果部署仍然显示旧版本，尝试清除 Cloudflare 缓存

---
*配置完成后，新的部署将包含所有最新的 UI 更新和 Fredoka One 字体*