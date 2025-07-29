-- ===============================================
-- 添加R2存储相关字段到 generated_images 表
-- ===============================================

-- 添加 R2 存储键字段
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS r2_key VARCHAR(500);

-- 添加原始图片URL字段（用于记录生成API返回的原始URL）
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- 添加注释
COMMENT ON COLUMN generated_images.r2_key IS 'R2存储中的文件键，用于管理和删除文件';
COMMENT ON COLUMN generated_images.original_url IS '生成API返回的原始图片URL';

-- 添加索引，优化查询性能
CREATE INDEX IF NOT EXISTS idx_generated_images_r2_key ON generated_images(r2_key);

-- 验证字段添加成功
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'generated_images' 
    AND column_name IN ('r2_key', 'original_url')
ORDER BY ordinal_position; 