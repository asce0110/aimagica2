"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, Clock, Target, Zap, RefreshCw } from "lucide-react"

interface WaitingGameProps {
  onGameComplete?: (score: number) => void
  isVisible?: boolean
}

interface Level {
  id: number
  name: string
  size: number
  timeLimit: number
  description: string
  icon: React.ReactNode
  unlocked: boolean
  completed: boolean
  bestTime?: number
}

const WaitingGame: React.FC<WaitingGameProps> = ({ onGameComplete, isVisible = true }) => {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [numbers, setNumbers] = useState<number[]>([])
  const [currentTarget, setCurrentTarget] = useState(1)
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)

  // Level definitions with progression system
  const [levels, setLevels] = useState<Level[]>([
    {
      id: 1,
      name: "Warm Up",
      size: 3,
      timeLimit: 60,
      description: "Find numbers 1-9 in order",
      icon: <Target className="w-4 h-4" />,
      unlocked: true,
      completed: false
    },
    {
      id: 2,
      name: "Getting Focused",
      size: 4,
      timeLimit: 80,
      description: "Find numbers 1-16 in order",
      icon: <Zap className="w-4 h-4" />,
      unlocked: false,
      completed: false
    },
    {
      id: 3,
      name: "Concentration Test",
      size: 5,
      timeLimit: 120,
      description: "Find numbers 1-25 in order",
      icon: <Star className="w-4 h-4" />,
      unlocked: false,
      completed: false
    },
    {
      id: 4,
      name: "Master Challenge",
      size: 6,
      timeLimit: 180,
      description: "Find numbers 1-36 in order",
      icon: <Trophy className="w-4 h-4" />,
      unlocked: false,
      completed: false
    }
  ])

  const getCurrentLevel = () => levels.find(l => l.id === currentLevel) || levels[0]

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array: number[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Generate numbers for current level
  const generateNumbers = useCallback(() => {
    const level = getCurrentLevel()
    const totalNumbers = level.size * level.size
    const numberArray = Array.from({ length: totalNumbers }, (_, i) => i + 1)
    setNumbers(shuffleArray(numberArray))
  }, [currentLevel])

  // Start game for current level
  const startGame = () => {
    generateNumbers()
    setGameStarted(true)
    setCurrentTarget(1)
    setTimer(0)
    setGameCompleted(false)
    setShowInstructions(false)

    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)
    setTimerInterval(interval)
  }

  // Handle cell click
  const handleCellClick = (number: number) => {
    if (!gameStarted || gameCompleted) return

    if (number === currentTarget) {
      const level = getCurrentLevel()
      const totalNumbers = level.size * level.size
      
      if (currentTarget === totalNumbers) {
        // Level completed!
        completeLevel()
      } else {
        setCurrentTarget(prev => prev + 1)
      }
    } else {
      // Wrong number - add visual feedback
      const wrongCell = document.querySelector(`[data-number="${number}"]`)
      if (wrongCell) {
        wrongCell.classList.add('wrong-shake')
        setTimeout(() => {
          wrongCell.classList.remove('wrong-shake')
        }, 500)
      }
    }
  }

  // Complete current level
  const completeLevel = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    setGameStarted(false)
    setGameCompleted(true)

    const level = getCurrentLevel()
    const timeBonus = Math.max(0, level.timeLimit - timer) * 10
    const speedBonus = timer < level.timeLimit / 2 ? 500 : 0
    const levelScore = 1000 + timeBonus + speedBonus

    setTotalScore(prev => prev + levelScore)

    // Update level completion and unlock next level
    setLevels(prev => prev.map(l => {
      if (l.id === currentLevel) {
        return { ...l, completed: true, bestTime: l.bestTime ? Math.min(l.bestTime, timer) : timer }
      }
      if (l.id === currentLevel + 1) {
        return { ...l, unlocked: true }
      }
      return l
    }))

    // Trigger completion callback
    onGameComplete?.(levelScore)
  }

  // Reset game
  const resetGame = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setGameStarted(false)
    setGameCompleted(false)
    setCurrentTarget(1)
    setTimer(0)
    generateNumbers()
  }

  // Select level
  const selectLevel = (levelId: number) => {
    const level = levels.find(l => l.id === levelId)
    if (level && level.unlocked) {
      setCurrentLevel(levelId)
      resetGame()
    }
  }

  // Initialize numbers on mount
  useEffect(() => {
    generateNumbers()
  }, [generateNumbers])

  if (!isVisible) return null

  const level = getCurrentLevel()
  const isCorrectNumber = (num: number) => num < currentTarget
  const isCurrentTarget = (num: number) => num === currentTarget

  return (
    <div className="relative">
      <Card className="w-full max-w-md mx-auto bg-white border-4 border-[#2d3e2d] shadow-xl transform rotate-0.5">
        <CardContent className="p-6 relative">
          {/* 装饰元素 */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#d4a574] rounded-full border-2 border-white shadow-sm"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#8b7355] rounded-full border-2 border-white shadow-sm"></div>
          
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-black text-[#2d3e2d] mb-1 transform -rotate-1" style={{ 
              fontFamily: "Fredoka One, Arial Black, sans-serif",
              textShadow: "1px 1px 0px #d4a574"
            }}>
              🧠 Mind Sharpener
            </h2>
            <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Keep your brain busy while we create magic! ✨
            </p>
          </div>

          {/* Instructions */}
          {showInstructions && (
            <div className="bg-[#f5f1e8] p-3 rounded-lg mb-4 text-xs border-2 border-[#8b7355]/30">
              <p className="text-[#2d3e2d] font-black mb-2">📋 How to Play:</p>
              <ul className="text-[#8b7355] space-y-1 font-bold">
                <li>• Click numbers in order from 1 to {level.size * level.size}</li>
                <li>• Complete levels to unlock harder challenges</li>
                <li>• Faster completion = higher score!</li>
              </ul>
            </div>
          )}

          {/* Level Selection */}
          <div className="mb-4">
            <p className="text-sm font-black text-[#2d3e2d] mb-2">Choose Your Challenge:</p>
            <div className="grid grid-cols-2 gap-2">
              {levels.map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => selectLevel(lvl.id)}
                  disabled={!lvl.unlocked}
                  className={`p-2 rounded-lg text-xs font-black transition-all transform hover:scale-105 ${
                    lvl.id === currentLevel
                      ? 'bg-[#d4a574] text-[#2d3e2d] shadow-lg scale-105 border-2 border-[#2d3e2d]'
                      : lvl.unlocked
                      ? 'bg-white text-[#2d3e2d] hover:bg-[#f5f1e8] border-2 border-[#8b7355]'
                      : 'bg-[#8b7355]/30 text-[#8b7355] cursor-not-allowed border-2 border-[#8b7355]/50'
                  }`}
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {lvl.icon}
                    <span>{lvl.name}</span>
                    {lvl.completed && <Trophy className="w-3 h-3 text-yellow-500" />}
                  </div>
                  <div className="text-xs opacity-75">{lvl.size}×{lvl.size} grid</div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Stats */}
          <div className="flex justify-between items-center mb-3 bg-[#f5f1e8] p-2 rounded-lg border-2 border-[#8b7355]/30">
            <div className="flex items-center gap-1 text-sm font-black text-[#2d3e2d]">
              <Target className="w-4 h-4" />
              <span>Next: {currentTarget}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-black text-[#2d3e2d]">
              <Clock className="w-4 h-4" />
              <span>{timer}s</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-black text-[#2d3e2d]">
              <Star className="w-4 h-4" />
              <span>{totalScore}</span>
            </div>
          </div>

          {/* Game Grid */}
          <div 
            className="grid gap-1 mb-4"
            style={{ 
              gridTemplateColumns: `repeat(${level.size}, 1fr)`,
              aspectRatio: '1'
            }}
          >
            {numbers.map((number, index) => (
              <button
                key={index}
                data-number={number}
                onClick={() => handleCellClick(number)}
                disabled={!gameStarted || gameCompleted}
                              className={`
                aspect-square flex items-center justify-center font-black text-sm rounded-md transition-all duration-200 transform hover:scale-105 border-2
                ${isCorrectNumber(number) 
                  ? 'bg-[#4a5a4a] text-white shadow-md border-[#2d3e2d]' 
                  : isCurrentTarget(number)
                  ? 'bg-[#d4a574] text-[#2d3e2d] shadow-lg ring-2 ring-[#d4a574] animate-pulse border-[#2d3e2d]'
                  : 'bg-white text-[#2d3e2d] hover:bg-[#f5f1e8] border-[#8b7355]'
                }
                ${!gameStarted || gameCompleted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                {number}
              </button>
            ))}
          </div>

          {/* Game Controls */}
          <div className="flex gap-2">
            {!gameStarted ? (
              <Button
                onClick={startGame}
                className="flex-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black py-2 px-4 rounded-lg transform hover:scale-105 transition-all border-2 border-[#2d3e2d] shadow-lg"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Level {currentLevel}!
              </Button>
            ) : (
              <Button
                onClick={resetGame}
                variant="outline"
                className="flex-1 border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-white font-black py-2 px-4 rounded-lg transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {/* Completion Message */}
          {gameCompleted && (
            <div className="mt-4 p-3 bg-[#f5f1e8] rounded-lg text-center border-2 border-[#d4a574] relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full"></div>
              <p className="text-[#2d3e2d] font-black mb-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                🎉 Level {currentLevel} Complete!
              </p>
              <p className="text-sm text-[#8b7355] font-bold">
                Time: {timer}s | Score: +{1000 + Math.max(0, level.timeLimit - timer) * 10}
              </p>
              {currentLevel < levels.length && levels[currentLevel].unlocked && (
                <Button
                  onClick={() => selectLevel(currentLevel + 1)}
                  className="mt-2 bg-[#4a5a4a] hover:bg-[#2d3e2d] text-white text-sm py-1 px-3 rounded font-black border-2 border-[#2d3e2d] transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  Next Level! 🚀
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        :global(.wrong-shake) {
          animation: shake 0.5s ease-in-out;
          background-color: #ef4444 !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}

export default WaitingGame
