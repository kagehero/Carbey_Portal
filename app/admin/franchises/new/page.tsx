import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { listPlans } from '@/lib/portal/franchises'
import { createFranchiseAction } from '../actions'

export const dynamic = 'force-dynamic'

const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none'
const label = 'mb-1 block text-sm font-medium text-gray-700'

export default async function NewFranchisePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const plans = await listPlans()
  const { error } = await searchParams

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/franchises" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        加盟店一覧へ
      </Link>

      <h1 className="mb-6 text-xl font-bold text-gray-900">加盟店を登録</h1>

      {error === 'name_required' && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">加盟店名は必須です。</div>
      )}

      <form action={createFranchiseAction} className="space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">基本情報</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>加盟店名 / 氏名 *</label>
              <input name="name" required className={field} />
            </div>
            <div>
              <label className={label}>メールアドレス</label>
              <input name="email" type="email" className={field} />
            </div>
            <div>
              <label className={label}>携帯番号</label>
              <input name="phone_mobile" className={field} />
            </div>
            <div>
              <label className={label}>固定電話</label>
              <input name="phone_landline" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>住所</label>
              <input name="address" className={field} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">陸送先</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>陸送先名</label>
              <input name="delivery_name" className={field} />
            </div>
            <div>
              <label className={label}>陸送先連絡先</label>
              <input name="delivery_contact" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>陸送先住所</label>
              <input name="delivery_address" className={field} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">契約情報</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>利用プラン</label>
              <select name="plan_code" className={field} defaultValue="">
                <option value="">未設定</option>
                {plans.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>契約ステータス</label>
              <select name="status" className={field} defaultValue="active">
                <option value="active">有効</option>
                <option value="suspended">停止</option>
                <option value="terminated">解約</option>
              </select>
            </div>
            <div>
              <label className={label}>契約日</label>
              <input name="contract_date" type="date" className={field} />
            </div>
            <div>
              <label className={label}>月額費用 (円)</label>
              <input name="monthly_fee_yen" type="number" min="0" className={field} />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/franchises"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            登録する
          </button>
        </div>
      </form>
    </div>
  )
}
