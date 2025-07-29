"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  loading?: 'eager' | 'lazy'
  quality?: number
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  className = '',
  fill = false,
  width,
  height,
  priority = false,
  loading = 'lazy',
  quality = 85,
  sizes,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // 如果是priority，立即加载
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  // 处理图片加载错误
  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
    } else {
      setHasError(true)
      onError?.()
    }
  }

  // 处理图片加载成功
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // 检查是否为外部URL
  const isExternalUrl = currentSrc.startsWith('http')

  // 如果还没有进入视口且不是priority，显示占位符
  if (!isInView && !priority) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  // 如果是外部URL，使用普通img标签避免Next.js的域名限制
  if (isExternalUrl) {
    return (
      <div ref={imgRef} className={`relative ${className}`}>
        <img
          src={currentSrc}
          alt={alt}
          className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={fill ? undefined : { width, height }}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
        {!isLoaded && (
          <div 
            className={`${fill ? 'absolute inset-0' : ''} bg-gray-200 animate-pulse flex items-center justify-center`}
            style={fill ? undefined : { width, height }}
          >
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}
      </div>
    )
  }

  // 对于本地图片，使用Next.js的Image组件
  return (
    <div ref={imgRef} className="relative">
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        priority={priority}
        loading={loading}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
} 