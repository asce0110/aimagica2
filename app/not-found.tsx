'use client'

import Link from 'next/link'
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowLeft, Home, RotateCcw, Sparkles } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MousePosition {
  x: number;
  y: number;
}

function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const hexInt = parseInt(hex, 16);
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

const MagicalParticles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 60,
  staticity = 50,
  ease = 50,
  size = 0.8,
  refresh = false,
  color = "#d4a574",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, [color]);

  useEffect(() => {
    onMouseMove();
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const onMouseMove = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mousePosition.x - rect.left - w / 2;
      const y = mousePosition.y - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  };

  type Circle = {
    x: number;
    y: number;
    translateX: number;
    translateY: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    dx: number;
    dy: number;
    magnetism: number;
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  const circleParams = (): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const rgb = hexToRgb(color);

  const drawCircle = (circle: Circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h,
      );
    }
  };

  const drawParticles = () => {
    clearContext();
    const particleCount = quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): number => {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle: Circle, i: number) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
      );
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      circle.translateX +=
        (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
        ease;
      circle.translateY +=
        (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
        ease;

      drawCircle(circle, true);

      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current.splice(i, 1);
        const newCircle = circleParams();
        drawCircle(newCircle);
      }
    });
    window.requestAnimationFrame(animate);
  };

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
}

const TextShimmer: React.FC<TextShimmerProps> = ({
  children,
  className,
  duration = 2,
  spread = 2,
}) => {
  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <motion.h1
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:#d4a574] [--base-gradient-color:#d4a574]',
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
        'drop-shadow-lg',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
        } as React.CSSProperties
      }
    >
      {children}
    </motion.h1>
  );
};

type ReactionProps = Omit<
  React.ComponentPropsWithoutRef<"button"> & {
    symbol?: string;
    scale?: number;
    y?: string;
    x?: string | number | (() => string | number);
    rotate?: string | number | (() => string | number);
  },
  "children"
>;

const FlyingSymbol: React.FC<ReactionProps> = ({
  symbol,
  rotate = () => Math.random() * 90 - 45,
  x = () => `${Math.random() * 200 - 100}%`,
  y = "-500%",
  scale = 2,
}) => {
  const animate = useMemo(
    () => ({
      rotate: typeof rotate === "function" ? rotate() : rotate,
      x: typeof x === "function" ? x() : x,
    }),
    [rotate, x]
  );

  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 1, rotate: 0, x: 0 }}
      animate={{ y, opacity: 0, scale, ...animate }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="absolute pointer-events-none"
    >
      {symbol}
    </motion.div>
  );
};

const MagicalReaction: React.FC<ReactionProps> = ({
  symbol,
  onClick: callback,
  ...props
}) => {
  const [flyingSymbols, setFlyingSymbols] = useState<
    { id: number; symbol: string }[]
  >([]);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      callback?.(e);
      if (!symbol) return;

      const id = Date.now();
      setFlyingSymbols((flyingSymbols) => [...flyingSymbols, { id, symbol }]);
      setTimeout(() => {
        setFlyingSymbols((flyingSymbols) =>
          flyingSymbols.filter((e) => e.id !== id)
        );
      }, 1000);
    },
    [callback, symbol]
  );

  return (
    <button {...{ onClick, ...props }}>
      <AnimatePresence>
        {flyingSymbols.map(({ id, symbol }) => (
          <FlyingSymbol key={id} {...{ symbol }} />
        ))}
      </AnimatePresence>
      {symbol}
    </button>
  );
};

export default function MagicalNotFound() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{backgroundColor: '#f5f1e8'}}>
      {/* 魔法粒子背景 */}
      <MagicalParticles
        className="absolute inset-0"
        quantity={40}
        ease={80}
        color="#d4a574"
        size={1.2}
        refresh
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* 魔法404展示 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative" style={{fontFamily: 'Fredoka One, cursive'}}>
            <TextShimmer 
              className="text-8xl md:text-9xl font-bold mb-4"
              duration={3}
            >
              404
            </TextShimmer>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 text-4xl"
            >
              ✨
            </motion.div>
          </div>
        </motion.div>

        {/* 标题和描述 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8 space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{color: '#2d3e2d', fontFamily: 'Fredoka One, cursive'}}>
            哎呀！魔法咒语出错了 ✨
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{color: '#2d3e2d', opacity: 0.8}}>
            您要找的页面消失在魔法的薄雾中了！🪄
          </p>
        </motion.div>

        {/* 魔法表情反应 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8 flex gap-4"
        >
          {["🪄", "✨", "🔮", "🎭"].map((symbol) => (
            <MagicalReaction
              key={symbol}
              symbol={symbol}
              className="text-3xl p-3 rounded-full transition-all duration-300 hover:scale-110 relative border-2 shadow-lg"
              style={{
                backgroundColor: 'rgba(212, 165, 116, 0.3)',
                borderColor: '#d4a574',
                color: '#2d3e2d'
              }}
            />
          ))}
        </motion.div>

        {/* 搜索部分 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-8 w-full max-w-md"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{color: '#d4a574'}} />
            <Input
              placeholder="施展搜索魔法... 🔍"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-2xl border-2 shadow-lg focus:ring-2 focus:ring-opacity-50"
              style={{
                borderColor: '#d4a574',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#2d3e2d'
              }}
            />
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <Button
            asChild
            className="group rounded-2xl px-8 py-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #2d3e2d 0%, #3d4e3d 100%)',
              color: '#f5f1e8',
              border: 'none'
            }}
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              返回首页 🏠
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="group border-2 rounded-2xl px-8 py-3 font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              borderColor: '#d4a574',
              color: '#2d3e2d',
              backgroundColor: 'rgba(212, 165, 116, 0.1)'
            }}
          >
            <Link href="/text-to-image">
              <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              开始创作 ✨
            </Link>
          </Button>
          
          <Button
            variant="secondary"
            className="group rounded-2xl px-8 py-3 font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              backgroundColor: 'rgba(212, 165, 116, 0.3)',
              color: '#2d3e2d',
              border: 'none'
            }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            返回上页 ↩️
          </Button>
        </motion.div>

        {/* 底部魔法 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 text-sm"
          style={{color: '#2d3e2d', opacity: 0.7}}
        >
          <p>✨ 由 AIMAGICA 魔法驱动 ✨</p>
        </motion.div>
      </div>
    </div>
  );
}