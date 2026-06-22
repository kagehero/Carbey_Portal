import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createClient, createAuthClient } from '@/lib/supabase/server'
import type { UserRole, PortalUserRow } from '@/types/database'
import { canAccess, type Feature } from '@/lib/auth/permissions'

export type SessionUser = {
  userId: string
  email: string | null
  role: UserRole
  name: string | null
}

type PortalUserPick = Pick<PortalUserRow, 'role' | 'name' | 'email'>

/**
 * 現在のユーザーと portal.users のロールを解決する。
 * 未認証 or portal.users 未登録なら null。
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const auth = await createAuthClient()
  const {
    data: { user },
  } = await auth.auth.getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('role, name, email')
    .eq('id', user.id)
    .maybeSingle<PortalUserPick>()

  if (!data) return null

  return {
    userId: user.id,
    email: user.email ?? data.email ?? null,
    role: data.role,
    name: data.name,
  }
}

export function isStaffOrAdmin(role: UserRole): boolean {
  return role === 'super_admin' || role === 'staff'
}

// ---------------------------------------------------------------------
// Server Component / Page 用ガード (リダイレクト)
// ---------------------------------------------------------------------

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser()
  if (!session) redirect('/login')
  return session
}

/** super_admin のみ。 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.role !== 'super_admin') redirect('/login?error=forbidden')
  return session
}

/** super_admin または staff (本部側)。 */
export async function requireStaff(): Promise<SessionUser> {
  const session = await requireSession()
  if (!isStaffOrAdmin(session.role)) redirect('/login?error=forbidden')
  return session
}

/** member (加盟店側)。 */
export async function requireMember(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.role !== 'member') redirect('/login?error=forbidden')
  return session
}

/** 機能アクセス権でガード。 */
export async function requireFeature(feature: Feature): Promise<SessionUser> {
  const session = await requireSession()
  if (!canAccess(session.role, feature)) redirect('/login?error=forbidden')
  return session
}

// ---------------------------------------------------------------------
// Route Handler 用ガード (JSON レスポンス)
// ---------------------------------------------------------------------

export type ApiGate = { ok: true; session: SessionUser } | { ok: false; response: NextResponse }

export async function apiRequireSession(): Promise<ApiGate> {
  const session = await getSessionUser()
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true, session }
}

export async function apiRequireStaff(): Promise<ApiGate> {
  const gate = await apiRequireSession()
  if (!gate.ok) return gate
  if (!isStaffOrAdmin(gate.session.role)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return gate
}
