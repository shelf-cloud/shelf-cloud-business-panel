import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const options: NextAuthOptions = {
  theme: {
    colorScheme: 'light', // "auto" | "dark" | "light"
    brandColor: '#458BC9', // Hex color code
    logo: `${process.env.API_DOMAIN}/assets/shelfcloud-logo-v.jpg`, // Absolute URL to image
  },
  debug: true,
  session: { maxAge: 3600 },
  jwt: {},
  secret: process.env.AUTH_SHIPNOVO_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      type: "credentials",
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, _req) {
        const res = await fetch(
          `${process.env.NEXTAUTH_URL}/api/auth/shipnovo`,
          {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-type': 'application/json' },
          }
        )

        const backData = await res.json()

        if (backData.connected && backData.user) {
          return backData.user
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/SignIn',
  },
  callbacks: {
    // async session({ session }) {

    //   const userInfo = await axios.post(`${process.env.API_LOGIN_SERVICE}/getUser.php`, {
    //     username: session?.user?.name
    //   }) as any

    //   session.user.businessId = userInfo.data.businessId
    //   session.user.showCreateOrder = userInfo.data.showCreateOrder
    //   session.user.showWholeSale = userInfo.data.showWholeSale
    //   session.user.hasShelfCloudUsa = userInfo.data.hasShelfCloudUsa
    //   session.user.hasShelfCloudEu = userInfo.data.hasShelfCloudEu
    //   session.user.defaultRegion = userInfo.data.defaultRegion

    //   return session
    // },
    async redirect() {
      return '/'
    },
  },
}

export default NextAuth(options)
