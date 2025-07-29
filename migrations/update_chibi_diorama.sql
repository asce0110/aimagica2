-- 直接更新CHIBI DIORAMA风格的配置
UPDATE styles 
SET prohibits_image_upload = true 
WHERE name ILIKE '%CHIBI DIORAMA%';

-- 验证更新结果
SELECT id, name, prohibits_image_upload, requires_image_upload 
FROM styles 
WHERE name ILIKE '%CHIBI DIORAMA%'; 