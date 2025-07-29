"use client"

import React, { ReactNode, createContext, useContext } from "react"
import { SessionProvider, useSession, signOut, signIn } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { getUserFromCookie, signIn as authSignIn, signOut as authSignOut, checkLoginStatus } from "@/lib/auth"

interface ProvidersProps {
  children: ReactNode
}

// 检测是否为静态导出环境 - 使用Pages Functions OAuth
const isStaticExport = true // 使用Pages Functions实现OAuth

// Mock Session Context for static export
interface MockSession {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

interface MockSessionContextType {
  data: MockSession | null
  status: "loading" | "authenticated" | "unauthenticated"
  update: () => Promise<MockSession | null>
}

const MockSessionContext = createContext<MockSessionContextType>({
  data: null,
  status: "unauthenticated",
  update: async () => null,
})

function MockSessionProvider({ children }: { children: ReactNode }) {
  const mockSession: MockSessionContextType = {
    data: null,
    status: "unauthenticated",
    update: async () => null,
  }

  return (
    <MockSessionContext.Provider value={mockSession}>
      {children}
    </MockSessionContext.Provider>
  )
}

// 导出兼容的 useSession hook
export function useSessionCompat() {
  if (isStaticExport) {
    // 使用Pages Functions OAuth
    const [session, setSession] = React.useState<MockSessionContextType>({
      data: null,
      status: "loading",
      update: async () => null,
    })

    React.useEffect(() => {
      // 检查登录状态
      checkLoginStatus()
      
      // 从Cookie获取用户信息
      const user = getUserFromCookie()
      
      if (user) {
        setSession({
          data: { user },
          status: "authenticated",
          update: async () => null,
        })
      } else {
        setSession({
          data: null,
          status: "unauthenticated", 
          update: async () => null,
        })
      }
    }, [])

    // 在服务器端渲染中，直接返回loading状态
    if (typeof window === 'undefined') {
      return {
        data: null,
        status: "loading" as const,
        update: async () => null,
      }
    }

    return session
  } else {
    // 服务器模式，使用真正的NextAuth
    return useSession()
  }
}

// 导出兼容的 signOut function
export async function signOutCompat(options?: any) {
  if (isStaticExport) {
    // 使用Pages Functions登出
    authSignOut()
    return
  } else {
    // 服务器模式，使用真正的NextAuth signOut
    return await signOut(options)
  }
}

// 导出兼容的 signIn function
export async function signInCompat(provider?: string, options?: any) {
  if (isStaticExport) {
    // 使用Pages Functions登录
    authSignIn()
    return
  } else {
    // 服务器模式，使用真正的NextAuth signIn
    if (provider) {
      return await signIn(provider, options)
    } else {
      return await signIn(undefined, options)
    }
  }
}

export default function Providers({ children }: ProvidersProps) {
  if (isStaticExport) {
    return (
      <MockSessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey={undefined} // 静态导出时禁用存储
        >
          {children}
        </ThemeProvider>
      </MockSessionProvider>
    )
  }

  // 服务器模式，使用真正的NextAuth SessionProvider
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="aimagica-theme"
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
} 