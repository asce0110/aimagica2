import { createFastServiceRoleClient } from './supabase-server'

export interface MagicCoinBalance {
  id: string
  user_id: string
  balance: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface MagicCoinTransaction {
  id: string
  user_id: string
  transaction_type: 'earn' | 'spend' | 'purchase' | 'subscription_grant' | 'admin_grant'
  amount: number
  balance_after: number
  description?: string
  reference_id?: string
  reference_type?: string
  created_at: string
}

export interface MagicCoinPackage {
  id: string
  name: string
  description?: string
  coins_amount: number
  price_usd: number
  bonus_coins: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  start_date: string
  end_date?: string
  auto_renew: boolean
  payment_provider?: string
  external_subscription_id?: string
  created_at: string
  updated_at: string
}

export interface UserMonthlyUsage {
  id: string
  user_id: string
  year_month: string
  images_generated: number
  videos_generated: number
  coins_granted: number
  created_at: string
  updated_at: string
}

export interface MagicCoinSettings {
  id: string
  setting_key: string
  setting_value: string
  description?: string
  created_at: string
  updated_at: string
}

export class MagicCoinService {
  private _supabase: any = null

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createFastServiceRoleClient()
    }
    return this._supabase
  }

  // 获取用户魔法币余额
  async getUserBalance(userId: string): Promise<MagicCoinBalance | null> {
    const { data, error } = await this.supabase
      .from('user_magic_coins')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('获取用户魔法币余额失败:', error)
      return null
    }

    return data
  }

  // 初始化新用户魔法币余额
  async initializeUserBalance(userId: string, initialCoins: number = 10): Promise<MagicCoinBalance | null> {
    const { data, error } = await this.supabase
      .from('user_magic_coins')
      .insert({
        user_id: userId,
        balance: initialCoins,
        total_earned: initialCoins
      })
      .select()
      .single()

    if (error) {
      console.error('初始化用户魔法币余额失败:', error)
      return null
    }

    // 记录初始化交易
    await this.addTransaction(userId, 'earn', initialCoins, initialCoins, '新用户注册赠送')

    return data
  }

  // 添加魔法币交易记录
  async addTransaction(
    userId: string,
    type: MagicCoinTransaction['transaction_type'],
    amount: number,
    balanceAfter: number,
    description?: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<MagicCoinTransaction | null> {
    const { data, error } = await this.supabase
      .from('magic_coin_transactions')
      .insert({
        user_id: userId,
        transaction_type: type,
        amount,
        balance_after: balanceAfter,
        description,
        reference_id: referenceId,
        reference_type: referenceType
      })
      .select()
      .single()

    if (error) {
      console.error('添加魔法币交易记录失败:', error)
      return null
    }

    return data
  }

  // 消费魔法币
  async spendCoins(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      // 获取当前余额
      const balance = await this.getUserBalance(userId)
      if (!balance) {
        return { success: false, error: '用户魔法币账户不存在' }
      }

      if (balance.balance < amount) {
        return { success: false, error: '魔法币余额不足' }
      }

      const newBalance = balance.balance - amount
      const newTotalSpent = balance.total_spent + amount

      // 更新余额
      const { error: updateError } = await this.supabase
        .from('user_magic_coins')
        .update({
          balance: newBalance,
          total_spent: newTotalSpent,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('更新用户魔法币余额失败:', updateError)
        return { success: false, error: '更新余额失败' }
      }

      // 记录交易
      await this.addTransaction(userId, 'spend', -amount, newBalance, description, referenceId, referenceType)

      return { success: true, newBalance }
    } catch (error) {
      console.error('消费魔法币失败:', error)
      return { success: false, error: '系统错误' }
    }
  }

  // 增加魔法币
  async addCoins(
    userId: string,
    amount: number,
    description: string,
    type: 'earn' | 'purchase' | 'subscription_grant' | 'admin_grant' = 'earn',
    referenceId?: string,
    referenceType?: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      // 获取当前余额
      let balance = await this.getUserBalance(userId)
      if (!balance) {
        // 如果用户没有魔法币账户，先初始化
        balance = await this.initializeUserBalance(userId, 0)
        if (!balance) {
          return { success: false, error: '初始化用户魔法币账户失败' }
        }
      }

      const newBalance = balance.balance + amount
      const newTotalEarned = balance.total_earned + amount

      // 更新余额
      const { error: updateError } = await this.supabase
        .from('user_magic_coins')
        .update({
          balance: newBalance,
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('更新用户魔法币余额失败:', updateError)
        return { success: false, error: '更新余额失败' }
      }

      // 记录交易
      await this.addTransaction(userId, type, amount, newBalance, description, referenceId, referenceType)

      return { success: true, newBalance }
    } catch (error) {
      console.error('增加魔法币失败:', error)
      return { success: false, error: '系统错误' }
    }
  }

  // 获取用户交易历史
  async getUserTransactions(userId: string, limit: number = 50): Promise<MagicCoinTransaction[]> {
    const { data, error } = await this.supabase
      .from('magic_coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取用户交易历史失败:', error)
      return []
    }

    return data || []
  }

  // 获取魔法币购买包
  async getPackages(): Promise<MagicCoinPackage[]> {
    const { data, error } = await this.supabase
      .from('magic_coin_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('获取魔法币购买包失败:', error)
      return []
    }

    return data || []
  }

  // 获取系统配置
  async getSetting(key: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('magic_coin_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single()

    if (error) {
      console.error(`获取系统配置 ${key} 失败:`, error)
      return null
    }

    return data?.setting_value || null
  }

  // 获取API消费配置
  async getApiCosts(apiId: string): Promise<{ imageCoins: number; videoCoins: number }> {
    const { data, error } = await this.supabase
      .from('api_configs')
      .select('coins_per_image, coins_per_video')
      .eq('id', apiId)
      .single()

    if (error) {
      console.error('获取API消费配置失败:', error)
      // 返回默认值
      return { imageCoins: 1, videoCoins: 5 }
    }

    return {
      imageCoins: data?.coins_per_image || 1,
      videoCoins: data?.coins_per_video || 5
    }
  }

  // 检查用户是否有足够的魔法币
  async canAfford(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getUserBalance(userId)
    return balance ? balance.balance >= amount : false
  }

  // 获取用户月度使用情况
  async getUserMonthlyUsage(userId: string, yearMonth?: string): Promise<UserMonthlyUsage | null> {
    const currentYearMonth = yearMonth || new Date().toISOString().slice(0, 7) // YYYY-MM

    const { data, error } = await this.supabase
      .from('user_monthly_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('year_month', currentYearMonth)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('获取用户月度使用情况失败:', error)
      return null
    }

    return data
  }

  // 更新用户月度使用情况
  async updateMonthlyUsage(
    userId: string,
    type: 'image' | 'video',
    increment: number = 1
  ): Promise<boolean> {
    try {
      const currentYearMonth = new Date().toISOString().slice(0, 7)
      
      // 尝试更新现有记录
      const updateField = type === 'image' ? 'images_generated' : 'videos_generated'
      
      const { data, error } = await this.supabase
        .from('user_monthly_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('year_month', currentYearMonth)
        .single()

      if (error && error.code === 'PGRST116') {
        // 记录不存在，创建新记录
        const newRecord = {
          user_id: userId,
          year_month: currentYearMonth,
          images_generated: type === 'image' ? increment : 0,
          videos_generated: type === 'video' ? increment : 0,
          coins_granted: 0
        }

        const { error: insertError } = await this.supabase
          .from('user_monthly_usage')
          .insert(newRecord)

        if (insertError) {
          console.error('创建月度使用记录失败:', insertError)
          return false
        }
      } else if (!error) {
        // 记录存在，更新
        const updateData = {
          [updateField]: data[updateField] + increment,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await this.supabase
          .from('user_monthly_usage')
          .update(updateData)
          .eq('user_id', userId)
          .eq('year_month', currentYearMonth)

        if (updateError) {
          console.error('更新月度使用记录失败:', updateError)
          return false
        }
      } else {
        console.error('查询月度使用记录失败:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('更新月度使用情况失败:', error)
      return false
    }
  }
}

// 导出单例实例
export const magicCoinService = new MagicCoinService() 