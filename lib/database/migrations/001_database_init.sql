-- AIMAGICA AI绘图平台数据库初始化脚本
-- 执行顺序：在Supabase SQL Editor中执行此脚本
-- 版本：v1.0 (完全重写版本)

-- ===========================================
-- 第一部分：基础设置和扩展
-- ===========================================

-- 启用必要的PostgreSQL扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 第二部分：枚举类型定义
-- ===========================================

-- 用户订阅等级
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'wizard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 订阅状态
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 图片生成状态
DO $$ BEGIN
    CREATE TYPE image_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 计费周期
DO $$ BEGIN
    CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- 第三部分：核心数据表
-- ===========================================

-- 用户表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'active', 
    subscription_end_date TIMESTAMPTZ,
    google_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    daily_render_count INTEGER DEFAULT 0,
    daily_rerender_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE
);

-- 生成图片表
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    original_sketch_url TEXT,
    generated_image_url TEXT NOT NULL,
    style TEXT NOT NULL,
    prompt TEXT,
    render_time_seconds INTEGER,
    status image_status DEFAULT 'pending',
    error_message TEXT,
    is_public BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户订阅表
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    plan_price DECIMAL(10,2) NOT NULL,
    billing_cycle billing_cycle NOT NULL,
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 图片点赞表
CREATE TABLE IF NOT EXISTS public.image_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- 用户统计表
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    total_renders INTEGER DEFAULT 0,
    total_rerenders INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 登录日志表
CREATE TABLE IF NOT EXISTS public.login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    login_method TEXT NOT NULL CHECK (login_method IN ('google', 'email', 'admin')),
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    session_duration INTEGER,
    is_admin_login BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 第四部分：索引优化
-- ===========================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);

-- 生成图片表索引
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_status ON public.generated_images(status);
CREATE INDEX IF NOT EXISTS idx_generated_images_is_public ON public.generated_images(is_public);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON public.generated_images(created_at DESC);

-- 用户订阅表索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- 图片点赞表索引
CREATE INDEX IF NOT EXISTS idx_image_likes_user_id ON public.image_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_image_likes_image_id ON public.image_likes(image_id);

-- 用户统计表索引
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- 登录日志表索引
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON public.login_logs(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON public.login_logs(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_admin ON public.login_logs(is_admin_login);

-- ===========================================
-- 第五部分：数据库函数
-- ===========================================

-- 更新点赞数量函数
CREATE OR REPLACE FUNCTION update_image_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.generated_images 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.image_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.generated_images 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.image_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重置每日计数器函数
CREATE OR REPLACE FUNCTION reset_daily_counters()
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET daily_render_count = 0, 
        daily_rerender_count = 0, 
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 第六部分：触发器
-- ===========================================

-- 点赞数量自动更新触发器
CREATE TRIGGER trigger_update_image_likes_count
    AFTER INSERT OR DELETE ON public.image_likes
    FOR EACH ROW EXECUTE FUNCTION update_image_likes_count();

-- 时间戳自动更新触发器
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_generated_images_updated_at
    BEFORE UPDATE ON public.generated_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_login_logs_updated_at
    BEFORE UPDATE ON public.login_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 第七部分：行级安全（RLS）
-- ===========================================

-- 启用行级安全
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "images_select_own" ON public.generated_images;
DROP POLICY IF EXISTS "images_insert_own" ON public.generated_images;
DROP POLICY IF EXISTS "images_update_own" ON public.generated_images;
DROP POLICY IF EXISTS "images_delete_own" ON public.generated_images;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.user_subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.user_subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.user_subscriptions;
DROP POLICY IF EXISTS "likes_select_all" ON public.image_likes;
DROP POLICY IF EXISTS "likes_insert_own" ON public.image_likes;
DROP POLICY IF EXISTS "likes_delete_own" ON public.image_likes;
DROP POLICY IF EXISTS "stats_select_own" ON public.user_stats;
DROP POLICY IF EXISTS "stats_insert_own" ON public.user_stats;
DROP POLICY IF EXISTS "stats_update_own" ON public.user_stats;
DROP POLICY IF EXISTS "logs_select_own" ON public.login_logs;
DROP POLICY IF EXISTS "logs_insert_system" ON public.login_logs;
DROP POLICY IF EXISTS "logs_update_system" ON public.login_logs;
DROP POLICY IF EXISTS "admin_select_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_select_all_images" ON public.generated_images;
DROP POLICY IF EXISTS "admin_select_all_logs" ON public.login_logs;

-- 用户表安全策略
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid()::uuid = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::uuid = id);

-- 生成图片表安全策略
CREATE POLICY "images_select_own" ON public.generated_images
    FOR SELECT USING (auth.uid()::uuid = user_id OR is_public = true);

CREATE POLICY "images_insert_own" ON public.generated_images
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "images_update_own" ON public.generated_images
    FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "images_delete_own" ON public.generated_images
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- 用户订阅表安全策略
CREATE POLICY "subscriptions_select_own" ON public.user_subscriptions
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "subscriptions_insert_own" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "subscriptions_update_own" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid()::uuid = user_id);

-- 图片点赞表安全策略
CREATE POLICY "likes_select_all" ON public.image_likes
    FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON public.image_likes
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "likes_delete_own" ON public.image_likes
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- 用户统计表安全策略
CREATE POLICY "stats_select_own" ON public.user_stats
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "stats_insert_own" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "stats_update_own" ON public.user_stats
    FOR UPDATE USING (auth.uid()::uuid = user_id);

-- 登录日志表安全策略
CREATE POLICY "logs_select_own" ON public.login_logs
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "logs_insert_system" ON public.login_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "logs_update_system" ON public.login_logs
    FOR UPDATE USING (true);

-- 管理员策略（可查看所有数据）
CREATE POLICY "admin_select_all_users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()::uuid 
            AND u.email IN ('admin@aimagica.com', 'your-admin@gmail.com')
        )
    );

CREATE POLICY "admin_select_all_images" ON public.generated_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()::uuid 
            AND u.email IN ('admin@aimagica.com', 'your-admin@gmail.com')
        )
    );

CREATE POLICY "admin_select_all_logs" ON public.login_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()::uuid 
            AND u.email IN ('admin@aimagica.com', 'your-admin@gmail.com')
        )
    );

-- ===========================================
-- 第八部分：验证和完成
-- ===========================================

-- 验证表创建
SELECT 
    schemaname, 
    tablename,
    tableowner,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'generated_images', 'user_subscriptions', 'user_stats', 'image_likes', 'login_logs')
ORDER BY tablename;

-- 验证策略创建
SELECT 
    schemaname, 
    tablename, 
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 显示完成信息
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ========================================';
    RAISE NOTICE '🎉 AIMAGICA数据库初始化完成！';
    RAISE NOTICE '🎉 ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 已创建6个核心表：';
    RAISE NOTICE '   • users (用户表)';
    RAISE NOTICE '   • generated_images (生成图片表)';
    RAISE NOTICE '   • user_subscriptions (用户订阅表)';
    RAISE NOTICE '   • image_likes (图片点赞表)';
    RAISE NOTICE '   • user_stats (用户统计表)';
    RAISE NOTICE '   • login_logs (登录日志表)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 已启用行级安全(RLS)策略';
    RAISE NOTICE '⚡ 已创建性能优化索引';
    RAISE NOTICE '🔧 已创建自动化触发器';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 系统准备就绪，可以开始使用！';
    RAISE NOTICE '';
END $$; 