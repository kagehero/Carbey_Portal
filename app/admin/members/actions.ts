'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/auth/session'
import { createMember, updateMember } from '@/lib/portal/members'
import { notifyAdmin } from '@/lib/portal/notifications'
import type { MemberStatus, PaymentStatus } from '@/types/database'

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? null : s
}
function num(v: FormDataEntryValue | null): number | null {
  const s = str(v)
  return s == null ? null : Number(s)
}

export async function createMemberAction(formData: FormData) {
  await requireStaff()
  const member_name = str(formData.get('member_name'))
  if (!member_name) redirect('/admin/members/new?error=name_required')

  const m = await createMember({
    member_name,
    company_name: str(formData.get('company_name')),
    email: str(formData.get('email')),
    phone: str(formData.get('phone')),
    address: str(formData.get('address')),
    plan_id: str(formData.get('plan_id')),
    status: (str(formData.get('status')) ?? 'pending') as MemberStatus,
    joining_fee_yen: num(formData.get('joining_fee_yen')),
    monthly_fee_yen: num(formData.get('monthly_fee_yen')),
    admin_notes: str(formData.get('admin_notes')),
  })

  await notifyAdmin('member_registered', '新規会員登録', `${member_name} を登録しました`)
  revalidatePath('/admin/members')
  redirect(`/admin/members/${m.id}`)
}

export async function updateMemberAction(formData: FormData) {
  await requireStaff()
  const id = str(formData.get('id'))
  if (!id) redirect('/admin/members')

  await updateMember(id, {
    member_name: str(formData.get('member_name')) ?? undefined,
    company_name: str(formData.get('company_name')),
    email: str(formData.get('email')),
    phone: str(formData.get('phone')),
    address: str(formData.get('address')),
    plan_id: str(formData.get('plan_id')),
    status: (str(formData.get('status')) ?? undefined) as MemberStatus | undefined,
    payment_status: (str(formData.get('payment_status')) ?? undefined) as PaymentStatus | undefined,
    joining_fee_yen: num(formData.get('joining_fee_yen')),
    monthly_fee_yen: num(formData.get('monthly_fee_yen')),
    admin_notes: str(formData.get('admin_notes')),
  })

  revalidatePath(`/admin/members/${id}`)
  redirect(`/admin/members/${id}`)
}
