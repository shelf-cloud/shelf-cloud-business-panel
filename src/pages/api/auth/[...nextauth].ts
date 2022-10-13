import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"

const options: NextAuthOptions = {
    theme: {
        colorScheme: "light", // "auto" | "dark" | "light"
        brandColor: "#0373D7", // Hex color code
        logo: `${process.env.API_DOMAIN}/assets/shipnovo-logo.png`, // Absolute URL to image
    },
    debug: true,
    session: { maxAge: 60 * 60 },
    jwt: {},
    secret: process.env.AUTH_SHIPNOVO_SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/shipnovo`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-type": "application/json" }
                })

                const backData = await res.json()

                if (backData.connected && backData.user) {
                    return backData.user
                }

                return null
            }
        })
    ],
    callbacks: {
        async redirect() {
          return '/'
        }
      }
}

export default NextAuth(options);