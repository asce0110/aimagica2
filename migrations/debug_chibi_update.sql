-- 完整调试CHIBI DIORAMA更新问题
-- 第1步：检查表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'styles' 
AND column_name IN ('prohibits_image_upload', 'requires_image_upload', 'id', 'name');

-- 第2步：查找所有包含CHIBI的记录
SELECT id, name, prohibits_image_upload, requires_image_upload, is_active, updated_at
FROM styles 
WHERE name ILIKE '%chibi%' OR name ILIKE '%diorama%';

-- 第3步：检查具体ID的记录
SELECT * 
FROM styles 
WHERE id = 'b7af7aa8-a4fa-468c-8c73-933897206419';

-- 第4步：强制更新（使用事务确保原子性）
BEGIN;

UPDATE styles 
SET 
  prohibits_image_upload = true,
  updated_at = NOW()
WHERE id = 'b7af7aa8-a4fa-468c-8c73-933897206419';

-- 检查更新影响的行数（应该返回1）
SELECT ROW_COUNT() as affected_rows;

-- 验证更新结果
SELECT id, name, prohibits_image_upload, requires_image_upload, updated_at
FROM styles 
WHERE id = 'b7af7aa8-a4fa-468c-8c73-933897206419';

COMMIT;

-- 第5步：最终验证
SELECT 
  'Final Check:' as status,
  id, 
  name, 
  prohibits_image_upload, 
  requires_image_upload,
  updated_at
FROM styles 
WHERE id = 'b7af7aa8-a4fa-468c-8c73-933897206419'; 