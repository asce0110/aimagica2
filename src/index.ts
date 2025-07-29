import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import { apiRoutes } from './routes/api'
import { staticRoutes } from './routes/static'

// 定义环境变量类型
type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

// 创建Hono应用
const app = new Hono<{ Bindings: Bindings }>()

// 中间件配置
app.use('*', logger())
app.use('*', cors({
  origin: ['https://aimagica.ai', 'https://aimagica.app', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// API路由 - 必须在静态文件之前
app.route('/api', apiRoutes)

// 静态文件和页面路由
app.route('/', staticRoutes)

// 健康检查端点
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT 
  })
})

// 404处理
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>404 - AIMAGICA</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: 'Fredoka One', Arial, sans-serif; text-align: center; padding: 50px; }
          .magic { color: #d4a574; font-size: 2rem; }
        </style>
      </head>
      <body>
        <div class="magic">
          <h1>404 - Page Not Found 🪄</h1>
          <p>This page doesn't exist in our magic world!</p>
          <a href="/">Return to AIMAGICA Home</a>
        </div>
      </body>
    </html>
  `, 404)
})

// 错误处理
app.onError((err, c) => {
  console.error(`Error: ${err.message}`)
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong'
  }, 500)
})

export default app