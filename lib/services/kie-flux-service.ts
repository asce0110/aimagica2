// import { ApiConfig } from '@/lib/services/api-manager'
type ApiConfig = any

interface KieFluxRequest {
  prompt: string
  aspectRatio?: string
  inputImage?: string // base64 encoded image for editing
  callBackUrl?: string
}

interface KieFluxResponse {
  success: boolean
  data?: {
    taskId: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    imageUrl?: string
    prompt: string
    aspectRatio?: string
    model: string
    createdAt: string
    estimatedTime?: number
  }
  error?: string
  message?: string
}

export class KieFluxService {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  /**
   * 生成图像（文本转图像）
   */
  async generateImage(params: {
    prompt: string
    aspectRatio?: string
    callBackUrl?: string
  }): Promise<KieFluxResponse> {
    try {
      const requestData: KieFluxRequest = {
        prompt: params.prompt,
        aspectRatio: params.aspectRatio || '1:1',
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl })
      }

      console.log('🎨 Kie.ai Flux 生成图像请求:', {
        aspectRatio: requestData.aspectRatio,
        promptLength: requestData.prompt.length,
        endpoint: this.config.endpoint
      })

      const response = await fetch(`${this.config.base_url}${this.config.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Kie.ai API Error: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: {
          taskId: result.taskId || result.id,
          status: result.status || 'pending',
          imageUrl: result.imageUrl || result.image_url,
          prompt: params.prompt,
          aspectRatio: params.aspectRatio,
          model: this.config.model,
          createdAt: new Date().toISOString(),
          estimatedTime: result.estimatedTime || result.estimated_time
        }
      }

    } catch (error) {
      console.error('❌ Kie.ai Flux 生成失败:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * 编辑图像
   */
  async editImage(params: {
    prompt: string
    inputImage: string // base64 encoded
    callBackUrl?: string
  }): Promise<KieFluxResponse> {
    try {
      const requestData: KieFluxRequest = {
        prompt: params.prompt,
        inputImage: params.inputImage,
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl })
      }

      console.log('✏️ Kie.ai Flux 编辑图像请求:', {
        promptLength: requestData.prompt.length,
        hasInputImage: !!requestData.inputImage,
        endpoint: this.config.endpoint
      })

      const response = await fetch(`${this.config.base_url}${this.config.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Kie.ai API Error: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: {
          taskId: result.taskId || result.id,
          status: result.status || 'pending',
          imageUrl: result.imageUrl || result.image_url,
          prompt: params.prompt,
          model: this.config.model,
          createdAt: new Date().toISOString(),
          estimatedTime: result.estimatedTime || result.estimated_time
        }
      }

    } catch (error) {
      console.error('❌ Kie.ai Flux 编辑失败:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<KieFluxResponse> {
    try {
      const response = await fetch(`${this.config.base_url}/api/v1/flux/kontext/record-info?taskId=${encodeURIComponent(taskId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.api_key}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Kie.ai API Error: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: {
          taskId: result.taskId || result.id,
          status: result.status,
          imageUrl: result.imageUrl || result.image_url,
          prompt: result.prompt,
          aspectRatio: result.aspectRatio,
          model: result.model,
          createdAt: result.createdAt || result.created_at,
          estimatedTime: result.estimatedTime || result.estimated_time
        }
      }

    } catch (error) {
      console.error('❌ Kie.ai Flux 获取状态失败:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * 验证配置
   */
  validateConfig(): boolean {
    return !!(
      this.config.base_url &&
      this.config.api_key &&
      this.config.endpoint &&
      this.config.model
    )
  }

  /**
   * 获取支持的宽高比
   */
  getSupportedAspectRatios(): string[] {
    const ratios = this.config.config_data?.aspectRatios
    return ratios ? Object.keys(ratios) : ['1:1', '16:9', '9:16', '4:3', '3:4']
  }

  /**
   * 获取支持的模型
   */
  getSupportedModels(): string[] {
    const models = this.config.config_data?.models
    return models ? Object.values(models) : ['flux-kontext-pro', 'flux-kontext-max']
  }
} 