// 图片缓存管理器
class ImageCacheManager {
  private cache = new Map<string, HTMLImageElement>()
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>()
  private maxCacheSize = 50 // 最大缓存数量
  private cacheHits = 0
  private cacheMisses = 0

  // 预加载图片
  async preloadImage(src: string): Promise<HTMLImageElement> {
    // 如果已经在缓存中，直接返回
    if (this.cache.has(src)) {
      this.cacheHits++
      console.log(`🎯 图片缓存命中: ${src}`)
      return this.cache.get(src)!
    }

    // 如果正在加载中，返回现有的Promise
    if (this.loadingPromises.has(src)) {
      console.log(`⏳ 图片正在加载中: ${src}`)
      return this.loadingPromises.get(src)!
    }

    // 开始加载图片
    this.cacheMisses++
    console.log(`📥 开始加载图片: ${src}`)
    
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        // 加载成功，添加到缓存
        this.addToCache(src, img)
        this.loadingPromises.delete(src)
        console.log(`✅ 图片加载成功: ${src}`)
        resolve(img)
      }
      
      img.onerror = () => {
        this.loadingPromises.delete(src)
        console.error(`❌ 图片加载失败: ${src}`)
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      // 设置跨域和缓存策略
      img.crossOrigin = 'anonymous'
      img.src = src
    })

    this.loadingPromises.set(src, loadPromise)
    return loadPromise
  }

  // 添加到缓存
  private addToCache(src: string, img: HTMLImageElement) {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
        console.log(`🗑️ 删除旧缓存: ${firstKey}`)
      }
    }
    
    this.cache.set(src, img)
    console.log(`💾 图片已缓存: ${src} (缓存大小: ${this.cache.size})`)
  }

  // 检查图片是否已缓存
  isImageCached(src: string): boolean {
    return this.cache.has(src)
  }

  // 批量预加载图片
  async preloadImages(sources: string[]): Promise<void> {
    console.log(`🚀 开始批量预加载 ${sources.length} 张图片`)
    
    const promises = sources.map(src => 
      this.preloadImage(src).catch(error => {
        console.warn(`⚠️ 预加载失败: ${src}`, error)
        return null
      })
    )
    
    await Promise.allSettled(promises)
    console.log(`✨ 批量预加载完成`)
  }

  // 清除缓存
  clearCache() {
    this.cache.clear()
    this.loadingPromises.clear()
    console.log('🧹 图片缓存已清除')
  }

  // 获取缓存统计
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) * 100
    }
  }

  // 预热缓存（预加载常用图片）
  async warmupCache() {
    const commonImages = [
      '/images/examples/cat-wizard.svg',
      '/images/examples/cyber-city.svg',
      '/images/examples/magic-forest.svg',
      '/images/examples/space-art.svg',
      '/images/placeholder.svg',
      '/images/placeholder-error.svg'
    ]
    
    console.log('🔥 开始预热图片缓存')
    await this.preloadImages(commonImages)
    console.log('🔥 图片缓存预热完成')
  }
}

// 创建全局单例
export const imageCache = new ImageCacheManager()

// 在浏览器环境中自动预热缓存
if (typeof window !== 'undefined') {
  // 延迟预热，避免阻塞页面加载
  setTimeout(() => {
    imageCache.warmupCache().catch(error => {
      console.warn('图片缓存预热失败:', error)
    })
  }, 2000) // 增加延迟时间
}

// 导出类型
export type { ImageCacheManager } 