"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface StyleRequirementsAlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  errors?: string[]
  warnings?: string[]
  styleName?: string
  styleEmoji?: string
}

export default function StyleRequirementsAlert({
  isOpen,
  onClose,
  title,
  errors = [],
  warnings = [],
  styleName,
  styleEmoji
}: StyleRequirementsAlertProps) {
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#f5f1e8] border-4 border-[#8b7355] rounded-2xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            {hasErrors ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            ) : hasWarnings ? (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Info className="w-8 h-8 text-yellow-500" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
          </div>
          
          <DialogTitle 
            className="text-[#2d3e2d] font-black text-xl mb-2"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            {title}
          </DialogTitle>
          
          {styleName && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">{styleEmoji}</span>
              <span 
                className="text-[#8b7355] font-bold"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                {styleName}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* 错误信息 */}
          {hasErrors && (
            <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 
                  className="text-red-700 font-bold"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  Requirements not met:
                </h4>
              </div>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li 
                    key={index}
                    className="text-red-600 text-sm font-bold flex items-start gap-2"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="text-red-500 mt-0.5">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 警告信息 */}
          {hasWarnings && (
            <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-yellow-500" />
                <h4 
                  className="text-yellow-700 font-bold"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  Tips:
                </h4>
              </div>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li 
                    key={index}
                    className="text-yellow-600 text-sm font-bold flex items-start gap-2"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="text-yellow-500 mt-0.5">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={onClose}
              className="bg-[#8b7355] hover:bg-[#6d5a44] text-white font-bold px-6 py-2 rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <X className="w-4 h-4 mr-2" />
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 