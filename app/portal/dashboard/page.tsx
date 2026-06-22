import { requireMember } from '@/lib/auth/session'
import { getMemberByUserId } from '@/lib/portal/members'
import { MEMBER_STATUS_LABEL, yen } from '@/lib/portal/labels'

export const dynamic = 'force-dynamic'

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-2 text-sm font-medium text-gray-500">{title}</h2>
      {children}
    </div>
  )
}

export default async function MemberDashboardPage() {
  const session = await requireMember()
  const member = await getMemberByUserId(session.userId)

  const onboardingPct = member?.onboarding_total
    ? Math.round((member.onboarding_done / member.onboarding_total) * 100)
    : 0

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">ようこそ</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {member?.company_name ?? member?.member_name ?? session.name ?? 'ゲスト'}
        </h1>
      </div>

      {!member && (
        <div className="mb-6 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          会員情報が紐付いていません。本部にお問い合わせください。
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Widget title="契約プラン">
          {member ? (
            <div>
              <p className="text-lg font-semibold text-gray-900">{member.plan?.name ?? '未設定'}</p>
              <p className="mt-0.5 text-sm text-gray-500">{MEMBER_STATUS_LABEL[member.status]}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </Widget>

        <Widget title="スタートアップ進捗">
          {member ? (
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {member.onboarding_done} / {member.onboarding_total} 完了
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${onboardingPct}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
          <p className="mt-2 text-xs text-gray-400">フロー本体は Phase 2</p>
        </Widget>

        <Widget title="今月の利益">
          <p className="text-lg font-semibold text-gray-900">{yen(0)}</p>
          <p className="mt-1 text-xs text-gray-400">Phase 3 で実装</p>
        </Widget>

        <Widget title="AI 壁打ち">
          <p className="text-sm text-gray-400">Phase 4 で実装</p>
          <p className="mt-1 text-xs text-gray-400">オンボーディング完了後に解放</p>
        </Widget>

        <Widget title="お知らせ">
          <p className="text-sm text-gray-400">Phase 2 で実装</p>
        </Widget>
      </div>
    </div>
  )
}
