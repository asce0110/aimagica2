// 兼容性 hook - 在静态导出时使用 mock，否则使用真实的 useSession

const isStaticExport = process.env.NEXT_CONFIG_FILE?.includes('static') || process.env.NODE_ENV === 'production'

export const useSessionCompat = isStaticExport
  ? () => require('@/components/static-providers').useSession()
  : () => require('next-auth/react').useSession()

// 导出类型兼容性
export type SessionCompat = {
  data: any | null
  status: "loading" | "authenticated" | "unauthenticated"
  update?: () => Promise<any | null>
}