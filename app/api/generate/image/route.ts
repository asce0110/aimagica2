import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * AI图片生成API
 * 接收文本和图片输入，返回生成的图片
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎨 AI Image Generation API called')
    
    // 1. 解析请求体
    const body = await request.json()
    const {
      prompt,
      styleId,
      aspectRatio = '1:1',
      imageCount = 1,
      userId,
      uploadedImage,
      creationMode = 'text2img',
      modelId,
      kieModel
    } = body
    
    console.log('📋 Generation parameters:', {
      prompt: prompt?.substring(0, 50) + '...',
      styleId,
      aspectRatio,
      imageCount,
      userId,
      creationMode,
      hasUploadedImage: !!uploadedImage,
      modelId,
      kieModel
    })
    
    // 2. 验证必需参数
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User authentication required'
      }, { status: 401 })
    }
    
    // 3. 验证用户身份
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 })
    }
    
    // 4. 获取样式信息（如果提供了styleId）
    let selectedStyle = null
    if (styleId) {
      try {
        const { data: style, error: styleError } = await supabase
          .from('styles')
          .select('*')
          .eq('id', styleId)
          .eq('is_active', true)
          .single()
        
        if (!styleError && style) {
          selectedStyle = style
          console.log('✅ Style found:', style.name)
        } else {
          console.warn('⚠️ Style not found or inactive:', styleId)
        }
      } catch (error) {
        console.warn('⚠️ Error fetching style:', error)
      }
    }
    
    // 5. 构建生成参数
    const generationParams = {
      prompt: selectedStyle?.prompt_template 
        ? selectedStyle.prompt_template.replace('{prompt}', prompt)
        : prompt,
      style: selectedStyle?.name || 'Default',
      aspectRatio,
      imageCount: Math.min(imageCount, 4), // 限制最多4张
      creationMode,
      modelId: modelId || kieModel || 'flux-pro',
      uploadedImage: creationMode === 'img2img' ? uploadedImage : null
    }
    
    console.log('🔧 Final generation params:', {
      ...generationParams,
      prompt: generationParams.prompt.substring(0, 100) + '...',
      uploadedImage: generationParams.uploadedImage ? 'PROVIDED' : 'NONE'
    })
    
    // 6. 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送初始状态
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            progress: 5,
            message: 'Initializing generation...'
          })}\n\n`))
          
          // 模拟生成过程（实际应该调用AI服务）
          const progressSteps = [
            { progress: 10, message: 'Connecting to AI service...' },
            { progress: 20, message: 'Processing prompt...' },
            { progress: 35, message: 'Generating image...' },
            { progress: 50, message: 'Applying style transformations...' },
            { progress: 65, message: 'Enhancing details...' },
            { progress: 80, message: 'Finalizing image...' },
            { progress: 90, message: 'Optimizing output...' },
            { progress: 95, message: 'Almost done...' }
          ]
          
          // 发送进度更新
          for (const step of progressSteps) {
            await new Promise(resolve => setTimeout(resolve, 500))
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              ...step
            })}\n\n`))
          }
          
          // 生成完成 - 返回模拟结果
          const mockImageUrl = `https://picsum.photos/seed/${Date.now()}/1024/1024`
          const generatedImages = Array.from({ length: generationParams.imageCount }, (_, i) => ({
            url: `https://picsum.photos/seed/${Date.now() + i}/1024/1024`,
            revised_prompt: generationParams.prompt
          }))
          
          // TODO: 这里应该保存到数据库
          // await saveGeneratedImage({
          //   user_id: user.id,
          //   prompt,
          //   style: selectedStyle?.name || 'Default',
          //   generated_image_url: generatedImages[0].url,
          //   // ... other fields
          // })
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            progress: 100,
            message: 'Generation complete!',
            images: generatedImages,
            metadata: {
              prompt: generationParams.prompt,
              style: selectedStyle?.name || 'Default',
              aspectRatio,
              creationMode,
              processingTime: '5.2s'
            }
          })}\n\n`))
          
          controller.close()
          
        } catch (error) {
          console.error('❌ Generation stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Generation failed'
          })}\n\n`))
          controller.close()
        }
      }
    })
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('❌ Image generation API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET方法 - 获取生成状态或配置信息
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Image Generation API is ready',
    data: {
      endpoint: '/api/generate/image',
      methods: ['POST'],
      description: 'Generate AI images from text and image inputs',
      features: [
        'Text-to-image generation',
        'Image-to-image transformation',
        'Style application',
        'Streaming progress updates',
        'Multiple aspect ratios',
        'Batch generation (up to 4 images)'
      ],
      supportedModes: [
        'text2img',
        'img2img'
      ],
      supportedAspectRatios: [
        '1:1',
        '16:9',
        '9:16',
        '4:3',
        '3:4'
      ]
    }
  })
}