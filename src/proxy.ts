import { withAuth } from 'next-auth/middleware'

export default withAuth({
  secret: process.env.AUTH_SHIPNOVO_SECRET,
  pages: {
    signIn: '/SignIn',
  },
})

export const config = {
  matcher: [
    '/((?!SignIn|ContactForm|api/requestForgotPassword|api/sendContactForm|Forgotpassword|api/resetPassword|_next|_next/static|_next/image|favicon.ico).*)',
  ],
}
