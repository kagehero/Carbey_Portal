'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createFranchise } from '@/lib/portal/franchises'
import type { FranchiseStatus } from '@/types/database'

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? null : s
}

export async function createFranchiseAction(formData: FormData) {
  await requireAdmin()

  const name = str(formData.get('name'))
  if (!name) {
    redirect('/admin/franchises/new?error=name_required')
  }

  const status = (str(formData.get('status')) ?? 'active') as FranchiseStatus
  const monthlyFeeRaw = str(formData.get('monthly_fee_yen'))

  const franchise = await createFranchise({
    name,
    status,
    plan_code: str(formData.get('plan_code')),
    email: str(formData.get('email')),
    phone_mobile: str(formData.get('phone_mobile')),
    phone_landline: str(formData.get('phone_landline')),
    address: str(formData.get('address')),
    delivery_name: str(formData.get('delivery_name')),
    delivery_address: str(formData.get('delivery_address')),
    delivery_contact: str(formData.get('delivery_contact')),
    contract_date: str(formData.get('contract_date')),
    monthly_fee_yen: monthlyFeeRaw ? Number(monthlyFeeRaw) : null,
  })

  revalidatePath('/admin/franchises')
  redirect(`/admin/franchises/${franchise.id}`)
}
