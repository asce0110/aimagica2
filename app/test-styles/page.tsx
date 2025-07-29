"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StyleRequirementsAlert from '@/components/ui/style-requirements-alert'
import { validateStyleRequirements } from '@/lib/database/styles'

export default function TestStylesPage() {
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({
    title: '',
    errors: [] as string[],
    warnings: [] as string[]
  })

  // 模拟 TOY PHOTOGRAPHY 风格数据
  const toyPhotographyStyle = {
    id: 'toy-photography',
    name: 'TOY PHOTOGRAPHY',
    description: '玩具摄影风格，将真实物体转换为可爱的玩具模型效果',
    emoji: '🧸',
    image_url: '',
    prompt_template: '{prompt}, toy photography style, miniature effect',
    type: 'image' as const,
    category: 'photographic-realism' as const,
    is_premium: false,
    is_active: true,
    sort_order: 100,
    requires_image_upload: true,
    requires_prompt_description: true,
    min_prompt_length: 10,
    max_prompt_length: 500,
    allowed_image_formats: ['jpg', 'jpeg', 'png', 'webp'],
    requirements_description: '此风格需要上传参考图片，AI将基于您的图片创造玩具摄影风格的作品。请确保图片清晰，主体明确。',
    created_at: '',
    updated_at: ''
  }

  const [testPrompt, setTestPrompt] = useState('')
  const [hasImage, setHasImage] = useState(false)

  const testValidation = () => {
    const validation = validateStyleRequirements(
      toyPhotographyStyle,
      testPrompt,
      hasImage,
      hasImage ? 'jpg' : undefined
    )

    setAlertData({
      title: validation.isValid ? '验证通过' : '验证失败',
      errors: validation.errors,
      warnings: validation.warnings
    })
    setShowAlert(true)
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-xl">
          <CardHeader className="bg-[#2d3e2d] text-white rounded-t-xl">
            <CardTitle 
              className="text-2xl font-black text-center"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              🧸 风格要求测试 - TOY PHOTOGRAPHY
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* 风格信息 */}
            <div className="p-4 bg-[#f5f1e8] rounded-xl border-2 border-[#8b7355]/30">
              <h3 
                className="text-[#2d3e2d] font-bold mb-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                风格要求：
              </h3>
              <ul className="space-y-1 text-sm text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                <li>📸 必须上传参考图片</li>
                <li>✍️ 必须输入描述</li>
                <li>📝 描述至少 10 个字符</li>
                <li>🖼️ 支持格式：jpg, jpeg, png, webp</li>
              </ul>
              <p className="text-xs text-[#8b7355] mt-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                💡 {toyPhotographyStyle.requirements_description}
              </p>
            </div>

            {/* 测试输入 */}
            <div className="space-y-4">
              <div>
                <Label 
                  htmlFor="test-prompt"
                  className="text-[#2d3e2d] font-bold"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  测试提示词：
                </Label>
                <Input
                  id="test-prompt"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="输入测试提示词..."
                  className="border-2 border-[#8b7355] focus:border-[#d4a574] rounded-xl"
                />
                <p className="text-xs text-gray-600 mt-1">
                  当前长度：{testPrompt.length} 字符
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="has-image"
                  checked={hasImage}
                  onChange={(e) => setHasImage(e.target.checked)}
                  className="w-4 h-4 rounded border-[#8b7355]"
                />
                <Label 
                  htmlFor="has-image"
                  className="text-[#2d3e2d] font-bold"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  模拟已上传图片
                </Label>
              </div>
            </div>

            {/* 测试按钮 */}
            <Button
              onClick={testValidation}
              className="w-full bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-bold py-3 rounded-xl transform transition-all duration-200 hover:scale-105"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              🧪 测试风格要求验证
            </Button>

            {/* 快速测试按钮 */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setTestPrompt('')
                  setHasImage(false)
                  testValidation()
                }}
                variant="outline"
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 font-bold rounded-xl"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                ❌ 测试失败情况
              </Button>
              
              <Button
                onClick={() => {
                  setTestPrompt('一只可爱的小猫咪在花园里玩耍')
                  setHasImage(true)
                  setTimeout(testValidation, 100)
                }}
                variant="outline"
                className="border-2 border-green-300 text-green-600 hover:bg-green-50 font-bold rounded-xl"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                ✅ 测试成功情况
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提示对话框 */}
      <StyleRequirementsAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertData.title}
        errors={alertData.errors}
        warnings={alertData.warnings}
        styleName={toyPhotographyStyle.name}
        styleEmoji={toyPhotographyStyle.emoji}
      />
    </div>
  )
} 