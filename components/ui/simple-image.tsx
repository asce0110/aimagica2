"use client"

import { useState } from "react"
import useStaticUrl from "@/hooks/use-static-url"

interface SimpleImageProps {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * 超简单的图片组件 - 完全模仿Hero区域的成功模式
 * 
 * 特点：
 * 1. 只使用useStaticUrl处理URL，没有复杂逻辑
 * 2. 原生<img>标签，简单可靠
 * 3. 与Hero区域完全相同的处理方式
 */
export default function SimpleImage({
  src,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad
}: SimpleImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // 完全模仿Hero区域：只使用useStaticUrl处理URL
  const staticUrl = useStaticUrl(src)
  
  // 调试信息
  console.log(`🔍 SimpleImage处理URL:`, {
    originalSrc: src,
    staticUrl: staticUrl,
    alt: alt
  })
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`❌ SimpleImage 加载失败: ${src}`)
    setHasError(true)
    setIsLoading(false)
    onError?.(e)
  }
  
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`✅ SimpleImage 加载成功: ${src}`)
    setIsLoading(false)
    onLoad?.(e)
  }
  
  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
        <div className="text-center p-2">
          <div className="text-2xl mb-1">🖼️</div>
          <div className="text-xs text-gray-500 font-medium">Image unavailable</div>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center animate-pulse`}>
          <div className="text-center p-2">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs text-gray-400 font-medium">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={staticUrl}
        alt={alt}
        className={className}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        style={{ 
          display: isLoading ? 'none' : 'block',
          // 调试：强制显示，避免CSS隐藏
          opacity: hasError ? '0.3' : '1',
          backgroundColor: hasError ? 'red' : 'transparent'
        }}
        // 完全模仿Hero区域的属性设置
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        decoding="async"
      />
    </>
  )
}