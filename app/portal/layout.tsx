import Link from 'next/link'
import { requireMember } from '@/lib/auth/session'
import { ROLE_LABEL } from '@/lib/portal/labels'
import SignOutButton from '@/components/SignOutButton'
import Logo from '@/components/Logo'
import AdminNav, { type NavItem } from '@/components/AdminNav'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireMember()

  const items: NavItem[] = [
    { href: '/portal/dashboard', label: 'ダッシュボード' },
    { href: '/portal/profile', label: 'プロフィール' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/portal/dashboard" className="flex items-center">
              <Logo variant="icon" className="h-8 w-8 rounded-lg" priority />
            </Link>
            <AdminNav items={items} />
          </div>
          <div className="flex items-center gap-3">
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
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
