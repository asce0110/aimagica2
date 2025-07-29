import { NextRequest } from 'next/server'
import { processImageUpload, extractFileFromRequest, createUploadResponse } from '@/lib/image-upload-middleware'
import { createClient } from '@/lib/supabase-server'
import { createGeneratedImage } from '@/lib/database/images'

/**
 * 画廊图片上传API
 * 专门处理用户分享到画廊的图片，包含压缩和数据库保存
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Gallery upload API called')
    
    // 1. 身份验证
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return createUploadResponse({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      })
    }
    
    console.log('✅ User authenticated:', user.id)
    
    // 2. 提取文件和表单数据
    const file = await extractFileFromRequest(request, 'image')
    if (!file) {
      return createUploadResponse({
        success: false,
        message: 'No image file found',
        error: 'Missing image file in request'
      })
    }
    
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string || ''
    const styleId = formData.get('style_id') as string || null
    const compressionInfo = formData.get('compression_info') as string || '{}'
    
    console.log('📋 Gallery upload data:', {
      fileName: file.name,
      fileSize: file.size,
      prompt: prompt.substring(0, 50) + '...',
      styleId,
      hasCompressionInfo: compressionInfo !== '{}'
    })
    
    // 3. 处理图片上传（包含压缩）
    const uploadResult = await processImageUpload(file, {
      path: 'gallery', // R2存储路径
      compressionStrategy: 'gallery', // 画廊压缩策略
      enableCompression: true,
      saveToDatabase: false, // 我们手动处理数据库保存
      isPublic: true,
      userId: user.id,
      metadata: {
        uploadType: 'gallery',
        originalPrompt: prompt,
        styleId: styleId || undefined,
        compressionInfo: JSON.parse(compressionInfo)
      }
    })
    
    if (!uploadResult.success) {
      console.error('❌ Image upload failed:', uploadResult.error)
      return createUploadResponse(uploadResult)
    }
    
    console.log('✅ Image uploaded to R2:', uploadResult.data?.publicUrl)
    
    // 4. 保存到数据库（generated_images表）
    try {
      const generatedImage = await createGeneratedImage({
        user_id: user.id,
        generated_image_url: uploadResult.data!.publicUrl,
        original_url: uploadResult.data!.publicUrl,
        style: styleId || 'gallery-shared',
        prompt: prompt,
        is_public: true,
        r2_key: uploadResult.data!.r2Key
      })
      
      if (!generatedImage) {
        console.error('❌ Failed to save image record to database')
        return createUploadResponse({
          success: false,
          message: 'Failed to save image record',
          error: 'Database insert failed'
        })
      }
      
      console.log('✅ Image record saved to database:', generatedImage.id)
      
      // 5. 返回成功结果
      return createUploadResponse({
        success: true,
        message: 'Image shared to gallery successfully',
        data: {
          ...uploadResult.data,
          imageId: Number(generatedImage.id),
          prompt,
          styleId,
          isPublic: true
        } as any
      })
      
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError)
      
      // 数据库保存失败，但R2上传成功了
      // 这里应该考虑是否要清理R2文件，但为了数据一致性，我们返回部分成功
      return createUploadResponse({
        success: false,
        message: 'Image uploaded but failed to save to gallery',
        error: dbError instanceof Error ? dbError.message : 'Database error'
      })
    }
    
  } catch (error) {
    console.error('❌ Gallery upload API error:', error)
    return createUploadResponse({
      success: false,
      message: 'Gallery upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET方法 - 获取画廊信息
 */
export async function GET() {
  return createUploadResponse({
    success: true,
    message: 'Gallery upload API is ready',
    data: {
      endpoint: '/api/gallery/upload',
      methods: ['POST'],
      description: 'Upload compressed images to public gallery',
      features: [
        'Smart image compression',
        'R2 storage integration', 
        'Database record creation',
        'User authentication',
        'Public gallery sharing'
      ]
    } as any
  })
}