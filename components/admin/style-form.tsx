'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Save, Sparkles, Eye, Crop } from 'lucide-react'
import { StyleModel } from '@/lib/database/styles'
import ImageCropper from '@/components/ui/image-cropper'

interface StyleFormProps {
  style?: StyleModel | null
  onSave: (styleData: any) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export default function StyleForm({ style, onSave, onCancel, isLoading }: StyleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '🎨',
    image_url: '',
    prompt_template: '',
    default_prompt: '',
    type: 'image' as 'image' | 'video' | 'both',
    category: 'photographic-realism' as 'photographic-realism' | 'illustration-digital-painting' | 'anime-comics' | 'concept-art' | '3d-render' | 'abstract' | 'fine-art-movements' | 'technical-scientific' | 'architecture-interior' | 'design-commercial' | 'genre-driven' | 'vintage-retro',
    is_premium: false,
    is_active: true,
    sort_order: 0,
    // 新增的限制条件字段
    requires_image_upload: false,
    requires_prompt_description: false,
    prohibits_image_upload: false, // 新增：禁止图片上传
    min_prompt_length: 0,
    max_prompt_length: 1000,
    allowed_image_formats: ['jpg', 'jpeg', 'png', 'webp'],
    requirements_description: ''
  })

  const [previewImage, setPreviewImage] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)

  // 本地存储的key
  const STORAGE_KEY = 'admin_style_form_draft'

  // 监听页面可见性变化，防止切换标签页时重新加载
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
      if (!document.hidden) {
        console.log('页面重新可见，保持当前状态')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // 初始化时加载数据
  useEffect(() => {
    if (style) {
      const styleData = {
        name: style.name,
        description: style.description,
        emoji: style.emoji,
        image_url: style.image_url,
        prompt_template: style.prompt_template,
        default_prompt: style.default_prompt || '',
        type: style.type,
        category: style.category,
        is_premium: style.is_premium,
        is_active: style.is_active,
        sort_order: style.sort_order,
        // 新增的限制条件字段
        requires_image_upload: style.requires_image_upload || false,
        requires_prompt_description: style.requires_prompt_description || false,
        prohibits_image_upload: style.prohibits_image_upload || false, // 新增
        min_prompt_length: style.min_prompt_length || 0,
        max_prompt_length: style.max_prompt_length || 1000,
        allowed_image_formats: style.allowed_image_formats || ['jpg', 'jpeg', 'png', 'webp'],
        requirements_description: style.requirements_description || ''
      }
      setFormData(styleData)
      setPreviewImage(style.image_url)
    } else {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          if (parsedData.formData) {
            setFormData(parsedData.formData)
            setPreviewImage(parsedData.previewImage || '')
            console.log('已恢复表单草稿')
          }
        }
      } catch (error) {
        console.log('加载表单草稿失败:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (style) {
      const styleData = {
        name: style.name,
        description: style.description,
        emoji: style.emoji,
        image_url: style.image_url,
        prompt_template: style.prompt_template,
        default_prompt: style.default_prompt || '',
        type: style.type,
        category: style.category,
        is_premium: style.is_premium,
        is_active: style.is_active,
        sort_order: style.sort_order,
        // 新增的限制条件字段
        requires_image_upload: style.requires_image_upload || false,
        requires_prompt_description: style.requires_prompt_description || false,
        prohibits_image_upload: style.prohibits_image_upload || false, // 新增
        min_prompt_length: style.min_prompt_length || 0,
        max_prompt_length: style.max_prompt_length || 1000,
        allowed_image_formats: style.allowed_image_formats || ['jpg', 'jpeg', 'png', 'webp'],
        requirements_description: style.requirements_description || ''
      }
      setFormData(styleData)
      setPreviewImage(style.image_url)
    }
  }, [style?.id])

  // 增强的自动保存机制
  useEffect(() => {
    if (!style && (formData.name || formData.description || formData.prompt_template || previewImage)) {
      const timer = setTimeout(() => {
        try {
          const draftData = {
            formData,
            previewImage,
            selectedFile: null, // 文件对象无法序列化，但URL已保存
            timestamp: Date.now(),
            version: '1.0' // 版本号，用于兼容性检查
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData))
          console.log('✅ 已自动保存草稿 (包含图片)')
        } catch (error) {
          console.log('❌ 保存表单草稿失败:', error)
        }
      }, 300) // 减少延迟，更频繁保存

      return () => clearTimeout(timer)
    }
  }, [formData, previewImage, style])

  // 页面卸载前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!style && (formData.name || formData.description || formData.prompt_template || previewImage)) {
        try {
          const draftData = {
            formData,
            previewImage,
            timestamp: Date.now(),
            version: '1.0'
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData))
          console.log('🔄 页面卸载前保存草稿')
        } catch (error) {
          console.log('❌ 页面卸载前保存失败:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [formData, previewImage, style])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 移除了selectedFile状态，ImageCropper组件内部管理文件选择

  // 移除了handleImageUpload函数，因为ImageCropper组件有内置的文件选择功能

  const handleCropComplete = (croppedImageUrl: string) => {
    setPreviewImage(croppedImageUrl)
    handleInputChange('image_url', croppedImageUrl)
    setShowImageCropper(false)
  }

  const handleCropCancel = () => {
    setShowImageCropper(false)
  }

  const handleSaveDraft = () => {
    try {
      const draftData = {
        formData,
        previewImage,
        timestamp: Date.now(),
        version: '1.0'
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData))
      alert('✅ 草稿已手动保存！')
      console.log('🔄 手动保存草稿成功')
    } catch (error) {
      alert('❌ 保存草稿失败')
      console.log('❌ 手动保存草稿失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.prompt_template.trim()) {
      alert('请填写所有必填字段')
      return
    }
    
    if (!formData.prompt_template.includes('{prompt}')) {
      alert('⚠️ 提示词模板必须包含 {prompt} 占位符以接收用户输入')
      return
    }

    try {
      await onSave(formData)
      if (!style) {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('保存样式失败:', error)
    }
  }

  const categoryOptions = [
    { value: 'photographic-realism', label: 'Photographic Realism' },
    { value: 'illustration-digital-painting', label: 'Illustration & Digital Painting' },
    { value: 'anime-comics', label: 'Anime & Comics' },
    { value: 'concept-art', label: 'Concept Art' },
    { value: '3d-render', label: '3D Render' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'fine-art-movements', label: 'Fine-Art Movements' },
    { value: 'technical-scientific', label: 'Technical & Scientific' },
    { value: 'architecture-interior', label: 'Architecture & Interior' },
    { value: 'design-commercial', label: 'Design & Commercial' },
    { value: 'genre-driven', label: 'Genre-Driven' },
    { value: 'vintage-retro', label: 'Vintage & Retro' }
  ]

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto border-4 border-[#8b7355] bg-[#f5f1e8]">
        <CardHeader className="bg-[#d4a574] border-b-4 border-[#8b7355]">
          <CardTitle 
            className="text-2xl font-black text-[#2d3e2d] flex items-center gap-2"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Sparkles className="w-6 h-6" />
            {style ? '编辑样式' : '创建新样式'} ✨
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label 
                    htmlFor="name" 
                    className="text-[#2d3e2d] font-bold text-sm flex items-center gap-1"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    样式名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="例如：动漫风格"
                    className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label 
                    htmlFor="emoji" 
                    className="text-[#2d3e2d] font-bold text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    表情符号
                  </Label>
                  <Input
                    id="emoji"
                    value={formData.emoji}
                    onChange={(e) => handleInputChange('emoji', e.target.value)}
                    placeholder="🎨"
                    className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl"
                    maxLength={2}
                  />
                </div>

                <div>
                  <Label 
                    htmlFor="type" 
                    className="text-[#2d3e2d] font-bold text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    类型
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">图片生成</SelectItem>
                      <SelectItem value="video">视频生成</SelectItem>
                      <SelectItem value="both">两者皆可</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label 
                    htmlFor="category" 
                    className="text-[#2d3e2d] font-bold text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    分类
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label 
                  className="text-[#2d3e2d] font-bold text-sm"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  样式预览图片
                </Label>
                
                <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-4 text-center bg-white relative">
                  {previewImage ? (
                    <div className="relative flex justify-center">
                      {/* 强制方形容器 */}
                      <div className="w-48 h-48 relative rounded-lg overflow-hidden border-2 border-[#8b7355]">
                        <img 
                          src={previewImage} 
                          alt="Style preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-[#8b7355] hover:bg-[#6d5a44] text-white transform transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                            onClick={() => setShowImageCropper(true)}
                          >
                            <Crop className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="transform transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                            onClick={() => {
                              setPreviewImage('')
                              handleInputChange('image_url', '')
                            }}
                          >
                            <X className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="flex flex-col items-center space-y-3">
                        <Upload className="w-8 h-8 text-[#8b7355]" />
                        <p 
                          className="text-[#8b7355] font-bold text-sm"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          点击上传并裁剪图片 ✂️
                        </p>
                        <p className="text-xs text-gray-500">
                          支持 PNG、JPG，最大 10MB • 自动裁剪和缩放
                        </p>
                        <Button
                          type="button"
                          className="bg-[#8b7355] hover:bg-[#6d5a44] text-white font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          onClick={() => setShowImageCropper(true)}
                        >
                          <Crop className="w-4 h-4 mr-2 transition-transform duration-200 group-active:rotate-12" />
                          选择并裁剪图片
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* 移除了隐藏的input，ImageCropper有内置文件选择功能 */}
                </div>
              </div>
            </div>

            <div>
              <Label 
                htmlFor="description" 
                className="text-[#2d3e2d] font-bold text-sm flex items-center gap-1"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                描述 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="描述样式的特点和特色..."
                className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl min-h-[80px]"
                required
              />
            </div>

            <div>
              <Label 
                htmlFor="prompt_template" 
                className="text-[#2d3e2d] font-bold text-sm flex items-center gap-1"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                提示词模板 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="prompt_template"
                value={formData.prompt_template}
                onChange={(e) => handleInputChange('prompt_template', e.target.value)}
                placeholder="例如：{prompt}, anime style, vibrant colors, detailed artwork"
                className={`border-2 ${formData.prompt_template.includes('{prompt}') ? 'border-[#8b7355]' : 'border-red-500'} focus:border-[#d4a574] rounded-xl min-h-[100px]`}
                required
              />
              <div className="mt-1 space-y-1">
                <p className="text-xs text-gray-600">
                  使用 {`{prompt}`} 作为用户输入的占位符
                </p>
                {!formData.prompt_template.includes('{prompt}') && formData.prompt_template && (
                  <p className="text-xs text-red-500 font-bold flex items-center">
                    <span className="mr-1">⚠️</span>
                    警告：模板必须包含 {`{prompt}`} 占位符以接收用户输入
                  </p>
                )}
                {formData.prompt_template.includes('{prompt}') && formData.prompt_template && (
                  <p className="text-xs text-green-600 font-bold flex items-center">
                    <span className="mr-1">✅</span>
                    模板有效 - 包含 {`{prompt}`} 占位符
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label 
                htmlFor="default_prompt" 
                className="text-[#2d3e2d] font-bold text-sm flex items-center gap-1"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                默认提示词 <span className="text-blue-500">(可选)</span>
              </Label>
              <Textarea
                id="default_prompt"
                value={formData.default_prompt}
                onChange={(e) => handleInputChange('default_prompt', e.target.value)}
                placeholder="例如：Sun Wukong causing havoc in heaven, traditional Chinese mythology, epic battle scene"
                className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl min-h-[80px]"
              />
              <div className="mt-1">
                <p className="text-xs text-gray-600">
                  当用户不输入提示词时使用的默认英文提示词。如果用户输入了提示词，则使用用户的提示词。
                </p>
                {formData.default_prompt && (
                  <p className="text-xs text-green-600 font-bold flex items-center mt-1">
                    <span className="mr-1">✅</span>
                    已设置默认提示词：用户无输入时将使用此提示词
                  </p>
                )}
              </div>
            </div>

            {/* 使用限制条件 */}
            <div className="p-6 bg-gradient-to-r from-[#f5f1e8] to-[#d4a574]/20 rounded-xl border-2 border-[#8b7355]/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚙️</span>
                <Label 
                  className="text-[#2d3e2d] font-bold text-lg"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  使用限制条件
                </Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#8b7355]/30">
                  <div>
                    <Label 
                      className="text-[#2d3e2d] font-bold text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      📸 必须上传图片
                    </Label>
                    <p className="text-xs text-gray-600">用户必须上传参考图片才能使用此风格</p>
                  </div>
                  <Switch
                    checked={formData.requires_image_upload}
                    onCheckedChange={(checked) => handleInputChange('requires_image_upload', checked)}
                    disabled={formData.prohibits_image_upload} // 禁止上传时不能同时要求上传
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#8b7355]/30">
                  <div>
                    <Label 
                      className="text-[#2d3e2d] font-bold text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      ✍️ 必须输入描述
                    </Label>
                    <p className="text-xs text-gray-600">用户必须输入提示词描述</p>
                  </div>
                  <Switch
                    checked={formData.requires_prompt_description}
                    onCheckedChange={(checked) => handleInputChange('requires_prompt_description', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-300">
                  <div>
                    <Label 
                      className="text-red-700 font-bold text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      🚫 禁止图片上传
                    </Label>
                    <p className="text-xs text-red-600">此风格仅支持文本生成，不允许上传图片（如CHIBI DIORAMA等风格）</p>
                  </div>
                  <Switch
                    checked={formData.prohibits_image_upload}
                    onCheckedChange={(checked) => {
                      handleInputChange('prohibits_image_upload', checked)
                      // 如果禁止上传图片，自动关闭"必须上传图片"
                      if (checked) {
                        handleInputChange('requires_image_upload', false)
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label 
                    htmlFor="min_prompt_length" 
                    className="text-[#2d3e2d] font-bold text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    📝 最小描述长度
                  </Label>
                  <Input
                    id="min_prompt_length"
                    type="number"
                    value={formData.min_prompt_length}
                    onChange={(e) => handleInputChange('min_prompt_length', parseInt(e.target.value) || 0)}
                    className="border border-[#8b7355]/30 focus:border-[#d4a574] rounded-lg"
                    min="0"
                    max="500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-600 mt-1">设置为0表示无限制</p>
                </div>

                <div>
                  <Label 
                    htmlFor="max_prompt_length" 
                    className="text-[#2d3e2d] font-bold text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    📏 最大描述长度
                  </Label>
                  <Input
                    id="max_prompt_length"
                    type="number"
                    value={formData.max_prompt_length}
                    onChange={(e) => handleInputChange('max_prompt_length', parseInt(e.target.value) || 1000)}
                    className="border border-[#8b7355]/30 focus:border-[#d4a574] rounded-lg"
                    min="10"
                    max="2000"
                    placeholder="1000"
                  />
                  <p className="text-xs text-gray-600 mt-1">建议设置为1000以内</p>
                </div>
              </div>

              <div className="mb-4">
                <Label 
                  htmlFor="allowed_image_formats" 
                  className="text-[#2d3e2d] font-bold text-sm"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  🖼️ 允许的图片格式
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].map((format) => (
                    <label key={format} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowed_image_formats.includes(format)}
                        onChange={(e) => {
                          const formats = formData.allowed_image_formats
                          if (e.target.checked) {
                            handleInputChange('allowed_image_formats', [...formats, format])
                          } else {
                            handleInputChange('allowed_image_formats', formats.filter(f => f !== format))
                          }
                        }}
                        className="rounded border-[#8b7355]"
                      />
                      <span className="text-sm font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        {format.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">选择此风格支持的图片格式</p>
              </div>

              <div>
                <Label 
                  htmlFor="requirements_description" 
                  className="text-[#2d3e2d] font-bold text-sm"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  📋 使用要求说明
                </Label>
                <Textarea
                  id="requirements_description"
                  value={formData.requirements_description}
                  onChange={(e) => handleInputChange('requirements_description', e.target.value)}
                  placeholder="例如：此风格需要上传参考图片，AI将基于您的图片创造玩具摄影风格的作品。请确保图片清晰，主体明确。"
                  className="border border-[#8b7355]/30 focus:border-[#d4a574] rounded-lg min-h-[80px] mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">向用户说明使用此风格的具体要求和注意事项</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#8b7355]">
                <div>
                  <Label 
                    className="text-[#2d3e2d] font-bold text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    高级样式
                  </Label>
                  <p className="text-xs text-gray-600">需要订阅</p>
                </div>
                <Switch
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => handleInputChange('is_premium', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#8b7355]">
                <div>
                  <Label 
                    className="text-[#2d3e2d] font-bold text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    启用
                  </Label>
                  <p className="text-xs text-gray-600">用户可见</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>

              <div>
                <Label 
                  htmlFor="sort_order" 
                  className="text-[#2d3e2d] font-bold text-sm"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  排序顺序
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl"
                  min="0"
                />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border-2 border-[#8b7355]">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-[#8b7355]" />
                <Label 
                  className="text-[#2d3e2d] font-bold"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  样式预览
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{formData.emoji}</div>
                <div>
                  <h4 
                    className="font-bold text-[#2d3e2d] text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    {formData.name || '样式名称'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {formData.description || '样式描述'}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {formData.type === 'image' ? '图片' : formData.type === 'video' ? '视频' : '两者'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {categoryOptions.find(cat => cat.value === formData.category)?.label}
                    </Badge>
                    {formData.is_premium && (
                      <Badge className="text-xs bg-[#d4a574] text-[#2d3e2d]">
                        高级
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-between">
              <div>
                {!style && (formData.name || formData.description || formData.prompt_template || previewImage) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    💾 保存草稿
                  </Button>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-white font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95 active:bg-[#b8935a] shadow-lg hover:shadow-xl"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2d3e2d] mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 transition-transform duration-200 group-active:rotate-12" />
                      {style ? '更新样式' : '创建样式'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {showImageCropper && (
        <ImageCropper
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          maxWidth={512}
          maxHeight={512}
          styleName={formData.name}
        />
      )}
    </>
  )
}
