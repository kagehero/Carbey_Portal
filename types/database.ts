/**
 * Carbey Portal の DB 型 (portal スキーマ)。
 *
 * 既存 Carbey の自動生成型とは別に、本システムが使う portal スキーマだけを
 * 手書きで定義する。supabase gen types を導入したら差し替える。
 */

export type FranchiseStatus = 'active' | 'suspended' | 'terminated'
export type MembershipRole = 'admin' | 'franchise' | 'crm_staff' | 'chat_only'
export type PlanType = 'semi_auto' | 'full_auto'
export type ContractStatus = 'active' | 'suspended' | 'terminated'
export type DealStatus = 'open' | 'in_progress' | 'won' | 'lost'

export type PlanRow = {
  code: string
  name: string
  plan_type: PlanType
  display_order: number
  description: string | null
  created_at: string
}

export type FranchiseRow = {
  id: string
  name: string
  status: FranchiseStatus
  plan_code: string | null
  address: string | null
  phone_mobile: string | null
  phone_landline: string | null
  email: string | null
  delivery_name: string | null
  delivery_address: string | null
  delivery_contact: string | null
  contract_date: string | null
  monthly_fee_yen: number | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type FranchiseInsert = {
  id?: string
  name: string
  status?: FranchiseStatus
  plan_code?: string | null
  address?: string | null
  phone_mobile?: string | null
  phone_landline?: string | null
  email?: string | null
  delivery_name?: string | null
  delivery_address?: string | null
  delivery_contact?: string | null
  contract_date?: string | null
  monthly_fee_yen?: number | null
  onboarding_completed?: boolean
}

export type MembershipRow = {
  user_id: string
  franchise_id: string | null
  role: MembershipRole
  display_name: string | null
  created_at: string
  updated_at: string
}

export type ContractRow = {
  id: string
  franchise_id: string
  plan_code: string | null
  status: ContractStatus
  started_at: string
  ended_at: string | null
  note: string | null
  created_at: string
}

export type CrmCustomerRow = {
  id: string
  franchise_id: string | null
  name: string
  phone: string | null
  email: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export type CrmDealRow = {
  id: string
  customer_id: string
  status: DealStatus
  title: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  portal: {
    Tables: {
      plans: { Row: PlanRow; Insert: Partial<PlanRow>; Update: Partial<PlanRow> }
      franchises: { Row: FranchiseRow; Insert: FranchiseInsert; Update: Partial<FranchiseInsert> }
      memberships: { Row: MembershipRow; Insert: Partial<MembershipRow>; Update: Partial<MembershipRow> }
      contracts: { Row: ContractRow; Insert: Partial<ContractRow>; Update: Partial<ContractRow> }
      crm_customers: { Row: CrmCustomerRow; Insert: Partial<CrmCustomerRow>; Update: Partial<CrmCustomerRow> }
      crm_deals: { Row: CrmDealRow; Insert: Partial<CrmDealRow>; Update: Partial<CrmDealRow> }
    }
    // GenericSchema を満たすため空オブジェクトにする (never だと Schema 推論が壊れる)
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
}
