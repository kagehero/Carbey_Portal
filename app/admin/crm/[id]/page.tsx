import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { requireStaff } from '@/lib/auth/session'
import { getLead, listLeadNotes } from '@/lib/portal/crm'
import { LEAD_STATUS_LABEL, LEAD_STATUS_STYLE, LEAD_STATUS_ORDER } from '@/lib/portal/labels'
import type { LeadStatus } from '@/types/database'
import { updateLeadStatusAction, addLeadNoteAction, convertLeadAction } from '../actions'

export const dynamic = 'force-dynamic'

const field = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff()
  const { id } = await params
  const [lead, notes] = await Promise.all([getLead(id), listLeadNotes(id)])
  if (!lead) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/crm" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        CRM へ
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_STATUS_STYLE[lead.status as LeadStatus]}`}>
          {LEAD_STATUS_LABEL[lead.status as LeadStatus]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* 基本情報 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">基本情報</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">会社</dt><dd>{lead.company ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">メール</dt><dd>{lead.email ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">電話</dt><dd>{lead.phone ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">流入経路</dt><dd>{lead.source ?? '—'}</dd></div>
          </dl>
          {lead.memo && <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">{lead.memo}</p>}
        </section>

        {/* パイプライン操作 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">パイプライン</h2>
          <form action={updateLeadStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={lead.id} />
            <select name="status" defaultValue={lead.status} className={field}>
              {LEAD_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>
              ))}
            </select>
            <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">更新</button>
          </form>

          <div className="mt-4 border-t border-gray-100 pt-4">
            {lead.converted_member_id ? (
              <Link href={`/admin/members/${lead.converted_member_id}`} className="text-sm text-green-700 hover:underline">
                会員化済み → 会員ページを開く
              </Link>
            ) : (
              <form action={convertLeadAction}>
                <input type="hidden" name="id" value={lead.id} />
                <button className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                  <UserPlus className="h-4 w-4" />
                  会員に変換
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* フォローアップ */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">フォローアップ履歴</h2>
        <form action={addLeadNoteAction} className="mb-4 flex gap-2">
          <input type="hidden" name="id" value={lead.id} />
          <input name="body" required placeholder="対応履歴を記録..." className={`${field} flex-1`} />
          <button className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">追加</button>
        </form>
        <ul className="space-y-3">
          {notes.length === 0 && <li className="text-sm text-gray-400">履歴はありません。</li>}
          {notes.map((n) => (
            <li key={n.id} className="border-l-2 border-brand-200 pl-3 text-sm">
              <div className="text-gray-700">{n.body}</div>
              <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('ja-JP')}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
