import { Check, X } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { FEATURES, FEATURE_LABEL, ACCESS_MATRIX, type Access } from '@/lib/auth/permissions'
import { ROLE_LABEL } from '@/lib/portal/labels'
import type { UserRole } from '@/types/database'

export const dynamic = 'force-dynamic'

const ROLES: UserRole[] = ['admin', 'crm_staff', 'chat_only', 'member']

function AccessCell({ access }: { access: Access }) {
  if (access === 'full') return <Check className="mx-auto h-4 w-4 text-green-600" />
  if (access === 'none') return <X className="mx-auto h-4 w-4 text-slate-300" />
  if (access === 'own')
    return <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">自分のみ</span>
  return <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-700">任意</span>
}

export default async function PermissionsPage() {
  await requireAdmin()

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">権限マトリクス</h1>
      <p className="mb-6 text-sm text-slate-500">
        機能ごとのロール別アクセス権。コードで定義された単一の真実の源（`lib/auth/permissions.ts`）。
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">機能</th>
              {ROLES.map((r) => (
                <th key={r} className="px-4 py-3 text-center font-medium">
                  {ROLE_LABEL[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {FEATURES.map((f) => (
              <tr key={f}>
                <td className="px-4 py-3 font-medium text-slate-900">{FEATURE_LABEL[f]}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-4 py-3 text-center">
                    <AccessCell access={ACCESS_MATRIX[f][r]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-600" /> 全件アクセス</span>
        <span className="flex items-center gap-1"><span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">自分のみ</span> 自分のデータのみ</span>
        <span className="flex items-center gap-1"><span className="rounded bg-yellow-50 px-1.5 py-0.5 text-yellow-700">任意</span> プラン等で可変</span>
        <span className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-slate-300" /> アクセス不可</span>
      </div>
    </div>
  )
}
