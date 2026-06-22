import Link from 'next/link'
import { requireRole } from '@/lib/auth/session'
import { ROLE_LABEL } from '@/lib/portal/labels'
import SignOutButton from '@/components/SignOutButton'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // 加盟店側はオーナー/CRM入力担当/チャット専用が利用 (admin は本部画面へ)
  const session = await requireRole(['franchise', 'crm_staff', 'chat_only'])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/portal/dashboard" className="font-bold text-gray-900">
            Carbey Portal
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {session.displayName ?? session.email}
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
