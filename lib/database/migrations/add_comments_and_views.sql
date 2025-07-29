-- ===============================================
-- 添加评论功能和浏览量统计
-- ===============================================

-- 1. 为 generated_images 表添加浏览量字段
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 添加注释
COMMENT ON COLUMN generated_images.view_count IS '图片浏览次数';

-- 添加索引优化查询
CREATE INDEX IF NOT EXISTS idx_generated_images_view_count ON generated_images(view_count DESC);

-- 2. 创建图片评论表
CREATE TABLE IF NOT EXISTS public.image_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加评论表注释
COMMENT ON TABLE public.image_comments IS '图片评论表';
COMMENT ON COLUMN public.image_comments.user_id IS '评论用户ID';
COMMENT ON COLUMN public.image_comments.image_id IS '评论图片ID';
COMMENT ON COLUMN public.image_comments.content IS '评论内容';
COMMENT ON COLUMN public.image_comments.likes_count IS '评论点赞数';

-- 创建评论表索引
CREATE INDEX IF NOT EXISTS idx_image_comments_user_id ON public.image_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_image_comments_image_id ON public.image_comments(image_id);
CREATE INDEX IF NOT EXISTS idx_image_comments_created_at ON public.image_comments(created_at DESC);

-- 3. 创建评论点赞表
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.image_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 添加评论点赞表注释
COMMENT ON TABLE public.comment_likes IS '评论点赞表';
COMMENT ON COLUMN public.comment_likes.user_id IS '点赞用户ID';
COMMENT ON COLUMN public.comment_likes.comment_id IS '被点赞评论ID';

-- 创建评论点赞表索引
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);

-- 4. 创建更新评论点赞数的函数
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.image_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.image_comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建评论点赞数量自动更新触发器
CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- 6. 创建更新评论时间戳的触发器
CREATE TRIGGER trigger_image_comments_updated_at
    BEFORE UPDATE ON public.image_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 设置行级安全策略
ALTER TABLE public.image_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 评论表安全策略
CREATE POLICY "comments_select_all" ON public.image_comments
    FOR SELECT USING (true);

CREATE POLICY "comments_insert_own" ON public.image_comments
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "comments_update_own" ON public.image_comments
    FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "comments_delete_own" ON public.image_comments
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- 评论点赞表安全策略
CREATE POLICY "comment_likes_select_all" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "comment_likes_insert_own" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "comment_likes_delete_own" ON public.comment_likes
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- 管理员策略
CREATE POLICY "admin_select_all_comments" ON public.image_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()::uuid 
            AND u.email IN ('admin@aimagica.com', 'asce3801@gmail.com')
        )
    );

CREATE POLICY "admin_select_all_comment_likes" ON public.comment_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()::uuid 
            AND u.email IN ('admin@aimagica.com', 'asce3801@gmail.com')
        )
    );

-- 8. 验证创建结果
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('generated_images', 'image_comments', 'comment_likes')
    AND column_name IN ('view_count', 'content', 'likes_count', 'comment_id')
ORDER BY table_name, ordinal_position; 