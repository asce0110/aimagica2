-- API配置管理系统
-- 支持生图和生视频的多API配置和故障转移

-- 创建API配置表
CREATE TABLE IF NOT EXISTS public.api_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- API配置名称
    type VARCHAR(50) NOT NULL CHECK (type IN ('image_generation', 'video_generation')), -- API类型
    provider VARCHAR(100) NOT NULL, -- 提供商名称 (例如: OpenAI, Stability, Replicate)
    base_url TEXT NOT NULL, -- API基础URL
    api_key TEXT NOT NULL, -- API密钥
    model VARCHAR(255), -- 使用的模型名称
    endpoint VARCHAR(255), -- 具体端点
    priority INTEGER DEFAULT 0, -- 优先级，数字越小优先级越高
    is_default BOOLEAN DEFAULT FALSE, -- 是否为默认API
    is_active BOOLEAN DEFAULT TRUE, -- 是否启用
    max_retries INTEGER DEFAULT 3, -- 最大重试次数
    timeout_seconds INTEGER DEFAULT 60, -- 超时时间（秒）
    rate_limit_per_minute INTEGER DEFAULT 60, -- 每分钟速率限制
    last_used_at TIMESTAMP WITH TIME ZONE, -- 最后使用时间
    last_success_at TIMESTAMP WITH TIME ZONE, -- 最后成功时间
    last_error_at TIMESTAMP WITH TIME ZONE, -- 最后错误时间
    last_error_message TEXT, -- 最后错误消息
    success_count INTEGER DEFAULT 0, -- 成功次数
    error_count INTEGER DEFAULT 0, -- 错误次数
    config_data JSONB DEFAULT '{}', -- 额外配置数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建API使用日志表
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_config_id UUID REFERENCES public.api_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL, -- 请求类型 (image_generation, video_generation)
    prompt TEXT, -- 用户提示词
    request_data JSONB DEFAULT '{}', -- 请求数据
    response_data JSONB DEFAULT '{}', -- 响应数据
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
    response_time_ms INTEGER, -- 响应时间（毫秒）
    error_message TEXT, -- 错误消息
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_configs_type ON public.api_configs(type);
CREATE INDEX IF NOT EXISTS idx_api_configs_priority ON public.api_configs(type, priority, is_active);
CREATE INDEX IF NOT EXISTS idx_api_configs_is_default ON public.api_configs(type, is_default, is_active);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_config_id ON public.api_usage_logs(api_config_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status ON public.api_usage_logs(status);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_api_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_configs_updated_at
    BEFORE UPDATE ON public.api_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_api_configs_updated_at();

-- 创建确保每种类型只有一个默认API的触发器
CREATE OR REPLACE FUNCTION ensure_single_default_api()
RETURNS TRIGGER AS $$
BEGIN
    -- 如果设置为默认，清除同类型的其他默认设置
    IF NEW.is_default = TRUE THEN
        UPDATE public.api_configs 
        SET is_default = FALSE 
        WHERE type = NEW.type AND id != NEW.id AND is_default = TRUE;
    END IF;
    
    -- 如果没有任何默认API，自动设置第一个活跃的为默认
    IF NEW.is_default = FALSE THEN
        PERFORM 1 FROM public.api_configs 
        WHERE type = NEW.type AND is_default = TRUE AND is_active = TRUE;
        
        IF NOT FOUND THEN
            UPDATE public.api_configs 
            SET is_default = TRUE 
            WHERE id = (
                SELECT id FROM public.api_configs 
                WHERE type = NEW.type AND is_active = TRUE 
                ORDER BY priority ASC, created_at ASC 
                LIMIT 1
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_api
    AFTER INSERT OR UPDATE ON public.api_configs
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_api();

-- 设置RLS策略
ALTER TABLE public.api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看和管理API配置
CREATE POLICY "Only admins can manage api_configs" ON public.api_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_config 
            WHERE email = auth.jwt() ->> 'email' AND role = 'admin'
        )
    );

-- API使用日志的访问策略
CREATE POLICY "Admins can view all api_usage_logs" ON public.api_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_config 
            WHERE email = auth.jwt() ->> 'email' AND role = 'admin'
        )
    );

CREATE POLICY "Users can view their own api_usage_logs" ON public.api_usage_logs
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- 插入系统可以写入使用日志
CREATE POLICY "System can insert api_usage_logs" ON public.api_usage_logs
    FOR INSERT WITH CHECK (true);

-- 插入一些示例API配置
INSERT INTO public.api_configs (name, type, provider, base_url, api_key, model, endpoint, priority, is_default, config_data) VALUES 
-- 图片生成API
('OpenAI DALL-E 3', 'image_generation', 'OpenAI', 'https://api.openai.com/v1', 'your-openai-api-key', 'dall-e-3', '/images/generations', 1, TRUE, 
 '{"quality": "standard", "size": "1024x1024", "style": "vivid"}'::jsonb),
 
('Stability AI SDXL', 'image_generation', 'Stability AI', 'https://api.stability.ai/v1', 'your-stability-api-key', 'stable-diffusion-xl-1024-v1-0', '/generation/stable-diffusion-xl-1024-v1-0/text-to-image', 2, FALSE, 
 '{"samples": 1, "steps": 30, "cfg_scale": 7}'::jsonb),

('Replicate SDXL', 'image_generation', 'Replicate', 'https://api.replicate.com/v1', 'your-replicate-api-key', 'stability-ai/sdxl', '/predictions', 3, FALSE, 
 '{"width": 1024, "height": 1024, "num_outputs": 1}'::jsonb),

-- 视频生成API
('Runway Gen-2', 'video_generation', 'Runway', 'https://api.runwayml.com/v1', 'your-runway-api-key', 'gen2', '/generate', 1, TRUE, 
 '{"duration": 4, "seed": 0, "upscale": false}'::jsonb),

('Pika Labs', 'video_generation', 'Pika', 'https://api.pika.art/v1', 'your-pika-api-key', 'pika-1.0', '/generate', 2, FALSE, 
 '{"fps": 24, "aspect_ratio": "16:9", "camera_motion": "static"}'::jsonb),

('Stable Video Diffusion', 'video_generation', 'Stability AI', 'https://api.stability.ai/v2beta', 'your-stability-video-api-key', 'stable-video-diffusion-img2vid-xt', '/image-to-video', 3, FALSE, 
 '{"motion_bucket_id": 127, "noise_aug_strength": 0.02}'::jsonb)

ON CONFLICT DO NOTHING;

-- 创建API配置管理函数
CREATE OR REPLACE FUNCTION get_active_api_for_type(api_type VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    provider VARCHAR,
    base_url TEXT,
    api_key TEXT,
    model VARCHAR,
    endpoint VARCHAR,
    config_data JSONB
) AS $$
BEGIN
    -- 首先尝试获取默认API
    RETURN QUERY
    SELECT 
        c.id, c.name, c.provider, c.base_url, c.api_key, 
        c.model, c.endpoint, c.config_data
    FROM public.api_configs c
    WHERE c.type = api_type AND c.is_default = TRUE AND c.is_active = TRUE
    LIMIT 1;
    
    -- 如果没有默认API，返回优先级最高的
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            c.id, c.name, c.provider, c.base_url, c.api_key, 
            c.model, c.endpoint, c.config_data
        FROM public.api_configs c
        WHERE c.type = api_type AND c.is_active = TRUE
        ORDER BY c.priority ASC, c.created_at ASC
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建API故障转移函数
CREATE OR REPLACE FUNCTION get_fallback_apis_for_type(api_type VARCHAR, exclude_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    provider VARCHAR,
    base_url TEXT,
    api_key TEXT,
    model VARCHAR,
    endpoint VARCHAR,
    config_data JSONB,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.name, c.provider, c.base_url, c.api_key, 
        c.model, c.endpoint, c.config_data, c.priority
    FROM public.api_configs c
    WHERE c.type = api_type 
      AND c.is_active = TRUE 
      AND (exclude_id IS NULL OR c.id != exclude_id)
    ORDER BY c.priority ASC, c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建更新API统计的函数
CREATE OR REPLACE FUNCTION update_api_stats(
    config_id UUID,
    is_success BOOLEAN,
    error_msg TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE public.api_configs
    SET 
        last_used_at = NOW(),
        last_success_at = CASE WHEN is_success THEN NOW() ELSE last_success_at END,
        last_error_at = CASE WHEN NOT is_success THEN NOW() ELSE last_error_at END,
        last_error_message = CASE WHEN NOT is_success THEN error_msg ELSE last_error_message END,
        success_count = CASE WHEN is_success THEN success_count + 1 ELSE success_count END,
        error_count = CASE WHEN NOT is_success THEN error_count + 1 ELSE error_count END
    WHERE id = config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 