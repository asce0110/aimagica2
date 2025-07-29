/**
 * 简化的浏览器缓存管理器 - 轻量级图片预加载
 * 
 * 主要功能:
 * 1. 简单的图片预加载
 * 2. 基本的错误处理
 * 3. 减少内存使用
 */

interface CacheOptions {
  priority?: 'high' | 'low'
  retryCount?: number
}

class BrowserCacheManager {
  private loadingPromises = new Map<string, Promise<boolean>>()
  private failedUrls = new Set<string>()
  
  /**
   * 简单的图片预加载
   */
  async preloadImage(src: string, options: CacheOptions = {}): Promise<boolean> {
    const { retryCount = 1 } = options
    
    // 检查是否已在加载中
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!
    }
    
    // 检查是否已失败
    if (this.failedUrls.has(src)) {
      return false
    }
    
    // 开始加载
    const loadPromise = this.loadSimpleImage(src, retryCount)
    this.loadingPromises.set(src, loadPromise)
    
    try {
      const result = await loadPromise
      this.loadingPromises.delete(src)
      return result
    } catch (error) {
      this.loadingPromises.delete(src)
      this.failedUrls.add(src)
      return false
    }
  }
  
  /**
   * 简单的图片加载
   */
  private async loadSimpleImage(src: string, retryCount: number): Promise<boolean> {
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image()
          
          const timeout = setTimeout(() => {
            img.onload = null
            img.onerror = null
            reject(new Error('超时'))
          }, 10000) // 缩短到10秒
          
          img.onload = () => {
            clearTimeout(timeout)
            resolve()
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('加载失败'))
          }
          
          // 只在重试时添加时间戳
          const finalSrc = attempt > 0 ? `${src}?t=${Date.now()}` : src
          img.src = finalSrc
        })
        
        return true
      } catch (error) {
        if (attempt === retryCount) {
          throw error
        }
        // 简单延迟，不用指数退避
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return false
  }
  
  /**
   * 批量预加载图片
   */
  async preloadImages(urls: string[], options: CacheOptions = {}): Promise<number> {
    const results = await Promise.allSettled(
      urls.map(url => this.preloadImage(url, options))
    )
    
    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length
    
    console.log(`🎉 批量预加载完成: ${successCount}/${urls.length}`)
    return successCount
  }
  
  /**
   * 清理失败记录
   */
  clearFailedUrls(): void {
    this.failedUrls.clear()
  }
  
  /**
   * 获取简单统计
   */
  getStats() {
    return {
      loading: this.loadingPromises.size,
      failed: this.failedUrls.size,
    }
  }
  
  /**
   * 重置状态
   */
  reset(): void {
    this.loadingPromises.clear()
    this.failedUrls.clear()
  }
}

// 创建全局实例
export const browserCacheManager = new BrowserCacheManager()

// 简单的清理机制
if (typeof window !== 'undefined') {
  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    browserCacheManager.reset()
  })
}