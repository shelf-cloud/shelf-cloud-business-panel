import { withAuth } from 'next-auth/middleware'

export default withAuth({
  secret: process.env.AUTH_SHIPNOVO_SECRET,
  pages: {
    signIn: '/SignIn',
  },
})

export const config = {
  matcher: ['/((?!SignIn|api/requestForgotPassword|Forgotpassword|api/resetPassword|_next|_next/static|_next/image|favicon.ico).*)'],
}
