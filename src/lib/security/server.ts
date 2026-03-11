import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import type { AxiosError } from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'

export const ALLOWED_REGIONS = ['us', 'eu'] as const

type AllowedRegion = (typeof ALLOWED_REGIONS)[number]

type SessionWithSecurity = Session & {
  user: Session['user'] & {
    businessId: string
    role: string
    businessName: string
    businessOrderStart: string
    profileName: string
  }
}

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

type OAuthStatePayload = {
  businessId: string
  mode: 'ads' | 'new' | 'reauth'
  nonce: string
  username: string
  issuedAt: number
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const oauthStateSecret = process.env.AUTH_SHIPNOVO_SECRET ?? 'development-secret'

function setJsonError(response: NextApiResponse, status: number, message: string) {
  response.status(status).json({ error: true, message })
}

function toSingleValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

function serializeCookie(name: string, value: string, maxAgeSeconds: number) {
  const segments = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ]

  if (process.env.NODE_ENV === 'production') {
    segments.push('Secure')
  }

  return segments.join('; ')
}

function clearCookie(response: NextApiResponse, name: string) {
  response.setHeader('Set-Cookie', serializeCookie(name, '', 0))
}

function getCookieValue(request: NextApiRequest, name: string) {
  return request.cookies[name]
}

function signState(encodedPayload: string) {
  return createHmac('sha256', oauthStateSecret).update(encodedPayload).digest('base64url')
}

function parseState(state: string): OAuthStatePayload | null {
  const [encodedPayload, signature] = state.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signState(encodedPayload)

  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as OAuthStatePayload
    return payload
  } catch {
    return null
  }
}

export function rejectMethod(request: NextApiRequest, response: NextApiResponse, allowedMethods: readonly string[]) {
  if (!allowedMethods.includes(request.method ?? '')) {
    response.setHeader('Allow', allowedMethods.join(', '))
    setJsonError(response, 405, 'Method not allowed.')
    return true
  }

  return false
}

export function isAllowedRegion(region: string | undefined): region is AllowedRegion {
  return region != null && ALLOWED_REGIONS.includes(region as AllowedRegion)
}

export async function requireSession(request: NextApiRequest, response: NextApiResponse) {
  const session = (await getServerSession(request, response, authOptions)) as SessionWithSecurity | null

  if (session == null) {
    setJsonError(response, 401, 'Session not found.')
    return null
  }

  return session
}

export async function getAuthorizedTenant(
  request: NextApiRequest,
  response: NextApiResponse,
  options: {
    requireAdmin?: boolean
    requireRegion?: boolean
  } = {}
) {
  const session = await requireSession(request, response)

  if (session == null) {
    return null
  }

  const businessId = session.user.businessId
  const role = session.user.role
  const username = session.user.name ?? ''
  const region = toSingleValue(request.query.region)
  const queryBusinessId = toSingleValue(request.query.businessId)

  if (!businessId || !role || !username) {
    setJsonError(response, 403, 'Invalid authenticated user context.')
    return null
  }

  if (options.requireAdmin && role !== 'admin') {
    setJsonError(response, 403, 'You do not have permission to access this resource.')
    return null
  }

  if (options.requireRegion !== false && !isAllowedRegion(region)) {
    setJsonError(response, 400, 'Invalid region.')
    return null
  }

  if (queryBusinessId != null && queryBusinessId !== businessId) {
    setJsonError(response, 403, 'Tenant mismatch.')
    return null
  }

  return {
    session,
    businessId,
    role,
    username,
    region: region as AllowedRegion | undefined,
  }
}

export function getSessionTokenFromCookies(request: NextApiRequest) {
  return request.cookies['next-auth.session-token'] ?? request.cookies['__Secure-next-auth.session-token'] ?? null
}

export function enforceRateLimit(request: NextApiRequest, response: NextApiResponse, options: RateLimitOptions) {
  const forwardedFor = request.headers['x-forwarded-for']
  const ip =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim() ?? 'unknown'
      : request.socket.remoteAddress ?? 'unknown'

  const now = Date.now()
  const bucketKey = `${options.key}:${ip}`
  const existing = rateLimitStore.get(bucketKey)

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    })

    return false
  }

  if (existing.count >= options.limit) {
    response.setHeader('Retry-After', String(Math.ceil((existing.resetAt - now) / 1000)))
    setJsonError(response, 429, 'Too many requests. Please try again later.')
    return true
  }

  existing.count += 1
  rateLimitStore.set(bucketKey, existing)

  return false
}

export function enforceContentType(
  request: NextApiRequest,
  response: NextApiResponse,
  allowedPrefixes: readonly string[],
  message = 'Unsupported content type.'
) {
  const contentType = request.headers['content-type']

  if (typeof contentType !== 'string' || !allowedPrefixes.some((prefix) => contentType.startsWith(prefix))) {
    setJsonError(response, 415, message)
    return true
  }

  return false
}

export function enforceContentLength(request: NextApiRequest, response: NextApiResponse, maxBytes: number) {
  const contentLength = request.headers['content-length']

  if (typeof contentLength !== 'string') {
    return false
  }

  const size = Number(contentLength)

  if (!Number.isFinite(size) || size <= maxBytes) {
    return false
  }

  setJsonError(response, 413, 'Uploaded file is too large.')
  return true
}

export function sendGenericProxyError(response: NextApiResponse, error: unknown, fallbackMessage: string) {
  const axiosError = error as AxiosError<{ error_description?: string; message?: string }>
  const errorMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error_description

  if (errorMessage) {
    console.error('Upstream request failed.', errorMessage)
  } else {
    console.error('Upstream request failed.', error)
  }

  setJsonError(response, 502, fallbackMessage)
}

export function createOAuthState(
  response: NextApiResponse,
  cookieName: string,
  payload: Omit<OAuthStatePayload, 'issuedAt' | 'nonce'>
) {
  const statePayload: OAuthStatePayload = {
    ...payload,
    issuedAt: Date.now(),
    nonce: randomBytes(16).toString('hex'),
  }
  const encodedPayload = Buffer.from(JSON.stringify(statePayload)).toString('base64url')
  const state = `${encodedPayload}.${signState(encodedPayload)}`

  response.setHeader('Set-Cookie', serializeCookie(cookieName, state, 600))

  return state
}

export function consumeOAuthState(
  request: NextApiRequest,
  response: NextApiResponse,
  options: {
    cookieName: string
    expectedMode: OAuthStatePayload['mode']
    session: SessionWithSecurity
    state: string | undefined
  }
) {
  const cookieValue = getCookieValue(request, options.cookieName)

  clearCookie(response, options.cookieName)

  if (!cookieValue || !options.state || cookieValue !== options.state) {
    setJsonError(response, 403, 'Invalid OAuth state.')
    return null
  }

  const payload = parseState(options.state)

  if (payload == null) {
    setJsonError(response, 403, 'Invalid OAuth state.')
    return null
  }

  const hasExpired = payload.issuedAt + 10 * 60 * 1000 < Date.now()
  const sessionUsername = options.session.user.name ?? ''

  if (
    hasExpired ||
    payload.mode !== options.expectedMode ||
    payload.businessId !== options.session.user.businessId ||
    payload.username !== sessionUsername
  ) {
    setJsonError(response, 403, 'Invalid OAuth state.')
    return null
  }

  return payload
}
