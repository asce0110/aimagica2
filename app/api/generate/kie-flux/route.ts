import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * KieFlux AI生成API
 * 专门处理KieFlux模型的图片生成
 */

// 模拟的任务状态存储（实际应该使用Redis或数据库）
const taskStore = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 KieFlux Generation API called')
    
    // 1. 解析请求体
    const body = await request.json()
    const {
      prompt,
      model = 'flux-pro',
      width = 1024,
      height = 1024,
      styleId,
      userId
    } = body
    
    console.log('📋 KieFlux generation parameters:', {
      prompt: prompt?.substring(0, 50) + '...',
      model,
      width,
      height,
      styleId,
      userId
    })
    
    // 2. 验证参数
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }
    
    // 3. 验证用户
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    // 4. 生成任务ID
    const taskId = `kie_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    // 5. 创建任务
    const task = {
      id: taskId,
      prompt,
      model,
      width,
      height,
      styleId,
      userId: user.id,
      status: 'pending',
      createdAt: new Date(),
      progress: 0,
      estimatedTime: 30 // 预估30秒
    }
    
    taskStore.set(taskId, task)
    console.log('✅ KieFlux task created:', taskId)
    
    // 6. 启动异步生成过程
    startKieFluxGeneration(taskId, task)
    
    // 7. 返回任务ID
    return NextResponse.json({
      success: true,
      message: 'KieFlux generation started',
      data: {
        taskId,
        status: 'pending',
        estimatedTime: 30
      }
    })
    
  } catch (error) {
    console.error('❌ KieFlux generation API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    
    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required'
      }, { status: 400 })
    }
    
    const task = taskStore.get(taskId)
    if (!task) {
      return NextResponse.json({
        success: false,
        error: 'Task not found'
      }, { status: 404 })
    }
    
    console.log('📊 KieFlux task status check:', taskId, task.status)
    
    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        status: task.status,
        progress: task.progress,
        message: task.message || getStatusMessage(task.status),
        result: task.result,
        error: task.error,
        createdAt: task.createdAt,
        completedAt: task.completedAt
      }
    })
    
  } catch (error) {
    console.error('❌ KieFlux status check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * 启动KieFlux生成过程（模拟）
 */
async function startKieFluxGeneration(taskId: string, task: any) {
  try {
    console.log('🚀 Starting KieFlux generation for task:', taskId)
    
    // 更新任务状态为处理中
    task.status = 'processing'
    task.progress = 10
    task.message = 'Connecting to KieFlux service...'
    
    // 模拟生成过程
    const progressSteps = [
      { progress: 20, message: 'Analyzing prompt...', delay: 2000 },
      { progress: 35, message: 'Initializing Flux model...', delay: 3000 },
      { progress: 50, message: 'Generating base image...', delay: 5000 },
      { progress: 70, message: 'Applying style enhancements...', delay: 4000 },
      { progress: 85, message: 'Refining details...', delay: 3000 },
      { progress: 95, message: 'Finalizing output...', delay: 2000 }
    ]
    
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay))
      
      // 检查任务是否还存在（可能被取消）
      if (!taskStore.has(taskId)) {
        console.log('⚠️ Task was cancelled:', taskId)
        return
      }
      
      task.progress = step.progress
      task.message = step.message
      console.log(`📈 Task ${taskId} progress: ${step.progress}% - ${step.message}`)
    }
    
    // 生成完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (taskStore.has(taskId)) {
      const mockImageUrl = `https://picsum.photos/seed/${taskId}/1024/1024`
      
      task.status = 'completed'
      task.progress = 100
      task.message = 'Generation completed successfully!'
      task.completedAt = new Date()
      task.result = {
        imageUrl: mockImageUrl,
        prompt: task.prompt,
        model: task.model,
        dimensions: { width: task.width, height: task.height },
        processingTime: Math.round((task.completedAt - task.createdAt) / 1000)
      }
      
      console.log('✅ KieFlux generation completed:', taskId)
      
      // TODO: 保存到数据库
      // await saveGeneratedImage({
      //   user_id: task.userId,
      //   prompt: task.prompt,
      //   generated_image_url: mockImageUrl,
      //   model: task.model,
      //   // ... other fields
      // })
    }
    
  } catch (error) {
    console.error('❌ KieFlux generation error:', error)
    
    if (taskStore.has(taskId)) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Generation failed'
      task.completedAt = new Date()
    }
  }
}

/**
 * 获取状态消息
 */
function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Task is queued and waiting to start'
    case 'processing':
      return 'AI is generating your image...'
    case 'completed':
      return 'Generation completed successfully!'
    case 'failed':
      return 'Generation failed'
    case 'cancelled':
      return 'Task was cancelled'
    default:
      return 'Unknown status'
  }
}