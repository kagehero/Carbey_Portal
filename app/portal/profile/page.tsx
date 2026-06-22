import { requireMember } from '@/lib/auth/session'
import { getMemberByUserId } from '@/lib/portal/members'
import { MEMBER_STATUS_LABEL, PAYMENT_STATUS_LABEL, yen } from '@/lib/portal/labels'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export default async function MemberProfilePage() {
  const session = await requireMember()
  const member = await getMemberByUserId(session.userId)

  if (!member) {
    return (
      <div className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        会員情報が紐付いていません。本部にお問い合わせください。
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900">プロフィール</h1>
        <Badge tone={member.status === 'active' ? 'green' : member.status === 'pending' ? 'amber' : member.status === 'suspended' ? 'red' : 'slate'}>
          {MEMBER_STATUS_LABEL[member.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">基本情報</h2>
          <dl>
            <Row label="担当者氏名" value={member.member_name} />
            <Row label="会社名" value={member.company_name} />
            <Row label="メールアドレス" value={member.email} />
            <Row label="携帯番号" value={member.phone_mobile} />
            <Row label="固定電話" value={member.phone_landline} />
            <Row label="住所" value={member.address} />
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">陸送先</h2>
          <dl>
            <Row label="陸送先名" value={member.delivery_name} />
            <Row label="陸送先連絡先" value={member.delivery_contact} />
            <Row label="陸送先住所" value={member.delivery_address} />
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">契約情報</h2>
          <dl>
            <Row label="プラン" value={member.plan?.name} />
            <Row label="契約日" value={member.contract_date} />
            <Row label="登録日" value={member.registration_date} />
            <Row label="月額費用" value={yen(member.monthly_fee_yen)} />
            <Row label="加盟金" value={yen(member.joining_fee_yen)} />
            <Row label="支払ステータス" value={PAYMENT_STATUS_LABEL[member.payment_status]} />
          </dl>
        </section>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        ※ 情報の変更は本部にお問い合わせください（編集機能は今後追加予定）。
      </p>
    </div>
  )
}
