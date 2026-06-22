import type { FranchiseStatus, MembershipRole } from '@/types/database'

export const FRANCHISE_STATUS_LABEL: Record<FranchiseStatus, string> = {
  active: '有効',
  suspended: '停止',
  terminated: '解約',
}

export const FRANCHISE_STATUS_STYLE: Record<FranchiseStatus, string> = {
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-yellow-50 text-yellow-700',
  terminated: 'bg-gray-100 text-gray-600',
}

export const ROLE_LABEL: Record<MembershipRole, string> = {
  admin: '本部管理者',
  franchise: '加盟店',
  crm_staff: 'CRM入力担当',
  chat_only: 'チャット専用',
}
