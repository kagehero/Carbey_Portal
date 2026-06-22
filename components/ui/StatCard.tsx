import Link from 'next/link'
import { cn } from '@/lib/cn'

type Tone = 'brand' | 'blue' | 'green' | 'amber' | 'slate' | 'teal'

const ICON_TONES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600',
  blue: 'bg-info-50 text-info-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-500',
  teal: 'bg-teal-50 text-teal-600',
}

/** ダッシュボードの KPI タイル。 */
export function StatCard({
  label,
  value,
  icon,
  tone = 'slate',
  sub,
  href,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  tone?: Tone
  sub?: React.ReactNode
  href?: string
}) {
  const inner = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', ICON_TONES[tone])}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {sub && <div className="mt-2 text-xs text-slate-500">{sub}</div>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}
