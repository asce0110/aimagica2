"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface FloatingCharacter {
  id: number
  x: number
  y: number
  scale: number
  rotate: number
  delay: number
  duration: number
  character: "wizard" | "cat" | "fairy" | "star" | "brush"
  flip: boolean
}

export default function FloatingCharacters() {
  const [characters, setCharacters] = useState<FloatingCharacter[]>([])
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  })

  useEffect(() => {
    // 处理窗口大小变化
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // 生成随机角色
    const generateCharacters = () => {
      const characterTypes: ("wizard" | "cat" | "fairy" | "star" | "brush")[] = [
        "wizard",
        "cat",
        "fairy",
        "star",
        "brush",
      ]
      const newCharacters: FloatingCharacter[] = []

      // 根据屏幕大小决定角色数量
      const characterCount = windowSize.width < 768 ? 3 : windowSize.width < 1200 ? 5 : 7

      for (let i = 0; i < characterCount; i++) {
        newCharacters.push({
          id: i,
          x: Math.random() * 100, // 随机x位置（百分比）
          y: Math.random() * 100, // 随机y位置（百分比）
          scale: 0.5 + Math.random() * 0.5, // 随机大小
          rotate: Math.random() * 20 - 10, // 随机旋转
          delay: Math.random() * 5, // 随机延迟
          duration: 15 + Math.random() * 20, // 随机动画持续时间
          character: characterTypes[Math.floor(Math.random() * characterTypes.length)], // 随机角色类型
          flip: Math.random() > 0.5, // 随机是否翻转
        })
      }
      setCharacters(newCharacters)
    }

    window.addEventListener("resize", handleResize)
    generateCharacters()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [windowSize.width])

  // 渲染角色SVG
  const renderCharacter = (type: "wizard" | "cat" | "fairy" | "star" | "brush", flip: boolean) => {
    switch (type) {
      case "wizard":
        return (
          <svg
            width="60"
            height="80"
            viewBox="0 0 60 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: flip ? "scaleX(-1)" : "none" }}
          >
            {/* 魔法师帽子 */}
            <path d="M30 5L40 20H20L30 5Z" fill="#2d3e2d" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M20 20H40V25C40 27.7614 37.7614 30 35 30H25C22.2386 30 20 27.7614 20 25V20Z"
              fill="#8b7355"
              stroke="#000"
              strokeWidth="2"
            />
            <circle cx="30" cy="15" r="2" fill="#d4a574" />
            <circle cx="25" cy="18" r="2" fill="#d4a574" />
            <circle cx="35" cy="18" r="2" fill="#d4a574" />

            {/* 脸 */}
            <circle cx="30" cy="40" r="10" fill="#f5f1e8" stroke="#000" strokeWidth="2" />
            <circle cx="26" cy="38" r="1.5" fill="#000" />
            <circle cx="34" cy="38" r="1.5" fill="#000" />
            <path d="M27 43C28.5 45 31.5 45 33 43" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

            {/* 魔法棒 */}
            <line x1="40" y1="35" x2="50" y2="25" stroke="#8b7355" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M50 25L53 22L55 24L52 27L50 25Z"
              fill="#d4a574"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="53" cy="22" r="2" fill="#f5f1e8" stroke="#000" />

            {/* 星星特效 */}
            <circle cx="55" cy="20" r="1" fill="#f5f1e8" />
            <circle cx="57" cy="22" r="1" fill="#f5f1e8" />
            <circle cx="54" cy="18" r="1" fill="#f5f1e8" />
          </svg>
        )
      case "cat":
        return (
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: flip ? "scaleX(-1)" : "none" }}
          >
            {/* 猫身体 */}
            <circle cx="30" cy="35" r="20" fill="#d4a574" stroke="#000" strokeWidth="2" />

            {/* 猫耳朵 */}
            <path d="M20 20L15 10L25 15L20 20Z" fill="#d4a574" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
            <path d="M40 20L45 10L35 15L40 20Z" fill="#d4a574" stroke="#000" strokeWidth="2" strokeLinejoin="round" />

            {/* 猫脸 */}
            <circle cx="25" cy="30" r="2" fill="#000" />
            <circle cx="35" cy="30" r="2" fill="#000" />
            <path d="M30 35L30 38" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            <path d="M26 40C27.5 42 32.5 42 34 40" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

            {/* 猫胡须 */}
            <line x1="20" y1="35" x2="15" y2="34" stroke="#000" strokeWidth="1" strokeLinecap="round" />
            <line x1="20" y1="37" x2="15" y2="37" stroke="#000" strokeWidth="1" strokeLinecap="round" />
            <line x1="20" y1="39" x2="15" y2="40" stroke="#000" strokeWidth="1" strokeLinecap="round" />
            <line x1="40" y1="35" x2="45" y2="34" stroke="#000" strokeWidth="1" strokeLinecap="round" />
            <line x1="40" y1="37" x2="45" y2="37" stroke="#000" strokeWidth="1" strokeLinecap="round" />
            <line x1="40" y1="39" x2="45" y2="40" stroke="#000" strokeWidth="1" strokeLinecap="round" />

            {/* 魔法帽 */}
            <path d="M25 20H35L30 10L25 20Z" fill="#2d3e2d" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="30" cy="15" r="1" fill="#f5f1e8" />
            <circle cx="27" cy="17" r="1" fill="#f5f1e8" />
            <circle cx="33" cy="17" r="1" fill="#f5f1e8" />
          </svg>
        )
      case "fairy":
        return (
          <svg
            width="50"
            height="60"
            viewBox="0 0 50 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: flip ? "scaleX(-1)" : "none" }}
          >
            {/* 精灵身体 */}
            <circle cx="25" cy="25" r="10" fill="#f5f1e8" stroke="#000" strokeWidth="1.5" />

            {/* 精灵脸 */}
            <circle cx="22" cy="23" r="1.5" fill="#000" />
            <circle cx="28" cy="23" r="1.5" fill="#000" />
            <path d="M23 27C24 28 26 28 27 27" stroke="#000" strokeWidth="1" strokeLinecap="round" />

            {/* 精灵翅膀 */}
            <path
              d="M15 20C10 15 10 10 15 5C20 10 20 15 15 20Z"
              fill="rgba(173, 216, 230, 0.7)"
              stroke="#000"
              strokeWidth="1"
            />
            <path
              d="M35 20C40 15 40 10 35 5C30 10 30 15 35 20Z"
              fill="rgba(173, 216, 230, 0.7)"
              stroke="#000"
              strokeWidth="1"
            />

            {/* 精灵魔法棒 */}
            <line x1="25" y1="35" x2="25" y2="45" stroke="#8b7355" strokeWidth="1.5" strokeLinecap="round" />
            <path
              d="M25 45L20 50L25 55L30 50L25 45Z"
              fill="#d4a574"
              stroke="#000"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <circle cx="25" cy="50" r="2" fill="#f5f1e8" stroke="#000" />

            {/* 魔法粒子 */}
            <circle cx="20" cy="15" r="1" fill="#f5f1e8" />
            <circle cx="30" cy="15" r="1" fill="#f5f1e8" />
            <circle cx="25" cy="10" r="1" fill="#f5f1e8" />
          </svg>
        )
      case "star":
        return (
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: flip ? "scaleX(-1)" : "none" }}
          >
            {/* 星星 */}
            <path
              d="M20 5L23.5267 15.8754H34.8532L25.6633 22.4493L29.1901 33.3246L20 26.7508L10.8099 33.3246L14.3367 22.4493L5.14683 15.8754H16.4733L20 5Z"
              fill="#d4a574"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* 星星脸 */}
            <circle cx="16" cy="18" r="1.5" fill="#000" />
            <circle cx="24" cy="18" r="1.5" fill="#000" />
            <path d="M17 22C18.5 23.5 21.5 23.5 23 22" stroke="#000" strokeWidth="1" strokeLinecap="round" />

            {/* 魔法粒子 */}
            <circle cx="10" cy="10" r="1" fill="#f5f1e8" />
            <circle cx="30" cy="10" r="1" fill="#f5f1e8" />
            <circle cx="20" cy="35" r="1" fill="#f5f1e8" />
          </svg>
        )
      case "brush":
        return (
          <svg
            width="40"
            height="60"
            viewBox="0 0 40 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: flip ? "scaleX(-1)" : "none" }}
          >
            {/* 画笔 */}
            <rect x="15" y="30" width="10" height="25" rx="2" fill="#8b7355" stroke="#000" strokeWidth="1.5" />
            <path
              d="M15 30C15 25 25 25 25 30L25 35C25 40 15 40 15 35L15 30Z"
              fill="#2d3e2d"
              stroke="#000"
              strokeWidth="1.5"
            />
            <path d="M20 5V25" stroke="#8b7355" strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="5" r="3" fill="#d4a574" stroke="#000" strokeWidth="1.5" />

            {/* 画笔脸 */}
            <circle cx="17" cy="33" r="1" fill="#f5f1e8" />
            <circle cx="23" cy="33" r="1" fill="#f5f1e8" />
            <path d="M18 36C19 37 21 37 22 36" stroke="#f5f1e8" strokeWidth="1" strokeLinecap="round" />

            {/* 颜料滴落 */}
            <circle cx="20" cy="15" r="2" fill="#d4a574" stroke="#000" />
            <circle cx="15" cy="20" r="2" fill="#8b7355" stroke="#000" />
            <circle cx="25" cy="20" r="2" fill="#2d3e2d" stroke="#000" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {characters.map((char) => (
        <motion.div
          key={char.id}
          className="absolute"
          initial={{
            x: `${char.x}%`,
            y: `${char.y}%`,
            scale: char.scale,
            rotate: char.rotate,
          }}
          animate={{
            x: [
              `${char.x}%`,
              `${char.x + (Math.random() * 10 - 5)}%`,
              `${char.x - (Math.random() * 10 - 5)}%`,
              `${char.x}%`,
            ],
            y: [
              `${char.y}%`,
              `${char.y - (Math.random() * 15 + 5)}%`,
              `${char.y + (Math.random() * 10 - 5)}%`,
              `${char.y}%`,
            ],
            rotate: [char.rotate, char.rotate + 5, char.rotate - 5, char.rotate],
          }}
          transition={{
            duration: char.duration,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "easeInOut",
            delay: char.delay,
          }}
          whileHover={{ scale: char.scale * 1.2 }}
        >
          {renderCharacter(char.character, char.flip)}

          {/* 跟随的魔法粒子 */}
          <motion.div
            className="absolute top-0 left-0"
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: Math.random(),
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[#d4a574]/50"></div>
          </motion.div>
          <motion.div
            className="absolute bottom-0 right-0"
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: Math.random() + 0.5,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[#8b7355]/50"></div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
