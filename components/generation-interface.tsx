"use client"

import React, { useState, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { 
  Settings, Zap, ChevronDown, ChevronUp, User, Mountain, Palette, 
  Camera, Sun, Moon, Zap as Lightning, Square, Monitor,
  Smartphone, X, Plus, Minus, Type, ImageIcon, Video, Film, Brush, CheckCircle
} from "lucide-react"
import StyleSelector from "@/components/style-selector"
import SketchCanvas from "@/components/sketch-canvas"
import StyleRequirementsAlert from "@/components/ui/style-requirements-alert"
import ModelSelector from "@/components/model-selector"
import KieModelSelector from "@/components/kie-model-selector"
import { validateStyleRequirements } from "@/lib/database/styles"

interface GenerationInterfaceProps {
  onStartRender: (aspectRatio?: string, styleId?: string | null, imageCount?: number, uploadedImage?: string | null, modelParams?: any) => void
  textPrompt: string
  setTextPrompt: (prompt: string) => void
  creationMode: "text2img" | "img2img" | "text2video" | "img2video"
  setCreationMode: (mode: "text2img" | "img2img" | "text2video" | "img2video") => void
  interfaceMode?: "quick" | "professional"
  setInterfaceMode?: (mode: "quick" | "professional") => void
  onAspectRatioChange?: (aspectRatio: string) => void
  onStyleChange?: (styleId: string | null, styleName: string | null) => void
  // 添加初始风格状态
  initialSelectedStyleId?: string | null
  initialSelectedStyleName?: string | null
  // 新增的props用于专门页面
  forcedMode?: "text2img" | "img2img" | "text2video" | "img2video"
  hideModeSelector?: boolean
}

interface GenerationInterfaceRef {
  setPromptForCurrentMode: (prompt: string) => void
  setStyleByName: (styleName: string) => void
}

// 预定义的选项数据
const SUBJECTS = {
  "人物": {
    icon: <User className="w-4 h-4" />,
    options: ["Portrait", "Girl", "Boy", "Wizard", "Warrior", "Princess", "Scientist", "Artist"]
  },
  "动物": {
    icon: "🐾",
    options: ["Cat", "Dog", "Dragon", "Wolf", "Bird", "Unicorn", "Phoenix", "Tiger"]
  },
  "风景": {
    icon: <Mountain className="w-4 h-4" />,
    options: ["Forest", "Ocean", "Mountain", "Desert", "City", "Garden", "Space", "Underwater"]
  },
  "物体": {
    icon: "🎨",
    options: ["Castle", "Spaceship", "Flower", "Crystal", "Book", "Sword", "Crown", "Potion"]
  }
}

const STYLE_CATEGORIES = [
  { id: "all", name: "All", emoji: "🎨" },
  { id: "photographic-realism", name: "Photographic Realism", emoji: "📸" },
  { id: "illustration-digital-painting", name: "Illustration & Digital", emoji: "🎨" },
  { id: "anime-comics", name: "Anime & Comics", emoji: "🌸" },
  { id: "concept-art", name: "Concept Art", emoji: "🎭" },
  { id: "3d-render", name: "3D Render", emoji: "🧊" },
  { id: "abstract", name: "Abstract", emoji: "🌀" },
  { id: "fine-art-movements", name: "Fine-Art Movements", emoji: "🖼️" },
  { id: "technical-scientific", name: "Technical & Scientific", emoji: "🔬" },
  { id: "architecture-interior", name: "Architecture & Interior", emoji: "🏗️" },
  { id: "design-commercial", name: "Design & Commercial", emoji: "💼" },
  { id: "genre-driven", name: "Genre-Driven", emoji: "🎪" },
  { id: "vintage-retro", name: "Vintage & Retro", emoji: "📻" }
]

const STYLE_GALLERY = [
  { id: "photorealistic", name: "Photorealistic", category: "photographic-realism", preview: "📸", description: "Ultra-realistic photography" },
  { id: "digital-art", name: "Digital Art", category: "illustration-digital-painting", preview: "🎨", description: "Modern digital painting" },
  { id: "anime", name: "Anime Style", category: "anime-comics", preview: "🌸", description: "Japanese anime art" },
  { id: "concept", name: "Concept Art", category: "concept-art", preview: "🎭", description: "Game & film concept" },
  { id: "3d-realistic", name: "3D Realistic", category: "3d-render", preview: "🧊", description: "3D rendered artwork" },
  { id: "abstract-modern", name: "Abstract Art", category: "abstract", preview: "🌀", description: "Contemporary abstract" },
  { id: "impressionist", name: "Impressionist", category: "fine-art-movements", preview: "🖼️", description: "Classic impressionist" },
  { id: "technical", name: "Technical Drawing", category: "technical-scientific", preview: "🔬", description: "Scientific illustration" },
  { id: "architecture", name: "Architecture", category: "architecture-interior", preview: "🏗️", description: "Architectural visualization" },
  { id: "commercial", name: "Commercial Design", category: "design-commercial", preview: "💼", description: "Commercial artwork" },
  { id: "fantasy", name: "Fantasy Genre", category: "genre-driven", preview: "🎪", description: "Fantasy themed art" },
  { id: "vintage", name: "Vintage Style", category: "vintage-retro", preview: "📻", description: "Retro vintage look" }
]

const COMPOSITIONS = [
  { id: "closeup", name: "Close-up", icon: "👤", description: "Close portrait view" },
  { id: "fullbody", name: "Full Body", icon: "🧍", description: "Complete figure" },
  { id: "wide", name: "Wide Shot", icon: "🏞️", description: "Wide landscape" },
  { id: "aerial", name: "Aerial View", icon: "🦅", description: "Bird's eye view" }
]

const LIGHTING = [
  { id: "golden", name: "Golden Hour", icon: <Sun className="w-4 h-4" />, color: "#FFD700" },
  { id: "blue", name: "Blue Hour", icon: <Moon className="w-4 h-4" />, color: "#4169E1" },
  { id: "neon", name: "Neon Light", icon: <Lightning className="w-4 h-4" />, color: "#FF1493" },
  { id: "soft", name: "Soft Light", icon: "☁️", color: "#F0F8FF" }
]

const COLOR_PALETTES = [
  { id: "pastel", name: "Pastel", colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"] },
  { id: "vibrant", name: "Vibrant", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"] },
  { id: "monochrome", name: "Monochrome", colors: ["#2C3E50", "#34495E", "#7F8C8D", "#BDC3C7", "#ECF0F1"] },
  { id: "warm", name: "Warm", colors: ["#FF8A80", "#FFAB91", "#FFCC02", "#FFEA00", "#FFF176"] }
]

const ASPECT_RATIOS = [
  { id: "1:1", name: "Square", icon: <Square className="w-4 h-4" />, size: "1024x1024" },
  { id: "2:3", name: "Portrait", icon: <Smartphone className="w-4 h-4" />, size: "1024x1536" },
  { id: "3:2", name: "Landscape", icon: "📱", size: "1536x1024" }
]

const GenerationInterface = forwardRef<GenerationInterfaceRef, GenerationInterfaceProps>(
  ({ onStartRender, textPrompt, setTextPrompt, creationMode, setCreationMode, interfaceMode, setInterfaceMode, onAspectRatioChange, onStyleChange, initialSelectedStyleId, initialSelectedStyleName, forcedMode, hideModeSelector }, ref) => {
    // 固定使用quick模式，移除professional模式
    const [mode, setMode] = useState<"quick">("quick")
    const [selectedStyleId, setSelectedStyleId] = useState<string | null>(initialSelectedStyleId || null)
    const [selectedStyleName, setSelectedStyleName] = useState<string | null>(initialSelectedStyleName || null)
    const [selectedStyleData, setSelectedStyleData] = useState<any>(null)
    const [availableStyles, setAvailableStyles] = useState<any[]>([])
    const [imageCount, setImageCount] = useState(1)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [showDrawing, setShowDrawing] = useState(false)
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("1:1")
    
    // 模型选择状态
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
    const [selectedKieModel, setSelectedKieModel] = useState<string>('pro')
    
    // 防重复随机提示词状态
    const [usedPromptIndices, setUsedPromptIndices] = useState<Set<number>>(new Set())

    // 监听初始风格状态变化，用于状态恢复
    React.useEffect(() => {
      if (initialSelectedStyleId !== undefined) {
        setSelectedStyleId(initialSelectedStyleId)
      }
      if (initialSelectedStyleName !== undefined) {
        setSelectedStyleName(initialSelectedStyleName)
      }
    }, [initialSelectedStyleId, initialSelectedStyleName])

    // 强制模式处理
    React.useEffect(() => {
      if (forcedMode && creationMode !== forcedMode) {
        setCreationMode(forcedMode)
      }
    }, [forcedMode, creationMode, setCreationMode])

    // 检查是否选择了Kie.ai相关模型
    const [availableModels, setAvailableModels] = useState<any[]>([])
    const selectedModelData = availableModels.find(m => m.id === selectedModelId)
    const isKieAiModel = selectedModelData && (
      selectedModelData.provider?.toLowerCase()?.includes('kie') || 
      selectedModelData.provider?.toLowerCase()?.includes('flux') ||
      selectedModelData.model?.toLowerCase()?.includes('flux') ||
      selectedModelData.name?.toLowerCase()?.includes('flux') ||
      selectedModelData.name?.toLowerCase()?.includes('kie')
    )
    
    // 当选择的模型变化时，自动更新KieModel
    React.useEffect(() => {
      if (selectedModelData) {
        console.log('🤖 Selected model:', selectedModelData.provider, selectedModelData.name)
        
        if (selectedModelData.provider?.includes('Max') || selectedModelData.model?.includes('max')) {
          console.log('🎨 Setting kieModel to "max"')
          setSelectedKieModel('max')
        } else if (selectedModelData.provider?.includes('Pro') || selectedModelData.model?.includes('pro')) {
          console.log('⚡ Setting kieModel to "pro"')
          setSelectedKieModel('pro')
        }
      }
      
      console.log('🎯 isKieAiModel:', isKieAiModel, '| selectedKieModel:', selectedKieModel)
    }, [selectedModelData])

    // 加载可用模型
    React.useEffect(() => {
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
      loadModels()
    }, [])

    // 加载可用风格
    React.useEffect(() => {
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
      loadStyles()
    }, [])
    
    // 风格要求提示对话框状态
    const [showRequirementsAlert, setShowRequirementsAlert] = useState(false)
    const [requirementsAlertData, setRequirementsAlertData] = useState<{
      title: string
      errors: string[]
      warnings: string[]
      styleName?: string
      styleEmoji?: string
    }>({
      title: '',
      errors: [],
      warnings: []
    })

    // 加载可用风格
    React.useEffect(() => {
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
      loadStyles()
    }, [])

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      setPromptForCurrentMode: (prompt: string) => {
        setTextPrompt(prompt)
      },
      setStyleByName: (styleName: string) => {
        console.log('🎨 尝试设置风格:', styleName)
        console.log('🎨 可用风格列表:', availableStyles.map(s => s.name))
        
        // 创建风格名称映射表（处理常见的风格名称变体）
        const styleMapping: { [key: string]: string[] } = {
          // 处理旧数据格式（模式描述）
          'text to image': ['photorealistic', 'realistic', 'photo'],
          'image to image': ['photorealistic', 'realistic', 'photo'],
          'text to video': ['cinematic', 'video', 'film'],
          'image to video': ['cinematic', 'video', 'film'],
          'ai generated': ['photorealistic', 'realistic', 'photo'],
          'generated': ['photorealistic', 'realistic', 'photo'],
          
          // 常见风格变体
          'cartoon': ['cartoon', 'comic', 'anime', 'illustration'],
          'anime': ['anime', 'manga', 'cartoon', 'japanese'],
          'digital art': ['digital', 'digital art', 'digital painting', 'illustration'],
          'digital': ['digital', 'digital art', 'digital painting', 'illustration'],
          'fantasy': ['fantasy', 'magical', 'mystical', 'fairy'],
          'realistic': ['photorealistic', 'realistic', 'photo', 'photography'],
          'photorealistic': ['photorealistic', 'realistic', 'photo', 'photography'],
          'cyberpunk': ['cyberpunk', 'futuristic', 'sci-fi', 'neon'],
          'watercolor': ['watercolor', 'painting', 'artistic', 'traditional'],
          'oil painting': ['oil painting', 'painting', 'classical', 'traditional'],
          'sketch': ['sketch', 'drawing', 'pencil', 'line art'],
          '3d': ['3d', '3d render', 'render', 'cgi'],
          'vintage': ['vintage', 'retro', 'old', 'classic'],
          'abstract': ['abstract', 'modern', 'contemporary', 'artistic']
        }
        
        // 查找精确匹配的风格
        let targetStyle = availableStyles.find(style => 
          style.name.toLowerCase() === styleName.toLowerCase()
        )
        
        // 如果没有找到精确匹配，尝试模糊匹配
        if (!targetStyle) {
          const lowerStyleName = styleName.toLowerCase()
          
          // 首先检查映射表
          for (const [key, variants] of Object.entries(styleMapping)) {
            if (lowerStyleName.includes(key) || variants.some(variant => lowerStyleName.includes(variant))) {
              // 使用映射表中的变体尝试匹配
              for (const variant of variants) {
                targetStyle = availableStyles.find(style => 
                  style.name.toLowerCase().includes(variant) ||
                  style.category?.toLowerCase().includes(variant) ||
                  style.description?.toLowerCase().includes(variant)
                )
                if (targetStyle) break
              }
              if (targetStyle) break
            }
          }
        }
        
        // 如果还是没找到，尝试包含匹配
        if (!targetStyle) {
          targetStyle = availableStyles.find(style => 
            style.name.toLowerCase().includes(styleName.toLowerCase()) ||
            styleName.toLowerCase().includes(style.name.toLowerCase()) ||
            style.category?.toLowerCase().includes(styleName.toLowerCase()) ||
            style.description?.toLowerCase().includes(styleName.toLowerCase())
          )
        }
        
        if (targetStyle) {
          console.log('🎨 找到匹配风格:', targetStyle.name)
          handleStyleSelect(targetStyle.id, targetStyle.name, targetStyle)
        } else {
          console.log('🎨 未找到匹配风格，使用默认风格')
          // 尝试使用第一个可用风格作为默认
          if (availableStyles.length > 0) {
            const defaultStyle = availableStyles[0]
            handleStyleSelect(defaultStyle.id, defaultStyle.name, defaultStyle)
          }
        }
      }
    }))

    const handleStyleSelect = (styleId: string | null, styleName?: string, styleData?: any) => {
      console.log('🎨 handleStyleSelect called:', { styleId, styleName, styleData })
      
      setSelectedStyleId(styleId)
      setSelectedStyleName(styleName || null)
      setSelectedStyleData(styleData || null)
      
      // 通知父组件风格变化
      if (onStyleChange) {
        onStyleChange(styleId, styleName || null)
      }
      
      // 如果选择了风格并且该风格有image_upload限制，需要检查当前的创建模式
      if (styleData && styleData.prohibits_image_upload) {
        // 如果当前是图生图或图生视频模式，需要切换回文生图/文生视频
        if (creationMode === "img2img") {
          console.log('🎨 Wind style prohibits image upload, switching to text2img')
          setCreationMode("text2img")
          setUploadedImage(null)
        } else if (creationMode === "img2video") {
          console.log('🎨 Style prohibits image upload, switching to text2video')
          setCreationMode("text2video")
          setUploadedImage(null)
        }
      }
    }

    const handleAspectRatioChange = (aspectRatio: string) => {
      setSelectedAspectRatio(aspectRatio)
      if (onAspectRatioChange) {
        onAspectRatioChange(aspectRatio)
      }
    }

    const handleSubmitDrawing = (imageData: string) => {
      setUploadedImage(imageData)
      setShowDrawing(false)
    }

    const handleStartDrawing = () => {
      console.log('🎨 handleStartDrawing: Starting drawing mode with existing image:', !!uploadedImage)
      setShowDrawing(true)
      // 不要清除已上传的图片，用户需要在图片上绘画
      // setUploadedImage(null) // 移除这行，保留已上传的图片
    }

    const handleStartRender = () => {
      console.log('🎨 handleStartRender called')
      console.log('🎨 Current state:', {
        creationMode,
        textPrompt: textPrompt.trim(),
        selectedStyleId,
        selectedStyleData,
        uploadedImage: !!uploadedImage,
        imageCount,
        selectedAspectRatio
      })
      console.log(`🐛 About to call onStartRender with imageCount = ${imageCount}`)

      // 图生图和图生视频模式：需要图片
      if (creationMode === "img2img" || creationMode === "img2video") {
        if (!uploadedImage) {
          setRequirementsAlertData({
            title: 'Image Required',
            errors: ['Please upload or draw an image for image-to-image generation'],
            warnings: []
          })
          setShowRequirementsAlert(true)
          return
        }
        
        // 图生图模式，有图片就可以生成（提示词是可选的）
        onStartRender(selectedAspectRatio, selectedStyleId, imageCount, uploadedImage, {
          modelId: selectedModelId,
          kieModel: selectedKieModel
        })
        return
      }
      
      // 文生图和文生视频模式：需要提示词验证
      if (selectedStyleId === null) {
        // 如果选择了"No Style"，必须要有用户输入的提示词
        if (textPrompt.trim()) {
          onStartRender(selectedAspectRatio, selectedStyleId, imageCount, null, {
            modelId: selectedModelId,
            kieModel: selectedKieModel
          })
        } else {
          setRequirementsAlertData({
            title: 'Description Required',
            errors: ['Please enter a description of the image you want to generate'],
            warnings: []
          })
          setShowRequirementsAlert(true)
        }
      } else {
        // 对于非TOY PHOTOGRAPHY风格，检查是否有用户输入的提示词，或者选中的风格有默认提示词
        if (!selectedStyleData.name.includes('TOY PHOTOGRAPHY')) {
          const hasPrompt = textPrompt.trim() || (selectedStyleData?.default_prompt?.trim())
          if (hasPrompt) {
            onStartRender(selectedAspectRatio, selectedStyleId, imageCount, uploadedImage, {
              modelId: selectedModelId,
              kieModel: selectedKieModel
            })
          } else {
            setRequirementsAlertData({
              title: 'Description Required',
              errors: ['Please enter a description or choose a style with default prompt'],
              warnings: []
            })
            setShowRequirementsAlert(true)
          }
        }
        // TOY PHOTOGRAPHY风格的验证已在上面处理
      }
    }

    return (
      <>
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] flex flex-col">
          {/* Header - 简化版，移除模式切换 */}
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
            {!hideModeSelector && (
            <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform rotate-1 hover:rotate-0 transition-all duration-300 relative overflow-hidden">
              {/* 装饰元素 */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#d4a574] rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#8b7355] rounded-full"></div>
              
              <h3
                className="text-[#2d3e2d] font-black text-lg mb-4 transform -rotate-2"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "2px 2px 0px #d4a574",
                }}
              >
                Choose Creation Mode! 🎯
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setCreationMode("text2img")}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:rotate-1 ${
                    creationMode === "text2img"
                      ? "bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-105 rotate-1 shadow-lg"
                      : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:border-[#d4a574] hover:bg-white"
                  }`}
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <Type className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold text-sm">Text to Image</div>
                </button>
                
                <button
                  onClick={() => {
                    // 检查选择的风格是否禁止图片上传
                    if (selectedStyleData?.prohibits_image_upload) {
                      // 显示提示
                      setRequirementsAlertData({
                        title: `${selectedStyleData.emoji} ${selectedStyleData.name} Restriction`,
                        errors: [`${selectedStyleData.name} style does not support image upload. This is a text-only style. Please use Text-to-Image mode.`],
                        warnings: [],
                        styleName: selectedStyleData.name,
                        styleEmoji: selectedStyleData.emoji
                      })
                      setShowRequirementsAlert(true)
                      return
                    }
                    setCreationMode("img2img")
                  }}
                  disabled={selectedStyleData?.prohibits_image_upload}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:-rotate-1 ${
                    selectedStyleData?.prohibits_image_upload
                      ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                      : creationMode === "img2img"
                        ? "bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-105 -rotate-1 shadow-lg"
                        : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:border-[#d4a574] hover:bg-white"
                  }`}
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold text-sm">Image to Image</div>
                </button>
                
                <button
                  onClick={() => setCreationMode("text2video")}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:rotate-2 ${
                    creationMode === "text2video"
                      ? "bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-105 rotate-2 shadow-lg"
                      : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:border-[#d4a574] hover:bg-white"
                  }`}
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <Video className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold text-sm">Text to Video</div>
                </button>
                
                <button
                  onClick={() => {
                    // 检查选择的风格是否禁止图片上传
                    if (selectedStyleData?.prohibits_image_upload) {
                      // 显示提示
                      setRequirementsAlertData({
                        title: `${selectedStyleData.emoji} ${selectedStyleData.name} Restriction`,
                        errors: [`${selectedStyleData.name} style does not support image upload. This is a text-only style. Please use Text-to-Video mode.`],
                        warnings: [],
                        styleName: selectedStyleData.name,
                        styleEmoji: selectedStyleData.emoji
                      })
                      setShowRequirementsAlert(true)
                      return
                    }
                    setCreationMode("img2video")
                  }}
                  disabled={selectedStyleData?.prohibits_image_upload}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:-rotate-2 ${
                    selectedStyleData?.prohibits_image_upload
                      ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                      : creationMode === "img2video"
                        ? "bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-105 -rotate-2 shadow-lg"
                        : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:border-[#d4a574] hover:bg-white"
                  }`}
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <Film className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold text-sm">Image to Video</div>
                </button>
              </div>
            </div>
            )}

            {/* Image Upload/Drawing for img2img and img2video modes */}
            {(creationMode === "img2img" || creationMode === "img2video") && (
              <div>
                <h3
                  className="text-[#2d3e2d] font-black text-lg mb-4 transform rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Upload or Draw Your Image! 📸🎨
                </h3>
                
                {/* Show uploaded image or drawing */}
                {uploadedImage && !showDrawing ? (
                  <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-6 text-center bg-[#f5f1e8]">
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Uploaded or drawn image"
                        className="max-h-[200px] mx-auto rounded-lg shadow-lg border-2 border-[#8b7355]"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute -top-2 -right-2 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] rounded-full w-8 h-8 flex items-center justify-center font-bold"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="mt-3 flex gap-2 justify-center">
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-bold px-4 py-2 rounded-xl transition-all"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <ImageIcon className="w-4 h-4 mr-1 inline" />
                          Upload New
                        </button>
                        <button
                          onClick={handleStartDrawing}
                          className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-bold px-4 py-2 rounded-xl transition-all"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Brush className="w-4 h-4 mr-1 inline" />
                          Edit Image
                        </button>
                      </div>
                    </div>
                  </div>
                ) :                 showDrawing ? (
                  /* Image Editing Canvas */
                  <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-6 bg-[#f5f1e8]">
                    <div className="text-center mb-4">
                      <h4 className="text-[#2d3e2d] font-bold text-lg mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        🖼️ Edit Your Image!
                      </h4>
                      <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        Draw modifications on your image - AI will enhance the changes!
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border-2 border-[#8b7355] overflow-hidden">
                      <SketchCanvas 
                        onSubmitDrawing={handleSubmitDrawing} 
                        baseImage={uploadedImage}
                        mode="edit"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setShowDrawing(false)}
                          className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-bold px-6 py-3 rounded-xl transition-all transform hover:scale-105"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // 手动触发保存
                            const canvas = document.querySelector('canvas') as HTMLCanvasElement
                            if (canvas) {
                              const imageData = canvas.toDataURL("image/png")
                              handleSubmitDrawing(imageData)
                              console.log('🎨 Manual save triggered from external button')
                            }
                          }}
                          className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-bold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg animate-pulse"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2 inline" />
                          Save Changes! ✨
                        </button>
                      </div>
                      <p className="text-[#8b7355] text-sm mt-2 font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        💡 Tip: You can also use the "Apply Changes!" button on the canvas
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Upload or Draw options */
                  <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-6 text-center bg-[#f5f1e8]">
                    <div className="py-8">
                      <div className="flex justify-center gap-8 mb-6">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-[#8b7355] mx-auto mb-2" />
                          <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                            Upload Image
                          </p>
                        </div>
                        <div className="text-[#8b7355] text-2xl flex items-center">OR</div>
                        <div className="text-center">
                          <Brush className="w-12 h-12 text-[#8b7355] mx-auto mb-2" />
                          <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                            Edit Image
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <label className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-bold px-6 py-3 rounded-xl cursor-pointer transition-all transform hover:scale-105 border-2 border-[#2d3e2d]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (event) => {
                                  setUploadedImage(event.target?.result as string)
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="hidden"
                          />
                          <ImageIcon className="w-5 h-5 mr-2 inline" />
                          Choose File
                        </label>
                        <button
                          onClick={handleStartDrawing}
                          disabled={!uploadedImage}
                          className={`font-bold px-6 py-3 rounded-xl transition-all transform border-2 border-[#2d3e2d] ${
                            uploadedImage 
                              ? "bg-[#8b7355] hover:bg-[#6d5a42] text-[#f5f1e8] hover:scale-105" 
                              : "bg-[#8b7355]/30 text-[#8b7355] cursor-not-allowed"
                          }`}
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Brush className="w-5 h-5 mr-2 inline" />
                          {uploadedImage ? "Start Editing" : "Upload Image First"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Prompt - Moved to top */}
            <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform rotate-0.5 hover:-rotate-0.5 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              {/* 装饰元素 */}
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#d4a574] rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#8b7355] rounded-full"></div>
              
              <div className="space-y-3">
                <Label
                  className="text-[#2d3e2d] font-black text-base transform -rotate-1 hover:rotate-1 hover:scale-105 inline-block transition-all duration-300 cursor-pointer"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  {(creationMode === "img2img" || creationMode === "img2video") ? 
                    "Describe Your Vision! (Optional) 💭" : 
                    "Describe Your Vision! ✨"
                  }
                </Label>
                <div className="relative group">
                  <Textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder={
                      (creationMode === "img2img" || creationMode === "img2video") ? 
                        "Describe how you want to transform your image... (Optional - AI can work with just the image!)" :
                        "A magical forest with glowing mushrooms and fairy lights..."
                    }
                    className="border-2 border-[#8b7355] bg-[#f5f1e8] text-[#2d3e2d] placeholder:text-[#8b7355]/70 font-bold resize-none focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 pr-10 py-6"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    rows={7}
                  />
                  {/* Clear button - 只在有内容且hover时显示 */}
                  {textPrompt && (
                    <button
                      onClick={() => setTextPrompt('')}
                      className="absolute top-2 right-2 w-6 h-6 bg-[#8b7355] hover:bg-[#d4a574] text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                      style={{ 
                        fontFamily: "Fredoka One, Arial Black, sans-serif",
                        fontSize: "14px",
                        fontWeight: "bold"
                      }}
                      title="Clear text"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Random and Reset buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      const randomPrompts = [
                        "A magical forest with glowing mushrooms and fairy lights",
                        "A cyberpunk city with neon lights reflecting in the rain",
                        "A serene mountain lake at sunset with mist",
                        "A cute cat wizard casting colorful spells",
                        "A fantasy castle floating in the clouds",
                        "A steampunk airship sailing through golden sky",
                        "A cozy cottage in an enchanted winter wonderland",
                        "A dragon soaring over mystical ancient ruins",
                        "A vibrant underwater coral reef with tropical fish",
                        "A peaceful zen garden with cherry blossoms falling",
                        "A majestic phoenix rising from crystalline flames",
                        "A space explorer discovering alien planets with purple moons",
                        "A Victorian mansion in a thunderstorm with lightning",
                        "A friendly robot gardener tending to rainbow flowers",
                        "An ancient library with floating books and golden dust",
                        "A pirate ship sailing through starry night clouds",
                        "A crystal cave filled with bioluminescent creatures",
                        "A time traveler's workshop with clockwork inventions",
                        "A mermaid palace built from coral and pearls",
                        "A ninja cat on a moonlit rooftop in feudal Japan",
                        "A floating island city with waterfalls and bridges",
                        "A magical bakery where pastries glow with enchantments",
                        "An arctic fox dancing with aurora borealis lights",
                        "A desert oasis with palm trees and hidden treasures",
                        "A clockwork butterfly in a garden of mechanical flowers",
                        "A sleepy dragon curled around a tower of books",
                        "A carnival in the clouds with balloon rides and cotton candy",
                        "A witch's greenhouse filled with singing plants",
                        "A knight's armor decorating a peaceful meadow",
                        "A submarine exploring colorful deep-sea trenches",
                        "A treehouse village connected by rope bridges",
                        "A phoenix feather glowing in an ancient temple",
                        "A robot artist painting landscapes on Mars",
                        "A fairy ring of mushrooms glowing under starlight",
                        "A clocktower with gears made of autumn leaves",
                        "A dragon egg nestled in a field of spring flowers",
                        "A ghost ship sailing through mist and moonbeams",
                        "A butterfly sanctuary with rainbow-winged creatures",
                        "A medieval tournament with colorful banners flying",
                        "A hot air balloon race over painted desert canyons"
                      ]
                      // 智能防重复随机选择
                      let availableIndices = Array.from({length: randomPrompts.length}, (_, i) => i)
                        .filter(i => !usedPromptIndices.has(i))
                      
                      // 如果所有提示词都用过了，重置已使用列表
                      if (availableIndices.length === 0) {
                        setUsedPromptIndices(new Set())
                        availableIndices = Array.from({length: randomPrompts.length}, (_, i) => i)
                      }
                      
                      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
                      const randomPrompt = randomPrompts[randomIndex]
                      
                      // 记录已使用的提示词索引
                      setUsedPromptIndices(prev => new Set([...prev, randomIndex]))
                      setTextPrompt(randomPrompt)
                    }}
                    className="px-3 py-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    title="Generate random prompt"
                  >
                    🎲 Random
                  </button>
                  <button
                    onClick={() => setTextPrompt('')}
                    className="px-3 py-1 bg-[#8b7355] hover:bg-[#7a6449] text-white rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    title="Reset text"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Model Selector and Aspect Ratio in same row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Model Selector */}
              <ModelSelector
                onModelSelect={setSelectedModelId}
                selectedModelId={selectedModelId}
                type="image_generation"
                className="transform rotate-0.5 hover:-rotate-0.5 hover:scale-105 hover:shadow-2xl transition-all duration-300"
                // 传递kieModel信息给ModelSelector以便动态显示
                dynamicKieModel={selectedKieModel}
                availableModels={availableModels}
              />

              {/* Aspect Ratio Selection */}
              <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform -rotate-0.5 hover:rotate-0 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                {/* 装饰元素 */}
                <div className="absolute -top-2 -left-2 w-5 h-5 bg-[#d4a574] rounded-full"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#8b7355] rounded-full"></div>
                
                <h4 className="text-[#2d3e2d] font-black text-base mb-3 transform rotate-1" style={{ 
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "1px 1px 0px #d4a574"
                }}>
                  Aspect Ratio 📐
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio, index) => (
                    <Button
                      key={ratio.id}
                      onClick={() => handleAspectRatioChange(ratio.id)}
                      variant="outline"
                      className={`h-auto py-2 px-1 border-2 font-bold transition-all transform hover:scale-105 hover:shadow-lg text-xs ${
                        selectedAspectRatio === ratio.id
                          ? `bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-105 shadow-lg ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`
                          : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:bg-[#d4a574]/20 hover:border-[#d4a574]"
                      }`}
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {typeof ratio.icon === 'string' ? (
                          <span className="text-sm">{ratio.icon}</span>
                        ) : (
                          <div className="text-sm">{ratio.icon}</div>
                        )}
                        <span className="text-xs leading-tight">{ratio.name}</span>
                        <span className="text-xs opacity-70">{ratio.id}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kie.ai Model Selection - Show only when Kie.ai/Flux model is selected */}
            {isKieAiModel && (
              <KieModelSelector
                onModelSelect={setSelectedKieModel}
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

            {/* Image Count and Magic Tips in same row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Image Count Selection */}
              <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform rotate-0.5 hover:-rotate-0.5 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                {/* 装饰元素 */}
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#d4a574] rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#8b7355] rounded-full"></div>
                
                <h4 className="text-[#2d3e2d] font-black text-base mb-3 transform -rotate-1" style={{ 
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "1px 1px 0px #d4a574"
                }}>
                  Number of {creationMode.includes("video") ? "Videos" : "Images"} 🖼️
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 4].map((count, index) => (
                    <Button
                      key={count}
                      onClick={() => {
                        console.log(`🐛 Setting imageCount to ${count}`)
                        setImageCount(count)
                      }}
                      variant="outline"
                      className={`h-16 px-4 py-3 border-3 font-black transition-all transform hover:scale-110 hover:shadow-xl text-base rounded-xl ${
                        imageCount === count
                          ? `bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-110 shadow-xl ${index % 2 === 0 ? 'rotate-2' : '-rotate-2'}`
                          : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:bg-[#d4a574]/20 hover:border-[#d4a574]"
                      }`}
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-2xl font-black">{count}</span>
                        <span className="text-xs opacity-80">
                          {creationMode.includes("video") ? "Video" : "Image"}{count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Magic Tips */}
              <div className="p-4 bg-gradient-to-br from-[#f5f1e8] to-[#ede7d3] rounded-xl border-2 border-[#8b7355] shadow-lg transform -rotate-0.5 hover:rotate-0 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                {/* 装饰元素 */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#8b7355] rounded-full animate-pulse delay-500"></div>
                
                <h4
                  className="text-[#2d3e2d] font-black mb-2 transform rotate-1 animate-wiggle"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "2px 2px 0px #d4a574",
                  }}
                >
                  Magic Tips! 💡
                </h4>
                <div
                  className="text-[#2d3e2d] font-bold space-y-1 text-sm"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  {creationMode === "text2img" && (
                    <>
                      <p>📝 Detailed descriptions get better results</p>
                      <p>🎨 Try adding style keywords like "watercolor", "oil painting"</p>
                      <p>✨ Use emotional words like "dreamy", "mysterious"</p>
                    </>
                  )}
                  {creationMode === "img2img" && (
                    <>
                      <p>🖼️ Clear, high-quality images work best</p>
                      <p>🎨 Describe the transformation you want</p>
                      <p>✨ Additional descriptions help guide the result</p>
                    </>
                  )}
                  {creationMode === "text2video" && (
                    <>
                      <p>🎬 Describe movement and action for better videos</p>
                      <p>🎨 Include camera angles like "close-up", "wide shot"</p>
                      <p>✨ Mention lighting and atmosphere for cinematic feel</p>
                    </>
                  )}
                  {creationMode === "img2video" && (
                    <>
                      <p>🖼️ Use clear, well-lit images for best results</p>
                      <p>🎭 Describe specific movements you want to see</p>
                      <p>✨ Keep animations simple for more realistic results</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button - Full Width */}
            <div className="relative">
              {/* 装饰性背景元素 */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4a574]/20 to-[#8b7355]/20 rounded-3xl transform rotate-1 scale-105"></div>
              
              <Button
                onClick={handleStartRender}
                disabled={false} // 移除所有disabled限制，让弹窗验证机制处理拦截
                className="relative w-full bg-gradient-to-r from-[#d4a574] to-[#8b7355] hover:from-[#c19660] hover:to-[#6d5a42] text-[#2d3e2d] font-black text-lg py-4 rounded-2xl shadow-2xl border-4 border-[#2d3e2d] transform hover:scale-105 hover:-rotate-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0 animate-pulse"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "2px 2px 0px rgba(245, 241, 232, 0.8)",
                }}
              >
                <span className="relative z-10">
                  ✨ Generate {imageCount} Amazing {
                    creationMode.includes("video") ? 
                      `Video${imageCount > 1 ? 's' : ''}` : 
                      `Image${imageCount > 1 ? 's' : ''}`
                  } ✨
                </span>
                
                {/* 闪烁效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </Button>
            </div>


          </div>
        </div>

        {/* 风格要求提示对话框 */}
        <StyleRequirementsAlert
          isOpen={showRequirementsAlert}
          onClose={() => setShowRequirementsAlert(false)}
          title={requirementsAlertData.title}
          errors={requirementsAlertData.errors}
          warnings={requirementsAlertData.warnings}
          styleName={requirementsAlertData.styleName}
          styleEmoji={requirementsAlertData.styleEmoji}
        />
      </>
    )
  },
)

GenerationInterface.displayName = "GenerationInterface"

export default GenerationInterface