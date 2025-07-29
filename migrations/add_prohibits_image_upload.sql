-- 添加禁止图片上传字段到styles表
-- Migration: Add prohibits_image_upload column to styles table

ALTER TABLE styles 
ADD COLUMN prohibits_image_upload BOOLEAN DEFAULT false;

-- 添加字段注释
COMMENT ON COLUMN styles.prohibits_image_upload IS '是否禁止图片上传 - 用于纯文本风格（如CHIBI DIORAMA）';

-- 更新现有记录的默认值（确保兼容性）
UPDATE styles 
SET prohibits_image_upload = false 
WHERE prohibits_image_upload IS NULL;

-- 验证添加是否成功
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'styles' 
AND column_name = 'prohibits_image_upload'; 