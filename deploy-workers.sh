#!/bin/bash

echo "🚀 Deploying AIMAGICA to Cloudflare Workers..."

# 检查文件是否存在
if [ ! -f "src/simple-worker.ts" ]; then
    echo "❌ Worker file not found!"
    exit 1
fi

echo "✅ Worker file found"

# 直接部署，超时30秒
timeout 30s wrangler deploy --config wrangler.workers.toml

if [ $? -eq 124 ]; then
    echo "⏰ Deployment timeout - checking status..."
    echo "You can check deployment status at: https://dash.cloudflare.com"
else
    echo "🎉 Deployment completed!"
fi