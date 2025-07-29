-- 为 styles 表添加限制条件字段
-- Migration: 003_add_style_requirements.sql

-- 添加新的字段来定义风格的使用要求
ALTER TABLE styles 
ADD COLUMN IF NOT EXISTS requires_image_upload BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requires_prompt_description BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS min_prompt_length INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_prompt_length INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS allowed_image_formats TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'webp'],
ADD COLUMN IF NOT EXISTS requirements_description TEXT DEFAULT NULL;

-- 添加注释说明
COMMENT ON COLUMN styles.requires_image_upload IS '是否必须上传图片才能使用此风格';
COMMENT ON COLUMN styles.requires_prompt_description IS '是否必须输入提示词描述';
COMMENT ON COLUMN styles.min_prompt_length IS '提示词最小长度要求';
COMMENT ON COLUMN styles.max_prompt_length IS '提示词最大长度限制';
COMMENT ON COLUMN styles.allowed_image_formats IS '允许的图片格式';
COMMENT ON COLUMN styles.requirements_description IS '使用要求的详细说明';

-- 更新现有的 TOY PHOTOGRAPHY 风格，设置必须上传图片的要求
UPDATE styles 
SET 
  requires_image_upload = TRUE,
  requires_prompt_description = TRUE,
  min_prompt_length = 10,
  requirements_description = '此风格需要上传参考图片，AI将基于您的图片创造玩具摄影风格的作品。请确保图片清晰，主体明确。'
WHERE name ILIKE '%TOY PHOTOGRAPHY%' OR name ILIKE '%玩具摄影%';

-- 为其他一些特殊风格设置要求
UPDATE styles 
SET 
  requires_prompt_description = TRUE,
  min_prompt_length = 5,
  requirements_description = '请提供详细的描述以获得最佳效果。'
WHERE category IN ('concept-art', 'technical-scientific', 'architecture-interior');

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_styles_requires_image ON styles(requires_image_upload);
CREATE INDEX IF NOT EXISTS idx_styles_requires_prompt ON styles(requires_prompt_description); 