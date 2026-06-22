import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'

/**
 * ログイン直後の遷移先をロールで振り分ける。
 *   admin              → /admin/franchises
 *   franchise/その他    → /portal/dashboard
 * メンバーシップ未登録なら /login?error=forbidden。
 */
export async function GET(request: NextRequest) {
  const session = await getSessionUser()
  const origin = request.nextUrl.origin

  if (!session) {
    return NextResponse.redirect(new URL('/login?error=forbidden', origin))
  }

  const redirect = request.nextUrl.searchParams.get('redirect')
  if (redirect && redirect.startsWith('/')) {
    return NextResponse.redirect(new URL(redirect, origin))
  }

  const staff = session.role === 'super_admin' || session.role === 'staff'
  const dest = staff ? '/admin/dashboard' : '/portal/dashboard'
  return NextResponse.redirect(new URL(dest, origin))
}
