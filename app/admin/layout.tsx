import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import SignOutButton from '@/components/SignOutButton'
import Logo from '@/components/Logo'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/franchises" className="flex items-center gap-2">
              <Logo variant="text" className="h-7 w-auto" priority />
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">
                本部
              </span>
            </Link>
            <nav className="flex gap-1">
              <Link
                href="/admin/franchises"
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                加盟店管理
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session.displayName ?? session.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
