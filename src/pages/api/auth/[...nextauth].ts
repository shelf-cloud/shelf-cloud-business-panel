import axios from 'axios'
import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  theme: {
    colorScheme: 'light', // "auto" | "dark" | "light"
    brandColor: '#458BC9', // Hex color code
    logo: `${process.env.API_DOMAIN}/assets/shelfcloud-logo-v.jpg`, // Absolute URL to image
  },
  debug: false,
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
    async session({ session }) {
      await axios.post(`${process.env.API_LOGIN_SERVICE}/getUserRole.php`, {
        username: session?.user?.name
      }).then((res) => {
        session.user.role = res.data.role
        session.user.businessId = res.data.businessId
        session.user.businessName = res.data.businessName
        session.user.businessOrderStart = res.data.businessOrderStart
        session.user.profileName = res.data.profileName
      }).catch((err) => console.log(err.message))
      return session
    },
    async redirect() {
      return '/'
    },
  },
}

export default NextAuth(authOptions)
