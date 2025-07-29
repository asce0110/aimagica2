import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

export const generateRoutes = new Hono<{ Bindings: Bindings }>()

// 图像生成端点
generateRoutes.post('/image', async (c) => {
  try {
    const body = await c.req.json()
    const { prompt, style, model } = body

    // 输入验证
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400)
    }

    // 创建Supabase客户端
    const supabase = createClient(
      c.env.NEXT_PUBLIC_SUPABASE_URL,
      c.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // 这里是原来的图像生成逻辑
    // 为了演示，返回模拟响应
    const mockResponse = {
      success: true,
      imageUrl: `${c.env.NEXT_PUBLIC_R2_PUBLIC_URL}/generated/mock-image-${Date.now()}.jpg`,
      generationId: `gen_${Date.now()}`,
      prompt,
      style: style || 'default',
      model: model || 'kie-flux'
    }

    // 缓存结果到KV
    await c.env.CACHE.put(
      `generation:${mockResponse.generationId}`,
      JSON.stringify(mockResponse),
      { expirationTtl: 3600 } // 1小时过期
    )

    return c.json(mockResponse)
  } catch (error) {
    console.error('Generation error:', error)
    return c.json({ 
      error: 'Generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// KIE-Flux特定端点
generateRoutes.post('/kie-flux', async (c) => {
  try {
    const body = await c.req.json()
    
    // KIE-Flux特定逻辑
    const response = {
      success: true,
      message: 'KIE-Flux generation started',
      taskId: `kie_${Date.now()}`
    }

    return c.json(response)
  } catch (error) {
    return c.json({ error: 'KIE-Flux generation failed' }, 500)
  }
})

// 获取生成结果
generateRoutes.get('/result/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // 从KV获取结果
    const cached = await c.env.CACHE.get(`generation:${id}`)
    if (!cached) {
      return c.json({ error: 'Generation not found' }, 404)
    }

    return c.json(JSON.parse(cached))
  } catch (error) {
    return c.json({ error: 'Failed to get result' }, 500)
  }
})