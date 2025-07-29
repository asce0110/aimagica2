"use client"

import { useState, useEffect } from 'react'

interface SimpleHeroImage {
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
 * 简化版Hero图片Hook - 专注稳定性，避免复杂逻辑
 */
export function useSimpleHeroImages() {
  const [images, setImages] = useState<SimpleHeroImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 静态备用图片 - 确保总是有内容
  const fallbackImages: SimpleHeroImage[] = [
    {
      id: 'fallback-1',
      url: '/images/hero-cache/hero-1-japanese-anime.png',
      title: 'Japanese Anime Style',
      author: 'AIMAGICA User',
      createdAt: '最近',
      prompt: 'Japanese Anime Style',
      style: 'Anime',
      rotation: 2.5
    },
    {
      id: 'fallback-2', 
      url: '/images/hero-cache/hero-2-cyberpunk-city.jpeg',
      title: 'Cyberpunk City',
      author: 'AIMAGICA User',
      createdAt: '最近',
      prompt: 'A cyberpunk city with neon lights',
      style: 'Cyberpunk',
      rotation: -1.2
    },
    {
      id: 'fallback-3',
      url: '/images/hero-cache/hero-3-zen-garden.jpeg',
      title: 'Zen Garden',
      author: 'AIMAGICA User',
      createdAt: '最近',
      prompt: 'A peaceful zen garden',
      style: 'Photography',
      rotation: 1.8
    },
    {
      id: 'fallback-4',
      url: '/images/hero-cache/hero-4-digital-art.png',
      title: 'Digital Art',
      author: 'AIMAGICA User',
      createdAt: '最近',
      prompt: 'Beautiful digital artwork',
      style: 'Digital Art',
      rotation: -2.1
    }
  ]

  useEffect(() => {
    // 立即设置备用图片，避免任何延迟
    setImages(fallbackImages)
    setIsLoading(false)
    setError(null)
    
    console.log('✅ Hero图片已设置为静态备用图片')
  }, [])

  return {
    images,
    isLoading,
    error,
    cacheStatus: 'fallback' as const,
    lastUpdate: new Date(),
    isRefreshing: false
  }
}