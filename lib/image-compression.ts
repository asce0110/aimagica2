/**
 * 智能图片压缩服务
 * 在上传到R2之前统一压缩图片，减少存储空间和画廊加载压力
 */

export interface CompressionOptions {
  // 质量设置
  quality?: number // 0-1，默认0.8
  maxWidth?: number // 最大宽度，默认1920
  maxHeight?: number // 最大高度，默认1920
  
  // 格式选择
  outputFormat?: 'webp' | 'jpeg' | 'png' | 'auto' // 默认auto
  
  // 文件大小限制
  maxSizeKB?: number // 最大文件大小KB，默认800KB
  
  // 压缩策略
  strategy?: 'quality' | 'size' | 'balanced' // 默认balanced
  
  // 是否保留元数据
  preserveMetadata?: boolean // 默认false
}

export interface CompressionResult {
  compressedFile: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  format: string
  dimensions: { width: number; height: number }
  processingTime: number
}

export class ImageCompressor {
  private canvas: OffscreenCanvas | HTMLCanvasElement
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
  
  constructor() {
    // 优先使用OffscreenCanvas（Web Worker支持）
    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(1, 1)
      this.ctx = this.canvas.getContext('2d')!
    } else if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')!
    } else {
      // 服务器端环境，延迟初始化
      this.canvas = null as any
      this.ctx = null as any
    }
  }

  /**
   * 压缩单个图片
   */
  async compressImage(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    // 服务器端环境检查
    if (this.canvas === null || this.ctx === null) {
      throw new Error('Image compression not available in server environment')
    }
    
    const startTime = performance.now()
    
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1920,
      outputFormat = 'auto',
      maxSizeKB = 800,
      strategy = 'balanced',
      preserveMetadata = false
    } = options

    try {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image')
      }

      const originalSize = file.size
      
      // 加载图片
      const img = await this.loadImage(file)
      
      // 计算目标尺寸
      const targetDimensions = this.calculateTargetDimensions(
        img.width, 
        img.height, 
        maxWidth, 
        maxHeight
      )
      
      // 选择最佳输出格式
      const finalFormat = this.selectOptimalFormat(file.type, outputFormat)
      
      // 根据策略调整质量
      const adjustedQuality = this.adjustQualityByStrategy(
        strategy, 
        quality, 
        originalSize, 
        maxSizeKB
      )
      
      // 执行压缩
      const compressedFile = await this.performCompression(
        img,
        targetDimensions,
        finalFormat,
        adjustedQuality,
        maxSizeKB
      )
      
      const processingTime = performance.now() - startTime
      
      return {
        compressedFile,
        originalSize,
        compressedSize: compressedFile.size,
        compressionRatio: Math.round((1 - compressedFile.size / originalSize) * 100),
        format: finalFormat,
        dimensions: targetDimensions,
        processingTime: Math.round(processingTime)
      }
      
    } catch (error) {
      console.error('Image compression failed:', error)
      throw new Error(`压缩失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 批量压缩图片
   */
  async compressImages(
    files: File[], 
    options: CompressionOptions = {}
  ): Promise<CompressionResult[]> {
    const results = await Promise.allSettled(
      files.map(file => this.compressImage(file, options))
    )
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`Image ${index} compression failed:`, result.reason)
        throw new Error(`图片 ${index + 1} 压缩失败`)
      }
    })
  }

  /**
   * 智能压缩 - 自动选择最佳参数
   */
  async smartCompress(file: File): Promise<CompressionResult> {
    const originalSize = file.size
    
    let options: CompressionOptions
    
    // 根据文件大小智能选择压缩策略
    if (originalSize > 5 * 1024 * 1024) { // > 5MB
      options = {
        quality: 0.7,
        maxWidth: 1600,
        maxHeight: 1600,
        maxSizeKB: 600,
        strategy: 'size',
        outputFormat: 'webp'
      }
    } else if (originalSize > 2 * 1024 * 1024) { // > 2MB
      options = {
        quality: 0.75,
        maxWidth: 1800,
        maxHeight: 1800,
        maxSizeKB: 700,
        strategy: 'balanced',
        outputFormat: 'webp'
      }
    } else if (originalSize > 1 * 1024 * 1024) { // > 1MB
      options = {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        maxSizeKB: 800,
        strategy: 'quality',
        outputFormat: 'auto'
      }
    } else {
      // 小文件，轻度压缩
      options = {
        quality: 0.85,
        maxWidth: 1920,
        maxHeight: 1920,
        maxSizeKB: 900,
        strategy: 'quality',
        outputFormat: 'auto'
      }
    }
    
    return this.compressImage(file, options)
  }

  // 私有方法
  private loadImage(file: File): Promise<HTMLImageElement> {
    if (typeof Image === 'undefined' || typeof URL === 'undefined') {
      throw new Error('Image loading not available in server environment')
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  private calculateTargetDimensions(
    width: number, 
    height: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height }
    }
    
    const aspectRatio = width / height
    
    if (width > height) {
      const newWidth = Math.min(width, maxWidth)
      const newHeight = Math.round(newWidth / aspectRatio)
      return { width: newWidth, height: newHeight }
    } else {
      const newHeight = Math.min(height, maxHeight)
      const newWidth = Math.round(newHeight * aspectRatio)
      return { width: newWidth, height: newHeight }
    }
  }

  private selectOptimalFormat(
    originalType: string, 
    preferredFormat: string
  ): string {
    if (preferredFormat !== 'auto') {
      return `image/${preferredFormat}`
    }
    
    // 智能格式选择
    if (originalType === 'image/png') {
      // PNG转WebP通常效果很好
      return 'image/webp'
    } else if (originalType === 'image/jpeg' || originalType === 'image/jpg') {
      // JPEG可以转WebP或保持JPEG
      return 'image/webp'
    } else {
      // 其他格式转WebP
      return 'image/webp'
    }
  }

  private adjustQualityByStrategy(
    strategy: string, 
    baseQuality: number, 
    fileSize: number, 
    maxSizeKB: number
  ): number {
    const targetSizeBytes = maxSizeKB * 1024
    
    switch (strategy) {
      case 'size':
        // 优先考虑文件大小
        if (fileSize > targetSizeBytes * 3) return Math.max(0.6, baseQuality - 0.2)
        if (fileSize > targetSizeBytes * 2) return Math.max(0.65, baseQuality - 0.15)
        if (fileSize > targetSizeBytes) return Math.max(0.7, baseQuality - 0.1)
        return baseQuality
        
      case 'quality':
        // 优先考虑图片质量
        return Math.max(0.75, baseQuality)
        
      case 'balanced':
      default:
        // 平衡质量和大小
        if (fileSize > targetSizeBytes * 2) return Math.max(0.65, baseQuality - 0.15)
        if (fileSize > targetSizeBytes) return Math.max(0.7, baseQuality - 0.1)
        return baseQuality
    }
  }

  private async performCompression(
    img: HTMLImageElement,
    dimensions: { width: number; height: number },
    format: string,
    quality: number,
    maxSizeKB: number
  ): Promise<File> {
    // 设置canvas尺寸
    this.canvas.width = dimensions.width
    this.canvas.height = dimensions.height
    
    // 清除画布
    this.ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    
    // 使用高质量缩放
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
    
    // 绘制缩放后的图片
    this.ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)
    
    // 转换为Blob
    let blob: Blob
    let currentQuality = quality
    let attempts = 0
    const maxAttempts = 5
    
    do {
      if (this.canvas instanceof OffscreenCanvas) {
        blob = await this.canvas.convertToBlob({ 
          type: format, 
          quality: currentQuality 
        })
      } else {
        blob = await new Promise<Blob>((resolve, reject) => {
          (this.canvas as HTMLCanvasElement).toBlob(
            (result) => result ? resolve(result) : reject(new Error('Failed to convert canvas to blob')),
            format,
            currentQuality
          )
        })
      }
      
      // 如果文件大小超过限制，降低质量重试
      if (blob.size > maxSizeKB * 1024 && attempts < maxAttempts) {
        currentQuality = Math.max(0.5, currentQuality - 0.1)
        attempts++
      } else {
        break
      }
    } while (attempts < maxAttempts)
    
    // 创建File对象
    const fileName = `compressed_${Date.now()}.${format.split('/')[1]}`
    return new File([blob], fileName, { type: format })
  }
}

// 单例实例
export const imageCompressor = new ImageCompressor()

// 便捷函数
export async function compressForGallery(file: File): Promise<CompressionResult> {
  return imageCompressor.smartCompress(file)
}

export async function compressForThumbnail(file: File): Promise<CompressionResult> {
  return imageCompressor.compressImage(file, {
    quality: 0.7,
    maxWidth: 400,
    maxHeight: 400,
    outputFormat: 'webp',
    maxSizeKB: 100,
    strategy: 'size'
  })
}