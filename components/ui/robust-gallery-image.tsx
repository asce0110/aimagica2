"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Image from "next/image"

interface RobustGalleryImageProps {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  fallbackSrc?: string
  retryCount?: number
  showPlaceholder?: boolean
}

/**
 * 健壮的Gallery图片组件 - 解决加载不稳定问题
 * 
 * 功能特性:
 * 1. 多重fallback机制
 * 2. 自动重试加载
 * 3. 浏览器缓存优化
 * 4. 渐进式加载体验
 * 5. 错误状态处理
 */
export default function RobustGalleryImage({
  src,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad,
  fallbackSrc,
  retryCount = 2,
  showPlaceholder = true
}: RobustGalleryImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set())
  
  const imageRef = useRef<HTMLImageElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()

  // 生成fallback URL列表
  const fallbackUrls = useMemo(() => {
    const urls: string[] = []
    
    // 原始URL
    if (src) urls.push(src)
    
    // 添加缓存破坏参数
    if (src && !src.includes('?')) {
      urls.push(`${src}?v=${Date.now()}`)
    }
    
    // 自定义fallback
    if (fallbackSrc) urls.push(fallbackSrc)
    
    // 默认占位符
    urls.push('/images/placeholder.svg')
    urls.push('/placeholder.svg')
    urls.push("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23666' text-anchor='middle' dy='.3em'%3E图片加载中...%3C/text%3E%3C/svg%3E")
    
    return urls
  }, [src, fallbackSrc])

  // 重置状态当src改变时
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src)
      setHasError(false)
      setIsLoading(true)
      setRetryAttempts(0)
      
      // 清除重试定时器
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [src])

  // 预加载图片
  useEffect(() => {
    if (currentSrc && !loadedSources.has(currentSrc)) {
      const img = new window.Image()
      img.onload = () => {
        setLoadedSources(prev => new Set([...prev, currentSrc]))
        console.log(`✅ 预加载成功: ${currentSrc}`)
      }
      img.onerror = () => {
        console.warn(`⚠️ 预加载失败: ${currentSrc}`)
      }
      img.src = currentSrc
    }
  }, [currentSrc, loadedSources])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    console.error(`❌ 图片加载失败: ${target.src}`)
    console.error('错误详情:', e)
    
    // 尝试下一个fallback URL
    const currentIndex = fallbackUrls.indexOf(currentSrc)
    const nextIndex = currentIndex + 1
    
    if (nextIndex < fallbackUrls.length && retryAttempts < retryCount) {
      const nextUrl = fallbackUrls[nextIndex]
      console.log(`🔄 尝试fallback (${retryAttempts + 1}/${retryCount}): ${nextUrl}`)
      
      setRetryAttempts(prev => prev + 1)
      setCurrentSrc(nextUrl)
      setIsLoading(true)
      
      // 延迟重试避免过快的连续请求
      retryTimeoutRef.current = setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.src = nextUrl
        }
      }, 500)
      
      return
    }
    
    // 所有fallback都失败了
    console.error(`💥 所有图片源都失败了: ${alt}`)
    setHasError(true)
    setIsLoading(false)
    onError?.(e)
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    console.log(`✅ 图片加载成功: ${target.src}`)
    
    setIsLoading(false)
    setHasError(false)
    setLoadedSources(prev => new Set([...prev, target.src]))
    onLoad?.(e)
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  // 错误状态渲染
  if (hasError && !showPlaceholder) {
    return null
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-100 flex flex-col items-center justify-center p-4`}>
        <div className="text-gray-400 text-sm text-center">
          <div className="w-12 h-12 bg-gray-300 rounded-lg mb-2 flex items-center justify-center">
            📷
          </div>
          <div>图片无法加载</div>
          <div className="text-xs text-gray-300 mt-1">{alt}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* 加载状态 - 始终显示占位符，避免白屏 */}
      {isLoading && (
        <div className={`absolute inset-0 ${className} bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10`}>
          <div className="text-gray-400 text-xs flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-lg mb-2 animate-pulse flex items-center justify-center">
              📷
            </div>
            <div className="font-medium">加载中...</div>
            {retryAttempts > 0 && (
              <div className="text-xs text-gray-300 mt-1 animate-bounce">
                重试 {retryAttempts}/{retryCount}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 实际图片 - 始终渲染，用opacity控制显示 */}
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        className={className}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          imageRendering: 'auto',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)' // 启用硬件加速
        }}
        // 添加图片优化属性
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        decoding="async"
        // 重要：添加crossOrigin以改善缓存行为
        crossOrigin="anonymous"
        // 添加referrerPolicy以改善兼容性
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}