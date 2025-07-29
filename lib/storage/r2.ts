import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2 配置
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 使用 'auto'
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, // 类似 https://账户ID.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!
const CUSTOM_DOMAIN = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN // 可选的自定义域名

/**
 * 生成唯一的文件名
 */
export function generateFileName(originalName: string, prefix: string = 'images'): string {
  const timestamp = new Date().getTime()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${prefix}/${timestamp}-${randomStr}.${extension}`
}

/**
 * 上传文件到R2
 */
export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      // Cloudflare R2 不支持 ACL，需要通过 Bucket 设置公开访问
    })

    await r2Client.send(command)

    // 生成访问URL
    const url = CUSTOM_DOMAIN 
      ? `${CUSTOM_DOMAIN}/${fileName}`
      : `${process.env.CLOUDFLARE_R2_ENDPOINT}/${BUCKET_NAME}/${fileName}`

    return { success: true, url }
  } catch (error) {
    console.error('❌ R2 upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }
  }
}

/**
 * 从R2删除文件
 */
export async function deleteFromR2(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    await r2Client.send(command)
    return { success: true }
  } catch (error) {
    console.error('❌ R2 delete error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Delete failed' 
    }
  }
}

/**
 * 生成预签名上传URL（用于前端直接上传）
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600 // 1小时
): Promise<{ success: boolean; uploadUrl?: string; accessUrl?: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
      // Cloudflare R2 不支持 ACL
    })

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn })
    
    const accessUrl = CUSTOM_DOMAIN 
      ? `${CUSTOM_DOMAIN}/${fileName}`
      : `${process.env.CLOUDFLARE_R2_ENDPOINT}/${BUCKET_NAME}/${fileName}`

    return { success: true, uploadUrl, accessUrl }
  } catch (error) {
    console.error('❌ R2 presigned URL error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate presigned URL' 
    }
  }
}

/**
 * 验证文件类型
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please use JPEG, PNG, WebP, or GIF.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}

/**
 * 从URL中提取文件名
 */
export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // 移除leading slash
    return pathname.startsWith('/') ? pathname.slice(1) : pathname
  } catch {
    return null
  }
} 