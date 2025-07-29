-- 支付系统数据库迁移脚本
-- 执行时间：2025年1月

-- 1. 支付提供商配置表
CREATE TABLE IF NOT EXISTS payment_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('stripe', 'paypal', 'alipay', 'wechat', 'crypto')),
    enabled BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    config JSONB NOT NULL,
    features JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('free', 'premium', 'enterprise')),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    interval VARCHAR(20) NOT NULL CHECK (interval IN ('month', 'year', 'lifetime')),
    features JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 扩展现有用户订阅表 (先创建新列，避免外键冲突)
-- 先添加不含外键的列
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS payment_provider_id UUID,
ADD COLUMN IF NOT EXISTS external_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS payment_history JSONB DEFAULT '[]'::jsonb;

-- 然后添加外键约束（如果表已存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_subscriptions_payment_provider_id_fkey'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD CONSTRAINT user_subscriptions_payment_provider_id_fkey 
        FOREIGN KEY (payment_provider_id) REFERENCES payment_providers(id);
    END IF;
END $$;

-- 4. 支付交易记录表
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES payment_providers(id),
    plan_id UUID REFERENCES subscription_plans(id),
    external_transaction_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'one_time', 'refund')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    webhook_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 支付配置审计表
CREATE TABLE IF NOT EXISTS payment_config_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'enable', 'disable')),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_payment_providers_enabled ON payment_providers(enabled, priority);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_enabled ON subscription_plans(enabled, type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON payment_transactions(provider_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_config_audit_admin ON payment_config_audit(admin_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_provider ON user_subscriptions(payment_provider_id);

-- 7. 设置行级安全策略(RLS)
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_config_audit ENABLE ROW LEVEL SECURITY;

-- 先删除可能存在的策略，然后重新创建
DO $$
BEGIN
    -- 删除现有策略（如果存在）
    DROP POLICY IF EXISTS "Admin can manage payment providers" ON payment_providers;
    DROP POLICY IF EXISTS "Admin can manage subscription plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Users can view enabled plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
    DROP POLICY IF EXISTS "Admin can view all transactions" ON payment_transactions;
    DROP POLICY IF EXISTS "Admin can view audit logs" ON payment_config_audit;
    
    -- 创建新策略
    -- 管理员可以访问所有支付配置数据
    EXECUTE 'CREATE POLICY "Admin can manage payment providers" ON payment_providers
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM admin_config ac
                WHERE ac.email = (
                    SELECT u.email FROM users u 
                    WHERE u.id = auth.uid()::uuid
                )
            )
        )';

    EXECUTE 'CREATE POLICY "Admin can manage subscription plans" ON subscription_plans
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM admin_config ac
                WHERE ac.email = (
                    SELECT u.email FROM users u 
                    WHERE u.id = auth.uid()::uuid
                )
            )
        )';

    -- 用户只能查看已启用的订阅计划
    EXECUTE 'CREATE POLICY "Users can view enabled plans" ON subscription_plans
        FOR SELECT USING (enabled = true)';

    -- 用户只能查看自己的交易记录
    EXECUTE 'CREATE POLICY "Users can view own transactions" ON payment_transactions
        FOR SELECT USING (auth.uid() = user_id)';

    -- 管理员可以查看所有交易记录
    EXECUTE 'CREATE POLICY "Admin can view all transactions" ON payment_transactions
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM admin_config ac
                WHERE ac.email = (
                    SELECT u.email FROM users u 
                    WHERE u.id = auth.uid()::uuid
                )
            )
        )';

    -- 管理员可以查看审计日志
    EXECUTE 'CREATE POLICY "Admin can view audit logs" ON payment_config_audit
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM admin_config ac
                WHERE ac.email = (
                    SELECT u.email FROM users u 
                    WHERE u.id = auth.uid()::uuid
                )
            )
        )';
        
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- 忽略表不存在的错误
    WHEN undefined_object THEN
        NULL; -- 忽略策略不存在的错误
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- 8. 创建触发器以自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_providers_updated_at 
    BEFORE UPDATE ON payment_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 插入默认订阅计划
INSERT INTO subscription_plans (name, description, type, price, currency, interval, features, enabled, popular)
VALUES 
    ('Free Plan', 'Perfect for getting started with AI image generation', 'free', 0, 'USD', 'month', 
     '{"imageGenerations": 10, "highResolution": false, "advancedStyles": false, "priorityQueue": false, "apiAccess": false, "commercialUse": false}', 
     true, false),
    ('Pro Plan', 'Great for creators and designers', 'premium', 19.99, 'USD', 'month',
     '{"imageGenerations": 500, "highResolution": true, "advancedStyles": true, "priorityQueue": true, "apiAccess": false, "commercialUse": true}',
     true, true),
    ('Enterprise Plan', 'For teams and businesses', 'enterprise', 99.99, 'USD', 'month',
     '{"imageGenerations": 10000, "highResolution": true, "advancedStyles": true, "priorityQueue": true, "apiAccess": true, "commercialUse": true}',
     true, false)
ON CONFLICT DO NOTHING;

-- 10. 插入示例支付提供商配置（仅用于开发测试）
INSERT INTO payment_providers (name, type, enabled, priority, config, features)
VALUES 
    ('Stripe', 'stripe', false, 1,
     '{"environment": "sandbox", "supportedCurrencies": ["USD", "EUR"], "supportedCountries": ["US", "CA", "GB", "AU"]}',
     '{"subscription": true, "oneTime": true, "refund": true, "webhook": true}'),
    ('PayPal', 'paypal', false, 2,
     '{"environment": "sandbox", "supportedCurrencies": ["USD", "EUR"], "supportedCountries": ["US", "CA", "GB", "AU"]}',
     '{"subscription": true, "oneTime": true, "refund": true, "webhook": true}')
ON CONFLICT DO NOTHING;

-- 11. 创建支付相关函数
CREATE OR REPLACE FUNCTION get_user_current_plan(user_uuid UUID)
RETURNS TABLE(
    plan_id UUID,
    plan_name VARCHAR,
    plan_type VARCHAR,
    features JSONB,
    status VARCHAR,
    expires_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id as plan_id,
        sp.name as plan_name,
        sp.type as plan_type,
        sp.features,
        us.status,
        us.expires_at
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid
    AND us.status IN ('active', 'trialing')
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql; 