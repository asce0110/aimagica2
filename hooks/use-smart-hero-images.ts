"use client"

import { useState, useEffect, useMemo } from 'react'

interface HeroImage {
  id: string
  url: string
  title: string
  author: string
  createdAt: string
  prompt: string
  style: string
  rotation: number
  isCached?: boolean
  originalUrl?: string
}

interface CacheOptions {
  maxAge: number // 缓存最大时间(分钟)
  fallbackImages: HeroImage[] // 备用图片
}

/**
 * 智能Hero图片管理Hook - 平衡实时性和性能
 * 
 * 策略:
 * 1. 立即显示缓存/备用图片 (0延迟)
 * 2. 后台获取最新API数据
 * 3. 智能更新: 如果有新图片才替换
 * 4. 缓存最新数据供下次使用
 */
export function useSmartHeroImages(options: CacheOptions) {
  const [images, setImages] = useState<HeroImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'live' | 'fallback'>('fallback')

  // 缓存键
  const CACHE_KEY = 'hero_images_cache'
  const CACHE_TIME_KEY = 'hero_images_cache_time'

  // 检查缓存是否过期
  const isCacheExpired = (cacheTime: string): boolean => {
    const now = Date.now()
    const cached = parseInt(cacheTime)
    const ageMinutes = (now - cached) / (1000 * 60)
    return ageMinutes > options.maxAge
  }

  // 从localStorage获取缓存
  const getCachedImages = (): HeroImage[] | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const cacheTime = localStorage.getItem(CACHE_TIME_KEY)
      
      if (!cached || !cacheTime) return null
      
      if (isCacheExpired(cacheTime)) {
        console.log('🕐 Hero图片缓存已过期')
        return null
      }
      
      const parsedImages = JSON.parse(cached)
      console.log('✅ 使用Hero图片缓存:', parsedImages.length, '张')
      return parsedImages
    } catch (error) {
      console.warn('⚠️ 读取Hero缓存失败:', error)
      return null
    }
  }

  // 保存到localStorage
  const saveCachedImages = (newImages: HeroImage[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newImages))
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
      console.log('💾 Hero图片已缓存:', newImages.length, '张')
    } catch (error) {
      console.warn('⚠️ 保存Hero缓存失败:', error)
    }
  }

  // 从API获取最新图片
  const fetchLatestImages = async (): Promise<HeroImage[]> => {
    // 尝试多个API端点
    const apiUrls = [
      process.env.NEXT_PUBLIC_WORKERS_URL,
      'https://api-worker.aimagica.pages.dev',
      'https://aimagica.com/api'
    ].filter(Boolean)
    
    let lastError: Error | null = null
    
    for (const baseUrl of apiUrls) {
      try {
        const apiUrl = `${baseUrl}/api/gallery/public`
        console.log('🔗 尝试API端点:', apiUrl)
        
        // 创建超时控制器
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(`${apiUrl}?limit=4&featured=true&sort=latest`, {
          headers: {
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`API调用失败: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (!result.success || !result.data || result.data.length === 0) {
          throw new Error('API返回数据为空')
        }
        
        console.log('✅ API调用成功:', result.data.length, '张图片')
        
        return result.data.map((item: any, index: number) => ({
          id: item.id || `api-${index}`,
          url: item.originalUrl || item.url || item.image_url,
          title: item.title || item.prompt?.substring(0, 50) + "..." || "AI Creation",
          author: item.author || item.user_name || "AI Artist",
          createdAt: item.createdAt || item.created_at || "Recently",
          prompt: item.prompt || "Amazing AI artwork",
          style: item.style || "Digital Art",
          rotation: Math.random() * 4 - 2,
          originalUrl: item.originalUrl || item.url || item.image_url
        }))
      } catch (error) {
        console.warn(`⚠️ API端点失败: ${baseUrl}`, error)
        lastError = error as Error
        continue
      }
    }
    
    throw lastError || new Error('所有API端点都失败了')
  }

  // 比较图片是否有变化
  const hasImagesChanged = (oldImages: HeroImage[], newImages: HeroImage[]): boolean => {
    if (oldImages.length !== newImages.length) return true
    
    // 比较前3张图片的ID
    for (let i = 0; i < Math.min(3, oldImages.length); i++) {
      if (oldImages[i].id !== newImages[i].id) {
        return true
      }
    }
    
    return false
  }

  // 初始化加载
  useEffect(() => {
    const initializeImages = async () => {
      try {
        console.log('🚀 初始化Hero图片...')
        
        // 1. 立即显示缓存或备用图片
        const cachedImages = getCachedImages()
        if (cachedImages && cachedImages.length > 0) {
          setImages(cachedImages)
          setCacheStatus('cached')
          setIsLoading(false)
          setLastUpdate(new Date())
          console.log('⚡ 立即显示缓存图片')
        } else {
          setImages(options.fallbackImages)
          setCacheStatus('fallback')
          setIsLoading(false)
          console.log('⚡ 立即显示备用图片')
        }
        
        // 2. 后台获取最新数据（添加延迟避免阻塞初始渲染）
        setTimeout(async () => {
          try {
            setIsRefreshing(true)
            console.log('🔄 后台获取最新Hero图片...')
            
            const latestImages = await fetchLatestImages()
            console.log('✅ 获取到最新图片:', latestImages.length)
            
            // 3. 智能更新策略
            const currentImages = cachedImages || options.fallbackImages
            const shouldUpdate = hasImagesChanged(currentImages, latestImages)
            
            if (shouldUpdate) {
              console.log('🔄 检测到新图片，更新Hero区域')
              setImages(latestImages)
              setCacheStatus('live')
              saveCachedImages(latestImages)
            } else {
              console.log('✅ 图片无变化，保持当前显示')
              // 即使无变化也更新缓存时间
              if (cachedImages) {
                saveCachedImages(cachedImages)
              }
            }
            
            setLastUpdate(new Date())
            
          } catch (error) {
            console.warn('⚠️ 获取最新Hero图片失败:', error)
            // API失败时保持当前显示的图片，不做任何改变
          } finally {
            setIsRefreshing(false)
          }
        }, 1000) // 延迟1秒执行，确保页面已渲染
        
      } catch (error) {
        console.error('❌ Hero图片初始化失败:', error)
        // 确保总是有fallback图片
        setImages(options.fallbackImages)
        setCacheStatus('fallback')
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
    
    initializeImages()
  }, [])

  // 手动刷新
  const refreshImages = async () => {
    if (isRefreshing) return
    
    try {
      setIsRefreshing(true)
      console.log('🔄 手动刷新Hero图片...')
      
      const latestImages = await fetchLatestImages()
      setImages(latestImages)
      setCacheStatus('live')
      saveCachedImages(latestImages)
      setLastUpdate(new Date())
      
      console.log('✅ Hero图片刷新完成')
    } catch (error) {
      console.error('❌ 刷新Hero图片失败:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // 清除缓存
  const clearCache = () => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIME_KEY)
    console.log('🗑️ Hero图片缓存已清除')
  }

  return {
    images,
    isLoading,
    isRefreshing,
    cacheStatus,
    lastUpdate,
    refreshImages,
    clearCache,
    cacheInfo: {
      maxAge: options.maxAge,
      isExpired: lastUpdate ? (Date.now() - lastUpdate.getTime()) / (1000 * 60) > options.maxAge : false
    }
  }
}