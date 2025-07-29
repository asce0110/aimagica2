'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (result: UploadResult) => void
  onError?: (error: string) => void
  uploadType?: string
  maxSize?: number
  accept?: string
  className?: string
  disabled?: boolean
  showPreview?: boolean
}

interface UploadResult {
  fileName: string
  url: string
  size: number
  type: string
}

export default function ImageUpload({
  onUpload,
  onError,
  uploadType = 'image',
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/*',
  className,
  disabled = false,
  showPreview = true
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (disabled) return

    // 验证文件大小
    if (file.size > maxSize) {
      const errorMsg = `File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
      onError?.(errorMsg)
      return
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file.')
      return
    }

    // 显示预览
    if (showPreview) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    // 上传文件
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      if (result.success) {
        setUploadSuccess(true)
        onUpload(result.data)
        
        // 3秒后隐藏成功状态
        setTimeout(() => {
          setUploadSuccess(false)
        }, 3000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (error) {
      console.error('Upload error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      onError?.(errorMsg)
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 上传区域 */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          'hover:border-[#8b7355] hover:bg-[#f5f1e8]/50',
          dragActive && 'border-[#8b7355] bg-[#f5f1e8]/50',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'border-[#d4a574] bg-[#f5f1e8]',
          uploadSuccess && 'border-green-500 bg-green-50'
        )}
        onClick={handleClick}
        onDrag={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-[#8b7355] animate-spin" />
            <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Uploading... 📤
            </p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="text-green-600 font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Upload successful! ✅
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-[#8b7355]" />
            <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Click to upload or drag & drop 🖼️
            </p>
            <p className="text-[#8b7355] text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              JPEG, PNG, WebP, GIF (max {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </div>
        )}
      </div>

      {/* 预览区域 */}
      {preview && showPreview && (
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden border-2 border-[#8b7355] bg-white p-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              onClick={clearPreview}
              className="absolute top-3 right-3 w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 