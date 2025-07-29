"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface FeaturedImage {
  id: string
  title: string
  prompt: string
  url: string
  originalUrl?: string
  image_url?: string
  style: string
  created_at: string
  featured_at?: string
}

export default function FeaturedImages() {
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadFeaturedImages()
  }, [])

  const loadFeaturedImages = async () => {
    try {
      // 尝试从API加载，失败时fallback到静态JSON
      let response = await fetch('/api/featured-images')
      let result: any
      
      if (response.ok) {
        try {
          result = await response.json()
        } catch (parseError) {
          console.warn('API response not JSON, trying static fallback')
          throw new Error('Invalid JSON response')
        }
      } else {
        throw new Error(`API responded with status ${response.status}`)
      }
      
      if (result.success) {
        // 确保所有图片都优先使用originalUrl (R2直链)
        const processedImages = result.data.map((item: any) => ({
          ...item,
          url: item.originalUrl || item.url || item.image_url || "/placeholder.svg"
        }))
        setFeaturedImages(processedImages)
      } else {
        throw new Error(result.error || 'API returned unsuccessful response')
      }
    } catch (error) {
      console.warn('Primary API failed, trying static fallback:', error)
      
      // Fallback to static JSON
      try {
        const fallbackResponse = await fetch('/api/featured-images.json')
        const fallbackResult = await fallbackResponse.json()
        
        if (fallbackResult.success) {
          const processedImages = fallbackResult.data.map((item: any) => ({
            ...item,
            url: item.originalUrl || item.url || item.image_url || "/placeholder.svg"
          }))
          setFeaturedImages(processedImages)
          console.log('✅ Loaded featured images from static fallback')
        }
      } catch (fallbackError) {
        console.error('Both API and fallback failed:', fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 如果没有精选图片，不显示任何内容
  if (!isLoading && featuredImages.length === 0) {
    return null
  }

  // 最多显示12张图片
  const displayImages = featuredImages.slice(0, 12)

  // 动态分组图片到5列
  const columns = []
  const imagesPerColumn = Math.ceil(displayImages.length / 5)
  
  for (let i = 0; i < 5; i++) {
    const start = i * imagesPerColumn
    const end = Math.min(start + imagesPerColumn, displayImages.length)
    if (start < displayImages.length) {
      columns.push(displayImages.slice(start, end))
    } else {
      columns.push([])
    }
  }

  const aspectRatios = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-[5/4]', 'aspect-[4/5]']
  const rotations = [-2, 1, -1, 2, -1.5, 1.5, -0.5, 2.5, -2, 1, -1, 1.5]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, colIndex) => (
          <div key={colIndex} className="grid gap-4 md:gap-6">
            {Array.from({ length: 3 }).map((_, rowIndex) => {
              const index = colIndex * 3 + rowIndex
              return (
                <div
                  key={`loading-${index}`}
                  className="group cursor-pointer relative transform hover:scale-105 transition-all"
                  style={{ transform: `rotate(${rotations[index]}deg)` }}
                >
                  <div className={`${aspectRatios[index % aspectRatios.length]} w-full rounded-lg overflow-hidden shadow-xl relative bg-white border-4 border-[#2d3e2d]`}>
                    <div className="absolute inset-1 bg-white rounded-md overflow-hidden">
                      <div className="w-full h-full bg-[#f5f1e8] flex items-center justify-center animate-pulse">
                        <span className="text-[#8b7355] font-bold text-sm">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
      {columns.map((columnImages, colIndex) => (
        <div key={colIndex} className="grid gap-4 md:gap-6">
          {columnImages.map((image, rowIndex) => {
            // 计算在所有图片中的实际索引，用于旋转角度
            const imageIndex = displayImages.findIndex(img => img.id === image.id)
            
            return (
              <div
                key={image.id}
                className="group cursor-pointer relative transform hover:scale-105 transition-all"
                style={{ transform: `rotate(${rotations[imageIndex % rotations.length]}deg)` }}
                onClick={() => router.push('/gallery')}
              >
                <div className={`${aspectRatios[imageIndex % aspectRatios.length]} w-full rounded-lg overflow-hidden shadow-xl relative bg-white border-4 border-[#2d3e2d]`}>
                  <div className="absolute inset-1 bg-white rounded-md overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png'
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-2 text-white w-full">
                        <p className="text-xs font-bold truncate">{image.title}</p>
                        <p className="text-xs opacity-80">{image.style}</p>
                      </div>
                    </div>
                    {/* Featured badge */}
                    <div className="absolute top-1 right-1">
                      <div className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        ⭐
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
} 