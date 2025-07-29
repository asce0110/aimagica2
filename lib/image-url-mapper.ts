/**
 * 图片URL映射器
 * 将R2存储的URL转换为本地可访问的URL
 */

import { useStaticUrl } from '@/hooks/use-static-url'

// 图片URL映射配置 - 直接内嵌，避免动态加载问题
const imageUrlMapping: Record<string, string> = {
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1750949808349_Japanese_Anime_Style.png": "/images/gallery/386628e0-61b1-4966-8575-2c2f2f162e3a-f897c7ae.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1750862975446_A_cyberpunk_city_with_neon_lig.jpeg": "/images/gallery/48a8804f-9028-4132-85dd-d5c4d807c75e-13630e73.jpeg",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1750861881556_A_peaceful_zen_garden_with_che.jpeg": "/images/gallery/9912c424-e6a2-4ac1-98de-77bac4200978-fbd736fa.jpeg",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Ftempfile.aiquickdraw.com%2Fv%2F68f5527672694583a3f90d9dbaec819f_0_1750696712.png": "/images/gallery/294ff75d-8579-4d3d-87ee-811b69b15a99-5479e3c7.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1749971728392_________.png": "/images/gallery/5abb0316-b1d9-4c3a-ac97-76fcbe63f52b-fbb64e00.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1749919511990________________.png": "/images/gallery/2afbdc00-d083-46bf-8167-28d81971226f-fb48974a.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1749916206895_____.png": "/images/gallery/04033a15-7dfc-4b96-8999-91e6915ac926-34c9105b.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1749915657307______.png": "/images/gallery/b3a47ac4-6386-41b1-8702-de4cf5ff03c1-38528305.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F115340097862236142261%2F1749913956478________.png": "/images/gallery/82db65f1-d54e-4f7f-a9c3-c3f5e902643b-d36a1d13.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fgallery%2F105948948301872216168%2F1749885738447_AI_Generated_Artwork.png": "/images/gallery/22ab8354-87e8-4a74-a37b-c3f08f1ced20-286738dd.png",
  "https://aimagica-api.403153162.workers.dev/api/images/proxy/https%3A%2F%2Fimages.aimagica.ai%2Fadmin_uploads%2F105948948301872216168%2F1749364319065_ee1d327b665d45f5bbb133de6849b6.png": "/images/gallery/341851d0-7c3b-4119-b503-102c0aee0d8f-b4209676.png"
}

/**
 * 加载图片URL映射 - 现在是同步的
 */
export async function loadImageUrlMapping() {
  console.log('✅ 图片URL映射已内嵌加载:', Object.keys(imageUrlMapping).length)
}

/**
 * 转换图片URL为本地可访问的URL
 */
export function mapImageUrl(originalUrl: string): string {
  // 如果是本地图片或示例图片，直接返回
  if (!originalUrl || 
      originalUrl.startsWith('/') || 
      originalUrl.includes('/images/examples/') ||
      originalUrl.includes('/images/placeholder')) {
    return originalUrl
  }

  // 检查映射表（用于代理URL的映射）
  if (imageUrlMapping[originalUrl]) {
    console.log(`🗺️ 使用URL映射: ${originalUrl} -> ${imageUrlMapping[originalUrl]}`)
    return imageUrlMapping[originalUrl]
  }

  // 如果是代理URL，尝试提取原始URL（优先处理，避免被R2检查拦截）
  if (originalUrl.includes('/api/images/proxy/')) {
    try {
      const encoded = originalUrl.split('/api/images/proxy/').pop()
      if (encoded) {
        const decoded = decodeURIComponent(encoded)
        console.log(`🔄 从代理URL解码原始URL: ${decoded}`)
        // 递归处理解码后的URL
        return mapImageUrl(decoded)
      }
    } catch (error) {
      console.warn('解码代理URL失败:', error)
    }
  }

  // 如果是直接的R2 URL (images.aimagica.ai)，优先直接使用
  if (originalUrl.includes('images.aimagica.ai')) {
    console.log(`✅ 直接使用R2 URL: ${originalUrl}`)
    return originalUrl
  }

  // 如果是其他R2存储的URL，尝试fallback策略
  if (originalUrl.includes('.r2.cloudflarestorage.com')) {
    const imageId = extractImageIdFromUrl(originalUrl)
    if (imageId) {
      const localPath = `/images/gallery/${imageId}.jpg`
      console.log(`🔄 尝试fallback: ${originalUrl} -> ${localPath}`)
      return localPath
    }
  }

  // 最终fallback到示例图片
  const fallbackImages = [
    '/images/examples/magic-forest.svg',
    '/images/examples/cyber-city.svg',
    '/images/examples/space-art.svg',
    '/images/examples/cat-wizard.svg'
  ]
  
  const hash = simpleHash(originalUrl)
  const fallbackUrl = fallbackImages[hash % fallbackImages.length]
  console.log(`🎯 最终fallback: ${originalUrl} -> ${fallbackUrl}`)
  
  return fallbackUrl
}

/**
 * 从URL中提取图片ID
 */
function extractImageIdFromUrl(url: string): string | null {
  try {
    // 尝试从代理URL中提取
    if (url.includes('/api/images/proxy/')) {
      const encoded = url.split('/api/images/proxy/').pop()
      if (encoded) {
        const decoded = decodeURIComponent(encoded)
        return extractImageIdFromUrl(decoded)
      }
    }

    // 尝试从R2 URL中提取
    const match = url.match(/\/([^\/]+)\.(jpg|jpeg|png|webp|gif)$/i)
    if (match) {
      return match[1]
    }

    // 尝试从路径中提取ID
    const pathMatch = url.match(/\/([a-zA-Z0-9\-]+)$/)
    if (pathMatch) {
      return pathMatch[1]
    }

    return null
  } catch (error) {
    return null
  }
}

/**
 * 简单哈希函数
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash)
}

/**
 * React Hook for image URL mapping
 */
export function useImageUrl(originalUrl: string): string {
  const mappedUrl = mapImageUrl(originalUrl)
  const staticUrl = useStaticUrl(mappedUrl)
  return staticUrl
}

/**
 * 预热图片映射（在应用启动时调用）
 */
export function preloadImageMapping() {
  if (typeof window !== 'undefined') {
    loadImageUrlMapping()
  }
}