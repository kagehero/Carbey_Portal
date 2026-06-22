import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireStaff } from '@/lib/auth/session'
import { listLeads } from '@/lib/portal/crm'
import { LEAD_STATUS_LABEL, LEAD_STATUS_STYLE, LEAD_STATUS_ORDER } from '@/lib/portal/labels'
import type { LeadStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireStaff()
  const sp = await searchParams
  const leads = await listLeads(sp.status)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CRM（見込み客）</h1>
          <p className="mt-1 text-sm text-gray-500">{leads.length} 件</p>
        </div>
        <Link
          href="/admin/crm/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          リードを追加
        </Link>
      </div>

      {/* ステータスフィルタ (パイプライン) */}
      <div className="mb-4 flex flex-wrap gap-1">
        <Link
          href="/admin/crm"
          className={!sp.status ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white' : 'rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200'}
        >
          すべて
        </Link>
        {LEAD_STATUS_ORDER.map((s) => (
          <Link
            key={s}
            href={`/admin/crm?status=${s}`}
            className={sp.status === s ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white' : 'rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200'}
          >
            {LEAD_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">氏名 / 会社</th>
              <th className="px-4 py-3 font-medium">連絡先</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  リードがありません。
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/crm/${lead.id}`} className="font-medium text-gray-900 hover:underline">
                    {lead.name}
                  </Link>
                  {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {lead.email ?? lead.phone ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_STATUS_STYLE[lead.status as LeadStatus]}`}>
                    {LEAD_STATUS_LABEL[lead.status as LeadStatus]}
                  </span>
                  {lead.converted_member_id && <span className="ml-2 text-xs text-green-600">会員化済</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(lead.created_at).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
