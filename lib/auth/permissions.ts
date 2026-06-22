/**
 * 機能アクセスマトリクス (コード定義・単一の真実の源)。
 * 要求スペックの Feature Access Matrix を TypeScript で表現する。
 *
 *   | Feature | super_admin | staff    | member   |
 *   | ------- | ----------- | -------- | -------- |
 *   | crm     | ✓           | ✓        | ✗        |
 *   | members | ✓           | ✓        | ✗        |
 *   | reports | ✓           | ✓        | own      |
 *   | orders  | ✓           | ✓        | own      |
 *   | chat    | ✓           | ✓        | own      |
 *   | ai      | ✓           | optional | optional |
 *   | plans   | ✓           | ✗        | ✗        |
 *   | settings| ✓           | ✗        | ✗        |
 */
import type { UserRole } from '@/types/database'

export type Feature =
  | 'crm'
  | 'members'
  | 'reports'
  | 'orders'
  | 'chat'
  | 'ai'
  | 'plans'
  | 'settings'

/** アクセスレベル: full=全件 / own=自分の分のみ / none=不可 / optional=プラン等で可変 */
export type Access = 'full' | 'own' | 'none' | 'optional'

export const FEATURES: Feature[] = ['crm', 'members', 'reports', 'orders', 'chat', 'ai', 'plans', 'settings']

export const FEATURE_LABEL: Record<Feature, string> = {
  crm: 'CRM',
  members: '会員管理',
  reports: 'レポート',
  orders: 'オーダー',
  chat: 'チャット',
  ai: 'AI',
  plans: 'プラン管理',
  settings: 'システム設定',
}

export const ACCESS_MATRIX: Record<Feature, Record<UserRole, Access>> = {
  crm:      { super_admin: 'full', staff: 'full',     member: 'none' },
  members:  { super_admin: 'full', staff: 'full',     member: 'none' },
  reports:  { super_admin: 'full', staff: 'full',     member: 'own' },
  orders:   { super_admin: 'full', staff: 'full',     member: 'own' },
  chat:     { super_admin: 'full', staff: 'full',     member: 'own' },
  ai:       { super_admin: 'full', staff: 'optional', member: 'optional' },
  plans:    { super_admin: 'full', staff: 'none',     member: 'none' },
  settings: { super_admin: 'full', staff: 'none',     member: 'none' },
}

/** role が feature にアクセスできるか (none 以外なら true)。 */
export function canAccess(role: UserRole, feature: Feature): boolean {
  return ACCESS_MATRIX[feature][role] !== 'none'
}

/** role の feature に対するアクセスレベル。 */
export function accessLevel(role: UserRole, feature: Feature): Access {
  return ACCESS_MATRIX[feature][role]
}
