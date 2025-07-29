-- 更新管理员配置 - 设置 asce3801@gmail.com 为唯一管理员
-- 执行此脚本更新管理员权限配置

-- ===========================================
-- 清空现有管理员配置
-- ===========================================
DELETE FROM public.admin_config;

-- ===========================================
-- 设置新的管理员配置
-- ===========================================
INSERT INTO public.admin_config (email, role) VALUES 
    ('asce3801@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- ===========================================
-- 验证配置
-- ===========================================
SELECT * FROM public.admin_config;

-- 显示完成信息
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🔧 ========================================';
    RAISE NOTICE '🔧 管理员配置更新完成！';
    RAISE NOTICE '🔧 ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 已设置 asce3801@gmail.com 为唯一管理员';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 现在管理员权限由数据库控制！';
    RAISE NOTICE '';
END $$; 