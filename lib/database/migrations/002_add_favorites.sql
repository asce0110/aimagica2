-- 用户收藏表迁移脚本
-- 执行顺序：在Supabase SQL Editor中执行此脚本

-- 创建用户收藏表
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_image_id ON public.user_favorites(image_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at DESC);

-- 启用行级安全策略
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能管理自己的收藏
CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 创建RLS策略：用户可以查看自己的收藏
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- 添加更新时间戳触发器
CREATE TRIGGER trigger_user_favorites_updated_at
    BEFORE UPDATE ON public.user_favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 