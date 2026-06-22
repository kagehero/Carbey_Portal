'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Store,
  FileText,
  Wallet,
  ClipboardList,
  Truck,
  ShoppingCart,
  MessageSquare,
  Users,
  Sparkles,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { cn } from '@/lib/cn'

export type NavEntry = {
  href: string
  label: string
  icon: keyof typeof ICONS
  /** Phase2-4 で実装予定 (クリック不可・近日バッジ) */
  soon?: boolean
}

const ICONS = {
  dashboard: LayoutDashboard,
  store: Store,
  contract: FileText,
  billing: Wallet,
  onboarding: ClipboardList,
  vehicle: Truck,
  order: ShoppingCart,
  chat: MessageSquare,
  crm: Users,
  ai: Sparkles,
  report: BarChart3,
  settings: Settings,
}

function NavLink({ entry, active }: { entry: NavEntry; active: boolean }) {
  const Icon = ICONS[entry.icon]
  if (entry.soon) {
    return (
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-400/70"
        title="Phase 2以降で実装予定"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-[18px] w-[18px]" />
          {entry.label}
        </span>
        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">近日</span>
      </div>
    )
  }
  return (
    <Link
      href={entry.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
        active
          ? 'bg-brand-500/15 text-white ring-1 ring-inset ring-brand-500/30'
          : 'text-slate-300 hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon className={cn('h-[18px] w-[18px]', active ? 'text-brand-400' : 'text-slate-400')} />
      {entry.label}
    </Link>
  )
}

function NavList({ items, sectionLabel }: { items: NavEntry[]; sectionLabel?: string }) {
  const pathname = usePathname()
  return (
    <div>
      {sectionLabel && (
        <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {sectionLabel}
        </p>
      )}
      <nav className="space-y-0.5">
        {items.map((e) => {
          const active = !e.soon && (pathname === e.href || pathname.startsWith(e.href + '/'))
          return <NavLink key={e.href + e.label} entry={e} active={active} />
        })}
      </nav>
    </div>
  )
}

export default function Sidebar({
  brandLabel,
  primary,
  secondary,
}: {
  brandLabel: string
  primary: NavEntry[]
  secondary?: { label: string; items: NavEntry[] }
}) {
  const [open, setOpen] = useState(false)

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Logo variant="icon" className="h-8 w-8 rounded-lg" priority />
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">Carbey</div>
          <div className="text-[11px] text-slate-400">{brandLabel}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-slim">
        <NavList items={primary} />
        {secondary && <NavList items={secondary.items} sectionLabel={secondary.label} />}
      </div>
      <div className="border-t border-white/5 px-5 py-3">
        <p className="text-[11px] text-slate-500">© {new Date().getFullYear()} Carbey</p>
      </div>
    </div>
  )

  return (
    <>
      {/* モバイル: ハンバーガー */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3.5 z-30 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden"
        aria-label="メニューを開く"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* デスクトップ: 固定サイドバー */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 bg-navy-800 lg:block">{content}</aside>

      {/* モバイル: ドロワー */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy-800">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/5"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
