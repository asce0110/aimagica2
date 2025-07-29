'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Image as ImageIcon, Edit, CheckCircle, XCircle, Clock, Upload } from 'lucide-react'
import { toast } from 'sonner'

const aspectRatios = [
  { value: '21:9', label: '21:9 (Ultra Wide)' },
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '4:3', label: '4:3 (Standard)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '3:4', label: '3:4 (Portrait)' },
  { value: '9:16', label: '9:16 (Mobile)' },
  { value: '16:21', label: '16:21 (Tall Portrait)' }
]

// Models are managed in API configuration

interface TaskStatus {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imageUrl?: string
  prompt: string
  aspectRatio?: string
  model: string
  createdAt: string
  estimatedTime?: number
}

export default function KieFluxTester() {
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  // Model由API配置决定，不需要在前端选择
  const [mode, setMode] = useState<'text_to_image' | 'image_edit'>('text_to_image')
  const [inputImage, setInputImage] = useState<string>('')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [generatedImages, setGeneratedImages] = useState<TaskStatus[]>([])
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setInputImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (mode === 'image_edit' && !inputImage) {
      toast.error('Please upload an image for editing')
      return
    }

    setIsGenerating(true)
    setTaskStatus(null)

    try {
      const response = await fetch('/api/generate/kie-flux', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio: mode === 'text_to_image' ? aspectRatio : undefined,
          mode,
          inputImage: mode === 'image_edit' ? inputImage : undefined
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

      if (result.success) {
        if (result.data.taskId) {
          // 异步任务
          setTaskStatus({
            taskId: result.data.taskId,
            status: result.data.status,
            prompt,
            aspectRatio: mode === 'text_to_image' ? aspectRatio : undefined,
            model: 'flux-kontext', // 显示名称
            createdAt: new Date().toISOString(),
            estimatedTime: result.data.estimatedTime
          })
          
          toast.success(`Image generation started! Task ID: ${result.data.taskId}`)
          
          // 开始轮询状态
          pollTaskStatus(result.data.taskId)
        } else if (result.data.imageUrl) {
          // 同步结果
          const completedTask: TaskStatus = {
            taskId: result.data.taskId || 'completed',
            status: 'completed',
            imageUrl: result.data.imageUrl,
            prompt,
            aspectRatio: mode === 'text_to_image' ? aspectRatio : undefined,
            model: 'flux-kontext', // 显示名称
            createdAt: new Date().toISOString()
          }
          
          setGeneratedImages(prev => [completedTask, ...prev])
          toast.success('Image generated successfully!')
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 60 // 5分钟 (每5秒检查一次)
    let attempts = 0

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        toast.error('Task timeout - please check manually')
        return
      }

      try {
        const response = await fetch(`/api/generate/kie-flux?taskId=${taskId}`)
        const result = await response.json()

        if (result.success && result.data) {
          setTaskStatus(result.data)

          if (result.data.status === 'completed' && result.data.imageUrl) {
            setGeneratedImages(prev => [result.data, ...prev])
            toast.success('Image generation completed!')
            return
          } else if (result.data.status === 'failed') {
            toast.error('Image generation failed')
            return
          } else if (result.data.status === 'processing' || result.data.status === 'pending') {
            // 继续轮询
            attempts++
            setTimeout(checkStatus, 5000) // 5秒后再次检查
          }
        }
      } catch (error) {
        console.error('Status check error:', error)
        attempts++
        setTimeout(checkStatus, 5000)
      }
    }

    setTimeout(checkStatus, 2000) // 2秒后开始第一次检查
  }

  const checkTaskStatus = async () => {
    if (!taskStatus?.taskId) {
      toast.error('No task ID available')
      return
    }

    setIsCheckingStatus(true)

    try {
      const response = await fetch(`/api/generate/kie-flux?taskId=${taskStatus.taskId}`)
      const result = await response.json()

      if (result.success) {
        setTaskStatus(result.data)
        toast.success('Status updated')

        if (result.data.status === 'completed' && result.data.imageUrl) {
          setGeneratedImages(prev => [result.data, ...prev])
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Status check error:', error)
      toast.error(error instanceof Error ? error.message : 'Status check failed')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Kie.ai Flux Kontext API Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Generation Mode</Label>
            <Select value={mode} onValueChange={(value: any) => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text_to_image">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Text to Image
                  </div>
                </SelectItem>
                <SelectItem value="image_edit">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Image Edit
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload for Edit Mode */}
          {mode === 'image_edit' && (
            <div className="space-y-2">
              <Label>Input Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload image
                  </span>
                </label>
                {inputImage && (
                  <div className="mt-4">
                    <img
                      src={inputImage}
                      alt="Input"
                      className="max-w-64 max-h-64 object-cover rounded-lg mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-2">
            <Label>Prompt *</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate or edit..."
              rows={3}
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aspect Ratio (只在text_to_image模式显示) */}
            {mode === 'text_to_image' && (
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Model Info */}
            <div className="space-y-2">
              <Label>Model</Label>
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded-md">
                Model managed in API configuration
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {/* Task Status */}
          {taskStatus && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(taskStatus.status)}
                    <span className="font-medium">Task Status</span>
                    <Badge className={getStatusColor(taskStatus.status)}>
                      {taskStatus.status.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    onClick={checkTaskStatus}
                    disabled={isCheckingStatus}
                    variant="outline"
                    size="sm"
                  >
                    {isCheckingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Check Status'
                    )}
                  </Button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Task ID: {taskStatus.taskId}</p>
                  <p>Model: Flux Kontext</p>
                  {taskStatus.estimatedTime && (
                    <p>Estimated Time: {taskStatus.estimatedTime}s</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Images ({generatedImages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((task, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  {task.imageUrl && (
                    <img
                      src={task.imageUrl}
                      alt={task.prompt}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium mb-1 line-clamp-2">
                      {task.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{task.aspectRatio}</span>
                      <span>{task.model}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {getStatusIcon(task.status)}
                      <Badge className={getStatusColor(task.status)} variant="secondary">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 