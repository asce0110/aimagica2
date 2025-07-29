import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      dbId?: string
      subscriptionTier?: string
      subscriptionStatus?: string
      dailyRenderCount?: number
      dailyRerenderCount?: number
      isAdmin?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    image?: string
    dbId?: string
    subscriptionTier?: string
    subscriptionStatus?: string
    dailyRenderCount?: number
    dailyRerenderCount?: number
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
  }
} 