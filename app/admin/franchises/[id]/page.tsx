import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getFranchise } from '@/lib/portal/franchises'
import { FRANCHISE_STATUS_LABEL, FRANCHISE_STATUS_STYLE } from '@/lib/portal/labels'

export const dynamic = 'force-dynamic'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 text-right">{value || '—'}</dd>
    </div>
  )
}

export default async function FranchiseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const f = await getFranchise(id)
  if (!f) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/franchises" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        加盟店一覧へ
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{f.name}</h1>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FRANCHISE_STATUS_STYLE[f.status]}`}>
          {FRANCHISE_STATUS_LABEL[f.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">基本情報</h2>
          <dl>
            <Row label="メールアドレス" value={f.email} />
            <Row label="携帯番号" value={f.phone_mobile} />
            <Row label="固定電話" value={f.phone_landline} />
            <Row label="住所" value={f.address} />
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">陸送先</h2>
          <dl>
            <Row label="陸送先名" value={f.delivery_name} />
            <Row label="陸送先連絡先" value={f.delivery_contact} />
            <Row label="陸送先住所" value={f.delivery_address} />
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">契約情報</h2>
          <dl>
            <Row label="利用プラン" value={f.plan_code} />
            <Row label="契約日" value={f.contract_date} />
            <Row
              label="月額費用"
              value={f.monthly_fee_yen != null ? `${f.monthly_fee_yen.toLocaleString()} 円` : null}
            />
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">利用状況</h2>
          <dl>
            <Row
              label="オンボーディング"
              value={
                f.onboarding_completed ? (
                  <span className="text-green-700">完了</span>
                ) : (
                  <span className="text-yellow-700">未完了（AI機能ロック）</span>
                )
              }
            />
          </dl>
          <p className="mt-3 text-xs text-gray-400">
            ※ オンボーディングフロー本体・AI利用状況は Phase 2 / Phase 4 で実装。
          </p>
        </section>
      </div>
    </div>
  )
}
