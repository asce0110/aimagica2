/**
 * 图片压缩Hook
 * 封装图片压缩相关的逻辑和状态管理
 */

import { useState, useCallback } from 'react'
import { imageCompressor, type CompressionOptions, type CompressionResult } from '@/lib/image-compression'

export interface CompressionHookResult {
  // 状态
  isCompressing: boolean
  progress: number
  error: string | null
  result: CompressionResult | null
  
  // 方法
  compressImage: (file: File, options?: CompressionOptions) => Promise<CompressionResult | null>
  smartCompress: (file: File) => Promise<CompressionResult | null>
  batchCompress: (files: File[], options?: CompressionOptions) => Promise<CompressionResult[]>
  reset: () => void
}

/**
 * 图片压缩Hook
 */
export function useImageCompression(): CompressionHookResult {
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompressionResult | null>(null)

  // 压缩单个图片
  const compressImage = useCallback(async (
    file: File, 
    options?: CompressionOptions
  ): Promise<CompressionResult | null> => {
    try {
      setIsCompressing(true)
      setProgress(0)
      setError(null)
      setResult(null)

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const compressionResult = await imageCompressor.compressImage(file, options)
      
      clearInterval(progressInterval)
      setProgress(100)
      setResult(compressionResult)
      
      console.log('✅ Image compression completed:', {
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        ratio: compressionResult.compressionRatio
      })
      
      return compressionResult
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compression failed'
      console.error('❌ Image compression failed:', err)
      setError(errorMessage)
      return null
    } finally {
      setIsCompressing(false)
      // 保持进度条在100%一小段时间
      setTimeout(() => setProgress(0), 2000)
    }
  }, [])

  // 智能压缩
  const smartCompress = useCallback(async (file: File): Promise<CompressionResult | null> => {
    try {
      setIsCompressing(true)
      setProgress(0)
      setError(null)
      setResult(null)

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85))
      }, 80)

      const compressionResult = await imageCompressor.smartCompress(file)
      
      clearInterval(progressInterval)
      setProgress(100)
      setResult(compressionResult)
      
      console.log('✅ Smart compression completed:', {
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        ratio: compressionResult.compressionRatio
      })
      
      return compressionResult
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Smart compression failed'
      console.error('❌ Smart compression failed:', err)
      setError(errorMessage)
      return null
    } finally {
      setIsCompressing(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }, [])

  // 批量压缩
  const batchCompress = useCallback(async (
    files: File[], 
    options?: CompressionOptions
  ): Promise<CompressionResult[]> => {
    try {
      setIsCompressing(true)
      setProgress(0)
      setError(null)
      setResult(null)

      const results: CompressionResult[] = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const compressionResult = await imageCompressor.compressImage(file, options)
        results.push(compressionResult)
        
        // 更新进度
        const progressPercent = Math.round(((i + 1) / totalFiles) * 100)
        setProgress(progressPercent)
        
        console.log(`✅ Compressed ${i + 1}/${totalFiles}: ${file.name}`)
      }
      
      console.log('✅ Batch compression completed:', results.length, 'files')
      return results
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch compression failed'
      console.error('❌ Batch compression failed:', err)
      setError(errorMessage)
      return []
    } finally {
      setIsCompressing(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    setIsCompressing(false)
    setProgress(0)
    setError(null)
    setResult(null)
  }, [])

  return {
    isCompressing,
    progress,
    error,
    result,
    compressImage,
    smartCompress,
    batchCompress,
    reset
  }
}

/**
 * 简化的图片压缩Hook - 只处理基本压缩
 */
export function useSimpleImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false)
  const [result, setResult] = useState<CompressionResult | null>(null)

  const compress = useCallback(async (file: File): Promise<CompressionResult | null> => {
    setIsCompressing(true)
    try {
      const compressionResult = await imageCompressor.smartCompress(file)
      setResult(compressionResult)
      return compressionResult
    } catch (err) {
      console.error('Compression failed:', err)
      return null
    } finally {
      setIsCompressing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
  }, [])

  return {
    isCompressing,
    result,
    compress,
    reset
  }
}