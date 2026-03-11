import axios from 'axios'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

export type SecurityUserContext = {
  role: string
  businessId: string
  businessName: string
  businessOrderStart: string
  profileName: string
}

const emptyContext: SecurityUserContext = {
  role: '',
  businessId: '',
  businessName: '',
  businessOrderStart: '',
  profileName: '',
}

export async function fetchUserSecurityContext(username: string): Promise<SecurityUserContext | null> {
  try {
    const { data } = await axios.post(`${process.env.API_LOGIN_SERVICE}/getUserRole.php`, {
      username,
    })

    return {
      role: typeof data?.role === 'string' ? data.role : '',
      businessId: String(data?.businessId ?? ''),
      businessName: typeof data?.businessName === 'string' ? data.businessName : '',
      businessOrderStart: String(data?.businessOrderStart ?? ''),
      profileName: typeof data?.profileName === 'string' ? data.profileName : '',
    }
  } catch (error) {
    console.error('Failed to hydrate security context.', error)
    return null
  }
}

export function applyUserContextToSession(session: Session, context: Partial<SecurityUserContext>) {
  session.user.role = context.role ?? emptyContext.role
  session.user.businessId = context.businessId ?? emptyContext.businessId
  session.user.businessName = context.businessName ?? emptyContext.businessName
  session.user.businessOrderStart = context.businessOrderStart ?? emptyContext.businessOrderStart
  session.user.profileName = context.profileName ?? emptyContext.profileName

  return session
}

export function applyUserContextToToken(token: JWT, context: Partial<SecurityUserContext>) {
  token.role = context.role ?? emptyContext.role
  token.businessId = context.businessId ?? emptyContext.businessId
  token.businessName = context.businessName ?? emptyContext.businessName
  token.businessOrderStart = context.businessOrderStart ?? emptyContext.businessOrderStart
  token.profileName = context.profileName ?? emptyContext.profileName

  return token
}
