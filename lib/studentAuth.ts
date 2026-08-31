import { createHmac, timingSafeEqual } from 'crypto'
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

const COOKIE_NAME = 'amtjt_student_session'
const SESSION_TTL_SECONDS = 8 * 60 * 60

function getSessionSecret() {
  return process.env.STUDENT_SESSION_SECRET || ''
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

function safelyEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function getCookie(cookieHeader?: string) {
  return cookieHeader
    ?.split(';')
    .map((value) => value.trim().split('='))
    .find(([name]) => name === COOKIE_NAME)
    ?.slice(1)
    .join('=')
}

export function isValidStudentLogin(loginId: unknown, password: unknown) {
  const configuredLoginId = process.env.STUDENT_LOGIN_ID
  const configuredPassword = process.env.STUDENT_LOGIN_PASSWORD
  return typeof loginId === 'string'
    && typeof password === 'string'
    && Boolean(configuredLoginId && configuredPassword && getSessionSecret())
    && safelyEqual(loginId, configuredLoginId as string)
    && safelyEqual(password, configuredPassword as string)
}

export function createStudentSessionCookie() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = Buffer.from(JSON.stringify({ role: 'student', expiresAt })).toString('base64url')
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE_NAME}=${payload}.${sign(payload)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`
}

export function clearStudentSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`
}

export function hasStudentSession(context: Pick<GetServerSidePropsContext, 'req'>) {
  const session = getCookie(context.req.headers.cookie)
  if (!session || !getSessionSecret()) return false

  const [payload, signature] = session.split('.')
  if (!payload || !signature || !safelyEqual(signature, sign(payload))) return false

  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { role?: string; expiresAt?: number }
    return value.role === 'student' && typeof value.expiresAt === 'number' && value.expiresAt > Date.now() / 1000
  } catch {
    return false
  }
}

export const requireStudentPage: GetServerSideProps = async (context) => {
  if (hasStudentSession(context)) {
    return { props: {} }
  }

  return {
    redirect: {
      destination: '/',
      permanent: false
    }
  }
}