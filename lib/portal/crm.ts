import { createServiceRoleClient } from '@/lib/supabase/admin'
import type { CrmLeadRow, CrmLeadInsert, CrmLeadNoteRow, MemberRow } from '@/types/database'

export async function listLeads(status?: string): Promise<CrmLeadRow[]> {
  const supabase = createServiceRoleClient()
  let query = supabase.from('crm_leads').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as CrmLeadRow[]
}

export async function getLead(id: string): Promise<CrmLeadRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle<CrmLeadRow>()
  if (error) throw new Error(error.message)
  return data
}

export async function createLead(input: CrmLeadInsert): Promise<CrmLeadRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('crm_leads')
    .insert(input as never)
    .select('*')
    .single<CrmLeadRow>()
  if (error) throw new Error(error.message)
  return data
}

export async function updateLead(id: string, patch: Partial<CrmLeadRow>): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from('crm_leads').update(patch as never).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function listLeadNotes(leadId: string): Promise<CrmLeadNoteRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('crm_lead_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as CrmLeadNoteRow[]
}

export async function addLeadNote(leadId: string, body: string, authorId: string | null): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('crm_lead_notes')
    .insert({ lead_id: leadId, body, author_id: authorId } as never)
  if (error) throw new Error(error.message)
}

/**
 * リードを会員に変換する。members に1行作成し、lead.status='contract' +
 * converted_member_id をセットする。
 */
export async function convertLeadToMember(leadId: string): Promise<MemberRow> {
  const supabase = createServiceRoleClient()
  const lead = await getLead(leadId)
  if (!lead) throw new Error('lead not found')
  if (lead.converted_member_id) throw new Error('already converted')

  const { data: member, error: mErr } = await supabase
    .from('members')
    .insert({
      member_name: lead.name,
      company_name: lead.company,
      phone: lead.phone,
      email: lead.email,
      status: 'pending',
    } as never)
    .select('*')
    .single<MemberRow>()
  if (mErr) throw new Error(mErr.message)

  const { error: lErr } = await supabase
    .from('crm_leads')
    .update({ status: 'contract', converted_member_id: member.id } as never)
    .eq('id', leadId)
  if (lErr) throw new Error(lErr.message)

  return member
}
