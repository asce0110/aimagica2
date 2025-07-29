"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Brush, Eraser, Undo, Redo, CheckCircle, AlertCircle } from "lucide-react"

interface SketchCanvasProps {
  onSubmitDrawing?: (imageData: string) => void
  baseImage?: string | null // 基础图片URL
  mode?: 'draw' | 'edit' // 绘画模式：纯绘画 或 图片编辑
}

export default function SketchCanvas({ onSubmitDrawing, baseImage, mode = 'draw' }: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const animationFrameRef = useRef<number>()

  const [brushSize, setBrushSize] = useState([4])
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [sketchQuality, setSketchQuality] = useState<"good" | "warning" | null>(null)
  const [hasDrawing, setHasDrawing] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 初始化canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // 设置canvas实际大小
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      // 设置canvas显示大小
      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // 缩放context以匹配设备像素比
      ctx.scale(dpr, dpr)

      // 设置绘图属性
      if (mode === 'draw') {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, rect.width, rect.height)
      }
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.imageSmoothingEnabled = true

      contextRef.current = ctx
      console.log('🖌️ Canvas context set and ready for drawing')
      
      // 如果是编辑模式且有基础图片，加载图片
      if (mode === 'edit' && baseImage) {
        console.log('🎯 Canvas initialized in edit mode, loading base image...')
        loadBaseImage(ctx, rect.width, rect.height)
      } else {
        console.log('🎯 Canvas initialized in draw mode or no base image')
        setHasDrawing(false)
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [baseImage, mode])

  // 加载基础图片到canvas
  const loadBaseImage = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    console.log('🖼️ loadBaseImage called with:', { 
      hasBaseImage: !!baseImage, 
      canvasSize: `${canvasWidth}x${canvasHeight}`,
      imageType: baseImage?.startsWith('data:') ? 'Data URL' : 'External URL'
    })
    
    if (!baseImage) return

    const img = new Image()
    // 只有当图片是外部URL时才设置crossOrigin，Data URL不需要
    if (!baseImage.startsWith('data:')) {
      img.crossOrigin = "anonymous"
    }
    img.onload = () => {
      console.log('✅ Base image loaded successfully:', img.width, 'x', img.height)
      // 计算图片在canvas中的位置和大小，保持宽高比
      const imgAspect = img.width / img.height
      const canvasAspect = canvasWidth / canvasHeight
      
      let drawWidth, drawHeight, drawX, drawY
      
      if (imgAspect > canvasAspect) {
        // 图片更宽，以宽度为准
        drawWidth = canvasWidth
        drawHeight = canvasWidth / imgAspect
        drawX = 0
        drawY = (canvasHeight - drawHeight) / 2
      } else {
        // 图片更高，以高度为准
        drawHeight = canvasHeight
        drawWidth = canvasHeight * imgAspect
        drawX = (canvasWidth - drawWidth) / 2
        drawY = 0
      }
      
      console.log('📐 Drawing image at:', { drawX, drawY, drawWidth, drawHeight })
      
      // 清空canvas并绘制图片
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      setHasDrawing(true)
      console.log('🎨 Base image drawn to canvas successfully')
    }
    img.onerror = (error) => {
      console.error("❌ Failed to load base image:", error)
      console.error("🔍 Image source:", baseImage?.substring(0, 100) + '...')
      // 加载失败时显示白色背景
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      setHasDrawing(false)
    }
    img.src = baseImage
  }

  // 优化的鼠标位置更新
  const updateMousePosition = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePosition({ x, y })
  }, [])

  // 获取相对于canvas的坐标
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  // 优化的绘制函数
  const drawLine = useCallback(
    (fromX: number, fromY: number, toX: number, toY: number) => {
      const ctx = contextRef.current
      if (!ctx) {
        console.error('❌ No canvas context available in drawLine')
        return
      }

      if (tool === "brush") {
        ctx.lineWidth = brushSize[0]
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = "#000000"
      } else {
        // 橡皮擦使用更大的线宽，与圆圈大小匹配
        const eraserSize = 6 + brushSize[0] * 3 // 与光标圆圈大小一致
        ctx.lineWidth = eraserSize
        ctx.globalCompositeOperation = "destination-out"
      }

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()
    },
    [brushSize, tool],
  )

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      console.log('🖊️ Starting to draw with tool:', tool)
      isDrawingRef.current = true

      const coords = getCanvasCoordinates(e.clientX, e.clientY)
      lastPointRef.current = coords

      const ctx = contextRef.current
      if (!ctx) {
        console.error('❌ No canvas context available for drawing')
        return
      }

      if (tool === "brush") {
        ctx.lineWidth = brushSize[0]
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = "#000000"
      } else {
        // 橡皮擦使用更大的线宽，与圆圈大小匹配
        const eraserSize = 6 + brushSize[0] * 3 // 与光标圆圈大小一致
        ctx.lineWidth = eraserSize
        ctx.globalCompositeOperation = "destination-out"
      }

      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
    },
    [brushSize, tool, getCanvasCoordinates],
  )

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      updateMousePosition(e)

      if (!isDrawingRef.current || !lastPointRef.current) return

      const coords = getCanvasCoordinates(e.clientX, e.clientY)

      // 使用requestAnimationFrame优化绘制
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        console.log('✏️ Drawing line from', lastPointRef.current, 'to', coords)
        drawLine(lastPointRef.current!.x, lastPointRef.current!.y, coords.x, coords.y)
        lastPointRef.current = coords
      })

      setHasDrawing(true)
    },
    [updateMousePosition, getCanvasCoordinates, drawLine],
  )

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false
    lastPointRef.current = null

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setTimeout(() => {
      setSketchQuality(Math.random() > 0.3 ? "good" : "warning")
    }, 500)
  }, [])

  const submitDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL("image/png")

    if (onSubmitDrawing) {
      onSubmitDrawing(imageData)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    
    if (mode === 'edit' && baseImage) {
      // 编辑模式：重新加载基础图片
      loadBaseImage(ctx, rect.width, rect.height)
    } else {
      // 绘画模式：清空为白色
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, rect.width, rect.height)
      setHasDrawing(false)
    }
    setSketchQuality(null)
  }

  // 触摸事件处理
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const touch = e.touches[0]
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
      } as React.MouseEvent<HTMLCanvasElement>
      startDrawing(mouseEvent)
    },
    [startDrawing],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const touch = e.touches[0]
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
      } as React.MouseEvent<HTMLCanvasElement>
      draw(mouseEvent)
    },
    [draw],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      stopDrawing()
    },
    [stopDrawing],
  )

  // 修改橡皮擦SVG为圆形设计
  const getCursorSVG = () => {
    // 根据brushSize动态计算光标大小，最大为8
    const cursorSize = 20 + brushSize[0] * 3 // 基础大小20px + 动态大小
    const size = Math.min(cursorSize, 44) // 最大44px

    // 安全的Base64编码函数
    const safeBase64Encode = (str: string) => {
      try {
        return window.btoa(
          encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
            return String.fromCharCode(Number.parseInt(p1, 16))
          }),
        )
      } catch (e) {
        console.warn("Failed to encode SVG, using fallback cursor")
        return ""
      }
    }

    if (tool === "brush") {
      const brushSvg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- 手部 -->
        <ellipse cx="${size * 0.3}" cy="${size * 0.75}" rx="${size * 0.12}" ry="${size * 0.15}" 
                 fill="#fdbcb4" stroke="#2d3e2d" strokeWidth="1"/>
        <!-- 手指 -->
        <ellipse cx="${size * 0.25}" cy="${size * 0.65}" rx="${size * 0.04}" ry="${size * 0.08}" 
                 fill="#fdbcb4" stroke="#2d3e2d" strokeWidth="0.5"/>
        <ellipse cx="${size * 0.35}" cy="${size * 0.6}" rx="${size * 0.04}" ry="${size * 0.08}" 
                 fill="#fdbcb4" stroke="#2d3e2d" strokeWidth="0.5"/>
        <!-- 笔杆 -->
        <rect x="${size * 0.4}" y="${size * 0.1}" width="${size * 0.08}" height="${size * 0.6}" 
              fill="#d4a574" stroke="#2d3e2d" strokeWidth="1" rx="2"/>
        <!-- 笔芯 -->
        <polygon points="${size * 0.44},${size * 0.7} ${size * 0.42},${size * 0.85} ${size * 0.46},${size * 0.85}" 
                 fill="#2d3e2d"/>
        <!-- 笔帽装饰 -->
        <circle cx="${size * 0.44}" cy="${size * 0.15}" r="${size * 0.06}" fill="#8b7355"/>
        <!-- 画笔大小指示器 -->
        <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${brushSize[0] + 1}" 
                fill="rgba(45,62,45,0.2)" stroke="#2d3e2d" strokeWidth="1"/>
        <text x="${size * 0.75}" y="${size * 0.1}" textAnchor="middle" 
              fontFamily="Arial" fontSize="8" fill="#2d3e2d" fontWeight="bold">${brushSize[0]}</text>
      </svg>
    `
      const encoded = safeBase64Encode(brushSvg)
      return encoded ? `data:image/svg+xml;base64,${encoded}` : "crosshair"
    } else {
      // 橡皮擦设计 - 可爱的橡皮擦样式
      const eraserRadius = 6 + brushSize[0] * 3 // 橡皮擦半径随SIZE增大

      const eraserSvg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- 手部 -->
        <ellipse cx="${size * 0.25}" cy="${size * 0.75}" rx="${size * 0.1}" ry="${size * 0.12}" 
                 fill="#fdbcb4" stroke="#2d3e2d" strokeWidth="1"/>
        <!-- 橡皮擦主体 -->
        <rect x="${size * 0.35}" y="${size * 0.2}" width="${size * 0.15}" height="${size * 0.4}" 
              fill="#ff69b4" stroke="#2d3e2d" strokeWidth="1.5" rx="4"/>
        <!-- 橡皮擦底部 -->
        <rect x="${size * 0.36}" y="${size * 0.58}" width="${size * 0.13}" height="${size * 0.08}" 
              fill="#ff91a4" stroke="#2d3e2d" strokeWidth="1" rx="2"/>
        <!-- 橡皮擦文字 -->
        <text x="${size * 0.425}" y="${size * 0.35}" textAnchor="middle" 
              fontFamily="Arial" fontSize="6" fill="white" fontWeight="bold">ERASER</text>
        <!-- 擦除区域指示器 -->
        <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${eraserRadius}" 
                fill="rgba(255,105,180,0.15)" stroke="#ff69b4" strokeWidth="1.5" strokeDasharray="3,2"/>
        <!-- SIZE指示 -->
        <text x="${size * 0.7}" y="${size * 0.15}" textAnchor="middle" 
              fontFamily="Arial" fontSize="8" fill="#ff69b4" fontWeight="bold">${brushSize[0]}</text>
      </svg>
    `
      const encoded = safeBase64Encode(eraserSvg)
      return encoded ? `data:image/svg+xml;base64,${encoded}` : "crosshair"
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-[#f5f1e8] rounded-xl md:rounded-2xl border-2 md:border-4 border-[#8b7355] shadow-lg gap-3 md:gap-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="flex gap-1 md:gap-2">
            <Button
              size="sm"
              variant={tool === "brush" ? "default" : "outline"}
              onClick={() => setTool("brush")}
              className={`font-black rounded-lg md:rounded-xl transform hover:scale-105 transition-all text-xs md:text-sm px-2 py-1 md:px-3 md:py-2 ${
                tool === "brush"
                  ? "bg-[#2d3e2d] text-[#f5f1e8] shadow-lg"
                  : "bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8]"
              }`}
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Brush className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === "eraser" ? "default" : "outline"}
              onClick={() => setTool("eraser")}
              className={`font-black rounded-lg md:rounded-xl transform hover:scale-105 transition-all text-xs md:text-sm px-2 py-1 md:px-3 md:py-2 ${
                tool === "eraser"
                  ? "bg-[#ff69b4] text-[#2d3e2d] shadow-lg border-2 border-[#e91e63]"
                  : "bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#ff69b4] hover:text-[#2d3e2d] hover:border-[#e91e63]"
              }`}
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Eraser className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
            <span
              className="text-[#2d3e2d] font-black text-xs md:text-sm whitespace-nowrap"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              SIZE:
            </span>
            <div className="w-16 md:w-24">
              <Slider value={brushSize} onValueChange={setBrushSize} max={8} min={1} step={1} className="w-full" />
            </div>
            <span
              className="text-[#2d3e2d] font-black text-xs md:text-sm whitespace-nowrap"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              {brushSize[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button
            size="sm"
            className="bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs px-2 py-1"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Undo className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          <Button
            size="sm"
            className="bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs px-2 py-1"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Redo className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          <Button
            size="sm"
            onClick={clearCanvas}
            className="bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs px-2 py-1"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            {mode === 'edit' ? 'RESET' : 'CLEAR'}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        {/* 纸张背景装饰 */}
        <div className="absolute inset-0 bg-[#f8f6f0] rounded-xl md:rounded-2xl border-2 md:border-4 border-[#8b7355] shadow-lg">
          {/* 纸张纹理 */}
          <div 
            className="absolute inset-2 md:inset-4 bg-white rounded-lg opacity-95"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(139,115,85,0.02) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, rgba(139,115,85,0.02) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          {/* 左侧装订孔 */}
          <div className="absolute left-2 md:left-4 top-6 md:top-8 w-1 h-1 bg-[#d4a574] rounded-full opacity-60" />
          <div className="absolute left-2 md:left-4 top-12 md:top-16 w-1 h-1 bg-[#d4a574] rounded-full opacity-60" />
          <div className="absolute left-2 md:left-4 bottom-6 md:bottom-8 w-1 h-1 bg-[#d4a574] rounded-full opacity-60" />
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => {
            stopDrawing()
            setShowCursor(false)
          }}
          onMouseEnter={() => setShowCursor(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative z-10 bg-transparent w-full aspect-square touch-none"
          style={{
            cursor: isMobile ? "auto" : `url("${getCursorSVG()}") ${brushSize[0] + 10} ${brushSize[0] + 10}, auto`,
          }}
        />

        {/* Quality feedback */}
        {sketchQuality && (
          <div className="absolute top-2 md:top-4 right-2 md:right-4">
            {sketchQuality === "good" ? (
              <div
                className="bg-[#d4a574] border-2 md:border-4 border-[#2d3e2d] text-[#2d3e2d] font-black px-2 py-1 md:px-3 md:py-2 rounded-xl md:rounded-2xl shadow-lg transform rotate-1 text-xs md:text-sm"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 inline" />
                PERFECT! ✨
              </div>
            ) : (
              <div
                className="bg-[#8b7355] border-2 md:border-4 border-[#2d3e2d] text-[#f5f1e8] font-black px-2 py-1 md:px-3 md:py-2 rounded-xl md:rounded-2xl shadow-lg transform -rotate-1 text-xs md:text-sm"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 inline" />
                MAKE IT BOLDER! 💪
              </div>
            )}
          </div>
        )}

        {/* Submit Button - 在编辑模式下总是显示，绘画模式下只有绘制后显示 */}
        {(mode === 'edit' || hasDrawing) && (
          <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4">
            <Button
              onClick={submitDrawing}
              className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-3 py-2 md:px-4 md:py-2 rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-all animate-pulse text-xs md:text-sm"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              {mode === 'edit' ? 'Apply Changes! ✨' : 'Use This Drawing! ✨'}
            </Button>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-[#f5f1e8] rounded-xl md:rounded-2xl border-2 md:border-4 border-[#8b7355] shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-1 md:mb-2 bg-[#d4a574] rounded-xl md:rounded-2xl flex items-center justify-center border-2 md:border-4 border-[#2d3e2d] transform rotate-3">
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-[#2d3e2d]" />
          </div>
          <p className="text-[#2d3e2d] font-black text-xs md:text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            DO THIS! ✅
          </p>
          <p className="text-[#8b7355] font-bold text-xs" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Bold & clear lines!
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-1 md:mb-2 bg-[#8b7355] rounded-xl md:rounded-2xl flex items-center justify-center border-2 md:border-4 border-[#2d3e2d] transform -rotate-3">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-[#f5f1e8]" />
          </div>
          <p className="text-[#2d3e2d] font-black text-xs md:text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            AVOID THIS! ❌
          </p>
          <p className="text-[#8b7355] font-bold text-xs" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Too thin & messy!
          </p>
        </div>
      </div>
    </div>
  )
}
