"use client"
import { AlertTriangle, Lightbulb, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentPolicyErrorProps {
  isVisible: boolean
  onClose: () => void
  onRetry?: () => void
  errorMessage?: string
}

export default function ContentPolicyError({ 
  isVisible, 
  onClose, 
  onRetry, 
  errorMessage 
}: ContentPolicyErrorProps) {
  if (!isVisible) return null

  const suggestions = [
    "避免使用可能被解释为暴力、成人或敏感内容的词汇",
    "使用更加积极正面的描述词语",
    "专注于艺术风格、颜色、构图等技术性描述",
    "参考我们提供的风格模板来构建您的提示词",
    "尝试使用更加具体和描述性的词语，而不是模糊的表达"
  ]

  const examples = [
    {
      bad: "创建一个黑暗、恐怖的场景",
      good: "创建一个神秘、梦幻的魔法森林场景"
    },
    {
      bad: "画一个战斗场面",
      good: "画一个英雄角色站在壮丽的山峰上"
    },
    {
      bad: "描绘危险的情况",
      good: "描绘一个充满冒险精神的探索场景"
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 
                className="text-2xl font-black text-white mb-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                🛡️ 内容审核提醒
              </h2>
              <p 
                className="text-white/90 font-medium"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                您的提示词包含了可能违反内容政策的内容
              </p>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          {/* 错误说明 */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <h3 
              className="text-lg font-bold text-orange-800 mb-2 flex items-center gap-2"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <AlertTriangle className="w-5 h-5" />
              为什么会出现这个提示？
            </h3>
            <p 
              className="text-orange-700 font-medium"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              AI系统检测到您的提示词可能包含敏感内容。为了保护所有用户，我们需要确保生成的内容安全、积极且适合所有年龄段。
            </p>
          </div>

          {/* 修改建议 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h3 
              className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Lightbulb className="w-5 h-5" />
              如何修改您的提示词？
            </h3>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-blue-700 font-medium"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 示例对比 */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <h3 
              className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              ✨ 提示词示例对比
            </h3>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="mb-2">
                    <span 
                      className="text-red-600 font-bold text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      ❌ 避免使用：
                    </span>
                    <p 
                      className="text-red-700 font-medium mt-1"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      "{example.bad}"
                    </p>
                  </div>
                  <div>
                    <span 
                      className="text-green-600 font-bold text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      ✅ 推荐使用：
                    </span>
                    <p 
                      className="text-green-700 font-medium mt-1"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      "{example.good}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-xl transform hover:scale-105 transition-all"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              我明白了，去修改提示词
            </Button>
            
            {onRetry && (
              <Button
                onClick={() => {
                  onClose()
                  onRetry()
                }}
                variant="outline"
                className="flex-1 border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#f5f1e8] font-black rounded-xl transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新尝试生图
              </Button>
            )}
          </div>

          {/* 底部提示 */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p 
              className="text-gray-600 text-sm font-medium"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              💡 提示：您可以参考我们的风格模板来创建安全且精美的艺术作品！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 