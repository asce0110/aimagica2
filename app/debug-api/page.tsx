'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugApiPage() {
  const [apiResponses, setApiResponses] = useState({})
  const [environmentInfo, setEnvironmentInfo] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 收集环境信息
    setEnvironmentInfo({
      currentUrl: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      isClient: typeof window !== 'undefined',
      environment: process.env.NODE_ENV || 'unknown'
    })
  }, [])

  const testApi = async (endpoint: string) => {
    setLoading(true)
    const startTime = Date.now()
    
    try {
      console.log(`🔍 测试API: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      let responseData
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
      
      const result = {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        contentType,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        success: response.ok,
        timestamp: new Date().toISOString()
      }
      
      console.log(`✅ API响应:`, result)
      
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: result
      }))
      
    } catch (error) {
      console.error(`❌ API错误:`, error)
      
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint,
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const testAllApis = async () => {
    const endpoints = [
      '/api/dashboard/stats',
      '/api/dashboard/users', 
      '/api/dashboard/images',
      '/api/admin/styles',
      '/api/admin/api-configs'
    ]
    
    for (const endpoint of endpoints) {
      await testApi(endpoint)
      // 添加小延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-white">API 调试界面</h1>
      
      {/* 环境信息 */}
      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">环境信息</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(environmentInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* 控制按钮 */}
      <div className="mb-8 space-x-4">
        <Button 
          onClick={testAllApis}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? '测试中...' : '测试所有API'}
        </Button>
        
        <Button 
          onClick={() => testApi('/api/dashboard/stats')}
          disabled={loading}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700"
        >
          测试统计API
        </Button>
        
        <Button 
          onClick={() => setApiResponses({})}
          variant="destructive"
        >
          清空结果
        </Button>
      </div>

      {/* API响应结果 */}
      <div className="grid grid-cols-1 gap-6">
        {Object.values(apiResponses).map((response: any, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className={`text-lg ${response.success ? 'text-green-400' : 'text-red-400'}`}>
                {response.endpoint} 
                <span className="ml-2 text-sm">
                  {response.success ? '✅' : '❌'} {response.status} {response.responseTime}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {response.headers && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">响应头:</h4>
                    <pre className="bg-gray-900 text-blue-400 p-3 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(response.headers, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    响应数据 {response.contentType && `(${response.contentType})`}:
                  </h4>
                  <pre className="bg-gray-900 text-white p-3 rounded text-xs overflow-auto max-h-96">
                    {typeof response.data === 'object' 
                      ? JSON.stringify(response.data, null, 2)
                      : response.data || response.error
                    }
                  </pre>
                </div>
                
                {!response.success && (
                  <div className="bg-red-900/20 border border-red-500 p-3 rounded">
                    <p className="text-red-400 text-sm">
                      ❌ 请求失败: {response.error || response.statusText}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {Object.keys(apiResponses).length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-8 text-center">
            <p className="text-gray-400">点击测试按钮开始调试API</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}