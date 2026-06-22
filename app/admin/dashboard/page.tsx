import Link from 'next/link'
import { Users, CreditCard, ShoppingCart, MessageSquare, Layers } from 'lucide-react'
import { getAdminStats } from '@/lib/portal/dashboard'
import { yen } from '@/lib/portal/labels'

export const dynamic = 'force-dynamic'

function StatCard({
  title,
  value,
  icon,
  sub,
  href,
}: {
  title: string
  value: string
  icon: React.ReactNode
  sub?: React.ReactNode
  href?: string
}) {
  const body = (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-gray-300">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()
  const m = stats.members

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">ダッシュボード</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="会員数"
          value={`${m.total}`}
          icon={<Users className="h-5 w-5" />}
          href="/admin/members"
          sub={
            <span className="flex gap-3">
              <span className="text-green-600">有効 {m.active}</span>
              <span className="text-yellow-600">保留 {m.pending}</span>
              <span className="text-orange-600">停止 {m.suspended}</span>
            </span>
          }
        />

        <StatCard
          title="今月の売上"
          value={yen(stats.monthlyRevenueYen)}
          icon={<CreditCard className="h-5 w-5" />}
          sub="確定入金の合計"
        />

        <StatCard
          title="プラン分布"
          value={`${stats.planDistribution.reduce((s, p) => s + p.count, 0)} 契約`}
          icon={<Layers className="h-5 w-5" />}
          href="/admin/plans"
          sub={
            <span className="flex flex-wrap gap-2">
              {stats.planDistribution
                .filter((p) => p.count > 0)
                .map((p) => (
                  <span key={p.code}>
                    {p.name}: {p.count}
                  </span>
                ))}
              {stats.planDistribution.every((p) => p.count === 0) && <span>契約なし</span>}
            </span>
          }
        />

        <StatCard
          title="新規オーダー"
          value={`${stats.newOrders}`}
          icon={<ShoppingCart className="h-5 w-5" />}
          sub="Phase 2 で実装"
        />

        <StatCard
          title="未読チャット"
          value={`${stats.unreadChats}`}
          icon={<MessageSquare className="h-5 w-5" />}
          sub="Phase 2 で実装"
        />
      </div>
    </div>
  )
}
