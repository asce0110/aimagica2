"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <div className="relative">
    {/* 装饰性圆点 */}
    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#d4a574] rounded-full border-2 border-white shadow-sm"></div>
    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#8b7355] rounded-full border-2 border-white shadow-sm"></div>
    
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-[#f5f1e8] border-2 border-[#8b7355]/30 shadow-inner",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-[#8b7355] via-[#d4a574] to-[#f0c674] transition-all duration-500 shadow-lg relative overflow-hidden"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {/* 闪烁效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-[shimmer_3s_infinite]"></div>
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
