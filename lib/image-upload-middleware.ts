/**
 * 统一的图片上传中间件 - 集成智能压缩
 * 在所有图片上传到R2之前自动进行压缩处理
 */

import { NextRequest, NextResponse } from 'next/server'
import { imageCompressor, type CompressionResult } from '@/lib/image-compression'
import { uploadToR2 } from '@/lib/storage/r2'
import { saveImageRecord } from '@/lib/database/images'

export interface R2UploadResult {
  success: boolean
  url?: string
  key?: string
  publicUrl?: string
  error?: string
}

export interface UploadConfig {
  // 存储配置
  path: string // R2存储路径前缀
  fileName?: string // 自定义文件名
  
  // 压缩配置
  enableCompression?: boolean // 是否启用压缩，默认true
  compressionStrategy?: 'auto' | 'gallery' | 'thumbnail' | 'admin'
  
  // 数据库配置
  saveToDatabase?: boolean // 是否保存到数据库
  isPublic?: boolean // 是否公开
  userId?: string // 用户ID
  metadata?: Record<string, any> // 额外元数据
}

export interface UploadResult {
  success: boolean
  message: string
  data?: {
    imageId?: number
    r2Key: string
    publicUrl: string
    originalSize: number
    compressedSize: number
    compressionRatio: number
    format: string
    dimensions: { width: number; height: number }
  }
  error?: string
}

/**
 * 统一的图片上传处理器
 */
export async function processImageUpload(
  file: File,
  config: UploadConfig
): Promise<UploadResult> {
  
  try {
    console.log('🖼️ 开始处理图片上传:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      config
    })

    // 1. 文件验证
    const validationResult = validateImageFile(file)
    if (!validationResult.valid) {
      return {
        success: false,
        message: validationResult.error!,
        error: validationResult.error
      }
    }

    // 2. 图片压缩处理
    let processedFile = file
    let compressionResult: CompressionResult | null = null
    
    if (config.enableCompression !== false) {
      try {
        compressionResult = await compressImageByStrategy(file, config.compressionStrategy || 'auto')
        processedFile = compressionResult.compressedFile
        
        console.log('✅ 图片压缩完成:', {
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          ratio: compressionResult.compressionRatio,
          format: compressionResult.format
        })
      } catch (compressionError) {
        console.warn('⚠️ 图片压缩失败，使用原始文件:', compressionError)
        // 压缩失败时使用原始文件，不中断上传流程
      }
    }

    // 3. 生成文件名和R2路径
    const { fileName, r2Key } = generateR2Path(processedFile, config)
    
    // 4. 上传到R2
    const buffer = Buffer.from(await processedFile.arrayBuffer())
    const uploadResult = await uploadToR2(
      buffer,
      fileName,
      processedFile.type
    )

    if (!uploadResult.success) {
      return {
        success: false,
        message: 'R2 upload failed',
        error: uploadResult.error
      }
    }

    // 5. 保存到数据库（如果配置）
    let imageId: number | undefined
    if (config.saveToDatabase) {
      try {
        imageId = await saveImageRecord({
          r2Key: r2Key,
          publicUrl: uploadResult.url || '',
          originalUrl: uploadResult.url || '',
          fileName: file.name,
          fileSize: processedFile.size,
          contentType: processedFile.type,
          isPublic: config.isPublic || false,
          userId: config.userId,
          metadata: {
            originalSize: file.size,
            compressedSize: processedFile.size,
            compressionRatio: compressionResult?.compressionRatio || 0,
            compressionFormat: compressionResult?.format || processedFile.type,
            dimensions: compressionResult?.dimensions,
            processingTime: compressionResult?.processingTime,
            ...config.metadata
          }
        })
        
        console.log('✅ 图片记录保存到数据库:', imageId)
      } catch (dbError) {
        console.error('❌ 数据库保存失败:', dbError)
        // 数据库保存失败不影响上传成功状态
      }
    }

    // 6. 返回结果
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageId,
        r2Key: r2Key,
        publicUrl: uploadResult.url || '',
        originalSize: file.size,
        compressedSize: processedFile.size,
        compressionRatio: compressionResult?.compressionRatio || 0,
        format: processedFile.type,
        dimensions: compressionResult?.dimensions || { width: 0, height: 0 }
      }
    }

  } catch (error) {
    console.error('❌ 图片上传处理失败:', error)
    return {
      success: false,
      message: 'Image upload processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 文件验证
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // 检查文件大小 (50MB限制)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 50MB`
    }
  }

  // 检查文件名
  if (!file.name || file.name.length > 255) {
    return {
      valid: false,
      error: 'Invalid file name'
    }
  }

  return { valid: true }
}

/**
 * 根据策略压缩图片
 */
async function compressImageByStrategy(
  file: File, 
  strategy: 'auto' | 'gallery' | 'thumbnail' | 'admin'
): Promise<CompressionResult> {
  
  switch (strategy) {
    case 'gallery':
      // 画廊分享 - 平衡质量和大小
      return imageCompressor.compressImage(file, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        outputFormat: 'webp',
        maxSizeKB: 800,
        strategy: 'balanced'
      })
      
    case 'thumbnail':
      // 缩略图 - 优先大小
      return imageCompressor.compressImage(file, {
        quality: 0.7,
        maxWidth: 400,
        maxHeight: 400,
        outputFormat: 'webp',
        maxSizeKB: 100,
        strategy: 'size'
      })
      
    case 'admin':
      // 管理员上传 - 优先质量
      return imageCompressor.compressImage(file, {
        quality: 0.85,
        maxWidth: 2560,
        maxHeight: 2560,
        outputFormat: 'webp',
        maxSizeKB: 1500,
        strategy: 'quality'
      })
      
    case 'auto':
    default:
      // 智能压缩 - 根据文件大小自动选择
      return imageCompressor.smartCompress(file)
  }
}

/**
 * 生成R2存储路径
 */
function generateR2Path(file: File, config: UploadConfig): { fileName: string; r2Key: string } {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  
  // 获取文件扩展名
  const extension = file.type.split('/')[1] || 'jpg'
  
  // 生成文件名
  const fileName = config.fileName || `${timestamp}_${randomStr}.${extension}`
  
  // 生成R2路径
  const r2Key = `${config.path}/${fileName}`.replace(/\/+/g, '/').replace(/^\//, '')
  
  return { fileName, r2Key }
}

/**
 * 从请求中提取文件
 */
export async function extractFileFromRequest(
  request: NextRequest,
  fieldName: string = 'image'
): Promise<File | null> {
  try {
    const formData = await request.formData()
    const file = formData.get(fieldName) as File
    
    if (!file || !(file instanceof File)) {
      return null
    }
    
    return file
  } catch (error) {
    console.error('❌ 提取文件失败:', error)
    return null
  }
}

/**
 * 标准化API响应
 */
export function createUploadResponse(result: UploadResult): NextResponse {
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    }, { status: 200 })
  } else {
    return NextResponse.json({
      success: false,
      message: result.message,
      error: result.error
    }, { status: 400 })
  }
}