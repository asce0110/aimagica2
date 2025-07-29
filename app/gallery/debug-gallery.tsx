"use client"

import { useState, useEffect } from "react"
import { getStaticGalleryData } from "@/lib/static-gallery-data"

export default function DebugGallery() {
  const [images, setImages] = useState([])
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const staticImages = getStaticGalleryData()
    setImages(staticImages)
    console.log('🐛 Debug Gallery 加载了', staticImages.length, '张图片')
    console.log('🐛 图片数据:', staticImages.map(img => ({ 
      id: img.id, 
      title: img.title, 
      url: img.url 
    })))
  }, [])

  const handleImageLoad = (imageId: string) => {
    console.log('✅ 图片加载成功:', imageId)
    setLoadingStates(prev => ({ ...prev, [imageId]: false }))
  }

  const handleImageError = (imageId: string, url: string) => {
    console.error('❌ 图片加载失败:', imageId, url)
    setLoadingStates(prev => ({ ...prev, [imageId]: false }))
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-8">🐛 Debug Gallery - {images.length} 张图片</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {images.map((image: any) => (
          <div key={image.id} className="border border-gray-700 rounded-lg p-4">
            <h3 className="font-bold mb-2">{image.title}</h3>
            <p className="text-sm text-gray-400 mb-4">URL: {image.url}</p>
            
            <div className="relative bg-gray-800 rounded h-48 flex items-center justify-center">
              {loadingStates[image.id] !== false && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-blue-400">Loading...</div>
                </div>
              )}
              
              <img
                src={image.url}
                alt={image.title}
                className="max-w-full max-h-full object-contain"
                onLoad={() => handleImageLoad(image.id)}
                onError={() => handleImageError(image.id, image.url)}
                style={{
                  opacity: loadingStates[image.id] === false ? 1 : 0.5
                }}
              />
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              <div>作者: {image.author}</div>
              <div>点赞: {image.likes}</div>
              <div>风格: {image.style}</div>
            </div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="text-center text-gray-400">
          <p>没有找到图片数据...</p>
        </div>
      )}
    </div>
  )
}