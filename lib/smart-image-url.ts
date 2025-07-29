/**
 * 智能图片URL处理 - 优化新上传图片的加载速度
 */

// 本地静态图片映射
const LOCAL_IMAGE_MAP: Record<string, string> = {
  // API URL -> 本地路径的映射
  'https://images.aimagica.ai/gallery/105948948301872216168/1750949808349_Japanese_Anime_Style.png': '/images/gallery/386628e0-61b1-4966-8575-2c2f2f162e3a-f897c7ae.png',
  'https://images.aimagica.ai/gallery/105948948301872216168/1750862975446_A_cyberpunk_city_with_neon_lig.jpeg': '/images/gallery/48a8804f-9028-4132-85dd-d5c4d807c75e-13630e73.jpeg',
  'https://images.aimagica.ai/gallery/105948948301872216168/1750861881556_A_peaceful_zen_garden_with_che.jpeg': '/images/gallery/9912c424-e6a2-4ac1-98de-77bac4200978-fbd736fa.jpeg',
  // 对于临时文件和admin上传，让它们保持远程加载，因为这些是动态URL
  // 'https://tempfile.aiquickdraw.com/...' 和 'https://images.aimagica.ai/admin_uploads/...' 将使用智能策略
}

export interface ImageLoadingStrategy {
  primaryUrl: string
  fallbackUrl?: string
  isLocal: boolean
  strategy: 'local' | 'api' | 'hybrid'
}

/**
 * 智能选择图片URL策略
 */
export function getSmartImageUrl(apiUrl: string): ImageLoadingStrategy {
  // 0. 如果已经是本地路径，直接返回本地策略
  if (apiUrl.startsWith('/images/') || apiUrl.startsWith('./') || apiUrl.startsWith('../')) {
    return {
      primaryUrl: apiUrl,
      isLocal: true,
      strategy: 'local'
    }
  }
  
  // 1. 检查是否有本地版本映射
  const localPath = findLocalVersion(apiUrl)
  if (localPath) {
    return {
      primaryUrl: localPath,
      fallbackUrl: apiUrl,
      isLocal: true,
      strategy: 'local'
    }
  }
  
  // 2. 检查是否是新的上传图片（通常包含时间戳）
  if (isRecentUpload(apiUrl)) {
    return {
      primaryUrl: apiUrl,
      isLocal: false,
      strategy: 'api'
    }
  }
  
  // 3. 对于其他情况，使用混合策略
  return {
    primaryUrl: apiUrl,
    isLocal: false,
    strategy: 'hybrid'
  }
}

/**
 * 查找本地版本图片
 */
function findLocalVersion(apiUrl: string): string | null {
  // 直接映射查找
  if (LOCAL_IMAGE_MAP[apiUrl]) {
    return LOCAL_IMAGE_MAP[apiUrl]
  }
  
  // 尝试从代理URL中提取原始URL
  if (apiUrl.includes('/api/images/proxy/')) {
    try {
      const originalUrl = decodeURIComponent(apiUrl.split('/api/images/proxy/')[1])
      if (LOCAL_IMAGE_MAP[originalUrl]) {
        return LOCAL_IMAGE_MAP[originalUrl]
      }
    } catch (e) {
      console.warn('无法解析代理URL:', apiUrl)
    }
  }
  
  return null
}

/**
 * 判断是否是最近上传的图片
 */
function isRecentUpload(url: string): boolean {
  // 检查URL中是否包含最近的时间戳
  const currentTime = Date.now()
  const oneWeekAgo = currentTime - (7 * 24 * 60 * 60 * 1000)
  
  // 从URL中提取时间戳
  const timestampMatch = url.match(/(\d{13})/g) // 13位时间戳
  if (timestampMatch) {
    const timestamp = parseInt(timestampMatch[0])
    return timestamp > oneWeekAgo
  }
  
  return false
}

/**
 * 为新上传图片预加载和缓存
 */
export function preloadNewImages(urls: string[]): void {
  urls.forEach(url => {
    const strategy = getSmartImageUrl(url)
    if (strategy.strategy === 'api') {
      // 为新上传的图片创建预加载
      const img = new Image()
      img.loading = 'eager'
      img.src = strategy.primaryUrl
      console.log('🚀 预加载新图片:', url)
    }
  })
}

/**
 * 预加载所有本地映射的图片，提升静态图片的加载速度
 */
export function preloadLocalMappedImages(): void {
  if (typeof window === 'undefined') return
  
  Object.values(LOCAL_IMAGE_MAP).forEach(localPath => {
    const img = new Image()
    img.loading = 'eager'
    img.src = localPath
    console.log('📦 预加载本地映射图片:', localPath)
  })
}

/**
 * 获取优化的图片加载属性
 */
export function getImageLoadingProps(url: string) {
  const strategy = getSmartImageUrl(url)
  
  return {
    src: strategy.primaryUrl,
    loading: strategy.isLocal ? 'lazy' : 'eager', // 本地图片可以lazy，远程图片eager
    fetchPriority: strategy.isLocal ? 'auto' : 'high', // 远程图片高优先级
    strategy: strategy.strategy
  }
}