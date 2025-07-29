import { Hono } from 'hono'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// 管理员样式管理
adminRoutes.get('/styles', async (c) => {
  return c.json({ message: 'Admin styles endpoint' })
})

// API配置管理
adminRoutes.get('/api-configs', async (c) => {
  return c.json({ message: 'Admin API configs endpoint' })
})