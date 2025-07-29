"use client"

import React, { useImperativeHandle, forwardRef, useEffect } from "react"
import { useGenerationStore } from "@/lib/stores/generation-store"
import type { CreationMode } from "@/lib/stores/generation-store"

// 重构后的子组件
import CreationModeSelector from "@/components/generation/creation-mode-selector"
import PromptInput from "@/components/generation/prompt-input"
import ImageUploadSection from "@/components/generation/image-upload-section"
import AspectRatioSelector from "@/components/generation/aspect-ratio-selector"
import ImageCountSelector from "@/components/generation/image-count-selector"
import GenerationControls from "@/components/generation/generation-controls"

// 保留的现有组件
import StyleSelector from "@/components/style-selector"
import ModelSelector from "@/components/model-selector"
import KieModelSelector from "@/components/kie-model-selector"

interface GenerationInterfaceV2Props {
  onStartRender: (aspectRatio?: string, styleId?: string | null, imageCount?: number, uploadedImage?: string | null, modelParams?: any) => void
  
  // 兼容性props - 用于状态同步
  textPrompt?: string
  setTextPrompt?: (prompt: string) => void
  creationMode?: CreationMode
  setCreationMode?: (mode: CreationMode) => void
  
  // 配置props
  forcedMode?: CreationMode
  hideModeSelector?: boolean
  interfaceMode?: "quick" | "professional"
  
  // 回调props
  onAspectRatioChange?: (aspectRatio: string) => void
  onStyleChange?: (styleId: string | null, styleName: string | null) => void
  
  // 初始状态
  initialSelectedStyleId?: string | null
  initialSelectedStyleName?: string | null
}

interface GenerationInterfaceV2Ref {
  setPromptForCurrentMode: (prompt: string) => void
  setStyleByName: (styleName: string) => void
}

const GenerationInterfaceV2 = forwardRef<GenerationInterfaceV2Ref, GenerationInterfaceV2Props>(
  ({
    onStartRender,
    textPrompt,
    setTextPrompt,
    creationMode,
    setCreationMode,
    forcedMode,
    hideModeSelector,
    interfaceMode = "quick",
    onAspectRatioChange,
    onStyleChange,
    initialSelectedStyleId,
    initialSelectedStyleName,
  }, ref) => {
    
    const {
      textPrompt: storePrompt,
      setTextPrompt: setStorePrompt,
      creationMode: storeMode,
      setCreationMode: setStoreMode,
      aspectRatio,
      selectedStyleId,
      selectedStyleName,
      selectedModelId,
      selectedKieModel,
      availableModels,
      setSelectedStyle,
      setAvailableStyles,
      setAvailableModels,
      setInterfaceMode,
    } = useGenerationStore()

    // 同步外部props到store（向后兼容）
    useEffect(() => {
      if (textPrompt !== undefined && textPrompt !== storePrompt) {
        setStorePrompt(textPrompt)
      }
    }, [textPrompt, storePrompt, setStorePrompt])

    useEffect(() => {
      if (creationMode !== undefined && creationMode !== storeMode) {
        setStoreMode(creationMode)
      }
    }, [creationMode, storeMode, setStoreMode])

    // 同步store状态到外部props（向后兼容）
    useEffect(() => {
      if (setTextPrompt && storePrompt !== textPrompt) {
        setTextPrompt(storePrompt)
      }
    }, [storePrompt, setTextPrompt, textPrompt])

    useEffect(() => {
      if (setCreationMode && storeMode !== creationMode) {
        setCreationMode(storeMode)
      }
    }, [storeMode, setCreationMode, creationMode])

    // 回调同步
    useEffect(() => {
      if (onAspectRatioChange) {
        onAspectRatioChange(aspectRatio)
      }
    }, [aspectRatio, onAspectRatioChange])

    useEffect(() => {
      if (onStyleChange) {
        onStyleChange(selectedStyleId, selectedStyleName)
      }
    }, [selectedStyleId, selectedStyleName, onStyleChange])

    // 初始化
    useEffect(() => {
      setInterfaceMode(interfaceMode)
      
      if (initialSelectedStyleId !== undefined) {
        setSelectedStyle(initialSelectedStyleId, initialSelectedStyleName)
      }
    }, [interfaceMode, initialSelectedStyleId, initialSelectedStyleName, setInterfaceMode, setSelectedStyle])

    // 加载可用数据
    useEffect(() => {
      const loadStyles = async () => {
        try {
          const response = await fetch('/api/styles?type=image')
          if (response.ok) {
            const data = await response.json()
            setAvailableStyles(data.styles || [])
          }
        } catch (error) {
          console.error('Failed to load styles:', error)
        }
      }

      const loadModels = async () => {
        try {
          const response = await fetch('/api/models/available?type=image_generation')
          if (response.ok) {
            const data = await response.json()
            setAvailableModels(data.models || [])
          }
        } catch (error) {
          console.error('Failed to load models:', error)
        }
      }

      loadStyles()
      loadModels()
    }, [setAvailableStyles, setAvailableModels])

    // 检查是否选择了Kie.ai相关模型
    const selectedModelData = availableModels.find(m => m.id === selectedModelId)
    const isKieAiModel = selectedModelData && (
      selectedModelData.provider?.toLowerCase()?.includes('kie') || 
      selectedModelData.provider?.toLowerCase()?.includes('flux') ||
      selectedModelData.model?.toLowerCase()?.includes('flux') ||
      selectedModelData.name?.toLowerCase()?.includes('flux') ||
      selectedModelData.name?.toLowerCase()?.includes('kie')
    )

    // 风格选择处理
    const handleStyleSelect = (styleId: string | null, styleName?: string, styleData?: any) => {
      console.log('🎨 handleStyleSelect called:', { styleId, styleName, styleData })
      setSelectedStyle(styleId, styleName || null, styleData)
    }

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      setPromptForCurrentMode: (prompt: string) => {
        setStorePrompt(prompt)
      },
      setStyleByName: (styleName: string) => {
        console.log('🎨 尝试设置风格:', styleName)
        // 这里可以添加风格名称映射逻辑
        // 暂时简化实现
        setStorePrompt(styleName)
      }
    }))

    return (
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] flex flex-col">
        {/* Header */}
        <div className="bg-[#4a5a4a] p-4 md:p-6 relative">
          <div className="text-center">
            <h2
              className="text-xl md:text-3xl font-black text-[#f5f1e8] mb-2 transform -rotate-1"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "2px 2px 0px #8b7355",
              }}
            >
              CREATE YOUR AIMAGICA! 🎨
            </h2>
            <p className="text-[#f5f1e8] font-bold text-sm md:text-base" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Quick & Easy Generation ⚡
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 space-y-6 min-h-0">
          
          {/* Creation Mode Selection */}
          <CreationModeSelector 
            hideModeSelector={hideModeSelector}
            forcedMode={forcedMode}
          />

          {/* Image Upload/Drawing for img2img and img2video modes */}
          <ImageUploadSection />

          {/* Text Prompt */}
          <PromptInput />

          {/* Model Selector and Aspect Ratio in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Selector */}
            <ModelSelector
              onModelSelect={(modelId) => useGenerationStore.getState().setSelectedModel(modelId)}
              selectedModelId={selectedModelId}
              type="image_generation"
              className="transform rotate-0.5 hover:-rotate-0.5 hover:scale-105 hover:shadow-2xl transition-all duration-300"
              dynamicKieModel={selectedKieModel}
              availableModels={availableModels}
            />

            {/* Aspect Ratio Selection */}
            <AspectRatioSelector />
          </div>

          {/* Kie.ai Model Selection - Show only when Kie.ai/Flux model is selected */}
          {isKieAiModel && (
            <KieModelSelector
              onModelSelect={(model) => useGenerationStore.getState().setSelectedKieModel(model)}
              selectedModel={selectedKieModel}
              className="transform -rotate-0.5 hover:rotate-0.5 transition-all duration-300"
            />
          )}

          {/* Style Selector */}
          <div>
            <h3
              className="text-[#2d3e2d] font-black text-lg mb-4 transform -rotate-1"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "1px 1px 0px #d4a574",
              }}
            >
              Choose Art Style! 🎨
            </h3>
            <StyleSelector 
              onStyleSelect={handleStyleSelect}
              selectedStyleId={selectedStyleId}
            />
          </div>

          {/* Image Count and Generation Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Image Count Selection */}
            <ImageCountSelector />

            {/* Generation Controls - Tips section moved here */}
            <div className="flex flex-col justify-center">
              <GenerationControls onStartRender={onStartRender} />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

GenerationInterfaceV2.displayName = "GenerationInterfaceV2"

export default GenerationInterfaceV2