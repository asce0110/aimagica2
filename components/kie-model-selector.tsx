"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Zap, Crown, Loader2 } from "lucide-react"

interface KieModelSelectorProps {
  onModelSelect: (model: string) => void
  selectedModel: string
  className?: string
}

export default function KieModelSelector({ 
  onModelSelect, 
  selectedModel,
  className = ""
}: KieModelSelectorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasKieConfig, setHasKieConfig] = useState(false)
  const [kieConfig, setKieConfig] = useState<any>(null)

  // 获取Kie.ai配置
  useEffect(() => {
    const fetchKieConfig = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/api-configs?type=image_generation')
        const data = await response.json()

        if (response.ok && data.configs && data.configs.length > 0) {
          const kieApiConfig = data.configs.find((config: any) => 
            (config.provider === 'Kie.ai' || 
             config.provider === 'Custom' && config.endpoint?.includes('/flux/kontext/generate')) && 
            config.is_active
          )
          
          if (kieApiConfig) {
            setKieConfig(kieApiConfig)
            setHasKieConfig(true)
            
            // 如果没有选中的模型，默认选择pro
            if (!selectedModel) {
              onModelSelect('pro')
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Kie.ai config:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchKieConfig()
  }, [selectedModel, onModelSelect])

  const models = kieConfig?.config_data?.models || {
    "pro": {
      name: "flux-kontext-pro",
      displayName: "Flux Kontext Pro",
      description: "Standard model for most use cases",
      icon: "⚡",
      speed: "Fast"
    },
    "max": {
      name: "flux-kontext-max", 
      displayName: "Flux Kontext Max",
      description: "Enhanced model for complex scenarios",
      icon: "🎨",
      speed: "High Quality"
    }
  }

  if (isLoading) {
    return (
      <Card className={`bg-white border-2 border-[#8b7355] rounded-xl ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#8b7355]" />
            <span className="text-[#8b7355] font-medium" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Loading Kie.ai Models...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasKieConfig) {
    return (
      <Card className={`bg-white border-2 border-gray-300 rounded-xl ${className}`}>
        <CardContent className="p-4">
          <div className="text-gray-600 text-sm font-medium" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            ℹ️ Kie.ai not configured or not active
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedModelData = models[selectedModel] || models.pro

  return (
    <Card className={`bg-white border-4 border-purple-500 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* 标题 */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🎨</div>
            <Label 
              className="text-[#2d3e2d] font-black text-base"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Kie.ai Flux Kontext Model
            </Label>
          </div>

          {/* 模型选择器 */}
          <div className="space-y-3">
            <Select
              value={selectedModel}
              onValueChange={onModelSelect}
            >
              <SelectTrigger className="border-2 border-purple-500 rounded-xl bg-purple-50 hover:bg-white transition-colors">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <div className="text-lg">{selectedModelData.icon}</div>
                    <Badge 
                      variant="outline" 
                      className="border-purple-500 text-purple-700 text-xs"
                    >
                      {selectedModel.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      {selectedModelData.displayName}
                    </span>
                    <div className="text-xs text-purple-600">
                      {selectedModelData.speed}
                    </div>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(models).map(([key, model]: [string, any]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">{model.icon}</div>
                      <Badge 
                        variant="outline" 
                        className="border-purple-500 text-purple-700 text-xs"
                      >
                        {key.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{model.displayName}</span>
                      <div className="text-xs text-gray-500">
                        ({model.speed})
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 模型描述 */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <div className="text-lg">{selectedModelData.icon}</div>
                <div>
                  <p className="text-sm font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    {selectedModelData.displayName}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    {selectedModelData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 