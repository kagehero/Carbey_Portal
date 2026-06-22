import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/session'
import { FRANCHISE_STATUS_LABEL } from '@/lib/portal/labels'
import type { FranchiseRow } from '@/types/database'

export const dynamic = 'force-dynamic'

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-2 text-sm font-medium text-gray-500">{title}</h2>
      {children}
    </div>
  )
}

function Placeholder({ phase }: { phase: string }) {
  return <p className="text-sm text-gray-400">{phase} で実装予定</p>
}

export default async function DashboardPage() {
  const session = await requireRole(['franchise', 'crm_staff', 'chat_only'])

  // RLS により自分の加盟店のみ取得できる
  let franchise: FranchiseRow | null = null
  if (session.franchiseId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('franchises')
      .select('*')
      .eq('id', session.franchiseId)
      .maybeSingle<FranchiseRow>()
    franchise = data
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">ダッシュボード</h1>

      {!franchise && (
        <div className="mb-6 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          加盟店情報が紐付いていません。本部にお問い合わせください。
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Widget title="契約プラン">
          {franchise ? (
            <div>
              <p className="text-lg font-semibold text-gray-900">{franchise.plan_code ?? '未設定'}</p>
              <p className="mt-0.5 text-sm text-gray-500">
                {FRANCHISE_STATUS_LABEL[franchise.status]}
              </p>
            </div>
          ) : (
            <Placeholder phase="—" />
          )}
        </Widget>

        <Widget title="オンボーディング進捗">
          {franchise ? (
            <p className={`text-lg font-semibold ${franchise.onboarding_completed ? 'text-green-700' : 'text-yellow-700'}`}>
              {franchise.onboarding_completed ? '完了' : '未完了'}
            </p>
          ) : (
            <Placeholder phase="—" />
          )}
          <p className="mt-1 text-xs text-gray-400">フローチャート本体は Phase 2</p>
        </Widget>

        <Widget title="販売件数サマリー">
          <Placeholder phase="Phase 3" />
        </Widget>

        <Widget title="利益状況">
          <Placeholder phase="Phase 3" />
        </Widget>

        <Widget title="AI 壁打ち">
          <Placeholder phase="Phase 4" />
          <p className="mt-1 text-xs text-gray-400">オンボーディング完了後に解放</p>
        </Widget>

        <Widget title="お知らせ">
          <Placeholder phase="Phase 2" />
        </Widget>
      </div>
    </div>
  )
}
