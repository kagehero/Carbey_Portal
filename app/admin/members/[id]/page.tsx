import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireFeature } from '@/lib/auth/session'
import { getMember, listPayments } from '@/lib/portal/members'
import { listPlans } from '@/lib/portal/plans'
import {
  MEMBER_STATUS_LABEL,
  MEMBER_STATUS_STYLE,
  yen,
} from '@/lib/portal/labels'
import { updateMemberAction } from '../actions'
import MemberFormFields from '../MemberFormFields'

export const dynamic = 'force-dynamic'

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireFeature('members')
  const { id } = await params
  const [member, plans, payments] = await Promise.all([getMember(id), listPlans(false), listPayments(id)])
  if (!member) notFound()

  const onboardingPct = member.onboarding_total
    ? Math.round((member.onboarding_done / member.onboarding_total) * 100)
    : 0

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/members" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        会員一覧へ
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{member.member_name}</h1>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${MEMBER_STATUS_STYLE[member.status]}`}>
          {MEMBER_STATUS_LABEL[member.status]}
        </span>
        {member.company_name && <span className="text-sm text-gray-500">{member.company_name}</span>}
      </div>

      {/* サマリ行 */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-xs text-gray-500">プラン</div>
          <div className="text-sm font-semibold text-gray-900">{member.plan?.name ?? '—'}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-xs text-gray-500">登録日</div>
          <div className="text-sm font-semibold text-gray-900">{member.registration_date}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-xs text-gray-500">月額</div>
          <div className="text-sm font-semibold text-gray-900">{yen(member.monthly_fee_yen)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-xs text-gray-500">オンボーディング</div>
          <div className="text-sm font-semibold text-gray-900">
            {member.onboarding_done}/{member.onboarding_total}（{onboardingPct}%）
          </div>
        </div>
      </div>

      {/* 編集フォーム */}
      <form action={updateMemberAction}>
        <input type="hidden" name="id" value={member.id} />
        <MemberFormFields plans={plans} member={member} showPaymentStatus />
        <div className="mt-6 flex justify-end">
          <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            変更を保存
          </button>
        </div>
      </form>

      {/* 入金履歴 */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">入金履歴</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">日付</th>
                <th className="px-4 py-2 font-medium">種別</th>
                <th className="px-4 py-2 font-medium">金額</th>
                <th className="px-4 py-2 font-medium">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    入金履歴はありません。
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-gray-700">{p.payment_date}</td>
                  <td className="px-4 py-2 text-gray-700">{p.kind}</td>
                  <td className="px-4 py-2 text-gray-900">{yen(p.amount_yen)}</td>
                  <td className="px-4 py-2 text-gray-700">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
