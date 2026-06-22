import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { requireStaff } from '@/lib/auth/session'
import { listMembers } from '@/lib/portal/members'
import { listPlans } from '@/lib/portal/plans'
import {
  MEMBER_STATUS_LABEL,
  MEMBER_STATUS_STYLE,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_STYLE,
} from '@/lib/portal/labels'
import type { MemberStatus, PaymentStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

const field = 'rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; plan_id?: string }>
}) {
  await requireStaff()
  const sp = await searchParams
  const [members, plans] = await Promise.all([
    listMembers({ q: sp.q, status: sp.status, plan_id: sp.plan_id }),
    listPlans(),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">会員管理</h1>
          <p className="mt-1 text-sm text-gray-500">{members.length} 件</p>
        </div>
        <Link
          href="/admin/members/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          会員を登録
        </Link>
      </div>

      {/* フィルタ */}
      <form className="mb-4 flex flex-wrap items-center gap-2" action="/admin/members" method="get">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="氏名・メール・会社名"
            className={`${field} pl-8`}
          />
        </div>
        <select name="status" defaultValue={sp.status ?? ''} className={field}>
          <option value="">すべてのステータス</option>
          {(Object.keys(MEMBER_STATUS_LABEL) as MemberStatus[]).map((s) => (
            <option key={s} value={s}>
              {MEMBER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select name="plan_id" defaultValue={sp.plan_id ?? ''} className={field}>
          <option value="">すべてのプラン</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
          絞り込む
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">氏名 / 会社</th>
              <th className="px-4 py-3 font-medium">プラン</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">支払</th>
              <th className="px-4 py-3 font-medium">最終ログイン</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  会員がいません。
                </td>
              </tr>
            )}
            {members.map((mem) => (
              <tr key={mem.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/members/${mem.id}`} className="font-medium text-gray-900 hover:underline">
                    {mem.member_name}
                  </Link>
                  {mem.company_name && <div className="text-xs text-gray-500">{mem.company_name}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{mem.plan?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${MEMBER_STATUS_STYLE[mem.status]}`}>
                    {MEMBER_STATUS_LABEL[mem.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLE[mem.payment_status as PaymentStatus]}`}>
                    {PAYMENT_STATUS_LABEL[mem.payment_status as PaymentStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {mem.last_login_at ? new Date(mem.last_login_at).toLocaleDateString('ja-JP') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
