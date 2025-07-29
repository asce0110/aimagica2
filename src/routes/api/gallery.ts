import { Hono } from 'hono'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

export const galleryRoutes = new Hono<{ Bindings: Bindings }>()

// 上传到画廊
galleryRoutes.post('/upload', async (c) => {
  return c.json({ message: 'Gallery upload endpoint' })
})

// 获取画廊图片
galleryRoutes.get('/', async (c) => {
  return c.json({ message: 'Gallery list endpoint' })
})