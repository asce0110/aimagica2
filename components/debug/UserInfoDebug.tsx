"use client"

import { useSessionCompat as useSession } from "@/components/session-provider"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

export default function UserInfoDebug() {
  const { data: session, status, update } = useSession()
  const [showDebug, setShowDebug] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setShowDebug(!showDebug)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        {showDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        调试信息
      </Button>

      {showDebug && (
        <Card className="w-96 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              用户会话调试信息
              <Button
                onClick={() => update()}
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs space-y-2">
            <div>
              <strong>状态:</strong> {status}
            </div>
            
            {session?.user && (
              <>
                <div>
                  <strong>用户ID:</strong> {session.user.id || 'undefined'}
                </div>
                <div>
                  <strong>邮箱:</strong> {session.user.email || 'undefined'}
                </div>
                <div>
                  <strong>姓名:</strong> {session.user.name || 'undefined'}
                </div>
                <div>
                  <strong>头像URL:</strong> 
                  <div className="break-all text-blue-600">
                    {session.user.image || 'undefined'}
                  </div>
                </div>
                <div>
                  <strong>是否管理员:</strong> {session.user.isAdmin ? '是' : '否'}
                </div>
                <div>
                  <strong>订阅层级:</strong> {session.user.subscriptionTier || 'undefined'}
                </div>
                
                {session.user.image && (
                  <div className="pt-2">
                    <strong>头像预览:</strong>
                    <div className="mt-1 flex items-center space-x-2">
                      <img
                        src={session.user.image}
                        alt="头像"
                        className="w-8 h-8 rounded-full border"
                        onError={(e) => {
                          console.error('调试组件：头像加载失败', session.user.image)
                          e.currentTarget.style.display = 'none'
                        }}
                        onLoad={() => {
                          console.log('调试组件：头像加载成功', session.user.image)
                        }}
                      />
                      <span className="text-green-600">加载成功</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-2 border-t">
              <strong>完整会话数据:</strong>
              <pre className="text-[10px] mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 