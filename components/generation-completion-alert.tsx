"use client"
import { useEffect, useState } from "react"
import { CheckCircle, Sparkles, Volume2 } from "lucide-react"

interface GenerationCompletionAlertProps {
  isVisible: boolean
  onDismiss: () => void
}

export default function GenerationCompletionAlert({ 
  isVisible, 
  onDismiss 
}: GenerationCompletionAlertProps) {
  const [showAlert, setShowAlert] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)

  // 播放完成音效
  const playCompletionSound = () => {
    try {
      // 创建音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // 成功音效序列 - 愉快的提示音
      const playTone = (frequency: number, duration: number, delay: number = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + duration)
        }, delay)
      }
      
      // 播放愉快的三音序列：C-E-G (上升和弦)
      playTone(523.25, 0.2, 0)    // C5
      playTone(659.25, 0.2, 200)  // E5
      playTone(783.99, 0.4, 400)  // G5
      
    } catch (error) {
      console.log('Audio not supported or blocked:', error)
    }
  }

  useEffect(() => {
    if (isVisible) {
      setShowAlert(true)
      setAnimationPhase(0)
      
      // 播放音效
      playCompletionSound()
      
      // 动画序列
      const animationSequence = [
        () => setAnimationPhase(1), // 淡入
        () => setAnimationPhase(2), // 放大
        () => setAnimationPhase(3), // 摇摆
        () => setAnimationPhase(4), // 淡出准备
      ]
      
      animationSequence.forEach((fn, index) => {
        setTimeout(fn, index * 800)
      })
      
      // 自动消失
      setTimeout(() => {
        setShowAlert(false)
        setTimeout(onDismiss, 300)
      }, 3500)
    }
  }, [isVisible, onDismiss])

  if (!showAlert) return null

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div 
        className={`
          bg-gradient-to-r from-green-500 to-emerald-600 
          text-white rounded-2xl p-4 shadow-2xl border-2 border-white/20
          transform transition-all duration-300 min-w-[280px]
          ${animationPhase === 0 ? 'opacity-0 scale-50 translate-y-4' : ''}
          ${animationPhase === 1 ? 'opacity-100 scale-100 translate-y-0' : ''}
          ${animationPhase === 2 ? 'opacity-100 scale-110 translate-y-0' : ''}
          ${animationPhase === 3 ? 'opacity-100 scale-100 translate-y-0 animate-pulse' : ''}
          ${animationPhase === 4 ? 'opacity-0 scale-95 translate-y-2' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          {/* 动画图标 */}
          <div className="relative">
            <CheckCircle className={`
              w-8 h-8 transition-all duration-500
              ${animationPhase >= 2 ? 'animate-bounce' : ''}
            `} />
            <Sparkles className={`
              absolute -top-1 -right-1 w-4 h-4 text-yellow-300
              transition-all duration-300
              ${animationPhase >= 2 ? 'animate-spin' : 'opacity-0'}
            `} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 font-magic">
              <h3 className="font-bold text-lg" >
                🎉 生成完成！
              </h3>
              <Volume2 className="w-4 h-4 text-white/80" />
            </div>
            <p className="text-sm text-white/90" >
              您的AI艺术作品已经创作完成！
            </p>
          </div>
        </div>
        
        {/* 装饰性粒子效果 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1 h-1 bg-white/50 rounded-full
                transition-all duration-1000
                ${animationPhase >= 2 ? 'animate-ping' : 'opacity-0'}
              `}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 