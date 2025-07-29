"use client"

import React, { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileImage,
  Minimize2 as Compress
} from "lucide-react"
import { imageCompressor, type CompressionOptions, type CompressionResult } from "@/lib/image-compression"

interface ImageCompressionDialogProps {
  isOpen: boolean
  onClose: () => void
  onCompressionComplete: (result: CompressionResult) => void
  originalFile: File | null
  title?: string
  description?: string
}

export default function ImageCompressionDialog({
  isOpen,
  onClose,
  onCompressionComplete,
  originalFile,
  title = "🖼️ Smart Image Compression",
  description = "Optimize your image for gallery upload"
}: ImageCompressionDialogProps) {
  // 压缩状态
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // 压缩配置
  const [quality, setQuality] = useState([80])
  const [maxWidth, setMaxWidth] = useState([1920])
  const [format, setFormat] = useState<string>("auto")
  const [strategy, setStrategy] = useState<string>("balanced")
  const [maxSizeKB, setMaxSizeKB] = useState([800])
  
  // 预览状态
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null)

  // 加载原始图片预览
  React.useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile)
      setOriginalPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [originalFile])

  // 重置状态
  const resetState = useCallback(() => {
    setCompressionResult(null)
    setError(null)
    setCompressedPreview(null)
  }, [])

  // 执行压缩
  const handleCompress = async () => {
    if (!originalFile) return
    
    setIsCompressing(true)
    setError(null)
    
    try {
      const options: CompressionOptions = {
        quality: quality[0] / 100,
        maxWidth: maxWidth[0],
        maxHeight: maxWidth[0], // 保持正方形比例
        outputFormat: format === "auto" ? "auto" : format as any,
        maxSizeKB: maxSizeKB[0],
        strategy: strategy as any,
        preserveMetadata: false
      }
      
      const result = await imageCompressor.compressImage(originalFile, options)
      setCompressionResult(result)
      
      // 生成压缩后预览
      const compressedUrl = URL.createObjectURL(result.compressedFile)
      setCompressedPreview(compressedUrl)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed')
    } finally {
      setIsCompressing(false)
    }
  }

  // 智能压缩
  const handleSmartCompress = async () => {
    if (!originalFile) return
    
    setIsCompressing(true)
    setError(null)
    
    try {
      const result = await imageCompressor.smartCompress(originalFile)
      setCompressionResult(result)
      
      // 生成压缩后预览
      const compressedUrl = URL.createObjectURL(result.compressedFile)
      setCompressedPreview(compressedUrl)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Smart compression failed')
    } finally {
      setIsCompressing(false)
    }
  }

  // 确认使用压缩结果
  const handleUseCompressed = () => {
    if (compressionResult) {
      onCompressionComplete(compressionResult)
      onClose()
    }
  }

  // 使用原始文件
  const handleUseOriginal = () => {
    if (originalFile) {
      // 创建一个模拟的压缩结果
      const mockResult: CompressionResult = {
        compressedFile: originalFile,
        originalSize: originalFile.size,
        compressedSize: originalFile.size,
        compressionRatio: 0,
        format: originalFile.type,
        dimensions: { width: 0, height: 0 }, // 会被后续处理覆盖
        processingTime: 0
      }
      onCompressionComplete(mockResult)
      onClose()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-gradient-to-br from-[#f5f1e8] to-[#ede7d3] p-0 rounded-2xl border-4 border-[#2d3e2d] shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="bg-[#2d3e2d] p-6 text-center">
          <DialogTitle className="text-2xl font-black text-[#f5f1e8] flex items-center justify-center gap-3">
            <Compress className="w-6 h-6" />
            {title}
            <Compress className="w-6 h-6" />
          </DialogTitle>
          <p className="text-[#d4a574] font-bold mt-2">{description}</p>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-y-auto">
          {originalFile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 配置面板 */}
              <div className="space-y-4">
                <Card className="border-2 border-[#8b7355]">
                  <CardContent className="p-4">
                    <h3 className="font-black text-[#2d3e2d] mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Compression Settings
                    </h3>
                    
                    {/* 快速操作 */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Button
                        onClick={handleSmartCompress}
                        disabled={isCompressing}
                        className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Smart Compress
                      </Button>
                      <Button
                        onClick={handleCompress}
                        disabled={isCompressing}
                        variant="outline"
                        className="border-[#8b7355] text-[#8b7355] font-bold"
                      >
                        <Compress className="w-4 h-4 mr-2" />
                        Custom Compress
                      </Button>
                    </div>

                    {/* 详细设置 */}
                    <div className="space-y-4">
                      <div>
                        <Label className="font-bold text-[#2d3e2d]">Quality: {quality[0]}%</Label>
                        <Slider
                          value={quality}
                          onValueChange={setQuality}
                          max={100}
                          min={50}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="font-bold text-[#2d3e2d]">Max Width: {maxWidth[0]}px</Label>
                        <Slider
                          value={maxWidth}
                          onValueChange={setMaxWidth}
                          max={3840}
                          min={800}
                          step={160}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="font-bold text-[#2d3e2d]">Max File Size: {maxSizeKB[0]}KB</Label>
                        <Slider
                          value={maxSizeKB}
                          onValueChange={setMaxSizeKB}
                          max={2000}
                          min={100}
                          step={50}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="font-bold text-[#2d3e2d]">Output Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (WebP)</SelectItem>
                            <SelectItem value="webp">WebP</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="font-bold text-[#2d3e2d]">Strategy</Label>
                        <Select value={strategy} onValueChange={setStrategy}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="quality">Quality First</SelectItem>
                            <SelectItem value="size">Size First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 压缩结果 */}
                {compressionResult && (
                  <Card className="border-2 border-[#2d3e2d] bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-black text-[#2d3e2d] mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Compression Results
                      </h3>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-bold text-[#8b7355]">Original Size:</span>
                          <span className="font-black text-[#2d3e2d]">{formatFileSize(compressionResult.originalSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#8b7355]">Compressed Size:</span>
                          <span className="font-black text-[#2d3e2d]">{formatFileSize(compressionResult.compressedSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#8b7355]">Compression Ratio:</span>
                          <span className="font-black text-green-600">{compressionResult.compressionRatio}% smaller</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#8b7355]">Dimensions:</span>
                          <span className="font-black text-[#2d3e2d]">{compressionResult.dimensions.width}×{compressionResult.dimensions.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#8b7355]">Processing Time:</span>
                          <span className="font-black text-[#2d3e2d]">{compressionResult.processingTime}ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 错误信息 */}
                {error && (
                  <Card className="border-2 border-red-400 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-bold">{error}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 预览面板 */}
              <div className="space-y-4">
                <Card className="border-2 border-[#8b7355]">
                  <CardContent className="p-4">
                    <h3 className="font-black text-[#2d3e2d] mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Preview Comparison
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 原始图片 */}
                      <div>
                        <Label className="font-bold text-[#8b7355] block mb-2">Original</Label>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-[#8b7355]">
                          {originalPreview ? (
                            <img 
                              src={originalPreview} 
                              alt="Original" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FileImage className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#8b7355] mt-2 text-center">
                          {formatFileSize(originalFile.size)}
                        </p>
                      </div>

                      {/* 压缩后图片 */}
                      <div>
                        <Label className="font-bold text-[#8b7355] block mb-2">Compressed</Label>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-[#2d3e2d]">
                          {isCompressing ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin text-[#d4a574]" />
                            </div>
                          ) : compressedPreview ? (
                            <img 
                              src={compressedPreview} 
                              alt="Compressed" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                              <Compress className="w-12 h-12" />
                              <span className="text-xs font-bold">Click compress to preview</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#2d3e2d] mt-2 text-center">
                          {compressionResult ? formatFileSize(compressionResult.compressedSize) : 'Not compressed yet'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="bg-[#2d3e2d] p-4 flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-white font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUseOriginal}
            variant="outline"
            className="border-[#d4a574] text-[#d4a574] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-bold"
          >
            Use Original
          </Button>
          <Button
            onClick={handleUseCompressed}
            disabled={!compressionResult}
            className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Use Compressed Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}