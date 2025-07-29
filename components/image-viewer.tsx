"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Download, Share2, Facebook, Twitter, Instagram, MessageCircle, Copy, Maximize, Minimize } from 'lucide-react'

interface ImageViewerProps {
  imageUrl: string
  onClose: () => void
}

export default function ImageViewer({ imageUrl, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [customShareText, setCustomShareText] = useState('Check out this amazing AI-generated artwork I created with AIMAGICA! 🎨✨')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })

  // 禁止body滚动，防止背景页面滚动
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])
  
  // 全屏控制
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      // 进入全屏时重置位置和缩放
      setZoom(1)
      setImagePosition({ x: 0, y: 0 })
    }
  }

  // 拖拽控制
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    // 阻止页面滚动和事件冒泡
    e.preventDefault()
    e.stopPropagation()
    
    // 只在放大状态下滚轮控制图片上下移动
    if (zoom > 1) {
      const scrollSensitivity = 0.8
      // 计算基于缩放级别的合理移动范围，让用户能滚动到边缘
      const maxMoveRange = Math.max(50, (zoom - 1) * 200) // 增大移动范围
      
      setImagePosition(prev => ({
        x: prev.x,
        y: Math.max(-maxMoveRange, Math.min(maxMoveRange, prev.y - e.deltaY * scrollSensitivity))
      }))
    }
  }

  // 下载图片
  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'aimagica-artwork.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 复制图片链接
  const copyImageLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      alert('Image link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // 分享到社交媒体
  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(customShareText + ' Created with AIMAGICA: https://aimagica.ai')}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(customShareText + ' Created with AIMAGICA: https://aimagica.ai')}&url=${encodeURIComponent(imageUrl)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareToWhatsApp = () => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(customShareText + ' ' + imageUrl + ' Created with AIMAGICA: https://aimagica.ai')}`
    window.open(shareUrl, '_blank')
  }

  const shareToTelegram = () => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(customShareText + ' Created with AIMAGICA: https://aimagica.ai')}`
    window.open(shareUrl, '_blank')
  }

  const shareToReddit = () => {
    const title = customShareText + ' - Created with AIMAGICA'
    const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}`
    window.open(shareUrl, '_blank')
  }

  const shareToLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}&summary=${encodeURIComponent(customShareText + ' Created with AIMAGICA: https://aimagica.ai')}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  // 全屏图片查看组件
  const FullscreenImageView = () => {
    const [fullscreenZoom, setFullscreenZoom] = useState(1)
    const [fullscreenPosition, setFullscreenPosition] = useState({ x: 0, y: 0 })
    const [fullscreenDragging, setFullscreenDragging] = useState(false)
    const [fullscreenDragStart, setFullscreenDragStart] = useState({ x: 0, y: 0 })

    const handleFullscreenMouseDown = (e: React.MouseEvent) => {
      if (fullscreenZoom > 1) {
        setFullscreenDragging(true)
        setFullscreenDragStart({
          x: e.clientX - fullscreenPosition.x,
          y: e.clientY - fullscreenPosition.y
        })
      }
    }

    const handleFullscreenMouseMove = (e: React.MouseEvent) => {
      if (fullscreenDragging && fullscreenZoom > 1) {
        setFullscreenPosition({
          x: e.clientX - fullscreenDragStart.x,
          y: e.clientY - fullscreenDragStart.y
        })
      }
    }

    const handleFullscreenMouseUp = () => {
      setFullscreenDragging(false)
    }

    const handleFullscreenWheel = (e: React.WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (fullscreenZoom > 1) {
        const scrollSensitivity = 0.8
        const maxMoveRange = Math.max(100, (fullscreenZoom - 1) * 300)
        
        setFullscreenPosition(prev => ({
          x: prev.x,
          y: Math.max(-maxMoveRange, Math.min(maxMoveRange, prev.y - e.deltaY * scrollSensitivity))
        }))
      }
    }

    return (
      <div 
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60]"
        onWheel={(e) => e.preventDefault()}
      >
        {/* 关闭按钮 */}
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="lg"
          className="absolute top-4 right-4 z-10 bg-black/70 border-white/30 text-white hover:bg-black/90 backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* 缩放控制 */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            onClick={() => setFullscreenZoom(Math.min(fullscreenZoom + 0.5, 4))}
            variant="outline"
            size="sm"
            className="bg-black/70 border-white/30 text-white hover:bg-black/90 backdrop-blur-sm"
            disabled={fullscreenZoom >= 4}
          >
            🔍+
          </Button>
          <Button
            onClick={() => {
              setFullscreenZoom(1)
              setFullscreenPosition({ x: 0, y: 0 })
            }}
            variant="outline"
            size="sm"
            className="bg-black/70 border-white/30 text-white hover:bg-black/90 backdrop-blur-sm"
          >
            1:1
          </Button>
          <Button
            onClick={() => setFullscreenZoom(Math.max(fullscreenZoom - 0.5, 0.5))}
            variant="outline"
            size="sm"
            className="bg-black/70 border-white/30 text-white hover:bg-black/90 backdrop-blur-sm"
            disabled={fullscreenZoom <= 0.5}
          >
            🔍-
          </Button>
        </div>

        {/* 缩放提示 */}
        {fullscreenZoom > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white px-4 py-2 rounded-lg text-lg font-bold backdrop-blur-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            🔍 Zoom: {Math.round(fullscreenZoom * 100)}% • 💡 Drag to move • Scroll to navigate
          </div>
        )}

        {/* 图片容器 */}
        <div 
          className="w-full h-full flex items-center justify-center overflow-hidden"
          onMouseMove={handleFullscreenMouseMove}
          onMouseUp={handleFullscreenMouseUp}
          onMouseLeave={handleFullscreenMouseUp}
          onWheel={handleFullscreenWheel}
        >
          <img
            src={imageUrl}
            alt="Generated artwork"
            className={`max-w-full max-h-full object-contain transition-transform duration-200 ${fullscreenZoom > 1 ? 'cursor-grab' : 'cursor-default'} ${fullscreenDragging ? 'cursor-grabbing' : ''}`}
            style={{ 
              transform: `scale(${fullscreenZoom}) translate(${fullscreenPosition.x / fullscreenZoom}px, ${fullscreenPosition.y / fullscreenZoom}px)`,
              transformOrigin: 'center center'
            }}
            onMouseDown={handleFullscreenMouseDown}
            draggable={false}
          />
        </div>
      </div>
    )
  }

  // 如果是全屏模式，显示全屏组件
  if (isFullscreen) {
    return <FullscreenImageView />
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onWheel={(e) => e.preventDefault()}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-auto"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            🎨 Your Amazing Creation!
          </h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* 图片显示区域 */}
          <div className="flex-1 p-6 bg-gray-50 flex flex-col items-center justify-center">
            {/* 全屏控制 */}
            <div className="flex items-center justify-center mb-4">
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] px-4"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Maximize className="w-4 h-4 mr-2" />
                View Fullscreen
              </Button>
            </div>
            
            {/* 图片容器 */}
            <div 
              className="relative overflow-hidden border-2 border-[#8b7355] rounded-lg shadow-lg bg-white max-w-full max-h-[60vh]"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <img
                src={imageUrl}
                alt="Generated artwork"
                className={`transition-transform duration-200 ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''} object-contain max-w-full max-h-full`}
                style={{ 
                  transform: `scale(${zoom}) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
                  transformOrigin: 'center center'
                }}
                onMouseDown={handleMouseDown}
                draggable={false}
              />
              {zoom > 1 && (
                <div className="absolute top-2 left-2 bg-gray-600/70 text-white px-2 py-1 rounded text-xs" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  💡 Drag to move • Scroll to move up/down
                </div>
              )}
            </div>
          </div>

          {/* 分享面板 */}
          <div className="w-full lg:w-80 p-6 bg-white">
            <div className="space-y-6">
              {/* 下载和复制 */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  💾 Save & Copy
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={downloadImage}
                    className="flex-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={copyImageLink}
                    variant="outline"
                    className="flex-1 bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574]"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* 自定义分享文本 */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  ✏️ Customize Share Message
                </h3>
                <Textarea
                  value={customShareText}
                  onChange={(e) => setCustomShareText(e.target.value)}
                  placeholder="Write your share message..."
                  className="border-2 border-[#8b7355] rounded-xl resize-none"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  rows={3}
                />
                <p className="text-xs text-[#8b7355]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  💡 Your message will include the image and: "Created with AIMAGICA: https://aimagica.ai"
                </p>
              </div>

              {/* 社交媒体分享 */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  🌟 Share Your Art
                </h3>
                
                {/* 主要社交媒体 */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={shareToFacebook}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    onClick={shareToTwitter}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    onClick={shareToWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={shareToLinkedIn}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>

                {/* 更多分享选项 */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={shareToTelegram}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    📱 Telegram
                  </Button>
                  <Button
                    onClick={shareToReddit}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    🔴 Reddit
                  </Button>
                </div>
              </div>

              {/* 分享提示 */}
              <div className="bg-[#f5f1e8] border-2 border-[#8b7355] rounded-xl p-4">
                <p className="text-sm text-[#2d3e2d] font-bold text-center" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  ✨ Share your amazing AI artwork with the world! 
                  <br />
                  Don't forget to tag #AIMAGICA! 🎨
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
