/**
 * 图片优化工具 - 为R2图片添加压缩和尺寸优化
 */

interface ImageOptimizeOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'auto'
}

/**
 * 优化图片URL - 简化版本，减少计算开销
 */
export function optimizeImageUrl(originalUrl: string, options: ImageOptimizeOptions = {}): string {
  if (!originalUrl) return originalUrl
  
  // 快速检查 - 避免正则表达式
  const needsOptimization = originalUrl.includes('aimagica.ai') || originalUrl.includes('tempfile.aiquickdraw.com')
  
  if (!needsOptimization) {
    return originalUrl
  }
  
  const {
    width = 800,
    quality = 80,
    format = 'webp'
  } = options
  
  // 使用字符串操作而不是URL构造器，更快
  if (originalUrl.includes('aimagica.ai')) {
    // 对于Cloudflare Images，直接构建优化URL
    const path = originalUrl.split('aimagica.ai')[1] || ''
    return `https://images.aimagica.ai/cdn-cgi/image/width=${width},quality=${quality},format=${format}${path}`
  }
  
  // 对于其他URL，添加查询参数
  const separator = originalUrl.includes('?') ? '&' : '?'
  return `${originalUrl}${separator}w=${width}&q=${quality}&f=${format}`
}

/**
 * 根据屏幕尺寸获取合适的图片尺寸
 */
export function getOptimalImageSize(containerWidth: number): ImageOptimizeOptions {
  // 考虑设备像素比
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const targetWidth = Math.ceil(containerWidth * devicePixelRatio)
  
  // 限制最大尺寸以节省带宽
  const maxWidth = Math.min(targetWidth, 1200)
  
  return {
    width: maxWidth,
    quality: maxWidth > 800 ? 75 : 85, // 大图片用更低质量
    format: 'webp'
  }
}

/**
 * 生成多尺寸图片集合（用于响应式图片）
 */
export function generateImageSrcSet(originalUrl: string): string {
  const sizes = [400, 800, 1200]
  
  const srcSet = sizes.map(size => {
    const optimizedUrl = optimizeImageUrl(originalUrl, {
      width: size,
      quality: size > 800 ? 75 : 85,
      format: 'webp'
    })
    return `${optimizedUrl} ${size}w`
  }).join(', ')
  
  return srcSet
}