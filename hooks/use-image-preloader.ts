import { useEffect, useState } from 'react'
import { imageCache } from '@/lib/image-cache'

interface UseImagePreloaderOptions {
  enabled?: boolean
  priority?: 'high' | 'low'
  delay?: number
}

export function useImagePreloader(
  images: string[], 
  options: UseImagePreloaderOptions = {}
) {
  const { enabled = true, priority = 'low', delay = 0 } = options
  const [isLoading, setIsLoading] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!enabled || images.length === 0) return

    const preloadImages = async () => {
      setIsLoading(true)
      setLoadedCount(0)
      setErrors([])

      // 如果设置了延迟，等待指定时间
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      console.log(`🚀 开始预加载 ${images.length} 张图片 (优先级: ${priority})`)

      const results = await Promise.allSettled(
        images.map(async (src, index) => {
          try {
            await imageCache.preloadImage(src)
            setLoadedCount(prev => prev + 1)
            return { success: true, src, index }
          } catch (error) {
            console.warn(`⚠️ 图片预加载失败: ${src}`, error)
            setErrors(prev => [...prev, src])
            return { success: false, src, index, error }
          }
        })
      )

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
      const failed = results.length - successful

      console.log(`✨ 图片预加载完成: ${successful}/${images.length} 成功, ${failed} 失败`)

      setIsLoading(false)
    }

    // 根据优先级决定何时开始预加载
    if (priority === 'high') {
      preloadImages()
    } else {
      // 低优先级：在下一个事件循环中执行
      setTimeout(preloadImages, 0)
    }
  }, [images.join(','), enabled, priority, delay]) // 使用 join(',') 来稳定化数组依赖

  return {
    isLoading,
    loadedCount,
    totalCount: images.length,
    progress: images.length > 0 ? (loadedCount / images.length) * 100 : 0,
    errors,
    hasErrors: errors.length > 0
  }
}

// 预定义的图片集合
export const IMAGE_SETS = {
  // 示例图片
  examples: [
    '/images/examples/cat-wizard.svg',
    '/images/examples/cyber-city.svg',
    '/images/examples/magic-forest.svg',
    '/images/examples/space-art.svg'
  ],
  
  // 占位符图片
  placeholders: [
    '/images/placeholder.svg',
    '/images/placeholder-error.svg'
  ],
  
  // 图标和装饰
  decorations: [
    '/images/decorations/sparkle.svg',
    '/images/decorations/star.svg'
  ]
}

// 获取所有预定义图片
export function getAllPreloadImages(): string[] {
  return [
    ...IMAGE_SETS.examples,
    ...IMAGE_SETS.placeholders,
    ...IMAGE_SETS.decorations
  ]
}

// 高优先级预加载Hook（用于关键图片）
export function useHighPriorityImagePreloader(images: string[]) {
  return useImagePreloader(images, { 
    enabled: true, 
    priority: 'high',
    delay: 0 
  })
}

// 低优先级预加载Hook（用于非关键图片）
export function useLowPriorityImagePreloader(images: string[], delay = 1000) {
  return useImagePreloader(images, { 
    enabled: true, 
    priority: 'low',
    delay 
  })
} 