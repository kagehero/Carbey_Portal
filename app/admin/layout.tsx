import Link from 'next/link'
import { requireStaff } from '@/lib/auth/session'
import { canAccess } from '@/lib/auth/permissions'
import { unreadAdminCount } from '@/lib/portal/notifications'
import { ROLE_LABEL } from '@/lib/portal/labels'
import SignOutButton from '@/components/SignOutButton'
import Logo from '@/components/Logo'
import AdminNav, { type NavItem } from '@/components/AdminNav'
import NotificationBell from '@/components/NotificationBell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff()
  const unread = await unreadAdminCount()

  // ロールに応じてナビ項目を出し分け (permission matrix と一致)
  const items: NavItem[] = [{ href: '/admin/dashboard', label: 'ダッシュボード' }]
  if (canAccess(session.role, 'members')) items.push({ href: '/admin/members', label: '会員管理' })
  if (canAccess(session.role, 'crm')) items.push({ href: '/admin/crm', label: 'CRM' })
  if (canAccess(session.role, 'plans')) items.push({ href: '/admin/plans', label: 'プラン管理' })
  if (canAccess(session.role, 'settings'))
    items.push({ href: '/admin/permissions', label: '権限' })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Logo variant="icon" className="h-8 w-8 rounded-lg" priority />
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">
                本部
              </span>
            </Link>
            <AdminNav items={items} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell count={unread} href="/admin/notifications" />
            <span className="text-sm text-gray-500">
              {session.name ?? session.email}
              <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                {ROLE_LABEL[session.role]}
              </span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
