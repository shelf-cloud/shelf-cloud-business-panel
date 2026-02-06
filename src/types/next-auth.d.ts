import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    // token: JWT,
    user: {
      role: string
      businessId: string
      businessName: string
      businessOrderStart: string
      profileName: string
      showCreateOrder: string
      showWholeSale: string
      hasShelfCloudUsa: string
      hasShelfCloudEu: string
      defaultRegion: string
    } & DefaultSession['user']
  }
}
