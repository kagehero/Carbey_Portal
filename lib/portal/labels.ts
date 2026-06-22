import type {
  MemberStatus,
  UserRole,
  PaymentStatus,
  LeadStatus,
} from '@/types/database'

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  pending: '保留中',
  active: '有効',
  suspended: '停止',
  cancelled: '解約',
}

export const MEMBER_STATUS_STYLE: Record<MemberStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-orange-50 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: 'スーパー管理者',
  staff: 'スタッフ',
  member: '加盟店',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: '未払い',
  paid: '支払済み',
  overdue: '滞納',
}

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  unpaid: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  inquiry: '問い合わせ',
  consultation: '相談',
  proposal: '提案',
  contract: '契約',
  active: '稼働中',
  suspended: '停止',
}

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  'inquiry',
  'consultation',
  'proposal',
  'contract',
  'active',
  'suspended',
]

export const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  inquiry: 'bg-blue-50 text-blue-700',
  consultation: 'bg-indigo-50 text-indigo-700',
  proposal: 'bg-purple-50 text-purple-700',
  contract: 'bg-brand-50 text-brand-700',
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-gray-100 text-gray-500',
}

export function yen(n: number | null | undefined): string {
  if (n == null) return '—'
  return `¥${n.toLocaleString()}`
}
