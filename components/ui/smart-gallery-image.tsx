"use client"

import { useState } from "react"
import { useImageUrl } from "@/lib/image-url-mapper"
import useStaticUrl from "@/hooks/use-static-url"

interface SmartGalleryImageProps {
  originalUrl: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  fallbackImages?: string[]
  index?: number
}

/**
 * 智能Gallery图片组件
 * 自动处理URL映射和fallback策略
 */
export default function SmartGalleryImage({
  originalUrl,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad,
  fallbackImages = [
    '/images/examples/magic-forest.svg',
    '/images/examples/cyber-city.svg',
    '/images/examples/space-art.svg',
    '/images/examples/cat-wizard.svg'
  ],
  index = 0
}: SmartGalleryImageProps) {
  const [hasError, setHasError] = useState(false)
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(-1)
  
  // 使用URL映射器处理图片URL
  const mappedUrl = useImageUrl(originalUrl)
  
  // 获取fallback图片URL
  const fallbackUrl = useStaticUrl(
    fallbackImages[currentFallbackIndex >= 0 ? currentFallbackIndex : index % fallbackImages.length]
  )
  
  // 最终使用的URL
  const finalUrl = hasError || currentFallbackIndex >= 0 ? fallbackUrl : mappedUrl
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`🖼️ 图片加载失败:`, {
      originalUrl,
      mappedUrl,
      currentUrl: finalUrl,
      fallbackIndex: currentFallbackIndex
    })
    
    if (currentFallbackIndex < fallbackImages.length - 1) {
      // 尝试下一个fallback图片
      setCurrentFallbackIndex(prev => prev + 1)
    } else {
      // 所有fallback都失败了
      setHasError(true)
    }
    
    // 调用外部错误处理器
    onError?.(e)
  }
  
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`✅ 图片加载成功:`, {
      originalUrl,
      finalUrl,
      wasError: hasError || currentFallbackIndex >= 0
    })
    
    // 调用外部加载处理器
    onLoad?.(e)
  }
  
  return (
    <img
      src={finalUrl}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      onLoad={handleLoad}
      crossOrigin="anonymous"
      decoding="async"
    />
  )
}