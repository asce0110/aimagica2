"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import ImageCompressionDialog from "@/components/ui/image-compression-dialog"
import type { CompressionResult } from "@/lib/image-compression"

interface ShareToGalleryButtonProps {
  imageUrl: string
  imagePrompt?: string
  styleId?: string | null
  onShareComplete?: (success: boolean, error?: string) => void
  className?: string
  disabled?: boolean
}

type ShareStatus = 'idle' | 'compressing' | 'uploading' | 'success' | 'error'

export default function ShareToGalleryButton({
  imageUrl,
  imagePrompt = "",
  styleId = null,
  onShareComplete,
  className = "",
  disabled = false
}: ShareToGalleryButtonProps) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle')
  const [showCompressionDialog, setShowCompressionDialog] = useState(false)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleShareClick = async () => {
    try {
      setShareStatus('compressing')
      setError(null)
      
      // 下载图片并转换为File对象
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      
      const blob = await response.blob()
      const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: blob.type })
      
      setOriginalFile(file)
      setShowCompressionDialog(true)
      setShareStatus('idle')
      
    } catch (err) {
      console.error('Error preparing image for compression:', err)
      setError(err instanceof Error ? err.message : 'Failed to prepare image')
      setShareStatus('error')
      onShareComplete?.(false, error || undefined)
    }
  }

  const handleCompressionComplete = async (compressionResult: CompressionResult) => {
    try {
      setShareStatus('uploading')
      setShowCompressionDialog(false)
      
      // 上传到画廊的API调用
      const formData = new FormData()
      formData.append('image', compressionResult.compressedFile)
      formData.append('prompt', imagePrompt)
      formData.append('style_id', styleId || '')
      formData.append('compression_info', JSON.stringify({
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        compressionRatio: compressionResult.compressionRatio,
        format: compressionResult.format,
        dimensions: compressionResult.dimensions
      }))
      
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }
      
      const result = await response.json()
      console.log('✅ Image uploaded to gallery:', result)
      
      setShareStatus('success')
      onShareComplete?.(true)
      
      // 3秒后重置状态
      setTimeout(() => {
        setShareStatus('idle')
      }, 3000)
      
    } catch (err) {
      console.error('❌ Gallery upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setShareStatus('error')
      onShareComplete?.(false, error || undefined)
      
      // 5秒后重置状态
      setTimeout(() => {
        setShareStatus('idle')
        setError(null)
      }, 5000)
    }
  }

  const getButtonContent = () => {
    switch (shareStatus) {
      case 'compressing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Preparing...
          </>
        )
      case 'uploading':
        return (
          <>
            <Upload className="w-4 h-4 mr-2 animate-bounce" />
            Uploading...
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Shared!
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed
          </>
        )
      default:
        return (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Share to Gallery
          </>
        )
    }
  }

  const getButtonStyle = () => {
    switch (shareStatus) {
      case 'success':
        return "bg-green-500 hover:bg-green-600 text-white"
      case 'error':
        return "bg-red-500 hover:bg-red-600 text-white"
      case 'compressing':
      case 'uploading':
        return "bg-[#8b7355] text-white cursor-wait"
      default:
        return "bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d]"
    }
  }

  const isButtonDisabled = disabled || ['compressing', 'uploading'].includes(shareStatus)

  return (
    <>
      <Button
        onClick={handleShareClick}
        disabled={isButtonDisabled}
        className={`font-black rounded-xl transition-all transform hover:scale-105 ${getButtonStyle()} ${className}`}
        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
      >
        {getButtonContent()}
      </Button>

      {/* 显示错误信息 */}
      {error && shareStatus === 'error' && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-xs font-bold">{error}</p>
        </div>
      )}

      {/* 图片压缩对话框 */}
      <ImageCompressionDialog
        isOpen={showCompressionDialog}
        onClose={() => {
          setShowCompressionDialog(false)
          setShareStatus('idle')
        }}
        onCompressionComplete={handleCompressionComplete}
        originalFile={originalFile}
        title="🖼️ Optimize for Gallery"
        description="Compress your AI artwork before sharing to the gallery"
      />
    </>
  )
}