/**
 * 统一的生成配置状态管理
 * 使用 Zustand 实现轻量级状态管理
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// 生成模式类型
export type CreationMode = "text2img" | "img2img" | "text2video" | "img2video"

// 生成配置状态接口
export interface GenerationState {
  // 基础配置
  textPrompt: string
  creationMode: CreationMode
  aspectRatio: string
  imageCount: number
  uploadedImage: string | null
  
  // 风格和模型配置
  selectedStyleId: string | null
  selectedStyleName: string | null
  selectedStyleData: any
  selectedModelId: string | null
  selectedKieModel: string
  
  // 可用数据
  availableStyles: any[]
  availableModels: any[]
  
  // UI状态
  isGenerating: boolean
  showDrawing: boolean
  interfaceMode: "quick" | "professional"
  
  // Actions - 基础操作
  setTextPrompt: (prompt: string) => void
  setCreationMode: (mode: CreationMode) => void
  setAspectRatio: (ratio: string) => void
  setImageCount: (count: number) => void
  setUploadedImage: (image: string | null) => void
  
  // Actions - 风格和模型
  setSelectedStyle: (styleId: string | null, styleName: string | null, styleData?: any) => void
  setSelectedModel: (modelId: string | null) => void
  setSelectedKieModel: (model: string) => void
  setAvailableStyles: (styles: any[]) => void
  setAvailableModels: (models: any[]) => void
  
  // Actions - UI状态
  setIsGenerating: (generating: boolean) => void
  setShowDrawing: (show: boolean) => void
  setInterfaceMode: (mode: "quick" | "professional") => void
  
  // Actions - 复合操作
  resetToDefaults: () => void
  getGenerationConfig: () => GenerationConfig
  validateConfiguration: () => ValidationResult
}

// 生成配置接口
export interface GenerationConfig {
  textPrompt: string
  creationMode: CreationMode
  aspectRatio: string
  imageCount: number
  uploadedImage: string | null
  styleId: string | null
  modelParams: {
    modelId: string | null
    kieModel: string
  }
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// 默认状态
const defaultState = {
  textPrompt: "",
  creationMode: "text2img" as CreationMode,
  aspectRatio: "1:1",
  imageCount: 1,
  uploadedImage: null,
  selectedStyleId: null,
  selectedStyleName: null,
  selectedStyleData: null,
  selectedModelId: null,
  selectedKieModel: "pro",
  availableStyles: [],
  availableModels: [],
  isGenerating: false,
  showDrawing: false,
  interfaceMode: "quick" as const,
}

// 创建状态管理存储
export const useGenerationStore = create<GenerationState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        ...defaultState,

        // 基础操作
        setTextPrompt: (prompt: string) =>
          set({ textPrompt: prompt }, false, 'setTextPrompt'),
          
        setCreationMode: (mode: CreationMode) =>
          set({ creationMode: mode }, false, 'setCreationMode'),
          
        setAspectRatio: (ratio: string) =>
          set({ aspectRatio: ratio }, false, 'setAspectRatio'),
          
        setImageCount: (count: number) =>
          set({ imageCount: count }, false, 'setImageCount'),
          
        setUploadedImage: (image: string | null) =>
          set({ uploadedImage: image }, false, 'setUploadedImage'),

        // 风格和模型操作
        setSelectedStyle: (styleId: string | null, styleName: string | null, styleData?: any) =>
          set({
            selectedStyleId: styleId,
            selectedStyleName: styleName,
            selectedStyleData: styleData
          }, false, 'setSelectedStyle'),
          
        setSelectedModel: (modelId: string | null) =>
          set({ selectedModelId: modelId }, false, 'setSelectedModel'),
          
        setSelectedKieModel: (model: string) =>
          set({ selectedKieModel: model }, false, 'setSelectedKieModel'),
          
        setAvailableStyles: (styles: any[]) =>
          set({ availableStyles: styles }, false, 'setAvailableStyles'),
          
        setAvailableModels: (models: any[]) =>
          set({ availableModels: models }, false, 'setAvailableModels'),

        // UI状态操作
        setIsGenerating: (generating: boolean) =>
          set({ isGenerating: generating }, false, 'setIsGenerating'),
          
        setShowDrawing: (show: boolean) =>
          set({ showDrawing: show }, false, 'setShowDrawing'),
          
        setInterfaceMode: (mode: "quick" | "professional") =>
          set({ interfaceMode: mode }, false, 'setInterfaceMode'),

        // 复合操作
        resetToDefaults: () =>
          set(defaultState, false, 'resetToDefaults'),
          
        getGenerationConfig: (): GenerationConfig => {
          const state = get()
          return {
            textPrompt: state.textPrompt,
            creationMode: state.creationMode,
            aspectRatio: state.aspectRatio,
            imageCount: state.imageCount,
            uploadedImage: state.uploadedImage,
            styleId: state.selectedStyleId,
            modelParams: {
              modelId: state.selectedModelId,
              kieModel: state.selectedKieModel
            }
          }
        },
        
        validateConfiguration: (): ValidationResult => {
          const state = get()
          const errors: string[] = []
          const warnings: string[] = []
          
          // 图生图和图生视频模式需要图片
          if ((state.creationMode === "img2img" || state.creationMode === "img2video") && !state.uploadedImage) {
            errors.push('Please upload or draw an image for image-to-image generation')
          }
          
          // 文生图和文生视频模式需要提示词（除非有默认风格提示词）
          if ((state.creationMode === "text2img" || state.creationMode === "text2video")) {
            const hasPrompt = state.textPrompt.trim() || state.selectedStyleData?.default_prompt?.trim()
            if (!hasPrompt && state.selectedStyleId !== null) {
              errors.push('Please enter a description or choose a style with default prompt')
            }
            if (!hasPrompt && state.selectedStyleId === null) {
              errors.push('Please enter a description of the image you want to generate')
            }
          }
          
          // 风格限制检查
          if (state.selectedStyleData?.prohibits_image_upload && 
              (state.creationMode === "img2img" || state.creationMode === "img2video")) {
            errors.push(`${state.selectedStyleData.name} style does not support image upload`)
          }
          
          // 警告
          if (state.imageCount > 2) {
            warnings.push('Generating multiple images may take longer')
          }
          
          return {
            isValid: errors.length === 0,
            errors,
            warnings
          }
        }
      }),
      {
        name: 'generation-config',
        // 只持久化配置数据，不持久化临时状态
        partialize: (state) => ({
          textPrompt: state.textPrompt,
          creationMode: state.creationMode,
          aspectRatio: state.aspectRatio,
          imageCount: state.imageCount,
          selectedStyleId: state.selectedStyleId,
          selectedStyleName: state.selectedStyleName,
          selectedModelId: state.selectedModelId,
          selectedKieModel: state.selectedKieModel,
          interfaceMode: state.interfaceMode,
        }),
      }
    ),
    {
      name: 'generation-store'
    }
  )
)

// 选择器函数 - 用于组件订阅特定状态
export const selectBasicConfig = (state: GenerationState) => ({
  textPrompt: state.textPrompt,
  creationMode: state.creationMode,
  aspectRatio: state.aspectRatio,
  imageCount: state.imageCount,
})

export const selectStyleConfig = (state: GenerationState) => ({
  selectedStyleId: state.selectedStyleId,
  selectedStyleName: state.selectedStyleName,
  selectedStyleData: state.selectedStyleData,
  availableStyles: state.availableStyles,
})

export const selectModelConfig = (state: GenerationState) => ({
  selectedModelId: state.selectedModelId,
  selectedKieModel: state.selectedKieModel,
  availableModels: state.availableModels,
})

export const selectUIState = (state: GenerationState) => ({
  isGenerating: state.isGenerating,
  showDrawing: state.showDrawing,
  interfaceMode: state.interfaceMode,
})