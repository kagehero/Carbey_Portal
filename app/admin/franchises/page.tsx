import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listFranchises } from '@/lib/portal/franchises'
import { FRANCHISE_STATUS_LABEL, FRANCHISE_STATUS_STYLE } from '@/lib/portal/labels'

export const dynamic = 'force-dynamic'

export default async function FranchisesPage() {
  const franchises = await listFranchises()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">加盟店管理</h1>
          <p className="mt-1 text-sm text-gray-500">{franchises.length} 件の加盟店</p>
        </div>
        <Link
          href="/admin/franchises/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          加盟店を登録
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">加盟店名</th>
              <th className="px-4 py-3 font-medium">プラン</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">オンボーディング</th>
              <th className="px-4 py-3 font-medium">契約日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {franchises.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  加盟店がまだ登録されていません。
                </td>
              </tr>
            )}
            {franchises.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/franchises/${f.id}`} className="font-medium text-gray-900 hover:underline">
                    {f.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{f.plan_code ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FRANCHISE_STATUS_STYLE[f.status]}`}>
                    {FRANCHISE_STATUS_LABEL[f.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {f.onboarding_completed ? '完了' : '未完了'}
                </td>
                <td className="px-4 py-3 text-gray-600">{f.contract_date ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
