import { requireStaff } from '@/lib/auth/session'
import { canAccess } from '@/lib/auth/permissions'
import { unreadAdminCount } from '@/lib/portal/notifications'
import { ROLE_LABEL } from '@/lib/portal/labels'
import Sidebar, { type NavEntry } from '@/components/shell/Sidebar'
import Topbar from '@/components/shell/Topbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff()
  const unread = await unreadAdminCount()

  // 要求書のサイドバー構成。実装済み=リンク、Phase2-4=soon(近日)。
  // permission matrix で権限の無い項目は出さない。
  const primary: NavEntry[] = [
    { href: '/admin/dashboard', label: 'ダッシュボード', icon: 'dashboard' },
  ]
  if (canAccess(session.role, 'members')) {
    primary.push({ href: '/admin/members', label: '加盟店管理', icon: 'store' })
    primary.push({ href: '/admin/contracts', label: '契約管理', icon: 'contract', soon: true })
    primary.push({ href: '/admin/billing', label: '請求・入金管理', icon: 'billing', soon: true })
    primary.push({ href: '/admin/onboarding', label: 'オンボーディング管理', icon: 'onboarding', soon: true })
  }
  primary.push({ href: '/admin/vehicles', label: '車両進捗管理', icon: 'vehicle', soon: true })
  primary.push({ href: '/admin/orders', label: 'オーダー管理', icon: 'order', soon: true })
  primary.push({ href: '/admin/chat', label: 'チャット', icon: 'chat', soon: true })
  if (canAccess(session.role, 'crm')) {
    primary.push({ href: '/admin/crm', label: 'CRM', icon: 'crm' })
  }
  primary.push({ href: '/admin/ai-usage', label: 'AI利用状況', icon: 'ai', soon: true })
  primary.push({ href: '/admin/reports', label: 'レポート', icon: 'report', soon: true })

  const settingsItems: NavEntry[] = []
  if (canAccess(session.role, 'plans')) settingsItems.push({ href: '/admin/plans', label: 'プラン管理', icon: 'settings' })
  if (canAccess(session.role, 'settings')) settingsItems.push({ href: '/admin/permissions', label: '権限管理', icon: 'settings' })

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        brandLabel="本部管理"
        primary={primary}
        secondary={settingsItems.length ? { label: '設定', items: settingsItems } : undefined}
      />
      <div className="lg:pl-64">
        <Topbar
          userName={session.name ?? session.email ?? 'ユーザー'}
          roleLabel={ROLE_LABEL[session.role]}
          notificationsHref="/admin/notifications"
          unread={unread}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
