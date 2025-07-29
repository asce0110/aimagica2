import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
  __STATIC_CONTENT: KVNamespace
  __STATIC_CONTENT_MANIFEST: string
}

export const staticRoutes = new Hono<{ Bindings: Bindings }>()

// 静态资源处理
staticRoutes.get('/static/*', serveStatic({
  root: './dist/static',
  onNotFound: (path, c) => {
    console.log(`Static file not found: ${path}`)
    return c.notFound()
  }
}))

// 图片资源
staticRoutes.get('/images/*', serveStatic({
  root: './dist/images'
}))

// CSS和JS资源
staticRoutes.get('/_next/static/*', serveStatic({
  root: './dist/_next/static'
}))

// 主页面路由 - 返回React应用
staticRoutes.get('/', async (c) => {
  try {
    // 从KV或内嵌资源获取HTML
    const html = await getIndexHTML(c.env)
    return c.html(html)
  } catch (error) {
    return c.html(getErrorHTML('Failed to load homepage'), 500)
  }
})

// SPA路由 - 所有未匹配的路由都返回index.html
staticRoutes.get('*', async (c) => {
  try {
    // 检查是否是API路由，如果是则跳过
    if (c.req.path.startsWith('/api')) {
      return c.notFound()
    }
    
    const html = await getIndexHTML(c.env)
    return c.html(html)
  } catch (error) {
    return c.html(getErrorHTML('Page not found'), 404)
  }
})

// 获取主HTML文件
async function getIndexHTML(env: Bindings): Promise<string> {
  // 这里可以从KV存储或内嵌资源获取HTML
  // 目前返回基础HTML模板
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIMAGICA - AI Art Generator</title>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <script>
      // 环境变量注入
      window.__ENV__ = {
        SUPABASE_URL: "${env.NEXT_PUBLIC_SUPABASE_URL}",
        SUPABASE_ANON_KEY: "${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}",
        R2_PUBLIC_URL: "${env.NEXT_PUBLIC_R2_PUBLIC_URL}",
        ENVIRONMENT: "${env.ENVIRONMENT}"
      };
    </script>
    <style>
      body { font-family: 'Fredoka One', Arial, sans-serif; margin: 0; padding: 0; }
      .loading { 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        background: #2d3135;
        color: #d4a574;
      }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <h1>🪄 Loading AIMAGICA Magic...</h1>
        </div>
    </div>
    <script type="module" src="/_next/static/js/main.js"></script>
</body>
</html>
  `
}

// 错误页面HTML
function getErrorHTML(message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Error - AIMAGICA</title>
    <style>
      body { font-family: 'Fredoka One', Arial, sans-serif; text-align: center; padding: 50px; background: #2d3135; color: #d4a574; }
    </style>
</head>
<body>
    <h1>🚫 Oops!</h1>
    <p>${message}</p>
    <a href="/" style="color: #f5f1e8;">← Back to Home</a>
</body>
</html>
  `
}