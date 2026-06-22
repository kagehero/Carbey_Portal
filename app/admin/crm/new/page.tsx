import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireStaff } from '@/lib/auth/session'
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER } from '@/lib/portal/labels'
import { createLeadAction } from '../actions'

export const dynamic = 'force-dynamic'

const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none'
const label = 'mb-1 block text-sm font-medium text-gray-700'

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  await requireStaff()
  const sp = await searchParams

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/crm" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        CRM へ
      </Link>
      <h1 className="mb-6 text-xl font-bold text-gray-900">リードを追加</h1>

      {sp.error === 'name_required' && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">氏名は必須です。</div>
      )}

      <form action={createLeadAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <label className={label}>氏名 *</label>
          <input name="name" required className={field} />
        </div>
        <div>
          <label className={label}>会社名</label>
          <input name="company" className={field} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>メール</label>
            <input name="email" type="email" className={field} />
          </div>
          <div>
            <label className={label}>電話</label>
            <input name="phone" className={field} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>ステータス</label>
            <select name="status" defaultValue="inquiry" className={field}>
              {LEAD_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>流入経路</label>
            <input name="source" placeholder="例: 紹介 / 広告" className={field} />
          </div>
        </div>
        <div>
          <label className={label}>メモ</label>
          <textarea name="memo" rows={3} className={field} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/crm" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            キャンセル
          </Link>
          <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            追加する
          </button>
        </div>
      </form>
    </div>
  )
}
