import { Hono } from 'hono'
import { generateRoutes } from './generate'
import { galleryRoutes } from './gallery'
import { adminRoutes } from './admin'
import { dashboardRoutes } from './dashboard'
import { stylesRoutes } from './styles'
import { modelsRoutes } from './models'
import { uploadRoutes } from './upload'
import { featuredRoutes } from './featured'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// 挂载所有API路由
apiRoutes.route('/generate', generateRoutes)
apiRoutes.route('/gallery', galleryRoutes)
apiRoutes.route('/admin', adminRoutes)
apiRoutes.route('/dashboard', dashboardRoutes)
apiRoutes.route('/styles', stylesRoutes)
apiRoutes.route('/models', modelsRoutes)
apiRoutes.route('/upload', uploadRoutes)
apiRoutes.route('/featured-images', featuredRoutes)

// API根路径信息
apiRoutes.get('/', (c) => {
  return c.json({
    name: 'AIMAGICA API',
    version: '1.0.0',
    endpoints: [
      '/api/generate',
      '/api/gallery', 
      '/api/admin',
      '/api/dashboard',
      '/api/styles',
      '/api/models',
      '/api/upload',
      '/api/featured-images'
    ]
  })
})