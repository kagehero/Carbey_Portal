import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createClient, createAuthClient } from '@/lib/supabase/server'
import type { MembershipRole, MembershipRow } from '@/types/database'

type MembershipPick = Pick<MembershipRow, 'role' | 'franchise_id' | 'display_name'>

export type SessionUser = {
  userId: string
  email: string | null
  role: MembershipRole
  franchiseId: string | null
  displayName: string | null
}

/**
 * 現在のユーザーとそのメンバーシップを解決する。
 * 未認証 or メンバーシップ未登録なら null。
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const auth = await createAuthClient()
  const {
    data: { user },
  } = await auth.auth.getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('memberships')
    .select('role, franchise_id, display_name')
    .eq('user_id', user.id)
    .maybeSingle<MembershipPick>()

  if (!data) return null

  return {
    userId: user.id,
    email: user.email ?? null,
    role: data.role,
    franchiseId: data.franchise_id,
    displayName: data.display_name,
  }
}

// ---------------------------------------------------------------------
// Server Component / Page 用ガード (リダイレクト)
// ---------------------------------------------------------------------

/** 認証必須。未認証ならログインへ。 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser()
  if (!session) redirect('/login')
  return session
}

/** 本部管理者必須。 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.role !== 'admin') redirect('/login?error=forbidden')
  return session
}

/** いずれかのロール必須。 */
export async function requireRole(roles: MembershipRole[]): Promise<SessionUser> {
  const session = await requireSession()
  if (!roles.includes(session.role)) redirect('/login?error=forbidden')
  return session
}

// ---------------------------------------------------------------------
// Route Handler 用ガード (JSON レスポンス)
// ---------------------------------------------------------------------

export type ApiGate =
  | { ok: true; session: SessionUser }
  | { ok: false; response: NextResponse }

/** API 用: 認証必須。 */
export async function apiRequireSession(): Promise<ApiGate> {
  const session = await getSessionUser()
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true, session }
}

/** API 用: 指定ロール必須。 */
export async function apiRequireRole(roles: MembershipRole[]): Promise<ApiGate> {
  const gate = await apiRequireSession()
  if (!gate.ok) return gate
  if (!roles.includes(gate.session.role)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return gate
}

/** API 用: 本部管理者必須。 */
export async function apiRequireAdmin(): Promise<ApiGate> {
  return apiRequireRole(['admin'])
}
