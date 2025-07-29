'use client'

import React, { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Upload, X, RotateCcw, ZoomIn, Crop as CropIcon, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ImageCropperProps {
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number
  className?: string
  styleName?: string
}

export default function ImageCropper({
  onCropComplete,
  onCancel,
  maxWidth = 512,
  maxHeight = 512,
  aspectRatio = 1, // 默认1:1正方形
  className,
  styleName
}: ImageCropperProps) {
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState([100])
  const [rotation, setRotation] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
  const blobUrlRef = useRef('')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10
      })
    }
  }, [aspectRatio])

  const generatePreview = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop, scale: number, rotate: number) => {
      const canvas = previewCanvasRef.current
      if (!canvas || !crop || crop.width === 0 || crop.height === 0) return

      // 设置预览canvas为正方形，和首页样式选择器一致
      const previewSize = 200 // 预览尺寸200x200像素
      canvas.width = previewSize
      canvas.height = previewSize
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, previewSize, previewSize)
      ctx.imageSmoothingQuality = 'high'

      // 计算裁剪区域在原始图像中的实际像素坐标
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      
      const cropX = crop.x * scaleX
      const cropY = crop.y * scaleY
      const cropWidth = crop.width * scaleX
      const cropHeight = crop.height * scaleY

      // 应用旋转
      if (rotate !== 0) {
        ctx.save()
        ctx.translate(previewSize / 2, previewSize / 2)
        ctx.rotate((rotate * Math.PI) / 180)
        ctx.translate(-previewSize / 2, -previewSize / 2)
      }

      // 直接从原始图像裁剪区域绘制到预览canvas
      ctx.drawImage(
        image,
        cropX, cropY, cropWidth, cropHeight, // 源图像的裁剪区域
        0, 0, previewSize, previewSize // 目标canvas的整个区域
      )

      if (rotate !== 0) {
        ctx.restore()
      }

      // 生成最终的裁剪图像blob
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current)
            }
            blobUrlRef.current = URL.createObjectURL(blob)
          }
        }, 'image/jpeg', 0.95)
      } catch (error) {
        console.error('生成预览失败:', error)
      }
    },
    []
  )

  const handleCropComplete = useCallback(
    (crop: PixelCrop) => {
      setCompletedCrop(crop)
      if (imgRef.current && crop.width && crop.height) {
        generatePreview(imgRef.current, crop, scale[0], rotation)
      }
    },
    [generatePreview, scale, rotation]
  )

  const handleScaleChange = (newScale: number[]) => {
    setScale(newScale)
    if (imgRef.current && completedCrop) {
      generatePreview(imgRef.current, completedCrop, newScale[0], rotation)
    }
  }

  const handleRotation = () => {
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
    if (imgRef.current && completedCrop) {
      generatePreview(imgRef.current, completedCrop, scale[0], newRotation)
    }
  }

  const [isUploading, setIsUploading] = useState(false)

  const handleSave = async () => {
    if (!blobUrlRef.current) return

    try {
      setIsUploading(true)
      
      // 获取canvas数据并转换为base64
      const canvas = previewCanvasRef.current
      if (!canvas) {
        throw new Error('无法获取裁剪后的图片数据')
      }

      // 将canvas转换为base64
      const imageData = canvas.toDataURL('image/png')
      
      console.log(`📸 准备上传裁剪后的图片到R2，样式名称：${styleName}`)

      // 上传到R2
      const response = await fetch('/api/admin/upload-cropped-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          styleName: styleName || 'unknown_style'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      const result = await response.json()
      console.log(`✅ 图片上传到R2成功：${result.data.r2Url}`)

      // 返回R2的URL而不是blob URL
      onCropComplete(result.data.r2Url)
      
    } catch (error) {
      console.error('❌ 上传裁剪图片失败:', error)
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const resetCrop = () => {
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    })
    setScale([100])
    setRotation(0)
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <Card className="w-full max-w-5xl mx-4 bg-white border-4 border-[#d4a574] rounded-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-[#d4a574] border-b-4 border-[#8b7355]">
          <CardTitle 
            className="text-2xl font-black text-[#2d3e2d] flex items-center justify-between"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <span className="flex items-center gap-2">
              <CropIcon className="w-6 h-6" />
              图片裁剪器 ✂️
            </span>
            <Button
              onClick={onCancel}
              variant="destructive"
              size="sm"
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {!selectedImage ? (
            <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-8 text-center bg-[#f5f1e8]">
              <Upload className="w-12 h-12 text-[#8b7355] mx-auto mb-4" />
              <p 
                className="text-[#8b7355] font-bold text-lg mb-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                选择图片进行裁剪 📸
              </p>
              <p className="text-[#8b7355] text-sm mb-4">
                支持 JPEG、PNG、WebP（最大 10MB）
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button 
                  type="button"
                  className="bg-[#8b7355] hover:bg-[#6d5a44] text-white font-bold rounded-xl cursor-pointer"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  asChild
                >
                  <span>选择图片</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 裁剪区域 */}
              <div className="lg:col-span-2 space-y-4">
                <Label 
                  className="text-[#2d3e2d] font-bold text-lg"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  裁剪和编辑图片
                </Label>
                
                <div className="border-2 border-[#8b7355] rounded-xl overflow-hidden bg-gray-100">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={handleCropComplete}
                    aspect={aspectRatio}
                    className="max-h-96"
                  >
                    <img
                      ref={imgRef}
                      src={selectedImage}
                      style={{
                        transform: `scale(${scale[0] / 100}) rotate(${rotation}deg)`,
                        maxHeight: '400px',
                        maxWidth: '100%'
                      }}
                      onLoad={onImageLoad}
                      alt="Crop preview"
                    />
                  </ReactCrop>
                </div>

                {/* 控制面板 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label 
                      className="text-[#2d3e2d] font-bold text-sm mb-2 block"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <ZoomIn className="w-4 h-4 inline mr-1" />
                      缩放: {scale[0]}%
                    </Label>
                    <Slider
                      value={scale}
                      onValueChange={handleScaleChange}
                      min={50}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <Button
                      type="button"
                      onClick={handleRotation}
                      className="bg-[#8b7355] hover:bg-[#6d5a44] text-white font-bold rounded-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      旋转90°
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={resetCrop}
                  variant="outline"
                  className="w-full border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#f5f1e8] font-bold rounded-xl"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  重置裁剪
                </Button>
              </div>

              {/* 预览区域 */}
              <div className="space-y-4">
                <Label 
                  className="text-[#2d3e2d] font-bold text-lg"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  预览效果
                </Label>
                
                <div className="border-2 border-[#8b7355] rounded-xl p-4 bg-white text-center">
                  <div className="mb-3">
                    <p 
                      className="text-[#2d3e2d] font-bold text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      在首页中的显示效果：
                    </p>
                  </div>
                  
                  {completedCrop ? (
                    <div className="flex flex-col items-center space-y-4">
                      {/* 模拟首页样式卡片 */}
                      <div className="border-2 border-[#8b7355] bg-white rounded-lg shadow-md overflow-hidden" style={{ width: '120px', height: '140px' }}>
                        <div className="p-2 text-center">
                          <div className="w-full aspect-square mb-1 rounded-lg overflow-hidden border-2 border-[#8b7355]/30">
                            <canvas
                              ref={previewCanvasRef}
                              className="w-full h-full object-cover scale-110"
                              style={{
                                imageRendering: 'crisp-edges',
                                filter: 'contrast(1.1) brightness(1.05) saturate(1.1)'
                              }}
                            />
                          </div>
                          <div className="text-sm">🎨</div>
                          <h4 className="text-[#2d3e2d] font-black text-xs leading-tight" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                            YOUR STYLE
                          </h4>
                        </div>
                      </div>
                      
                      <p 
                        className="text-[#8b7355] text-xs"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        裁剪框中的内容就是最终显示的效果
                      </p>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-[#8b7355]">
                      <p style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        调整裁剪区域查看预览
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={!completedCrop || isUploading}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        上传中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        保存到云端
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <a
        ref={hiddenAnchorRef}
        download
        style={{
          position: 'absolute',
          top: '-200vh',
          visibility: 'hidden'
        }}
      >
        Hidden download
      </a>
    </div>
  )
} 