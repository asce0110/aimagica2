'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestApiPage() {
  const [statsData, setStatsData] = useState(null)
  const [usersData, setUsersData] = useState(null)
  const [imagesData, setImagesData] = useState(null)
  const [stylesData, setStylesData] = useState(null)
  const [configsData, setConfigsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testApi = async (endpoint: string, setter: any) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('测试API:', endpoint)
      const response = await fetch(endpoint)
      const data = await response.json()
      
      console.log(`${endpoint} 响应:`, data)
      setter(data)
    } catch (err) {
      console.error(`${endpoint} 错误:`, err)
      setError(`${endpoint} 失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAllApis = async () => {
    await testApi('/api/dashboard/stats', setStatsData)
    await testApi('/api/dashboard/users', setUsersData)  
    await testApi('/api/dashboard/images', setImagesData)
    await testApi('/api/admin/styles', setStylesData)
    await testApi('/api/admin/api-configs', setConfigsData)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API 数据测试界面</h1>
      
      <div className="mb-8">
        <Button 
          onClick={testAllApis}
          disabled={loading}
          className="mr-4"
        >
          {loading ? '测试中...' : '测试所有API'}
        </Button>
        
        <Button 
          onClick={() => testApi('/api/dashboard/stats', setStatsData)}
          disabled={loading}
          variant="outline"
          className="mr-2"
        >
          测试统计API
        </Button>
        
        <Button 
          onClick={() => testApi('/api/dashboard/users', setUsersData)}
          disabled={loading}
          variant="outline"
          className="mr-2"
        >
          测试用户API
        </Button>
        
        <Button 
          onClick={() => testApi('/api/dashboard/images', setImagesData)}
          disabled={loading}
          variant="outline"
          className="mr-2"
        >
          测试图片API
        </Button>
        
        <Button 
          onClick={() => testApi('/api/admin/styles', setStylesData)}
          disabled={loading}
          variant="outline"
          className="mr-2"
        >
          测试风格API
        </Button>
        
        <Button 
          onClick={() => testApi('/api/admin/api-configs', setConfigsData)}
          disabled={loading}
          variant="outline"
        >
          测试配置API
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 统计数据 */}
        <Card>
          <CardHeader>
            <CardTitle>统计数据 (/api/dashboard/stats)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {statsData ? JSON.stringify(statsData, null, 2) : '未获取数据'}
            </pre>
          </CardContent>
        </Card>

        {/* 用户数据 */}
        <Card>
          <CardHeader>
            <CardTitle>用户数据 (/api/dashboard/users)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {usersData ? JSON.stringify(usersData, null, 2) : '未获取数据'}
            </pre>
          </CardContent>
        </Card>

        {/* 图片数据 */}
        <Card>
          <CardHeader>
            <CardTitle>图片数据 (/api/dashboard/images)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {imagesData ? JSON.stringify(imagesData, null, 2) : '未获取数据'}
            </pre>
          </CardContent>
        </Card>

        {/* 风格数据 */}
        <Card>
          <CardHeader>
            <CardTitle>风格数据 (/api/admin/styles)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {stylesData ? JSON.stringify(stylesData, null, 2) : '未获取数据'}
            </pre>
          </CardContent>
        </Card>

        {/* 配置数据 */}
        <Card>
          <CardHeader>
            <CardTitle>配置数据 (/api/admin/api-configs)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {configsData ? JSON.stringify(configsData, null, 2) : '未获取数据'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}