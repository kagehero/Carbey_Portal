import { createServiceRoleClient } from '@/lib/supabase/admin'
import type { FranchiseRow, FranchiseInsert, PlanRow } from '@/types/database'

/**
 * 加盟店データアクセス。本部管理画面用。
 * 呼び出し側で必ず requireAdmin 済みであること (service-role は RLS バイパスのため)。
 */

export async function listFranchises(): Promise<FranchiseRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('franchises')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getFranchise(id: string): Promise<FranchiseRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from('franchises').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function createFranchise(input: FranchiseInsert): Promise<FranchiseRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('franchises')
    .insert(input as never)
    .select('*')
    .single<FranchiseRow>()
  if (error) throw new Error(error.message)
  return data
}

export async function listPlans(): Promise<PlanRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}
