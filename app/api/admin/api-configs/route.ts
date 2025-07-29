import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('⚙️ 获取API配置列表')
    
    // 创建Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Supabase环境变量未配置')
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        configs: []
      })
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
      // 查询API配置
      const { data: configs, error } = await supabase
        .from('api_configs')
        .select('*')
        .order('priority', { ascending: true })

      if (error) {
        console.error('❌ 查询API配置失败:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch configs',
          configs: []
        })
      }

      // 隐藏敏感信息（API密钥）
      const safeConfigs = (configs || []).map(config => ({
        ...config,
        api_key: config.api_key ? config.api_key.substring(0, 8) + '***************' : null
      }))

      console.log(`✅ 成功获取 ${safeConfigs.length} 个API配置`)

      return NextResponse.json({
        success: true,
        configs: safeConfigs
      })

    } catch (dbError) {
      console.error("❌ 数据库查询失败:", dbError)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        configs: []
      })
    }

  } catch (error) {
    console.error('❌ API配置操作失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to handle API configs',
      message: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('➕ 创建新API配置:', body.name)
    
    // 创建Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
      // 插入新的API配置
      const { data, error } = await supabase
        .from('api_configs')
        .insert([{
          name: body.name,
          endpoint: body.endpoint,
          api_key: body.api_key,
          model: body.model,
          is_active: body.is_active || true,
          priority: body.priority || 1,
          timeout_seconds: body.timeout_seconds || 60,
          rate_limit_per_minute: body.rate_limit_per_minute || 10,
          config_data: body.config_data || {}
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ 创建API配置失败:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create config',
          message: error.message
        }, { status: 500 })
      }

      console.log('✅ API配置创建成功:', data.id)

      return NextResponse.json({
        success: true,
        message: '配置创建成功',
        id: data.id
      }, { status: 201 })

    } catch (dbError) {
      console.error("❌ 数据库插入失败:", dbError)
      return NextResponse.json({
        success: false,
        error: 'Database insert failed',
        message: dbError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ API配置操作失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to handle API configs',
      message: error.message
    }, { status: 500 })
  }
}