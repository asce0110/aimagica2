"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Cpu, Zap, Crown, Loader2 } from "lucide-react"

interface ModelConfig {
  id: string
  name: string
  provider: string
  model: string
  isDefault: boolean
  displayName: string
  shortName: string
}

interface ModelSelectorProps {
  onModelSelect: (modelId: string | null) => void
  selectedModelId: string | null
  type?: 'image_generation' | 'video_generation'
  className?: string
  dynamicKieModel?: string
  availableModels?: any[]
}

export default function ModelSelector({ 
  onModelSelect, 
  selectedModelId, 
  type = 'image_generation',
  className = "",
  dynamicKieModel,
  availableModels
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [defaultModel, setDefaultModel] = useState<ModelConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取可用模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true)
        
        // 尝试从API加载，失败时fallback到静态JSON
        let response = await fetch(`/api/models/available?type=${type}`)
        let data: any

        if (response.ok) {
          try {
            data = await response.json()
          } catch (parseError) {
            console.warn('API response not JSON, trying static fallback')
            throw new Error('Invalid JSON response')
          }
        } else {
          throw new Error(`API responded with status ${response.status}`)
        }

        if (!response.ok) {
          if (response.status === 401) {
            // 用户未登录，显示友好提示但仍允许使用自动选择
            setError('Please login to select specific AI models')
            setModels([]) // 清空模型列表
            setDefaultModel(null)
            // 确保选择了自动模式
            if (selectedModelId !== null) {
              onModelSelect(null) // 设置为自动选择
            }
            return
          }
          throw new Error(data.error || 'Failed to fetch models')
        }

        setModels(data.models || [])
        setDefaultModel(data.defaultModel || null)
        
        // 如果没有选中的模型且有默认模型，自动选择默认模型
        if (!selectedModelId && data.defaultModel) {
          onModelSelect(data.defaultModel.id)
        }

      } catch (err) {
        console.warn('Primary API failed, trying static fallback:', err)
        
        // Fallback to static JSON
        try {
          const fallbackResponse = await fetch('/api/models-available.json')
          const fallbackData = await fallbackResponse.json()
          
          setModels(fallbackData.models || [])
          setDefaultModel(fallbackData.defaultModel || null)
          setError(null) // 清除错误状态
          console.log('✅ Models loaded from static fallback')
        } catch (fallbackError) {
          console.error('Both API and fallback failed:', fallbackError)
          setError('Failed to load AI models')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [type, selectedModelId, onModelSelect])

  const handleModelChange = (modelId: string) => {
    if (modelId === "auto") {
      onModelSelect(null) // null 表示使用系统自动选择
    } else {
      onModelSelect(modelId)
    }
  }

  const selectedModel = models.find(m => m.id === selectedModelId)
  
  // 动态获取正确的model显示名称
  const getDisplayModel = (model: ModelConfig) => {
    // 如果是Flux Kontext模型且有动态Kie模型选择
    if (model.name?.toLowerCase().includes('flux') && model.name?.toLowerCase().includes('kontext') && dynamicKieModel) {
      return `flux-kontext-${dynamicKieModel}`
    }
    return model.model
  }

  const getDisplayProvider = (model: ModelConfig) => {
    // 如果是Flux Kontext模型且有动态Kie模型选择
    if (model.name?.toLowerCase().includes('flux') && model.name?.toLowerCase().includes('kontext') && dynamicKieModel) {
      return `Kie.ai ${dynamicKieModel.charAt(0).toUpperCase() + dynamicKieModel.slice(1)}`
    }
    return model.provider
  }

  // 检查是否有多个Kie.ai模型可选
  const kieModels = models.filter(m => m.provider.toLowerCase().includes('kie'))
  const hasMultipleKieModels = kieModels.length > 1

  if (isLoading) {
    return (
      <Card className={`bg-white border-2 border-[#8b7355] rounded-xl ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#8b7355]" />
            <span className="text-[#8b7355] font-medium" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Loading AI Models...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !error.includes('login')) {
    // 只有非认证错误才显示错误卡片
    return (
      <Card className={`bg-white border-2 border-red-300 rounded-xl ${className}`}>
        <CardContent className="p-4">
          <div className="text-red-600 text-sm font-medium" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            ❌ {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 如果是认证错误或没有模型，显示简化的自动选择界面
  if (models.length === 0) {
    const isAuthError = error && error.includes('login')
    
    return (
      <Card className={`bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* 标题 */}
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#8b7355]" />
              <Label 
                className="text-[#2d3e2d] font-black text-base transform hover:rotate-1 hover:scale-105 transition-all duration-300 cursor-pointer inline-block"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Choose AI Model 🤖
              </Label>
            </div>

            {/* 简化的选择器 - 只有自动选择 */}
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-[#d4a574]/20 to-[#8b7355]/20 border-2 border-[#d4a574] rounded-xl">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-[#d4a574]" />
                  <span className="font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Auto Selection (Smart)
                  </span>
                  <Badge className="bg-[#d4a574] text-[#2d3e2d] text-xs">Active</Badge>
                </div>
                <p className="text-xs text-[#8b7355] mt-1">
                  System will automatically choose the best AI model for your request
                </p>
              </div>

              {/* 认证提示 */}
              {isAuthError && (
                <div className="p-3 bg-[#f5f1e8] border border-[#8b7355]/30 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <div className="text-lg">🔐</div>
                    <div>
                      <p className="text-sm font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        Login for More Options
                      </p>
                      <p className="text-xs text-[#8b7355] mt-1">
                        Login to access specific AI models like GPT-4, DALL-E, Stable Diffusion, and more!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* 标题 */}
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#8b7355]" />
            <Label 
              className="text-[#2d3e2d] font-black text-base transform hover:rotate-1 hover:scale-105 transition-all duration-300 cursor-pointer inline-block"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Choose AI Model 🤖
            </Label>
          </div>

          {/* 模型选择器 */}
          <div className="space-y-3">
            <Select
              value={selectedModelId || "auto"}
              onValueChange={handleModelChange}
            >
              <SelectTrigger className="border-2 border-[#8b7355] rounded-xl bg-[#f5f1e8] hover:bg-white transition-colors">
                <SelectValue>
                  {selectedModel ? (
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          selectedModel.provider.toLowerCase().includes('kie') 
                            ? 'border-purple-500 text-purple-700' 
                            : 'border-[#8b7355] text-[#8b7355]'
                        }`}
                      >
                        {selectedModel.provider.includes('Pro') ? 'Pro' : 
                         selectedModel.provider.includes('Max') ? 'Max' : 
                         selectedModel.shortName}
                      </Badge>
                      <span className="font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        {selectedModel.provider.toLowerCase().includes('kie') 
                          ? `Kie.ai ${selectedModel.provider.includes('Pro') ? 'Pro' : selectedModel.provider.includes('Max') ? 'Max' : 'Flux'}`
                          : selectedModel.name}
                      </span>
                      {selectedModel.provider.toLowerCase().includes('kie') && (
                        <div className="text-xs text-[#8b7355]">
                          {selectedModel.provider.includes('Pro') ? '⚡ Fast' : 
                           selectedModel.provider.includes('Max') ? '🎨 High Quality' : ''}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#d4a574]" />
                      <span className="font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        Auto (Smart Selection)
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {/* 自动选择选项 */}
                <SelectItem value="auto">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-[#d4a574]" />
                    <span className="font-bold">Auto Selection</span>
                    <Badge className="bg-[#d4a574] text-[#2d3e2d] text-xs">Smart</Badge>
                  </div>
                </SelectItem>
                
                {/* 模型选项 */}
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          model.provider.toLowerCase().includes('kie') 
                            ? 'border-purple-500 text-purple-700' 
                            : 'border-[#8b7355] text-[#8b7355]'
                        }`}
                      >
                        {model.provider.includes('Pro') ? 'Pro' : 
                         model.provider.includes('Max') ? 'Max' : 
                         model.shortName}
                      </Badge>
                      <span className="font-medium">
                        {model.provider.toLowerCase().includes('kie') 
                          ? `Kie.ai ${model.provider.includes('Pro') ? 'Pro' : model.provider.includes('Max') ? 'Max' : 'Flux'}`
                          : model.name}
                      </span>
                      {model.isDefault && (
                        <Crown className="w-3 h-3 text-[#d4a574]" />
                      )}
                      {model.provider.toLowerCase().includes('kie') && (
                        <div className="text-xs text-gray-500">
                          {model.provider.includes('Pro') ? '(Standard)' : 
                           model.provider.includes('Max') ? '(Enhanced)' : ''}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 模型信息显示 */}
            {selectedModel && (
              <div className="p-3 bg-[#f5f1e8]/50 border border-[#8b7355]/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        {getDisplayProvider(selectedModel)}
                      </span>
                      {selectedModel.isDefault && (
                        <Badge className="bg-[#d4a574] text-[#2d3e2d] text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#8b7355] font-medium">
                      Model: {getDisplayModel(selectedModel) || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#8b7355] opacity-70">
                      Selected
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 自动选择说明 */}
            {!selectedModelId && (
              <div className="p-3 bg-gradient-to-r from-[#d4a574]/20 to-[#8b7355]/20 border border-[#d4a574]/30 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-[#d4a574] mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      Smart Auto Selection
                    </p>
                    <p className="text-xs text-[#8b7355]">
                      System will automatically choose the best available model with failover support
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 