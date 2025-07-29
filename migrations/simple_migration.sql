-- 简单迁移：添加禁止图片上传字段
ALTER TABLE styles ADD COLUMN prohibits_image_upload BOOLEAN DEFAULT false;

-- 确保所有现有记录都有默认值
UPDATE styles SET prohibits_image_upload = false WHERE prohibits_image_upload IS NULL; 