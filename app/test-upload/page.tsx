'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ui/image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UploadResult {
  fileName: string
  url: string
  size: number
  type: string
}

export default function TestUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleUpload = (result: UploadResult) => {
    console.log('上传成功:', result)
    setUploadedImages(prev => [...prev, result])
    setError(null)
  }

  const handleError = (errorMsg: string) => {
    console.error('上传失败:', errorMsg)
    setError(errorMsg)
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 
            className="text-4xl font-black text-[#2d3e2d] mb-2"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            Test Image Upload 📤
          </h1>
          <p 
            className="text-[#8b7355] font-bold"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            Test Cloudflare R2 image upload functionality
          </p>
        </div>

        {/* 上传区域 */}
        <Card className="border-4 border-[#2d3e2d] rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle 
              className="text-2xl font-black text-[#2d3e2d]"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Upload Images 🖼️
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onUpload={handleUpload}
              onError={handleError}
              uploadType="test"
              className="mb-4"
            />
            
            {/* 错误信息 */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-600 font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  ❌ {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 上传历史 */}
        {uploadedImages.length > 0 && (
          <Card className="border-4 border-[#8b7355] rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle 
                className="text-2xl font-black text-[#2d3e2d]"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Uploaded Images ✅ ({uploadedImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div 
                    key={index}
                    className="bg-white border-2 border-[#d4a574] rounded-xl p-4 space-y-3"
                  >
                    {/* 图片预览 */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 图片信息 */}
                    <div className="space-y-1">
                      <p 
                        className="text-[#2d3e2d] font-bold text-sm truncate"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        📁 {image.fileName}
                      </p>
                      <p 
                        className="text-[#8b7355] text-xs"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        📏 Size: {Math.round(image.size / 1024)}KB
                      </p>
                      <p 
                        className="text-[#8b7355] text-xs"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        🎨 Type: {image.type}
                      </p>
                      
                      {/* URL链接 */}
                      <div className="pt-2">
                        <a
                          href={image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-bold px-3 py-1 rounded-lg text-xs transition-all"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          🔗 View Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 说明 */}
        <Card className="border-4 border-[#d4a574] rounded-2xl shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 
                className="text-lg font-black text-[#2d3e2d]"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                📋 Test Instructions:
              </h3>
              <ul className="space-y-2 text-[#8b7355]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                <li>✅ Upload images by clicking or dragging & dropping</li>
                <li>✅ Supported formats: JPEG, PNG, WebP, GIF</li>
                <li>✅ Maximum file size: 10MB</li>
                <li>✅ Images are stored in Cloudflare R2</li>
                <li>✅ Check browser console for detailed logs</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 