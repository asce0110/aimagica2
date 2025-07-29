#!/bin/bash
echo "🚀 Cloudflare Pages Static Build"
echo "=================================="

# 确保使用npm而不是pnpm
echo "📦 Installing dependencies with npm..."
npm ci --silent

# 运行静态导出构建
echo "🔨 Building static export..."
npm run build:pages

# 验证输出
echo "✅ Build completed. Checking output..."
if [ -d "out" ]; then
  echo "📁 Output directory 'out' created successfully"
  echo "📊 Files generated: $(find out -type f | wc -l)"
  ls -la out/
else
  echo "❌ Error: Output directory 'out' not found!"
  exit 1
fi

echo "🎉 Static build completed successfully!"