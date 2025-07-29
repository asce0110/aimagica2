import { createClient } from '@supabase/supabase-js'

// 构建时提供占位符值，避免构建失败
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build-placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'build_placeholder_service_key'

// 懒加载Supabase客户端
let supabase: any = null

function getSupabaseClient() {
  if (!supabase) {
    const realUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const realKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (realUrl && realKey && realUrl !== 'https://build-placeholder.supabase.co' && realKey !== 'build_placeholder_service_key') {
      supabase = createClient(realUrl, realKey)
    }
  }
  return supabase
}

interface ApiConfig {
  id: string
  name: string
  type: 'image_generation' | 'video_generation'
  provider: string
  base_url: string
  api_key: string
  model: string
  endpoint: string
  priority: number
  is_default: boolean
  is_active: boolean
  max_retries: number
  timeout_seconds: number
  rate_limit_per_minute: number
  config_data: any
}

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  response_time_ms?: number
  api_config_id?: string
}

export class ApiManager {
  private static instance: ApiManager
  private rateLimitTracker: Map<string, { count: number; resetTime: number }> = new Map()

  static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager()
    }
    return ApiManager.instance
  }

  /**
   * 获取指定类型的活跃API配置列表
   */
  private async getActiveApiConfigs(type: 'image_generation' | 'video_generation'): Promise<ApiConfig[]> {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Database not configured - missing environment variables')
    }

    const { data: configs, error } = await supabaseClient
      .from('api_configs')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('is_default', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch API configs: ${error.message}`)
    }

    return configs || []
  }

  /**
   * 根据ID获取单个API配置
   */
  private async getApiConfigById(configId: string): Promise<ApiConfig | null> {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Database not configured - missing environment variables')
    }

    const { data: config, error } = await supabaseClient
      .from('api_configs')
      .select('*')
      .eq('id', configId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error(`Failed to fetch API config ${configId}:`, error.message)
      return null
    }

    return config
  }

  /**
   * 检查API速率限制
   */
  private checkRateLimit(apiConfigId: string, rateLimit: number): boolean {
    const now = Date.now()
    const key = apiConfigId
    const tracker = this.rateLimitTracker.get(key)

    if (!tracker || now > tracker.resetTime) {
      // 重置或创建新的追踪器
      this.rateLimitTracker.set(key, {
        count: 1,
        resetTime: now + 60000 // 1分钟后重置
      })
      return true
    }

    if (tracker.count >= rateLimit) {
      return false // 已达到速率限制
    }

    tracker.count++
    return true
  }

  /**
   * 记录API使用日志
   */
  private async logApiUsage(
    apiConfigId: string,
    userId: string | null,
    requestType: string,
    prompt: string,
    requestData: any,
    responseData: any,
    status: 'success' | 'error' | 'timeout' | 'rate_limited',
    responseTimeMs: number,
    errorMessage?: string
  ) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) return

    try {
      await supabaseClient
        .from('api_usage_logs')
        .insert({
          api_config_id: apiConfigId,
          user_id: userId,
          request_type: requestType,
          prompt,
          request_data: requestData,
          response_data: responseData,
          status,
          response_time_ms: responseTimeMs,
          error_message: errorMessage
        })
    } catch (error) {
      console.error('Failed to log API usage:', error)
    }
  }

  /**
   * 更新API统计信息
   */
  private async updateApiStats(
    apiConfigId: string,
    isSuccess: boolean,
    errorMessage?: string
  ) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) return

    try {
      await supabaseClient.rpc('update_api_stats', {
        config_id: apiConfigId,
        is_success: isSuccess,
        error_msg: errorMessage || null
      })
    } catch (error) {
      console.error('Failed to update API stats:', error)
    }
  }

  /**
   * 调用单个API
   */
  private async callApi(
    config: ApiConfig,
    requestData: any,
    userId?: string,
    prompt?: string
  ): Promise<ApiResponse> {
    return this.callApiWithProgress(config, requestData, userId, prompt)
  }

  private async callApiWithProgress(
    config: ApiConfig,
    requestData: any,
    userId?: string,
    prompt?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const startTime = Date.now()
    let responseData: any = null
    let status: 'success' | 'error' | 'timeout' | 'rate_limited' = 'error'
    let errorMessage: string | undefined

    try {
      // 检查速率限制
      if (!this.checkRateLimit(config.id, config.rate_limit_per_minute)) {
        status = 'rate_limited'
        errorMessage = 'Rate limit exceeded'
        return { success: false, error: errorMessage }
      }

      // 格式化请求数据
      const formattedData = this.formatRequestForProvider(config, requestData)
      console.log(`🔍 Making API request to ${config.provider}: ${JSON.stringify({
        url: config.base_url + config.endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + config.api_key.substring(0, 10) + '...'
        },
        timeout: config.timeout_seconds,
        requestData: formattedData
      }, null, 2)}`)

      // 发起API请求
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout_seconds * 1000)

      const response = await fetch(config.base_url + config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.api_key}`
        },
        body: JSON.stringify(formattedData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
        const errorBody = await response.text().catch(() => 'No error details')
        
        // 特殊处理OpenAI内容政策违规
        if (response.status === 400 && errorBody.includes('content_policy_violation')) {
          throw new Error('CONTENT_POLICY_VIOLATION: Your content was flagged by OpenAI as violating content policies. Please modify your prompt to avoid sensitive content.')
        }
        
        // 检查其他常见的内容审核关键词
        const contentViolationKeywords = [
          'content policies', 
          'content policy',
          'violating content policies',
          'inappropriate content',
          'harmful content',
          'unsafe content',
          'policy violation'
        ]
        
        const lowerErrorBody = errorBody.toLowerCase()
        const hasContentViolation = contentViolationKeywords.some(keyword => 
          lowerErrorBody.includes(keyword.toLowerCase())
        )
        
        if (hasContentViolation) {
          throw new Error('CONTENT_POLICY_VIOLATION: Your content was flagged as violating content policies. Please modify your prompt to remove sensitive or inappropriate content.')
        }
        
        errorMessage += ` - ${errorBody}`
        throw new Error(errorMessage)
      }

      responseData = await response.json()
      console.log(`🔍 Raw API response from ${config.provider} : ${JSON.stringify(responseData)}`)

      // 格式化响应数据，传递进度回调
      const formattedResponse = await this.formatResponseForProviderWithProgress(config, responseData, onProgress)
      
      status = 'success'
      const responseTime = Date.now() - startTime

      // 记录API使用情况
      await this.logApiUsage(
        config.id,
        userId || null,
        'image_generation',
        prompt || '',
        formattedData,
        formattedResponse,
        status,
        responseTime
      )

      // 更新API统计
      await this.updateApiStats(config.id, true)

      return {
        success: true,
        data: formattedResponse,
        response_time_ms: responseTime,
        api_config_id: config.id
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          status = 'timeout'
          errorMessage = `Request timeout after ${config.timeout_seconds} seconds`
        } else {
          errorMessage = error.message
        }
      } else {
        errorMessage = String(error)
      }

      console.error(`❌ Detailed error for ${config.provider}: ${JSON.stringify({
        message: errorMessage,
        detailed: String(error),
        url: config.base_url + config.endpoint,
        config: { provider: config.provider, model: config.model, timeout: config.timeout_seconds }
      })}`)

      // 记录API使用情况
      await this.logApiUsage(
        config.id,
        userId || null,
        'image_generation',
        prompt || '',
        requestData,
        responseData,
        status,
        responseTime,
        errorMessage
      )

      // 更新API统计
      await this.updateApiStats(config.id, false, errorMessage)

      return {
        success: false,
        error: errorMessage,
        response_time_ms: responseTime,
        api_config_id: config.id
      }
    }
  }

  /**
   * 根据提供商格式化请求数据
   */
  private formatRequestForProvider(config: ApiConfig, requestData: any): any {
    // 用户参数优先于配置默认值
    const baseData = { ...config.config_data, ...requestData }

    switch (config.provider.toLowerCase()) {
      case 'openai':
        return {
          prompt: requestData.prompt,
          model: config.model,
          ...baseData
        }
      
      case 'stability ai':
        return {
          text_prompts: [{ text: requestData.prompt }],
          ...baseData
        }
      
      case 'replicate':
        return {
          input: {
            prompt: requestData.prompt,
            ...baseData
          }
        }
      
      case 'runway':
        return {
          prompt: requestData.prompt,
          model: config.model,
          ...baseData
        }
      
      case 'kie.ai':
      case 'kie.ai pro':
      case 'kie.ai max':
      case 'kie':
      case 'custom':
        // 检查是否为 Flux Kontext API
        if (config.endpoint?.includes('/flux/kontext/generate')) {
          // Flux Kontext API format - 根据官方文档，不需要model参数
          // 但需要根据kieModel参数选择正确的endpoint
          const fluxData = {
            prompt: requestData.prompt,
            ...baseData
          }
          
          // 根据kieModel选择endpoint
          if (requestData.kieModel === 'max') {
            // 使用Max模型的endpoint
            config.endpoint = '/api/v1/flux/kontext-max/generate'
            console.log('🎨 Using Kie.ai Flux Kontext Max model')
          } else {
            // 默认使用Pro模型的endpoint
            config.endpoint = '/api/v1/flux/kontext/generate'
            console.log('🎨 Using Kie.ai Flux Kontext Pro model')
          }
          
          // 添加aspectRatio (仅用于文生图)
          if (requestData.aspectRatio || requestData.size) {
            const inputRatio = requestData.aspectRatio || requestData.size || '1:1'
            
            // Flux Kontext API支持的aspect ratio映射
            // 参考：KIE.AI官方文档 https://docs.kie.ai/zh-CN/flux-kontext-api/get-image-details/
            const fluxRatioMap: { [key: string]: string } = {
              // 标准比例格式 (推荐格式)
              '1:1': '1:1',           // 正方形 1024x1024
              '4:3': '4:3',           // 传统横向 1152x896
              '3:4': '3:4',           // 传统竖向 896x1152  
              '16:9': '16:9',         // 宽屏 1344x768
              '9:16': '9:16',         // 竖屏 768x1344
              
              // 常用比例映射到最接近的支持格式
              '2:3': '3:4',           // 竖向 - 映射到3:4 (896x1152)
              '3:2': '4:3',           // 横向 - 映射到4:3 (1152x896)
              
              // 像素格式映射到标准比例
              '1024x1024': '1:1',     // 正方形
              '1152x896': '4:3',      // 4:3横向
              '896x1152': '3:4',      // 3:4竖向
              '1344x768': '16:9',     // 16:9宽屏
              '768x1344': '9:16',     // 9:16竖屏
              '1024x1536': '3:4',     // 竖向 (接近2:3)
              '1536x1024': '4:3',     // 横向 (接近3:2)
              '1792x1024': '16:9',    // 宽屏
              '1024x1792': '9:16',    // 竖屏
              
              // 英文描述格式映射
              'square': '1:1',
              'landscape': '4:3',
              'portrait': '3:4',
              'widescreen': '16:9',
              'vertical': '9:16'
            }
            
            const mappedRatio = fluxRatioMap[inputRatio] || '1:1'
            fluxData.aspectRatio = mappedRatio
            
            if (mappedRatio !== inputRatio) {
              console.log(`🔄 Mapped aspect ratio from ${inputRatio} to ${mappedRatio} for Flux Kontext API (KIE.AI)`)
            } else {
              console.log(`✅ Using aspect ratio ${mappedRatio} for Flux Kontext API (KIE.AI)`)
            }
          }
          
          // 添加inputImage (用于图像编辑)
          if (requestData.inputImage || requestData.image_url) {
            fluxData.inputImage = requestData.inputImage || requestData.image_url
          }
          
          // 添加回调URL (可选)
          if (requestData.callBackUrl) {
            fluxData.callBackUrl = requestData.callBackUrl
          }
          
          console.log('🎨 Flux Kontext request data:', {
            hasPrompt: !!fluxData.prompt,
            aspectRatio: fluxData.aspectRatio,
            hasInputImage: !!fluxData.inputImage,
            endpoint: config.endpoint
          })
          
          return fluxData
        }
        
        // KIE.AI 4o Image API format - 根据官方文档，不需要userId参数
        const kieData = {
          model: config.model || 'gpt-4o',
          isEnhance: false,
          uploadCn: false,
          enableFallback: true,  // 启用Flux Max fallback来处理OpenAI服务故障
          ...baseData
        }
        
        // 图生图模式：只有当提示词不为空时才添加prompt参数
        if (requestData.prompt && requestData.prompt.trim()) {
          kieData.prompt = requestData.prompt
          console.log('🔤 Adding prompt to KIE.AI request:', requestData.prompt.substring(0, 50) + '...')
        } else if (requestData.image_url) {
          console.log('🖼️ Image-to-image mode without prompt - letting KIE.AI auto-transform')
        } else {
          // 文生图模式必须有prompt
          kieData.prompt = requestData.prompt || ''
          console.log('📝 Text-to-image mode with prompt')
        }
        
        // 添加图生图支持 - KIE.AI使用fileUrl参数
        if (requestData.image_url) {
          kieData.fileUrl = requestData.image_url  // KIE.AI API使用fileUrl，不是image_url
          console.log('🖼️ KIE.AI image-to-image mode enabled with fileUrl')
          console.log('📸 Image data length:', requestData.image_url.length)
          console.log('📸 Image format:', requestData.image_url.substring(0, 50) + '...')
        } else {
          console.log('🚫 No image_url provided to KIE.AI, this is text-to-image mode')
        }
        
        // 转换尺寸格式：支持像素格式和比例格式两种输入
        // KIE.AI只支持 1:1, 3:2, 2:3 三种格式，其他格式映射到最接近的
        if (kieData.size) {
          const sizeMap: { [key: string]: string } = {
            // 像素格式到比例格式的映射
            '1024x1024': '1:1',     // 正方形
            '1024x1536': '2:3',     // 竖向 
            '1536x1024': '3:2',     // 横向
            '1792x1024': '3:2',     // 16:9 映射到 3:2 (最接近的横向)
            '1024x1792': '2:3',     // 9:16 映射到 2:3 (最接近的竖向)
            '1152x864': '3:2',      // 4:3 映射到 3:2 (最接近的横向)
            // 比例格式的直接映射（如果已经是比例格式）
            '1:1': '1:1',           // 正方形
            '2:3': '2:3',           // 竖向
            '3:2': '3:2',           // 横向
            '16:9': '3:2',          // 16:9 映射到 3:2 (最接近的横向)
            '9:16': '2:3',          // 9:16 映射到 2:3 (最接近的竖向)
            '4:3': '3:2'            // 4:3 映射到 3:2 (最接近的横向)
          }
          
          if (sizeMap[kieData.size]) {
            const originalSize = kieData.size
            kieData.size = sizeMap[kieData.size]
            console.log(`🔄 Converted size from ${originalSize} to ${kieData.size} for KIE.AI (supported: 1:1, 3:2, 2:3)`)
          } else {
            // 默认使用1:1
            console.log(`⚠️ Unsupported size ${kieData.size} for KIE.AI, using default 1:1`)
            kieData.size = '1:1'
          }
        }
        
        // 处理图片数量参数，KIE.AI使用nVariants参数（始终设置，默认为1）
        kieData.nVariants = requestData.num_outputs || requestData.count || 1
        console.log(`🖼️ KIE.AI nVariants set to ${kieData.nVariants}`)
        console.log(`🐛 Debug: requestData.num_outputs=${requestData.num_outputs}, requestData.count=${requestData.count}`)
        
        // 如果nVariants大于1，确保参数正确设置
        if (kieData.nVariants > 1) {
          console.log(`🖼️ Multi-image generation: ${kieData.nVariants} variants`)
          console.log(`🐛 Final KIE.AI request data contains:`, JSON.stringify({
            nVariants: kieData.nVariants,
            prompt: kieData.prompt?.substring(0, 50) + '...',
            model: kieData.model,
            size: kieData.size
          }))
        }
        
        // 移除KIE.AI不支持的参数
        delete kieData.width
        delete kieData.height
        delete kieData.num_outputs // 删除num_outputs，使用nVariants
        delete kieData.count // 删除count，使用nVariants
        
        return kieData
      
      default:
        return {
          prompt: requestData.prompt,
          ...baseData
        }
    }
  }

  /**
   * 根据提供商格式化响应数据
   */
  private async formatResponseForProvider(config: ApiConfig, responseData: any): Promise<any> {
    return this.formatResponseForProviderWithProgress(config, responseData)
  }

  /**
   * 格式化不同提供商的响应数据，支持进度回调
   */
  private async formatResponseForProviderWithProgress(
    config: ApiConfig, 
    responseData: any,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    console.log(`🔍 Formatting response for provider: ${config.provider}`)
    
    try {
      switch (config.provider) {
        case 'Custom':
          // 检查是否为 Flux Kontext API
          if (config.endpoint?.includes('/flux/kontext/generate')) {
            return await this.processFluxKontextResponseWithProgress(responseData, config, undefined, onProgress)
          }
          return await this.processKieAiResponseWithProgress(responseData, config, undefined, onProgress)
        
        case 'Kie.ai':
        case 'Kie.ai Pro':
        case 'Kie.ai Max':
          // 检查是否为 Flux Kontext API
          if (config.endpoint?.includes('/flux/kontext/generate')) {
            return await this.processFluxKontextResponseWithProgress(responseData, config, undefined, onProgress)
          }
          return await this.processKieAiResponseWithProgress(responseData, config, undefined, onProgress)
        
        case 'OpenAI':
          // OpenAI格式: { data: [{ url: "..." }] }
          if (responseData.data && Array.isArray(responseData.data)) {
            return {
              images: responseData.data.map((item: any) => ({
                url: item.url,
                revised_prompt: item.revised_prompt
              }))
            }
          }
          break
          
        case 'Anthropic':
          // Anthropic格式处理
          if (responseData.images && Array.isArray(responseData.images)) {
            return {
              images: responseData.images.map((item: any) => ({
                url: item.url,
                revised_prompt: item.revised_prompt
              }))
            }
          }
          break
          
        default:
          console.log(`⚠️  Unknown provider ${config.provider}, using default formatting`)
          return responseData
      }
      
      // 如果没有匹配的格式，返回原始数据
      console.log(`⚠️  No matching format found for ${config.provider}`)
      return responseData
      
    } catch (error) {
      console.error(`❌ Error formatting response for ${config.provider}:`, error)
      return responseData
    }
  }

  /**
   * 处理Flux Kontext API的响应，支持进度回调
   */
  private async processFluxKontextResponseWithProgress(
    responseData: any,
    config?: ApiConfig,
    userId?: string,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    console.log('🎨 Processing Flux Kontext response format...')
    
    // 检查是否有错误响应
    if (!responseData.success && responseData.error) {
      console.error('❌ Flux Kontext API error:', responseData)
      throw new Error(`Flux Kontext API error: ${responseData.error}`)
    }
    
    if (responseData.code && responseData.code !== 200) {
      console.error('❌ Flux Kontext API error:', responseData)
      throw new Error(`Flux Kontext API error (${responseData.code}): ${responseData.msg || 'Unknown error'}`)
    }
    
    // 检查是否有taskId - 这表示是异步任务
    if (responseData.code === 200 && responseData.data?.taskId) {
      console.log('🔄 Found Flux Kontext taskId, starting polling with progress callback...')
      try {
        // 对于Flux Kontext，我们需要使用不同的轮询逻辑
        return await this.pollFluxKontextTask(responseData.data.taskId, config, userId, onProgress)
      } catch (pollError) {
        console.error('❌ Flux Kontext polling failed:', pollError)
        throw new Error(`Flux Kontext image generation started (taskId: ${responseData.data.taskId}) but polling failed. The image may still be generating. Please try again in a few moments.`)
      }
    }
    
    // 检查是否直接返回了图像URL
    if (responseData.success && responseData.data?.imageUrl) {
      console.log('✅ Found Flux Kontext direct image URL')
      return {
        images: [{
          url: responseData.data.imageUrl,
          revised_prompt: responseData.data.prompt
        }]
      }
    }
    
    // 其他格式处理
    if (responseData.imageUrl) {
      console.log('✅ Found top-level imageUrl')
      return {
        images: [{
          url: responseData.imageUrl,
          revised_prompt: responseData.prompt
        }]
      }
    }
    
    console.log('❌ No recognizable image format found in Flux Kontext response')
    return responseData
  }

  /**
   * 轮询Flux Kontext任务结果
   */
  private async pollFluxKontextTask(
    taskId: string,
    config?: ApiConfig,
    userId?: string,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    if (!config) {
      throw new Error('Config is required for polling Flux Kontext task')
    }

    const maxAttempts = 60 // 最多轮询60次，支持5分钟超时 (60 * 5秒 = 300秒 = 5分钟)
    const pollInterval = 5000 // 每5秒轮询一次
    
    console.log(`🔄 Starting to poll Flux Kontext task ${taskId}...`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔍 Polling attempt ${attempt}/${maxAttempts} for task ${taskId}`)
        
        // 使用GET方法查询任务状态，根据Kie.ai文档
        const queryUrl = `${config.base_url}/api/v1/flux/kontext/record-info?taskId=${encodeURIComponent(taskId)}`
        
        console.log(`🔍 Querying Flux Kontext with GET method:`, queryUrl)
        
        const response = await fetch(queryUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.api_key}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(30000) // 30秒超时
        })
        
        if (!response.ok) {
          console.error(`❌ Flux Kontext query failed with status ${response.status}: ${response.statusText}`)
          if (response.status === 404) {
            // 可能任务还没准备好，继续轮询
            console.log('⏳ Task not found yet, continuing to poll...')
            await new Promise(resolve => setTimeout(resolve, pollInterval))
            continue
          }
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        console.log(`🔍 Flux Kontext poll response ${attempt}:`, JSON.stringify(result, null, 2))
        
        // 提取进度信息
        if (result.data?.progress !== undefined && onProgress) {
          const progressValue = typeof result.data.progress === 'string' 
            ? parseFloat(result.data.progress) * 100 
            : result.data.progress
          console.log(`📊 Flux Kontext progress: ${progressValue}%`)
          onProgress(progressValue)
        }
        
        // 检查任务状态 - Kie.ai使用successFlag: 1=成功, 0=处理中, -1=失败
        const successFlag = result.data?.successFlag
        if (successFlag === 1) {
          console.log(`✅ Flux Kontext task ${taskId} completed successfully`)
          
          // 解析响应数据
          if (result.data?.response) {
            const responseData = typeof result.data.response === 'string' 
              ? JSON.parse(result.data.response) 
              : result.data.response
              
            console.log('🎨 Parsed Flux Kontext response data:', responseData)
            
            // 检查resultImageUrl（Kie.ai的主要图像URL）
            if (responseData.resultImageUrl) {
              return {
                images: [{
                  url: responseData.resultImageUrl,
                  revised_prompt: result.data.paramJson ? JSON.parse(result.data.paramJson).prompt : null
                }]
              }
            }
            
            // 检查images数组（备选格式）
            if (responseData.images && Array.isArray(responseData.images)) {
              return {
                images: responseData.images.map((img: any) => ({
                  url: img.url,
                  revised_prompt: result.data.paramJson ? JSON.parse(result.data.paramJson).prompt : null
                }))
              }
            }
            
            // 检查其他可能的图像URL字段（最后的备选）
            if (responseData.url || responseData.imageUrl || responseData.originImageUrl) {
              return {
                images: [{
                  url: responseData.url || responseData.imageUrl || responseData.originImageUrl,
                  revised_prompt: result.data.paramJson ? JSON.parse(result.data.paramJson).prompt : null
                }]
              }
            }
          }
        }
        
        // 如果任务失败
        if (successFlag === -1) {
          const errorMsg = result.data?.errorMessage || 'Task failed'
          console.log(`❌ Flux Kontext task ${taskId} failed:`, errorMsg)
          throw new Error(errorMsg)
        }
        
        // 如果还在处理中 (successFlag === 0)，继续轮询
        if (successFlag === 0) {
          console.log(`⏳ Flux Kontext task ${taskId} still processing (successFlag: ${successFlag})`)
          await new Promise(resolve => setTimeout(resolve, pollInterval))
          continue
        }
        
        // 未知状态，继续轮询
        console.log(`❓ Unknown Flux Kontext successFlag: ${successFlag}, continuing to poll...`)
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        
      } catch (error) {
        console.error(`❌ Flux Kontext polling attempt ${attempt} failed:`, error)
        if (attempt === maxAttempts) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }
    
    throw new Error(`Flux Kontext task ${taskId} polling timeout after ${maxAttempts} attempts`)
  }

  /**
   * 处理KIE.AI的异步响应，支持进度回调
   */
  private async processKieAiResponseWithProgress(
    responseData: any, 
    config?: ApiConfig, 
    userId?: string,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    console.log('🔍 Processing KIE.AI response format...')
    
    // 首先检查是否有错误响应
    if (responseData.code && responseData.code !== 200) {
      console.error('❌ KIE.AI API error:', responseData)
      throw new Error(`KIE.AI API error (${responseData.code}): ${responseData.msg || 'Unknown error'}`)
    }
    
    // 检查是否有taskId - 这表示是异步任务
    if (responseData.code === 200 && responseData.data?.taskId) {
      console.log('🔄 Found KIE.AI taskId, starting polling with progress callback...')
      try {
        // 传递进度回调给轮询方法
        return await this.pollKieAiTask(responseData.data.taskId, config, userId, onProgress)
      } catch (pollError) {
        console.error('❌ KIE.AI polling failed:', pollError)
        // 如果轮询失败，返回一个友好的错误信息
        throw new Error(`KIE.AI image generation started (taskId: ${responseData.data.taskId}) but polling failed. The image may still be generating. Please try again in a few moments.`)
      }
    }
    
    // 继续处理其他格式...
    if (responseData.code === 200 && responseData.data) {
      console.log('✅ Found KIE.AI success format with data')
      if (responseData.data.image_url || responseData.data.url) {
        return {
          images: [{
            url: responseData.data.image_url || responseData.data.url,
            revised_prompt: responseData.data.revised_prompt
          }]
        }
      }
    }
    
    // 其他格式处理逻辑保持不变...
    if (responseData.data?.images && Array.isArray(responseData.data.images)) {
      console.log('✅ Found data.images array')
      return {
        images: responseData.data.images.map((item: any) => ({
          url: item.url || item.image_url,
          revised_prompt: item.revised_prompt
        }))
      }
    }
    
    if (responseData.data && (responseData.data.image_url || responseData.data.url)) {
      console.log('✅ Found single image in data')
      return {
        images: [{
          url: responseData.data.image_url || responseData.data.url,
          revised_prompt: responseData.data.revised_prompt
        }]
      }
    }
    
    if (responseData.images && Array.isArray(responseData.images)) {
      console.log('✅ Found top-level images array')
      return {
        images: responseData.images.map((item: any) => ({
          url: item.url || item.image_url,
          revised_prompt: item.revised_prompt
        }))
      }
    }
    
    if (responseData.image_url || responseData.url) {
      console.log('✅ Found top-level image URL')
      return {
        images: [{
          url: responseData.image_url || responseData.url,
          revised_prompt: responseData.revised_prompt
        }]
      }
    }
    
    if (typeof responseData === 'string' && responseData.startsWith('http')) {
      console.log('✅ Found direct URL string')
      return {
        images: [{
          url: responseData,
          revised_prompt: null
        }]
      }
    }
    
    console.log('❌ No recognizable image format found in KIE.AI response')
    return responseData
  }

  /**
   * 轮询KIE.AI任务结果
   */
  private async pollKieAiTask(
    taskId: string, 
    config?: ApiConfig, 
    userId?: string,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    if (!config) {
      throw new Error('Config is required for polling KIE.AI task')
    }

    const maxAttempts = 150 // 最多轮询150次，支持5分钟超时 (150 * 2秒 = 300秒 = 5分钟)
    const pollInterval = 2000 // 每2秒轮询一次
    
    console.log(`🔄 Starting to poll KIE.AI task ${taskId}...`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔍 Polling attempt ${attempt}/${maxAttempts} for task ${taskId}`)
        
        // 根据官方文档，使用GET方法查询，只需要taskId参数
        const queryUrl = `${config.base_url}/api/v1/gpt4o-image/record-info?taskId=${encodeURIComponent(taskId)}`
        
        console.log(`🔍 Querying with GET method:`, queryUrl)
        
        const response = await fetch(queryUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.api_key}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(30000) // 30秒超时
        })
        
        if (!response.ok) {
          console.error(`❌ KIE.AI query failed with status ${response.status}: ${response.statusText}`)
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        console.log(`🔍 Poll response ${attempt}:`, JSON.stringify(result, null, 2))
        
        // 提取并报告真实进度
        const progressValue = result.data?.progress
        if (progressValue !== undefined && onProgress) {
          // 将字符串进度转换为数字 (0.43 -> 43)
          const numericProgress = parseFloat(progressValue) * 100
          console.log(`📊 Real-time progress update: ${numericProgress}%`)
          onProgress(numericProgress)
        }
        
        // KIE.AI查询响应格式：{ code, msg, data: { status, response, ... } }
        // 状态在data.status中，根据官方文档，成功状态是 SUCCESS
        const taskStatus = result.data?.status || result.task_status
        if (taskStatus === 'SUCCESS' || taskStatus === 'succeed') {
          console.log(`✅ KIE.AI task ${taskId} completed successfully`)
          
          // 检查data.response中的图片数据
          if (result.data?.response) {
            const responseData = typeof result.data.response === 'string' 
              ? JSON.parse(result.data.response) 
              : result.data.response
              
            if (responseData.images && Array.isArray(responseData.images)) {
              const images = responseData.images.map((img: any) => ({
                url: img.url,
                revised_prompt: result.data.paramJson ? JSON.parse(result.data.paramJson).prompt : null
              }))
              
              return { images }
            }
            
            // 检查resultUrls字段
            if (responseData.resultUrls && Array.isArray(responseData.resultUrls)) {
              console.log(`🎨 Found resultUrls:`, responseData.resultUrls)
              console.log(`🐛 Number of images returned: ${responseData.resultUrls.length}`)
              const images = responseData.resultUrls.map((url: string) => ({
                url: url,
                revised_prompt: result.data.paramJson ? JSON.parse(result.data.paramJson).prompt : null
              }))
              
              console.log(`🐛 Final images array contains ${images.length} images`)
              return { images }
            }
            
            // 如果没有images数组，检查是否有单个图片
            if (responseData.url) {
              return {
                images: [{
                  url: responseData.url,
                  revised_prompt: result.data.paramJson ? JSON.parse(result.data.paramJson).prompt : null
                }]
              }
            }
          }
        }
        
        // 如果任务失败
        if (taskStatus === 'failed' || taskStatus === 'FAILED') {
          const errorMsg = result.data?.errorMessage || result.task_status_msg || 'Task failed'
          console.log(`❌ KIE.AI task ${taskId} failed:`, errorMsg)
          throw new Error(errorMsg)
        }
        
        // 如果还在处理中（GENERATING状态），继续轮询
        if (taskStatus === 'GENERATING' || taskStatus === 'submitted') {
          const progress = result.data?.progress || '0'
          console.log(`⏳ KIE.AI task ${taskId} still processing (${taskStatus}), progress: ${progress}`)
        } else {
          console.log(`🔍 KIE.AI task ${taskId} status: ${taskStatus}`)
        }
        
        // 如果不是最后一次尝试，等待后继续
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
        
      } catch (error) {
        console.error(`❌ Error polling KIE.AI task ${taskId} on attempt ${attempt}:`, error)
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === maxAttempts) {
          throw error
        }
        
        // 否则等待后继续
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }
    
    // 如果所有尝试都失败了
    throw new Error(`KIE.AI task ${taskId} polling timeout after ${maxAttempts} attempts`)
  }

  /**
   * 生成图片 - 主要入口点，包含故障转移
   */
  async generateImage(
    prompt: string,
    options: any = {},
    userId?: string
  ): Promise<ApiResponse> {
    return this.generateContent('image_generation', prompt, options, userId)
  }

  /**
   * 生成图片 - 支持实时进度回调的版本
   */
  async generateImageWithProgress(
    prompt: string,
    options: any = {},
    userId?: string,
    modelId?: string | null,
    kieModel?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    return this.generateContentWithProgress('image_generation', prompt, options, userId, modelId, kieModel, onProgress)
  }

  /**
   * 生成视频 - 主要入口点，包含故障转移
   */
  async generateVideo(
    prompt: string,
    options: any = {},
    userId?: string
  ): Promise<ApiResponse> {
    return this.generateContent('video_generation', prompt, options, userId)
  }

  /**
   * 生成内容的通用方法，包含故障转移逻辑
   */
  private async generateContent(
    type: 'image_generation' | 'video_generation',
    prompt: string,
    options: any = {},
    userId?: string
  ): Promise<ApiResponse> {
    return this.generateContentWithProgress(type, prompt, options, userId)
  }

  /**
   * 生成内容的通用方法，包含故障转移逻辑和进度回调
   */
  private async generateContentWithProgress(
    type: 'image_generation' | 'video_generation',
    prompt: string,
    options: any = {},
    userId?: string,
    modelId?: string | null,
    kieModel?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    try {
      let configs: ApiConfig[]
      
      if (modelId) {
        // 如果指定了模型ID，只使用指定的模型
        console.log(`🎯 Using specified model: ${modelId}`)
        const specificConfig = await this.getApiConfigById(modelId)
        if (!specificConfig) {
          return {
            success: false,
            error: `Specified model ${modelId} not found or not active`
          }
        }
        configs = [specificConfig]
      } else {
        // 使用默认的优先级顺序获取所有活跃配置
        console.log(`🤖 Using auto-selection for ${type}`)
        configs = await this.getActiveApiConfigs(type)
      }
      
      if (configs.length === 0) {
        return {
          success: false,
          error: `No active ${type} APIs configured`
        }
      }

      let lastError = ''
      
      // 按优先级尝试每个API
      for (const config of configs) {
        console.log(`🚀 Trying ${config.provider} (${config.name})...`)
        
        const requestData = {
          prompt,
          kieModel,
          ...options
        }

        let retries = 0
        while (retries <= config.max_retries) {
          const result = await this.callApiWithProgress(config, requestData, userId, prompt, onProgress)
          
          if (result.success) {
            console.log(`✅ ${config.provider} succeeded`)
            return result
          }
          
          console.log(`❌ ${config.provider} failed: ${result.error}`)
          lastError = result.error || 'Unknown error'
          retries++
          
          if (retries <= config.max_retries) {
            console.log(`🔄 Retrying ${config.provider} (attempt ${retries + 1}/${config.max_retries + 1})...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)) // 递增延迟
          }
        }
      }
      
      return {
        success: false,
        error: `All ${type} APIs failed. Last error: ${lastError}`
      }
      
    } catch (error) {
      console.error(`❌ Generate content error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 测试API配置
   */
  async testApiConfig(configId: string, testPrompt: string = 'A simple test image'): Promise<ApiResponse> {
    if (!supabase) {
      return { success: false, error: 'Database not configured' }
    }

    try {
      const { data: config, error } = await supabase
        .from('api_configs')
        .select('*')
        .eq('id', configId)
        .single()

      if (error || !config) {
        return { success: false, error: 'API configuration not found' }
      }

      return await this.callApi(config, { prompt: testPrompt }, 'test-user', testPrompt)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 获取API使用统计
   */
  async getApiStats(hours: number = 24): Promise<any> {
    if (!supabase) {
      return { error: 'Database not configured' }
    }

    try {
      const hoursAgo = new Date()
      hoursAgo.setHours(hoursAgo.getHours() - hours)

      const { data: logs, error } = await supabase
        .from('api_usage_logs')
        .select(`
          *,
          api_configs (
            name,
            provider
          )
        `)
        .gte('created_at', hoursAgo.toISOString())

      if (error) {
        return { error: error.message }
      }

      return {
        total_requests: logs?.length || 0,
        success_rate: logs?.length > 0 
          ? (logs.filter(log => log.status === 'success').length / logs.length * 100).toFixed(2)
          : 0,
        avg_response_time: logs?.length > 0
          ? Math.round(logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length)
          : 0,
        by_provider: logs?.reduce((acc: any, log) => {
          const provider = log.api_configs?.provider || 'Unknown'
          if (!acc[provider]) {
            acc[provider] = { success: 0, error: 0, total: 0 }
          }
          acc[provider][log.status === 'success' ? 'success' : 'error']++
          acc[provider].total++
          return acc
        }, {}) || {}
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// 导出单例实例
export const apiManager = ApiManager.getInstance() 