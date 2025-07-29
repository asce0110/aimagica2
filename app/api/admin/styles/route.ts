import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🎨 获取风格列表')
    
    // 创建Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Supabase环境变量未配置')
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        styles: []
      })
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
      // 获取所有风格数据（管理员视图）
      const { data: styles, error } = await supabase
        .from('styles')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('❌ 查询风格失败:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch styles',
          styles: []
        })
      }

      console.log(`✅ 成功获取 ${styles?.length || 0} 个风格`)

      return NextResponse.json({
        success: true,
        styles: styles || []
      })

    } catch (dbError) {
      console.error("❌ 数据库查询失败:", dbError)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        styles: []
      })
    }

  } catch (error) {
    console.error('❌ 风格操作失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to handle styles',
      message: error.message
    }, { status: 500 })
  }
}