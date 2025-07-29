"use client"

import { useState, useEffect } from "react"
import MagicLoading from "./magic-loading"

interface MagicImageProps {
  src: string
  alt: string
  className?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  loadingMessage?: string
  onError?: () => void
  priority?: boolean
  width?: number
  height?: number
  sizes?: string
  style?: React.CSSProperties
}

export default function MagicImage({
  src,
  alt,
  className = "",
  objectFit = "cover",
  loadingMessage = "Loading image...",
  onError,
  priority = false,
  width,
  height,
  sizes,
  style
}: MagicImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // 重置状态当src改变时
    setIsLoading(true)
    setHasError(false)
    setImageLoaded(false)
  }, [src])

  const handleLoad = () => {
    console.log(`✅ Image loaded successfully: ${src}`)
    setIsLoading(false)
    setImageLoaded(true)
  }

  const handleError = () => {
    console.error(`❌ Image failed to load: ${src}`)
    setIsLoading(false)
    setHasError(true)
    if (onError) {
      onError()
    }
  }

  const imageClassName = `
    ${className}
    ${isLoading ? 'opacity-0' : 'opacity-100'}
    transition-opacity duration-300
  `.trim()

  return (
    <div className="relative w-full h-full">
      {/* 加载状态 */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5f1e8] to-[#d4a574]/20">
          <MagicLoading 
            size="small" 
            message={loadingMessage}
            showMessage={false}
          />
        </div>
      )}

      {/* 错误状态 */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f1e8] to-[#d4a574]/20 text-[#8b7355]">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm font-bold text-center font-accent">
            Image unavailable
          </div>
        </div>
      )}

      {/* 实际图片 - 使用原生img标签解决兼容性问题 */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          style={{
            objectFit,
            width: '100%',
            height: '100%',
            ...style
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          crossOrigin="anonymous"
        />
      )}
    </div>
  )
} 