/**
 * 统一的生成功能Hook
 * 封装生成相关的逻辑和状态管理
 */

import { useCallback, useState } from 'react'
import { useGenerationStore } from '@/lib/stores/generation-store'
import type { GenerationConfig, ValidationResult } from '@/lib/stores/generation-store'

export interface GenerationHookResult {
  // 状态
  isGenerating: boolean
  error: string | null
  
  // 配置
  config: GenerationConfig
  validation: ValidationResult
  
  // 方法
  startGeneration: () => Promise<void>
  stopGeneration: () => void
  resetError: () => void
  validateConfig: () => ValidationResult
}

export interface GenerationCallbacks {
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void
}

/**
 * 生成功能Hook
 */
export function useGeneration(
  onStartRender?: (aspectRatio?: string, styleId?: string | null, imageCount?: number, uploadedImage?: string | null, modelParams?: any) => Promise<any>,
  callbacks?: GenerationCallbacks
): GenerationHookResult {
  
  const {
    isGenerating,
    setIsGenerating,
    getGenerationConfig,
    validateConfiguration
  } = useGenerationStore()
  
  const [error, setError] = useState<string | null>(null)
  
  // 获取当前配置
  const config = getGenerationConfig()
  const validation = validateConfiguration()
  
  // 开始生成
  const startGeneration = useCallback(async () => {
    try {
      // 验证配置
      const validationResult = validateConfiguration()
      if (!validationResult.isValid) {
        const errorMessage = validationResult.errors.join(', ')
        setError(errorMessage)
        callbacks?.onError?.(errorMessage)
        return
      }
      
      // 重置错误状态
      setError(null)
      setIsGenerating(true)
      
      // 调用生成函数
      if (onStartRender) {
        callbacks?.onProgress?.(10)
        
        const result = await onStartRender(
          config.aspectRatio,
          config.styleId,
          config.imageCount,
          config.uploadedImage,
          config.modelParams
        )
        
        callbacks?.onProgress?.(100)
        callbacks?.onSuccess?.(result)
        
        console.log('✅ Generation completed successfully')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed'
      console.error('❌ Generation failed:', err)
      setError(errorMessage)
      callbacks?.onError?.(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }, [onStartRender, config, validateConfiguration, setIsGenerating, callbacks])
  
  // 停止生成
  const stopGeneration = useCallback(() => {
    setIsGenerating(false)
    console.log('🛑 Generation stopped by user')
  }, [setIsGenerating])
  
  // 重置错误
  const resetError = useCallback(() => {
    setError(null)
  }, [])
  
  // 验证配置
  const validateConfig = useCallback(() => {
    return validateConfiguration()
  }, [validateConfiguration])
  
  return {
    isGenerating,
    error,
    config,
    validation,
    startGeneration,
    stopGeneration,
    resetError,
    validateConfig
  }
}

/**
 * 简化的生成Hook - 只处理基本状态
 */
export function useSimpleGeneration() {
  const { isGenerating, setIsGenerating } = useGenerationStore()
  const [error, setError] = useState<string | null>(null)
  
  const start = useCallback(() => {
    setIsGenerating(true)
    setError(null)
  }, [setIsGenerating])
  
  const stop = useCallback(() => {
    setIsGenerating(false)
  }, [setIsGenerating])
  
  const setErrorState = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setIsGenerating(false)
  }, [setIsGenerating])
  
  return {
    isGenerating,
    error,
    start,
    stop,
    setError: setErrorState,
    resetError: () => setError(null)
  }
}