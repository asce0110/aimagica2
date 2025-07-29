import { createClient } from '../supabase-server'

// 登录记录类型
export interface LoginLog {
  id: string
  user_id: string
  email: string
  login_method: 'google' | 'email' | 'admin'
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  login_time: string
  session_duration?: number
  logout_time?: string
  is_admin_login: boolean
}

// 记录登录日志
export async function createLoginLog(data: {
  user_id: string
  email: string
  login_method: 'google' | 'email' | 'admin'
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  is_admin_login?: boolean
}): Promise<LoginLog | null> {
  const supabase = await createClient()
  
  const loginData = {
    user_id: data.user_id,
    email: data.email,
    login_method: data.login_method,
    ip_address: data.ip_address,
    user_agent: data.user_agent,
    success: data.success,
    error_message: data.error_message,
    login_time: new Date().toISOString(),
    is_admin_login: data.is_admin_login || false
  }

  try {
    // 首先创建登录日志表（如果不存在）
    await ensureLoginLogTable()
    
    const { data: log, error } = await supabase
      .from('login_logs')
      .insert(loginData)
      .select()
      .single()

    if (error) {
      console.error('创建登录日志失败:', error)
      return null
    }

    console.log('✅ 登录日志记录成功:', data.email)
    return log
  } catch (error) {
    console.error('记录登录日志时发生错误:', error)
    return null
  }
}

// 记录登出时间
export async function updateLogoutTime(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // 找到最近的登录记录
    const { data: latestLog, error: findError } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('success', true)
      .is('logout_time', null)
      .order('login_time', { ascending: false })
      .limit(1)
      .single()

    if (findError || !latestLog) {
      console.log('未找到需要更新的登录记录')
      return false
    }

    const logoutTime = new Date().toISOString()
    const sessionDuration = Math.floor(
      (new Date(logoutTime).getTime() - new Date(latestLog.login_time).getTime()) / 1000
    )

    console.log(`📝 准备记录登出: 用户 ${userId}, 会话时长 ${sessionDuration} 秒`)

    // 临时解决方案：创建一个新的登录记录来记录登出信息
    // 而不是更新现有记录（由于数据库表结构问题）
    const { data: logoutRecord, error: logoutError } = await supabase
      .from('login_logs')
      .insert({
        user_id: latestLog.user_id,
        email: latestLog.email,
        login_method: latestLog.login_method, // 使用原来的登录方法
        success: false, // 使用false来标记这是登出记录
        login_time: latestLog.login_time, // 保持原登录时间
        logout_time: logoutTime,
        session_duration: sessionDuration,
        is_admin_login: latestLog.is_admin_login,
        error_message: 'LOGOUT_RECORD' // 用error_message字段标记这是登出记录
      })
      .select()
      .single()

    if (logoutError) {
      console.error('记录登出信息失败:', logoutError)
      
      // 如果插入也失败，至少记录到控制台
      console.log(`⚠️ 登出记录失败，但登出成功: 用户 ${latestLog.email}, 会话时长 ${sessionDuration} 秒`)
      return true // 返回true因为登出本身是成功的
    }

    console.log('✅ 登出时间记录成功, 会话时长:', sessionDuration, '秒')
    return true
  } catch (error) {
    console.error('记录登出时间时发生错误:', error)
    return true // 返回true以免阻止登出流程
  }
}

// 获取用户登录历史
export async function getUserLoginHistory(
  userId: string, 
  limit: number = 10
): Promise<LoginLog[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('login_logs')
    .select('*')
    .eq('user_id', userId)
    .order('login_time', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('获取登录历史失败:', error)
    return []
  }

  return data || []
}

// 获取管理员登录统计
export async function getAdminLoginStats(days: number = 30) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('login_logs')
    .select('*')
    .eq('is_admin_login', true)
    .gte('login_time', startDate.toISOString())
    .order('login_time', { ascending: false })

  if (error) {
    console.error('获取管理员登录统计失败:', error)
    return []
  }

  return data || []
}

// 获取系统登录统计
export async function getSystemLoginStats(days: number = 30) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // 总登录次数
    const { count: totalLogins } = await supabase
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .gte('login_time', startDate.toISOString())

    // 成功登录次数
    const { count: successfulLogins } = await supabase
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .eq('success', true)
      .gte('login_time', startDate.toISOString())

    // 管理员登录次数
    const { count: adminLogins } = await supabase
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin_login', true)
      .gte('login_time', startDate.toISOString())

    // 唯一用户数
    const { data: uniqueUsers } = await supabase
      .from('login_logs')
      .select('user_id')
      .eq('success', true)
      .gte('login_time', startDate.toISOString())

    const uniqueUserCount = new Set(uniqueUsers?.map(u => u.user_id)).size

    return {
      totalLogins: totalLogins || 0,
      successfulLogins: successfulLogins || 0,
      failedLogins: (totalLogins || 0) - (successfulLogins || 0),
      adminLogins: adminLogins || 0,
      uniqueUsers: uniqueUserCount,
      successRate: totalLogins ? ((successfulLogins || 0) / totalLogins * 100).toFixed(2) : '0'
    }
  } catch (error) {
    console.error('获取系统登录统计失败:', error)
    return {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      adminLogins: 0,
      uniqueUsers: 0,
      successRate: '0'
    }
  }
}

// 确保登录日志表存在
async function ensureLoginLogTable() {
  const supabase = await createClient()
  
  try {
    // 检查表是否存在
    const { error } = await supabase
      .from('login_logs')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      // 表不存在，创建表
      console.log('📋 创建登录日志表...')
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.login_logs (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
          email text NOT NULL,
          login_method text NOT NULL CHECK (login_method IN ('google', 'email', 'admin')),
          ip_address text,
          user_agent text,
          success boolean DEFAULT true,
          error_message text,
          login_time timestamp with time zone DEFAULT now(),
          logout_time timestamp with time zone,
          session_duration integer,
          is_admin_login boolean DEFAULT false,
          created_at timestamp with time zone DEFAULT now()
        );

        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_login_logs_email ON public.login_logs(email);
        CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON public.login_logs(login_time DESC);
        CREATE INDEX IF NOT EXISTS idx_login_logs_admin ON public.login_logs(is_admin_login);

        -- 启用行级安全
        ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

        -- 创建安全策略
        CREATE POLICY "Users can view own login logs" ON public.login_logs
          FOR SELECT USING (auth.uid()::text = user_id);

        CREATE POLICY "System can insert login logs" ON public.login_logs
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "System can update login logs" ON public.login_logs
          FOR UPDATE USING (true);
      `
      
      // 注意：这个SQL需要在Supabase控制台中手动执行
      // 因为需要超级用户权限
      console.log('⚠️  需要在Supabase控制台中手动执行以下SQL:')
      console.log(createTableSQL)
    }
  } catch (error) {
    console.error('检查/创建登录日志表失败:', error)
  }
} 