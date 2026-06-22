'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/auth/session'
import { createLead, updateLead, addLeadNote, convertLeadToMember } from '@/lib/portal/crm'
import { notifyAdmin } from '@/lib/portal/notifications'
import type { LeadStatus } from '@/types/database'

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? null : s
}

export async function createLeadAction(formData: FormData) {
  await requireStaff()
  const name = str(formData.get('name'))
  if (!name) redirect('/admin/crm/new?error=name_required')

  const lead = await createLead({
    name,
    company: str(formData.get('company')),
    phone: str(formData.get('phone')),
    email: str(formData.get('email')),
    source: str(formData.get('source')),
    memo: str(formData.get('memo')),
    status: (str(formData.get('status')) ?? 'inquiry') as LeadStatus,
  })
  revalidatePath('/admin/crm')
  redirect(`/admin/crm/${lead.id}`)
}

export async function updateLeadStatusAction(formData: FormData) {
  await requireStaff()
  const id = str(formData.get('id'))
  const status = str(formData.get('status')) as LeadStatus | null
  if (!id || !status) redirect('/admin/crm')
  await updateLead(id, { status })
  revalidatePath(`/admin/crm/${id}`)
  redirect(`/admin/crm/${id}`)
}

export async function addLeadNoteAction(formData: FormData) {
  const gate = await requireStaff()
  const id = str(formData.get('id'))
  const body = str(formData.get('body'))
  if (!id || !body) redirect(`/admin/crm/${id ?? ''}`)
  await addLeadNote(id, body, gate.userId)
  revalidatePath(`/admin/crm/${id}`)
  redirect(`/admin/crm/${id}`)
}

export async function convertLeadAction(formData: FormData) {
  await requireStaff()
  const id = str(formData.get('id'))
  if (!id) redirect('/admin/crm')
  const member = await convertLeadToMember(id)
  await notifyAdmin('member_registered', 'リードを会員に変換', `${member.member_name} を会員化しました`)
  revalidatePath('/admin/members')
  redirect(`/admin/members/${member.id}`)
}
