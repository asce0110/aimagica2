-- 魔法币系统数据库迁移
-- 创建时间: 2025-01-16

-- 1. 用户魔法币余额表
CREATE TABLE IF NOT EXISTS user_magic_coins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 NOT NULL, -- 当前魔法币余额
    total_earned INTEGER DEFAULT 0 NOT NULL, -- 总获得魔法币
    total_spent INTEGER DEFAULT 0 NOT NULL, -- 总消费魔法币
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. 魔法币交易记录表
CREATE TABLE IF NOT EXISTS magic_coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'purchase', 'subscription_grant', 'admin_grant'
    amount INTEGER NOT NULL, -- 正数为获得，负数为消费
    balance_after INTEGER NOT NULL, -- 交易后余额
    description TEXT, -- 交易描述
    reference_id UUID, -- 关联ID（订单ID、API调用ID等）
    reference_type VARCHAR(50), -- 关联类型 ('purchase', 'api_call', 'subscription', 'admin')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 魔法币购买包配置表
CREATE TABLE IF NOT EXISTS magic_coin_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 包名称，如 "Starter Pack"
    description TEXT, -- 包描述
    coins_amount INTEGER NOT NULL, -- 魔法币数量
    price_usd DECIMAL(10,2) NOT NULL, -- 美元价格
    bonus_coins INTEGER DEFAULT 0, -- 赠送魔法币
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. API消费配置表（扩展现有api_configs表）
ALTER TABLE api_configs ADD COLUMN IF NOT EXISTS coins_per_image INTEGER DEFAULT 1;
ALTER TABLE api_configs ADD COLUMN IF NOT EXISTS coins_per_video INTEGER DEFAULT 5;

-- 5. 订阅计划表（扩展现有subscription_plans表）
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS monthly_image_quota INTEGER DEFAULT 0; -- 月度生图配额
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS monthly_video_quota INTEGER DEFAULT 0; -- 月度生视频配额
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS monthly_coins_grant INTEGER DEFAULT 0; -- 月度赠送魔法币
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false; -- 是否无限制

-- 6. 用户订阅记录表
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    payment_provider VARCHAR(50), -- 'stripe', 'paypal', 'manual'
    external_subscription_id VARCHAR(255), -- 外部订阅ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 用户月度使用配额表
CREATE TABLE IF NOT EXISTS user_monthly_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL, -- 格式: '2025-01'
    images_generated INTEGER DEFAULT 0,
    videos_generated INTEGER DEFAULT 0,
    coins_granted INTEGER DEFAULT 0, -- 本月已赠送的魔法币
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year_month)
);

-- 8. 系统配置表（魔法币相关配置）
CREATE TABLE IF NOT EXISTS magic_coin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认魔法币配置
INSERT INTO magic_coin_settings (setting_key, setting_value, description) VALUES
('new_user_coins', '10', '新用户注册赠送的魔法币数量'),
('default_image_cost', '1', '默认生图消耗魔法币数量'),
('default_video_cost', '5', '默认生视频消耗魔法币数量'),
('min_purchase_amount', '1.00', '最小购买金额（美元）'),
('max_purchase_amount', '500.00', '最大购买金额（美元）')
ON CONFLICT (setting_key) DO NOTHING;

-- 插入默认魔法币购买包
INSERT INTO magic_coin_packages (name, description, coins_amount, price_usd, bonus_coins, sort_order) VALUES
('Starter Pack', 'Perfect for trying out our services', 50, 4.99, 5, 1),
('Popular Pack', 'Most popular choice for regular users', 120, 9.99, 15, 2),
('Power Pack', 'Great value for heavy users', 300, 19.99, 50, 3),
('Ultimate Pack', 'Maximum value for professionals', 600, 39.99, 120, 4)
ON CONFLICT DO NOTHING;

-- 更新现有订阅计划，添加魔法币相关配置
UPDATE subscription_plans SET 
    monthly_image_quota = CASE 
        WHEN name ILIKE '%free%' THEN 10
        WHEN name ILIKE '%pro%' THEN 100
        WHEN name ILIKE '%premium%' OR name ILIKE '%wizard%' THEN 500
        ELSE 50
    END,
    monthly_video_quota = CASE 
        WHEN name ILIKE '%free%' THEN 2
        WHEN name ILIKE '%pro%' THEN 20
        WHEN name ILIKE '%premium%' OR name ILIKE '%wizard%' THEN 100
        ELSE 10
    END,
    monthly_coins_grant = CASE 
        WHEN name ILIKE '%free%' THEN 0
        WHEN name ILIKE '%pro%' THEN 50
        WHEN name ILIKE '%premium%' OR name ILIKE '%wizard%' THEN 200
        ELSE 20
    END,
    is_unlimited = CASE 
        WHEN name ILIKE '%wizard%' OR name ILIKE '%premium%' THEN true
        ELSE false
    END
WHERE id IN (SELECT id FROM subscription_plans LIMIT 10);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_magic_coins_user_id ON user_magic_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_magic_coin_transactions_user_id ON magic_coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_magic_coin_transactions_created_at ON magic_coin_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_user_month ON user_monthly_usage(user_id, year_month);

-- 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_magic_coins_updated_at BEFORE UPDATE ON user_magic_coins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_magic_coin_packages_updated_at BEFORE UPDATE ON magic_coin_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_monthly_usage_updated_at BEFORE UPDATE ON user_monthly_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_magic_coin_settings_updated_at BEFORE UPDATE ON magic_coin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为现有用户初始化魔法币余额
INSERT INTO user_magic_coins (user_id, balance, total_earned)
SELECT id, 10, 10 FROM users 
WHERE id NOT IN (SELECT user_id FROM user_magic_coins)
ON CONFLICT (user_id) DO NOTHING;

-- 创建RLS策略
ALTER TABLE user_magic_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_monthly_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_coin_settings ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的魔法币数据
CREATE POLICY "Users can view own magic coins" ON user_magic_coins FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own transactions" ON magic_coin_transactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own usage" ON user_monthly_usage FOR SELECT USING (auth.uid()::text = user_id::text);

-- 所有人都可以查看魔法币购买包
CREATE POLICY "Anyone can view packages" ON magic_coin_packages FOR SELECT USING (is_active = true);

-- 管理员可以管理所有数据
CREATE POLICY "Admins can manage all magic coin data" ON user_magic_coins FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_config WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage all transactions" ON magic_coin_transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_config WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage all packages" ON magic_coin_packages FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_config WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_config WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage all usage" ON user_monthly_usage FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_config WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage settings" ON magic_coin_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_config WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

COMMENT ON TABLE user_magic_coins IS '用户魔法币余额表';
COMMENT ON TABLE magic_coin_transactions IS '魔法币交易记录表';
COMMENT ON TABLE magic_coin_packages IS '魔法币购买包配置表';
COMMENT ON TABLE user_subscriptions IS '用户订阅记录表';
COMMENT ON TABLE user_monthly_usage IS '用户月度使用配额表';
COMMENT ON TABLE magic_coin_settings IS '魔法币系统配置表'; 