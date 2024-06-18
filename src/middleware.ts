import { withAuth } from "next-auth/middleware"

export default withAuth({
    secret: process.env.AUTH_SHIPNOVO_SECRET,
    pages: {
        signIn: '/SignIn',
    },
})

export const config = {
    matcher: ['/((?!_next).*)', '/((?!_next/static|_next/image|favicon.ico).*)'],
}