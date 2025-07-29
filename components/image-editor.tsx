import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { X, Download, RotateCcw } from 'lucide-react'

interface ImageEditorProps {
  imageUrl: string
  onClose: () => void
  onSave?: (editedImageUrl: string) => void
}

export default function ImageEditor({ imageUrl, onClose, onSave }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [borderRadius, setBorderRadius] = useState(0)

  // 加载原始图片
  useEffect(() => {
    if (!imageUrl) {
      console.error('❌ No image URL provided to editor')
      return
    }

    console.log('🖼️ Loading image for editor:', imageUrl.substring(0, 100) + '...')
    
    const img = new Image()
    
    img.onload = () => {
      console.log('✅ Image loaded successfully for editor')
      setOriginalImage(img)
      drawImage(img, borderRadius)
    }
    
    img.onerror = (error) => {
      console.error('❌ Failed to load image in editor:', error)
      
      // 尝试使用crossOrigin
      const fallbackImg = new Image()
      fallbackImg.crossOrigin = 'anonymous'
      
      fallbackImg.onload = () => {
        console.log('✅ Image loaded with crossOrigin method')
        setOriginalImage(fallbackImg)
        drawImage(fallbackImg, borderRadius)
      }
      
      fallbackImg.onerror = () => {
        console.error('❌ Fallback image loading also failed')
      }
      
      fallbackImg.src = imageUrl
    }
    
    img.src = imageUrl
  }, [imageUrl])

  // 绘制图片
  const drawImage = (img: HTMLImageElement, radius: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸为正方形
    const size = Math.min(img.width, img.height)
    canvas.width = size
    canvas.height = size

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 计算图片在画布中的位置（居中裁剪）
    const sourceX = (img.width - size) / 2
    const sourceY = (img.height - size) / 2

    if (radius > 0) {
      ctx.save()
      
      if (radius >= 50) {
        // 圆形
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const circleRadius = canvas.width / 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI)
      } else {
        // 圆角矩形
        const actualRadius = (radius / 50) * canvas.width / 4
        ctx.beginPath()
        
        const x = 0, y = 0, width = canvas.width, height = canvas.height
        ctx.moveTo(x + actualRadius, y)
        ctx.lineTo(x + width - actualRadius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + actualRadius)
        ctx.lineTo(x + width, y + height - actualRadius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - actualRadius, y + height)
        ctx.lineTo(x + actualRadius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - actualRadius)
        ctx.lineTo(x, y + actualRadius)
        ctx.quadraticCurveTo(x, y, x + actualRadius, y)
        ctx.closePath()
      }
      
      ctx.clip()
    }

    // 绘制图片（居中裁剪）
    ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, canvas.width, canvas.height)
    
    if (radius > 0) {
      ctx.restore()
    }
  }

  // 更新圆角
  const updateBorderRadius = (value: number) => {
    setBorderRadius(value)
    if (originalImage) {
      drawImage(originalImage, value)
    }
  }

  // 重置
  const resetFilters = () => {
    setBorderRadius(0)
    if (originalImage) {
      drawImage(originalImage, 0)
    }
  }

  // 下载图片
  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'edited-image.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  // 保存图片
  const saveImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const editedImageUrl = canvas.toDataURL()
    onSave?.(editedImageUrl)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            🔘 Shape Editor
          </h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* 图片预览 */}
          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              className="border-2 border-[#8b7355] rounded-lg shadow-lg bg-white"
              style={{ width: '300px', height: '300px' }}
            />
          </div>

          {/* 控制器 */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">
                {borderRadius >= 50 ? '●' : borderRadius === 0 ? '■' : '▢'}
              </div>
              <div className="text-lg font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                {borderRadius >= 50 ? 'Circle' : borderRadius === 0 ? 'Square' : 'Rounded'}
              </div>
            </div>
            
            <Slider
              value={[borderRadius]}
              onValueChange={([value]) => updateBorderRadius(value)}
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-sm text-[#8b7355]">
              <span>Square</span>
              <span>Rounded</span>
              <span>Circle</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="flex-1 border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574]"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={downloadImage}
              variant="outline"
              className="flex-1 border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574]"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={saveImage}
              className="flex-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 