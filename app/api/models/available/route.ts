import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * 可用模型API - 获取所有可用的AI模型配置
 */
export async function GET() {
  try {
    console.log('🤖 Available models API called')
    
    // 默认类型（静态导出时不能使用request.url）
    const type = 'image_generation'
    
    // 创建Supabase客户端
    const supabase = await createClient()
    
    // 构建查询
    let query = supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })
    
    // 如果指定了类型，过滤模型
    if (type) {
      query = query.or(`model.ilike.%${type}%,config_data->>type.eq.${type}`)
    }
    
    const { data: configs, error } = await query
    
    if (error) {
      console.error('❌ Failed to fetch model configs:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch model configs',
        models: []
      }, { status: 500 })
    }
    
    console.log(`✅ Successfully fetched ${configs?.length || 0} model configs`)
    
    // 处理模型数据，隐藏敏感信息
    const processedModels = (configs || []).map(config => ({
      id: config.id,
      name: config.name,
      model: config.model,
      endpoint: config.endpoint,
      is_active: config.is_active,
      priority: config.priority,
      timeout_seconds: config.timeout_seconds,
      rate_limit_per_minute: config.rate_limit_per_minute,
      config_data: config.config_data || {},
      // 隐藏API密钥
      api_key_available: !!config.api_key,
      created_at: config.created_at,
      updated_at: config.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      count: processedModels.length,
      models: processedModels,
      metadata: {
        total: processedModels.length,
        active_only: true,
        type_filter: type || 'all'
      }
    })
    
  } catch (error) {
    console.error('❌ Models API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      models: []
    }, { status: 500 })
  }
}