// 全局生图状态管理
export interface GenerationState {
  isRendering: boolean
  renderProgress: number
  generatedImages: Array<{ url: string; revised_prompt?: string }>
  textPrompt: string
  selectedAspectRatio: string
  selectedStyleId: string | null
  selectedStyleName: string | null
  currentStep: string
  startTime: number | null
}

const STORAGE_KEY = 'aimagica_generation_state'

// 默认状态
const defaultState: GenerationState = {
  isRendering: false,
  renderProgress: 0,
  generatedImages: [],
  textPrompt: '',
  selectedAspectRatio: '1:1',
  selectedStyleId: null,
  selectedStyleName: null,
  currentStep: 'create',
  startTime: null
}

// 保存状态到localStorage
export const saveGenerationState = (state: Partial<GenerationState>) => {
  try {
    const currentState = getGenerationState()
    const newState = { ...currentState, ...state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    
    // 触发自定义事件，通知其他页面状态变化
    window.dispatchEvent(new CustomEvent('generationStateChange', {
      detail: newState
    }))
  } catch (error) {
    console.warn('Failed to save generation state:', error)
  }
}

// 从localStorage获取状态
export const getGenerationState = (): GenerationState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      
      // 检查是否超时（超过10分钟自动清除）
      if (parsed.startTime && Date.now() - parsed.startTime > 10 * 60 * 1000) {
        clearGenerationState()
        return defaultState
      }
      
      return { ...defaultState, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load generation state:', error)
  }
  return defaultState
}

// 清除状态
export const clearGenerationState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('generationStateChange', {
      detail: defaultState
    }))
  } catch (error) {
    console.warn('Failed to clear generation state:', error)
  }
}

// 监听状态变化
export const onGenerationStateChange = (callback: (state: GenerationState) => void) => {
  const handleChange = (event: CustomEvent) => {
    callback(event.detail)
  }
  
  window.addEventListener('generationStateChange', handleChange as EventListener)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('generationStateChange', handleChange as EventListener)
  }
}

// 开始生图
export const startGeneration = (prompt: string, aspectRatio: string, styleId: string | null, styleName?: string | null) => {
  saveGenerationState({
    isRendering: true,
    renderProgress: 0,
    textPrompt: prompt,
    selectedAspectRatio: aspectRatio,
    selectedStyleId: styleId,
    selectedStyleName: styleName || null,
    currentStep: 'rendering',
    startTime: Date.now()
  })
}

// 更新进度
export const updateProgress = (progress: number) => {
  const state = getGenerationState()
  if (state.isRendering) {
    saveGenerationState({ renderProgress: progress })
  }
}

// 完成生图
export const completeGeneration = (images: Array<{ url: string; revised_prompt?: string }>) => {
  saveGenerationState({
    isRendering: false,
    renderProgress: 100,
    generatedImages: images,
    currentStep: 'result'
  })
}

// 取消生图
export const cancelGeneration = () => {
  saveGenerationState({
    isRendering: false,
    renderProgress: 0,
    currentStep: 'create'
  })
} 