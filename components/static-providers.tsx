"use client"

import { ReactNode, createContext, useContext } from "react"
import { ThemeProvider } from "@/components/theme-provider"

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

export function useSession(): MockSessionContextType {
  return useContext(MockSessionContext)
}

interface ProvidersProps {
  children: ReactNode
}

export default function StaticProviders({ children }: ProvidersProps) {
  return (
    <MockSessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        storageKey={null} // 禁用本地存储以避免水合错误
      >
        {children}
      </ThemeProvider>
    </MockSessionProvider>
  )
}