import { NextRequest } from 'next/server'
import { processImageUpload, extractFileFromRequest, createUploadResponse } from '@/lib/image-upload-middleware'
import { createClient } from '@/lib/supabase-server'

/**
 * 通用图片上传API
 * 处理各种类型的图片上传，支持压缩和不同上传策略
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 General upload API called')
    
    // 1. 身份验证（可选，取决于上传类型）
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 2. 提取文件和表单数据
    const file = await extractFileFromRequest(request, 'file')
    if (!file) {
      return createUploadResponse({
        success: false,
        message: 'No file found',
        error: 'Missing file in request'
      })
    }
    
    const formData = await request.formData()
    const uploadType = formData.get('type') as string || 'general'
    
    console.log('📋 Upload data:', {
      fileName: file.name,
      fileSize: file.size,
      uploadType,
      hasAuth: !!user
    })
    
    // 3. 根据上传类型确定配置
    let uploadConfig
    
    switch (uploadType) {
      case 'test':
        // 测试上传 - 临时存储，不压缩
        uploadConfig = {
          path: 'test',
          enableCompression: false,
          saveToDatabase: false,
          isPublic: false,
          userId: user?.id,
          metadata: { uploadType: 'test' }
        }
        break
        
      case 'avatar':
        // 头像上传 - 小尺寸压缩
        uploadConfig = {
          path: 'avatars',
          compressionStrategy: 'thumbnail' as const,
          enableCompression: true,
          saveToDatabase: true,
          isPublic: false,
          userId: user?.id,
          metadata: { uploadType: 'avatar' }
        }
        break
        
      case 'sketch':
        // 草图上传 - 智能压缩
        uploadConfig = {
          path: 'sketches',
          compressionStrategy: 'auto' as const,
          enableCompression: true,
          saveToDatabase: true,
          isPublic: false,
          userId: user?.id,
          metadata: { uploadType: 'sketch' }
        }
        break
        
      case 'admin':
        // 管理员上传 - 高质量压缩
        if (!user) {
          return createUploadResponse({
            success: false,
            message: 'Authentication required for admin upload',
            error: 'User not authenticated'
          })
        }
        uploadConfig = {
          path: 'admin',
          compressionStrategy: 'admin' as const,
          enableCompression: true,
          saveToDatabase: true,
          isPublic: false,
          userId: user.id,
          metadata: { uploadType: 'admin' }
        }
        break
        
      default:
        // 通用上传 - 智能压缩
        uploadConfig = {
          path: 'uploads',
          compressionStrategy: 'auto' as const,
          enableCompression: true,
          saveToDatabase: !!user,
          isPublic: false,
          userId: user?.id,
          metadata: { uploadType: 'general' }
        }
    }
    
    // 4. 处理图片上传
    const uploadResult = await processImageUpload(file, uploadConfig)
    
    if (!uploadResult.success) {
      console.error('❌ Upload failed:', uploadResult.error)
      return createUploadResponse(uploadResult)
    }
    
    console.log('✅ Upload successful:', uploadResult.data?.publicUrl)
    
    // 5. 返回兼容格式的结果
    return createUploadResponse({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileName: file.name,
        url: uploadResult.data!.publicUrl,
        size: uploadResult.data!.compressedSize,
        type: file.type,
        // 额外的压缩信息
        originalSize: uploadResult.data!.originalSize,
        compressionRatio: uploadResult.data!.compressionRatio,
        r2Key: uploadResult.data!.r2Key,
        imageId: uploadResult.data?.imageId
      } as any
    })
    
  } catch (error) {
    console.error('❌ Upload API error:', error)
    return createUploadResponse({
      success: false,
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET方法 - 获取上传信息
 */
export async function GET() {
  return createUploadResponse({
    success: true,
    message: 'Upload API is ready',
    data: {
      endpoint: '/api/upload',
      methods: ['POST'],
      description: 'General file upload with smart compression',
      supportedTypes: ['test', 'avatar', 'sketch', 'admin', 'general'],
      features: [
        'Smart image compression',
        'Multiple upload strategies',
        'R2 storage integration',
        'Optional database storage',
        'User authentication support'
      ]
    } as any
  })
}