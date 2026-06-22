import Link from 'next/link'
import {
  Store,
  CreditCard,
  ClipboardList,
  Truck,
  ShoppingCart,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'
import { getAdminStats, getRecentMembers } from '@/lib/portal/dashboard'
import { yen, MEMBER_STATUS_LABEL } from '@/lib/portal/labels'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { MemberStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

const PLAN_BAR_COLORS = ['bg-brand-500', 'bg-info-600', 'bg-teal-500', 'bg-amber-500', 'bg-slate-400']

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([getAdminStats(), getRecentMembers(5)])
  const m = stats.members
  const totalContracts = stats.planDistribution.reduce((s, p) => s + p.count, 0)
  const maxPlan = Math.max(1, ...stats.planDistribution.map((p) => p.count))

  return (
    <div>
      <PageHeader title="ダッシュボード" description="本部全体の運営状況をひと目で把握" />

      {/* KPI グリッド */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="加盟店数"
          value={m.total}
          icon={<Store className="h-5 w-5" />}
          tone="brand"
          href="/admin/members"
          sub={
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-emerald-600">有効 {m.active}</span>
              <span className="text-amber-600">申込中 {m.pending}</span>
              <span className="text-orange-600">停止 {m.suspended}</span>
            </span>
          }
        />
        <StatCard
          label="有効契約"
          value={totalContracts}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="blue"
          sub="プラン契約の合計"
        />
        <StatCard
          label="今月の売上"
          value={yen(stats.monthlyRevenueYen)}
          icon={<CreditCard className="h-5 w-5" />}
          tone="green"
          sub="確定入金の合計"
        />
        <StatCard
          label="申込中（要対応）"
          value={m.pending}
          icon={<ArrowUpRight className="h-5 w-5" />}
          tone="amber"
          href="/admin/members?status=pending"
          sub="オンボーディング待ち"
        />
      </div>

      {/* 2カラム: プラン分布 + 最近の加盟店 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* プラン分布バーチャート */}
        <Card className="lg:col-span-1">
          <CardHeader title="プラン分布" action={<Link href="/admin/plans" className="text-xs text-info-600 hover:underline">プラン管理</Link>} />
          <CardBody className="space-y-4">
            {stats.planDistribution.map((p, i) => (
              <div key={p.code}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{p.name}</span>
                  <span className="font-medium text-slate-900">{p.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${PLAN_BAR_COLORS[i % PLAN_BAR_COLORS.length]}`}
                    style={{ width: `${(p.count / maxPlan) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {totalContracts === 0 && <p className="text-sm text-slate-400">契約データがありません。</p>}
          </CardBody>
        </Card>

        {/* 最近の加盟店 */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="最近登録された加盟店"
            action={
              <Link href="/admin/members" className="flex items-center gap-1 text-xs text-info-600 hover:underline">
                すべて見る <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {recent.length === 0 && <li className="px-5 py-8 text-center text-sm text-slate-400">加盟店がまだいません。</li>}
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/members/${r.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                        {r.member_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{r.member_name}</div>
                        {r.company_name && <div className="text-xs text-slate-500">{r.company_name}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={statusTone(r.status as MemberStatus)}>{MEMBER_STATUS_LABEL[r.status as MemberStatus]}</Badge>
                      <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Phase 2-4 領域: 運営オペレーション (実装予定をエンタープライズ的に提示) */}
      <h2 className="mb-3 mt-8 text-sm font-semibold text-slate-500">運営オペレーション</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ComingCard icon={<Truck className="h-5 w-5" />} title="車両進捗管理" phase="Phase 3" desc="仕入れ〜清算の案件管理" />
        <ComingCard icon={<ShoppingCart className="h-5 w-5" />} title="オーダー管理" phase="Phase 2" desc="加盟店からの仕入れ依頼" />
        <ComingCard icon={<MessageSquare className="h-5 w-5" />} title="チャット" phase="Phase 2" desc="加盟店との個別連絡" />
        <ComingCard icon={<Sparkles className="h-5 w-5" />} title="AI利用状況" phase="Phase 4" desc="壁打ち利用の分析" />
      </div>
    </div>
  )
}

function statusTone(s: MemberStatus): 'green' | 'amber' | 'red' | 'slate' {
  return s === 'active' ? 'green' : s === 'pending' ? 'amber' : s === 'suspended' ? 'red' : 'slate'
}

function ComingCard({ icon, title, phase, desc }: { icon: React.ReactNode; title: string; phase: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">{icon}</span>
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-medium text-slate-500">{phase}</span>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-700">{title}</div>
      <div className="mt-0.5 text-xs text-slate-400">{desc}</div>
    </div>
  )
}
