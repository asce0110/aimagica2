"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, Eye, EyeOff } from "lucide-react"

interface ApiConfig {
  id?: string
  name: string
  type: 'image_generation' | 'video_generation'
  provider: string
  base_url: string
  api_key: string
  model: string
  endpoint: string
  priority: number
  is_default: boolean
  is_active: boolean
  max_retries: number
  timeout_seconds: number
  rate_limit_per_minute: number
  config_data: any
}

interface ApiConfigFormProps {
  config?: ApiConfig
  onSave: (config: Omit<ApiConfig, 'id'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ApiConfigForm({ config, onSave, onCancel, isLoading }: ApiConfigFormProps) {
  // 生成唯一的存储键
  const storageKey = config ? `api-config-edit-${config.id}` : 'api-config-new'
  const hasUnsavedChanges = useRef(false)

  // 从localStorage恢复数据或使用默认值
  const getInitialFormData = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          console.log('📥 恢复已保存的编辑数据:', parsedData.timestamp)
          hasUnsavedChanges.current = true
          return parsedData.formData
        } catch (e) {
          console.warn('❌ 无法解析保存的数据，使用默认值')
        }
      }
    }
    
    return {
      name: config?.name || '',
      type: config?.type || 'image_generation',
      provider: config?.provider || '',
      base_url: config?.base_url || '',
      api_key: config?.api_key || '',
      model: config?.model || '',
      endpoint: config?.endpoint || '',
      priority: config?.priority || 0,
      is_default: config?.is_default || false,
      is_active: config?.is_active !== false,
      max_retries: config?.max_retries || 3,
      timeout_seconds: config?.timeout_seconds || 60,
      rate_limit_per_minute: config?.rate_limit_per_minute || 60,
      config_data: config?.config_data || {}
    }
  }

  const [formData, setFormData] = useState<Omit<ApiConfig, 'id'>>(getInitialFormData)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showDraftWarning, setShowDraftWarning] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [configDataText, setConfigDataText] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          return parsedData.configDataText || JSON.stringify(config?.config_data || {}, null, 2)
        } catch (e) {
          console.warn('❌ 无法解析保存的配置数据文本')
        }
      }
    }
    return JSON.stringify(config?.config_data || {}, null, 2)
  })

  // 自动保存到localStorage
  const autoSave = () => {
    try {
      if (typeof window !== 'undefined') {
        const dataToSave = {
          formData,
          configDataText,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(storageKey, JSON.stringify(dataToSave))
        hasUnsavedChanges.current = true
        setShowDraftWarning(true)
        console.log('💾 自动保存编辑数据')
      }
    } catch (error) {
      console.error('自动保存失败:', error)
      // 静默处理错误，不影响用户体验
    }
  }

  // 清除保存的数据
  const clearSavedData = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey)
        hasUnsavedChanges.current = false
        setShowDraftWarning(false)
        console.log('🗑️ 清除保存的编辑数据')
      }
    } catch (error) {
      console.error('清除保存数据失败:', error)
      // 静默处理错误，不影响用户体验
    }
  }

  // 监听表单数据变化，自动保存
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        autoSave()
      } catch (error) {
        console.error('定时自动保存失败:', error)
      }
    }, 1000) // 1秒后保存
    
    return () => clearTimeout(timeoutId)
  }, [formData, configDataText])

  // 页面卸载前警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault()
                 e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
         return 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    const handleVisibilityChange = () => {
      try {
        if (document.visibilityState === 'hidden' && hasUnsavedChanges.current) {
          autoSave()
          console.log('📤 页面隐藏时自动保存')
        }
      } catch (error) {
        console.error('页面隐藏时自动保存失败:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // 组件挂载时检查是否有未保存的数据并验证JSON
  useEffect(() => {
    if (hasUnsavedChanges.current) {
      setShowDraftWarning(true)
      console.log('✨ 检测到未保存的编辑数据已自动恢复')
    }
    // 初始化时验证当前的JSON
    validateJson(configDataText)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 解析配置数据JSON
      let parsedConfigData = {}
      if (configDataText.trim()) {
        try {
          parsedConfigData = JSON.parse(configDataText)
        } catch (jsonError) {
          console.error('JSON解析错误:', jsonError)
          console.error('待解析的文本:', configDataText)
          
          // 提供更详细的错误信息
          const errorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'
          alert(`❌ JSON格式错误!\n\n错误详情: ${errorMessage}\n\n请检查配置数据的JSON格式是否正确。\n\n提示:\n- 确保所有引号都是英文引号\n- 确保没有多余的逗号\n- 确保大括号和方括号配对正确`)
          return
        }
      }

      await onSave({
        ...formData,
        config_data: parsedConfigData
      })
      
      // 成功保存后清除自动保存的数据
      clearSavedData()
    } catch (error) {
      console.error('保存配置错误:', error)
      alert(`❌ 保存失败!\n\n错误详情: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges.current) {
      const shouldDiscard = confirm('You have unsaved changes. Are you sure you want to discard them?')
      if (!shouldDiscard) {
        return
      }
      clearSavedData()
    }
    onCancel()
  }

  const providerTemplates = {
    'OpenAI': {
      base_url: 'https://api.openai.com/v1',
      endpoint: '/images/generations',
      model: 'dall-e-3',
      config_data: { quality: 'standard', size: '1024x1024', style: 'vivid' }
    },
    'Stability AI': {
      base_url: 'https://api.stability.ai/v1',
      endpoint: '/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      model: 'stable-diffusion-xl-1024-v1-0',
      config_data: { samples: 1, steps: 30, cfg_scale: 7 }
    },
    'Replicate': {
      base_url: 'https://api.replicate.com/v1',
      endpoint: '/predictions',
      model: 'stability-ai/sdxl',
      config_data: { width: 1024, height: 1024, num_outputs: 1 }
    },
    'Runway': {
      base_url: 'https://api.runwayml.com/v1',
      endpoint: '/generate',
      model: 'gen2',
      config_data: { duration: 4, seed: 0, upscale: false }
    },
    'Kie.ai Pro': {
      base_url: 'https://api.kie.ai',
      endpoint: '/api/v1/flux/kontext/generate',
      model: 'flux-kontext-pro',
      config_data: { 
        aspectRatios: {
          "21:9": "21:9",
          "16:9": "16:9", 
          "4:3": "4:3",
          "1:1": "1:1",
          "3:4": "3:4",
          "9:16": "9:16",
          "16:21": "16:21"
        },
        supportedModes: ["text_to_image", "image_edit"],
        promptLanguage: "en",
        description: "Standard Flux Kontext model for most use cases"
      }
    },
    'Kie.ai Max': {
      base_url: 'https://api.kie.ai',
      endpoint: '/api/v1/flux/kontext/generate', 
      model: 'flux-kontext-max',
      config_data: { 
        aspectRatios: {
          "21:9": "21:9",
          "16:9": "16:9", 
          "4:3": "4:3",
          "1:1": "1:1",
          "3:4": "3:4",
          "9:16": "9:16",
          "16:21": "16:21"
        },
        supportedModes: ["text_to_image", "image_edit"],
        promptLanguage: "en",
        description: "Enhanced Flux Kontext model for complex scenarios"
      }
    }
  }

  // JSON验证函数
  const validateJson = (text: string) => {
    if (!text.trim()) {
      setJsonError(null)
      return true
    }
    
    try {
      JSON.parse(text)
      setJsonError(null)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON'
      setJsonError(errorMessage)
      return false
    }
  }

  // 处理配置数据文本变化
  const handleConfigDataChange = (value: string) => {
    setConfigDataText(value)
    validateJson(value)
  }

  const handleProviderChange = (provider: string) => {
    setFormData(prev => ({ ...prev, provider }))
    
    // 自动填充模板数据
    const template = providerTemplates[provider as keyof typeof providerTemplates]
    if (template) {
      setFormData(prev => ({
        ...prev,
        base_url: template.base_url,
        endpoint: template.endpoint,
        model: template.model
      }))
      const templateJson = JSON.stringify(template.config_data, null, 2)
      setConfigDataText(templateJson)
      validateJson(templateJson)
    }
  }

  return (
    <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle 
              className="text-2xl font-black text-[#2d3e2d] flex items-center"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Plus className="w-6 h-6 mr-2" />
              {config ? 'Edit API Configuration 🔧' : 'Add New API Configuration ⚡'}
            </CardTitle>
            <CardDescription className="text-[#8b7355] font-bold">
              Configure AI generation APIs with automatic failover support
            </CardDescription>
          </div>
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="text-[#8b7355] hover:text-[#2d3e2d]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#2d3e2d] font-bold">
                Configuration Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., OpenAI DALL-E 3 Primary Config"
                required
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-[#2d3e2d] font-bold">
                API Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'image_generation' | 'video_generation') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="border-2 border-[#8b7355] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image_generation">Image Generation 🎨</SelectItem>
                  <SelectItem value="video_generation">Video Generation 🎬</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider" className="text-[#2d3e2d] font-bold">
                Provider *
              </Label>
              <Select
                value={formData.provider}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger className="border-2 border-[#8b7355] rounded-xl">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Stability AI">Stability AI</SelectItem>
                  <SelectItem value="Replicate">Replicate</SelectItem>
                  <SelectItem value="Runway">Runway</SelectItem>
                  <SelectItem value="Kie.ai Pro">Kie.ai Flux Kontext Pro</SelectItem>
                  <SelectItem value="Kie.ai Max">Kie.ai Flux Kontext Max</SelectItem>
                  <SelectItem value="Pika">Pika Labs</SelectItem>
                  <SelectItem value="Custom">Custom Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-[#2d3e2d] font-bold">
                Priority (Lower = Higher Priority)
              </Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                min="0"
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>
          </div>

          {/* API配置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_url" className="text-[#2d3e2d] font-bold">
                Base URL *
              </Label>
              <Input
                id="base_url"
                value={formData.base_url}
                onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                required
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint" className="text-[#2d3e2d] font-bold">
                Endpoint Path
              </Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="/images/generations"
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key" className="text-[#2d3e2d] font-bold">
                API Key *
              </Label>
              <div className="relative">
                <Input
                  id="api_key"
                  type={showApiKey ? "text" : "password"}
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Enter your API key here"
                  required
                  className="border-2 border-[#8b7355] rounded-xl pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-[#2d3e2d] font-bold">
                Model Name
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="dall-e-3"
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>
          </div>

          {/* 高级设置 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_retries" className="text-[#2d3e2d] font-bold">
                Max Retries
              </Label>
              <Input
                id="max_retries"
                type="number"
                value={formData.max_retries}
                onChange={(e) => setFormData(prev => ({ ...prev, max_retries: parseInt(e.target.value) || 3 }))}
                min="0"
                max="10"
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout_seconds" className="text-[#2d3e2d] font-bold">
                Timeout (seconds)
              </Label>
              <Input
                id="timeout_seconds"
                type="number"
                value={formData.timeout_seconds}
                onChange={(e) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) || 60 }))}
                min="10"
                max="300"
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate_limit" className="text-[#2d3e2d] font-bold">
                Rate Limit (per minute)
              </Label>
              <Input
                id="rate_limit"
                type="number"
                value={formData.rate_limit_per_minute}
                onChange={(e) => setFormData(prev => ({ ...prev, rate_limit_per_minute: parseInt(e.target.value) || 60 }))}
                min="1"
                className="border-2 border-[#8b7355] rounded-xl"
              />
            </div>
          </div>

          {/* 开关设置 */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label className="text-[#2d3e2d] font-bold">
                Active
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
              />
              <Label className="text-[#2d3e2d] font-bold">
                Set as Default
              </Label>
            </div>
          </div>

                    {/* 配置数据 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="config_data" className="text-[#2d3e2d] font-bold">
                Additional Configuration (JSON)
                {jsonError && (
                  <span className="text-red-500 ml-2 text-sm">❌ Invalid JSON</span>
                )}
              </Label>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  try {
                    // 尝试解析并格式化JSON
                    const parsed = JSON.parse(configDataText)
                    const formatted = JSON.stringify(parsed, null, 2)
                    setConfigDataText(formatted)
                    validateJson(formatted)
                  } catch (error) {
                    console.error('格式化JSON失败:', error)
                    // 如果解析失败，至少尝试基本的格式化
                    alert('无法格式化JSON，请先修复语法错误')
                  }
                }}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-6"
                disabled={!!jsonError}
              >
                Format JSON
              </Button>
            </div>
            <Textarea
              id="config_data"
              value={configDataText}
              onChange={(e) => handleConfigDataChange(e.target.value)}
              placeholder='{"quality": "standard", "size": "1024x1024"}'
              rows={8}
              className={`border-2 rounded-xl font-mono text-sm ${
                jsonError 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-[#8b7355]'
              }`}
            />
            
            {/* JSON错误提示 */}
            {jsonError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <span className="text-red-500 text-lg">❌</span>
                  <div>
                    <p className="text-red-700 font-bold text-sm">JSON格式错误</p>
                    <p className="text-red-600 text-xs mt-1">{jsonError}</p>
                    <div className="text-red-600 text-xs mt-2">
                      <p><strong>常见问题：</strong></p>
                      <p>• 确保使用英文引号 " 而不是中文引号 " "</p>
                      <p>• 检查是否有多余的逗号</p>
                      <p>• 确保大括号 {} 配对正确</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 使用提示 */}
            <div className="text-xs text-[#8b7355] space-y-1">
              <p><strong>Common image sizes:</strong></p>
              <p>• 1:1 → "1024x1024" (Square)</p>
              <p>• 2:3 → "1024x1536" (Portrait)</p>  
              <p>• 3:2 → "1536x1024" (Landscape)</p>
              <p>• 16:9 → "1792x1024" (Widescreen)</p>
              <p>Note: KIE.AI uses ratios like "1:1", others use pixels</p>
            </div>
          </div>

          {/* 草稿提示 */}
          {showDraftWarning && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-700 font-bold text-sm">
                                         📝 Unsaved draft detected and automatically restored
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear the draft data? This will restore to the original state.')) {
                      clearSavedData()
                      // 重新加载页面或重置表单
                      window.location.reload()
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-yellow-600 hover:text-yellow-800 text-xs"
                >
                                     Clear Draft
                </Button>
              </div>
              <p className="text-yellow-600 text-xs mt-1">
                Your edits are automatically saved, even when switching tabs ✨
              </p>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!jsonError}
              className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : (config ? 'Update Configuration' : 'Create Configuration')}
              {jsonError && ' (Fix JSON first)'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 