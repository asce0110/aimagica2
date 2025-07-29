import { Hono } from 'hono'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

export const stylesRoutes = new Hono<{ Bindings: Bindings }>()

// TODO: Implement styles routes
stylesRoutes.get('/', async (c) => {
  return c.json({ message: 'Styles endpoint' })
})
