"use client"

import { useState, useEffect, useMemo } from 'react'

interface CachedImage {
  id: string
  originalUrl: string
  cachedUrl: string
  filename: string
  isAvailable: boolean
}

interface HeroImage {
  id: string
  url: string
  title: string
  author: string
  createdAt: string
  prompt: string
  style: string
  rotation: number
}

/**
 * Hero图片缓存Hook - 优先使用本地缓存，提升加载速度
 */
export function useCachedHeroImages() {
  const [cachedMapping, setCachedMapping] = useState<Record<string, CachedImage>>({})
  const [isLoading, setIsLoading] = useState(true)
  
  // 静态Hero图片数据
  const staticHeroImages: HeroImage[] = useMemo(() => [
    {
      id: '386628e0-61b1-4966-8575-2c2f2f162e3a',
      url: 'https://images.aimagica.ai/gallery/105948948301872216168/1750949808349_Japanese_Anime_Style.png',
      title: 'Japanese Anime Style',
      author: 'AIMAGICA User',
      createdAt: '6/26/2025',
      prompt: 'Japanese Anime Style',
      style: 'Anime',
      rotation: 2.5
    },
    {
      id: '48a8804f-9028-4132-85dd-d5c4d807c75e',
      url: 'https://images.aimagica.ai/gallery/105948948301872216168/1750862975446_A_cyberpunk_city_with_neon_lig.jpeg',
      title: 'Cyberpunk City with Neon Lights',
      author: 'AIMAGICA User',
      createdAt: '6/25/2025',
      prompt: 'A cyberpunk city with neon lights reflecting in the rain',
      style: 'Chibi Diorama',
      rotation: -1.2
    },
    {
      id: '9912c424-e6a2-4ac1-98de-77bac4200978',
      url: 'https://images.aimagica.ai/gallery/105948948301872216168/1750861881556_A_peaceful_zen_garden_with_che.jpeg',
      title: 'Peaceful Zen Garden',
      author: 'AIMAGICA User',
      createdAt: '6/24/2025',
      prompt: 'A peaceful zen garden with cherry blossoms',
      style: 'Photography',
      rotation: 1.8
    },
    {
      id: '294ff75d-8579-4d3d-87ee-811b69b15a99',
      url: 'https://tempfile.aiquickdraw.com/v/68f5527672694583a3f90d9dbaec819f_0_1750696712.png',
      title: 'Digital Art Creation',
      author: 'AIMAGICA User',
      createdAt: '6/23/2025',
      prompt: 'Beautiful digital artwork with vibrant colors',
      style: 'Digital Art',
      rotation: -2.1
    }
  ], [])
  
  // 加载缓存映射
  useEffect(() => {
    const loadCacheMapping = async () => {
      try {
        // 尝试加载缓存映射文件
        const response = await fetch('/hero-cache-mapping.json')
        if (response.ok) {
          const mapping = await response.json()
          console.log('✅ 加载Hero缓存映射:', Object.keys(mapping).length, '张图片')
          
          // 验证每个缓存文件是否真的存在
          const verifiedMapping: Record<string, CachedImage> = {}
          for (const [id, item] of Object.entries(mapping)) {
            try {
              const cacheResponse = await fetch((item as any).cachedUrl, { method: 'HEAD' })
              verifiedMapping[id] = {
                ...(item as any),
                isAvailable: cacheResponse.ok
              }
              if (cacheResponse.ok) {
                console.log(`✅ 缓存文件可用: ${(item as any).filename}`)
              }
            } catch (error) {
              console.warn(`⚠️ 缓存文件不可用: ${(item as any).filename}`)
              verifiedMapping[id] = {
                ...(item as any),
                isAvailable: false
              }
            }
          }
          
          setCachedMapping(verifiedMapping)
        } else {
          console.log('ℹ️ 未找到缓存映射文件，使用远程图片')
        }
      } catch (error) {
        console.warn('⚠️ 加载缓存映射失败，使用远程图片:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCacheMapping()
  }, [])
  
  // 获取优化后的图片数据
  const optimizedImages = useMemo(() => {
    return staticHeroImages.map(img => {
      const cached = cachedMapping[img.id]
      
      // 优先使用缓存图片
      if (cached && cached.isAvailable) {
        return {
          ...img,
          url: cached.cachedUrl,
          isCached: true,
          originalUrl: cached.originalUrl
        }
      }
      
      // 使用原始远程图片
      return {
        ...img,
        isCached: false,
        originalUrl: img.url
      }
    })
  }, [staticHeroImages, cachedMapping])
  
  // 预加载缓存图片
  useEffect(() => {
    if (!isLoading && optimizedImages.length > 0) {
      optimizedImages.forEach((img, index) => {
        if (img.isCached && index < 2) { // 只预加载前2张
          const preloadImg = new Image()
          preloadImg.src = img.url
          console.log(`🚀 预加载缓存图片: ${img.title}`)
        }
      })
    }
  }, [optimizedImages, isLoading])
  
  return {
    images: optimizedImages,
    isLoading,
    cacheStatus: {
      total: staticHeroImages.length,
      cached: optimizedImages.filter(img => img.isCached).length,
      remote: optimizedImages.filter(img => !img.isCached).length
    }
  }
}