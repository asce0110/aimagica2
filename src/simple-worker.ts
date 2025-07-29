/**
 * 简化版Cloudflare Workers入口文件
 * 无需额外依赖，使用原生Workers API
 */

// 环境变量类型
interface Env {
  CACHE?: KVNamespace
  IMAGES?: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

// 主要的Worker处理函数
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    
    // 添加CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    // 处理OPTIONS请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }
    
    try {
      // API路由处理
      if (path.startsWith('/api/')) {
        return await handleApiRequest(request, env, path)
      }
      
      // 静态文件和页面
      return await handleStaticRequest(request, env, path)
      
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: env.ENVIRONMENT === 'development' ? String(error) : 'Something went wrong'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
  }
}

// API请求处理
async function handleApiRequest(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }
  
  // 路由匹配
  if (path.startsWith('/api/generate/image') && request.method === 'POST') {
    return await handleImageGeneration(request, env)
  }
  
  if (path.startsWith('/api/styles') && request.method === 'GET') {
    return await handleStylesApi(request, env)
  }
  
  if (path.startsWith('/api/models/available') && request.method === 'GET') {
    return await handleModelsApi(request, env)
  }
  
  if (path === '/api/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT
    }), { headers: corsHeaders })
  }
  
  // 默认API响应
  return new Response(JSON.stringify({
    message: 'AIMAGICA API',
    path: path,
    method: request.method,
    available_endpoints: [
      '/api/generate/image',
      '/api/styles', 
      '/api/models/available',
      '/api/health'
    ]
  }), { headers: corsHeaders })
}

// 图像生成API
async function handleImageGeneration(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as any
    const { prompt, style, model } = body
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 模拟图像生成响应
    const mockResponse = {
      success: true,
      imageUrl: `${env.NEXT_PUBLIC_R2_PUBLIC_URL}/generated/mock-image-${Date.now()}.jpg`,
      generationId: `gen_${Date.now()}`,
      prompt,
      style: style || 'default',
      model: model || 'kie-flux',
      message: 'Generation started (Workers version)'
    }
    
    // 如果有KV存储，缓存结果
    if (env.CACHE) {
      await env.CACHE.put(
        `generation:${mockResponse.generationId}`,
        JSON.stringify(mockResponse),
        { expirationTtl: 3600 }
      )
    }
    
    return new Response(JSON.stringify(mockResponse), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 样式API
async function handleStylesApi(request: Request, env: Env): Promise<Response> {
  const mockStyles = [
    { id: 1, name: 'Anime', category: 'artistic' },
    { id: 2, name: 'Oil Painting', category: 'classic' },
    { id: 3, name: 'Cyberpunk', category: 'futuristic' },
    { id: 4, name: 'Watercolor', category: 'artistic' }
  ]
  
  return new Response(JSON.stringify(mockStyles), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// 模型API  
async function handleModelsApi(request: Request, env: Env): Promise<Response> {
  const mockModels = [
    { id: 'kie-flux', name: 'KIE-Flux', available: true },
    { id: 'stable-diffusion', name: 'Stable Diffusion', available: true }
  ]
  
  return new Response(JSON.stringify(mockModels), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// 静态文件和页面处理
async function handleStaticRequest(request: Request, env: Env, path: string): Promise<Response> {
  // 主页面HTML
  if (path === '/' || !path.includes('.')) {
    return new Response(getIndexHTML(env), {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  // 404处理
  return new Response(get404HTML(), {
    status: 404,
    headers: { 'Content-Type': 'text/html' }
  })
}

// 主页面HTML
function getIndexHTML(env: Env): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIMAGICA - AI Art Generator (Workers Version)</title>
    
    <!-- 字体加载 -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&display=swap">
    </noscript>
    
    <!-- 基础样式 -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Fredoka One', 'Arial Black', cursive, sans-serif;
            background: linear-gradient(135deg, #2d3135 0%, #4a5a4a 100%);
            color: #f5f1e8;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
        }
        
        .hero {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .logo {
            font-size: 4rem;
            color: #d4a574;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .subtitle {
            font-size: 1.5rem;
            color: #8b7355;
            margin-bottom: 2rem;
            font-weight: 400;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
            max-width: 600px;
        }
        
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 20px;
            border: 2px solid #8b7355;
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        
        .feature:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .cta-button {
            background: linear-gradient(135deg, #d4a574, #c19660);
            color: #2d3e2d;
            padding: 1rem 2rem;
            font-size: 1.2rem;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 2rem 0;
            transition: all 0.3s ease;
            font-family: 'Fredoka One', cursive;
        }
        
        .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(212, 165, 116, 0.3);
        }
        
        .worker-badge {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4a574;
            color: #2d3e2d;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            .logo { font-size: 2.5rem; }
            .subtitle { font-size: 1.2rem; }
            .features { grid-template-columns: 1fr; }
        }
    </style>
    
    <!-- 环境变量注入 -->
    <script>
        window.__ENV__ = {
            SUPABASE_URL: "${env.NEXT_PUBLIC_SUPABASE_URL}",
            SUPABASE_ANON_KEY: "${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}",
            R2_PUBLIC_URL: "${env.NEXT_PUBLIC_R2_PUBLIC_URL}",
            ENVIRONMENT: "${env.ENVIRONMENT}"
        };
    </script>
</head>
<body>
    <div class="worker-badge">🚀 Cloudflare Workers</div>
    
    <div class="hero">
        <h1 class="logo">✨ AIMAGICA</h1>
        <p class="subtitle">AI Art Generator powered by Cloudflare Workers</p>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🎨</div>
                <h3>AI Art Generation</h3>
                <p>Transform sketches into stunning artworks</p>
            </div>
            
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Lightning Fast</h3>
                <p>Edge computing for instant results</p>
            </div>
            
            <div class="feature">
                <div class="feature-icon">🌍</div>
                <h3>Global Distribution</h3>
                <p>300+ edge locations worldwide</p>
            </div>
        </div>
        
        <button class="cta-button" onclick="testApi()">
            🚀 Test API Connection
        </button>
        
        <div id="api-result" style="margin-top: 2rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 10px; display: none;">
            <h4>API Test Result:</h4>
            <pre id="api-output" style="text-align: left; overflow: auto;"></pre>
        </div>
    </div>
    
    <script>
        async function testApi() {
            const resultDiv = document.getElementById('api-result');
            const outputPre = document.getElementById('api-output');
            
            try {
                resultDiv.style.display = 'block';
                outputPre.textContent = 'Testing API connection...';
                
                const response = await fetch('/api/health');
                const data = await response.json();
                
                outputPre.textContent = JSON.stringify(data, null, 2);
                
                // 测试图像生成API
                setTimeout(async () => {
                    try {
                        const genResponse = await fetch('/api/generate/image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                prompt: 'A magical forest with glowing trees',
                                style: 'fantasy',
                                model: 'kie-flux'
                            })
                        });
                        const genData = await genResponse.json();
                        
                        outputPre.textContent += '\\n\\n=== Generation Test ===\\n' + JSON.stringify(genData, null, 2);
                    } catch (err) {
                        outputPre.textContent += '\\n\\nGeneration test failed: ' + err.message;
                    }
                }, 1000);
                
            } catch (error) {
                outputPre.textContent = 'API test failed: ' + error.message;
            }
        }
    </script>
</body>
</html>`
}

// 404页面HTML
function get404HTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>404 - AIMAGICA</title>
    <style>
        body { 
            font-family: 'Fredoka One', Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #2d3135; 
            color: #d4a574; 
        }
        .magic { font-size: 2rem; margin: 2rem 0; }
        a { color: #f5f1e8; text-decoration: none; }
    </style>
</head>
<body>
    <div class="magic">
        <h1>404 - Page Not Found 🪄</h1>
        <p>This page doesn't exist in our magic world!</p>
        <a href="/">← Return to AIMAGICA Home</a>
    </div>
</body>
</html>`
}