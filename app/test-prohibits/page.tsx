"use client"

import { useState, useEffect } from 'react'

export default function TestProhibitsPage() {
  const [styles, setStyles] = useState<any[]>([])
  const [selectedStyle, setSelectedStyle] = useState<any>(null)

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await fetch('/api/styles?type=image')
        const data = await response.json()
        console.log('📊 Fetched styles:', data.styles)
        
        // 特别检查CHIBI DIORAMA
        const chibiStyle = data.styles?.find((s: any) => s.name.toLowerCase().includes('chibi'))
        if (chibiStyle) {
          console.log('🎯 CHIBI DIORAMA data:', {
            name: chibiStyle.name,
            id: chibiStyle.id,
            prohibits_image_upload: chibiStyle.prohibits_image_upload,
            prohibits_type: typeof chibiStyle.prohibits_image_upload,
            raw_data: chibiStyle
          })
        }
        
        setStyles(data.styles || [])
      } catch (error) {
        console.error('Error fetching styles:', error)
      }
    }
    fetchStyles()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">测试禁止图片上传功能</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">风格列表</h2>
          <div className="space-y-2">
            {styles.map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`p-3 border rounded cursor-pointer ${
                  selectedStyle?.id === style.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                }`}
              >
                <div className="font-medium">{style.emoji} {style.name}</div>
                              <div className="text-sm text-gray-600">
                prohibits_image_upload: {String(style.prohibits_image_upload)} (type: {typeof style.prohibits_image_upload})
              </div>
              <div className="text-sm text-gray-600">
                requires_image_upload: {String(style.requires_image_upload)} (type: {typeof style.requires_image_upload})
              </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">选中风格详情</h2>
          {selectedStyle ? (
            <div className="space-y-2">
              <div><strong>名称:</strong> {selectedStyle.name}</div>
              <div><strong>ID:</strong> {selectedStyle.id}</div>
              <div><strong>禁止图片上传:</strong> {selectedStyle.prohibits_image_upload ? '是' : '否'} 
                (原始值: {String(selectedStyle.prohibits_image_upload)}, 类型: {typeof selectedStyle.prohibits_image_upload})</div>
              <div><strong>必须图片上传:</strong> {selectedStyle.requires_image_upload ? '是' : '否'}</div>
              <div><strong>必须描述:</strong> {selectedStyle.requires_prompt_description ? '是' : '否'}</div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <strong>完整数据:</strong>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(selectedStyle, null, 2)}
                </pre>
              </div>
              
              {selectedStyle.prohibits_image_upload && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-red-700 font-medium">⚠️ 此风格禁止图片上传</div>
                  <div className="text-sm text-red-600">图生图和图生视频按钮应该被禁用</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">请选择一个风格查看详情</div>
          )}
        </div>
      </div>
    </div>
  )
} 