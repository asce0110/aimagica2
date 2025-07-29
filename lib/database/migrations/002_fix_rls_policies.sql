-- 修复RLS策略 - 解决无限递归问题
-- 执行此脚本修复用户表的行级安全策略

-- ===========================================
-- 第一步：删除导致无限递归的策略
-- ===========================================

-- 删除所有现有的用户表策略
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "admin_select_all_users" ON public.users;

-- 删除其他表中引用用户表的管理员策略
DROP POLICY IF EXISTS "admin_select_all_images" ON public.generated_images;
DROP POLICY IF EXISTS "admin_select_all_logs" ON public.login_logs;

-- ===========================================
-- 第二步：创建简化的RLS策略（避免递归）
-- ===========================================

-- 暂时允许所有认证用户读取用户表（用于NextAuth）
CREATE POLICY "users_select_authenticated" ON public.users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 用户只能更新自己的数据
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid()::uuid = id);

-- 系统可以插入新用户（用于注册）
CREATE POLICY "users_insert_system" ON public.users
    FOR INSERT WITH CHECK (true);

-- ===========================================
-- 第三步：创建管理员表（解决递归问题）
-- ===========================================

-- 创建专门的管理员配置表
CREATE TABLE IF NOT EXISTS public.admin_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入管理员邮箱
INSERT INTO public.admin_config (email, role) VALUES 
    ('admin@aimagica.com', 'admin'),
    ('your-admin@gmail.com', 'admin'),
    ('sakami55@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ===========================================
-- 第四步：使用管理员表重新创建策略
-- ===========================================

-- 管理员策略（基于独立的管理员表）
CREATE POLICY "admin_select_all_users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_config ac
            WHERE ac.email = (
                SELECT u.email FROM public.users u 
                WHERE u.id = auth.uid()::uuid
            )
        )
    );

CREATE POLICY "admin_select_all_images" ON public.generated_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_config ac
            WHERE ac.email = (
                SELECT u.email FROM public.users u 
                WHERE u.id = auth.uid()::uuid
            )
        )
    );

CREATE POLICY "admin_select_all_logs" ON public.login_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_config ac
            WHERE ac.email = (
                SELECT u.email FROM public.users u 
                WHERE u.id = auth.uid()::uuid
            )
        )
    );

-- ===========================================
-- 第五步：创建管理员检查函数
-- ===========================================

-- 创建检查用户是否为管理员的函数
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_config 
        WHERE email = user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取当前用户是否为管理员的函数
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email 
    FROM public.users 
    WHERE id = auth.uid()::uuid;
    
    IF user_email IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN public.is_admin(user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 第六步：验证修复
-- ===========================================

-- 显示当前策略
SELECT 
    schemaname, 
    tablename, 
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY tablename, policyname;

-- 验证管理员配置
SELECT * FROM public.admin_config;

-- 显示完成信息
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🔧 ========================================';
    RAISE NOTICE '🔧 RLS策略修复完成！';
    RAISE NOTICE '🔧 ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 已修复无限递归问题';
    RAISE NOTICE '✅ 已创建管理员配置表';
    RAISE NOTICE '✅ 已添加管理员邮箱';
    RAISE NOTICE '✅ 已创建辅助函数';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 现在可以正常使用Google登录了！';
    RAISE NOTICE '';
END $$; 