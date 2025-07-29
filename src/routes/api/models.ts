import { Hono } from 'hono'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

export const modelsRoutes = new Hono<{ Bindings: Bindings }>()

// TODO: Implement models routes
modelsRoutes.get('/', async (c) => {
  return c.json({ message: 'Models endpoint' })
})
