/**
 * Carbey Portal の DB 型 (portal スキーマ, 新スペック版)。
 * supabase gen types を導入したら差し替える。
 */

export type UserRole = 'super_admin' | 'staff' | 'member'
export type UserStatus = 'active' | 'suspended'
export type MemberStatus = 'pending' | 'active' | 'suspended' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'overdue'
export type PlanType = 'semi_auto' | 'full_auto'
export type LeadStatus =
  | 'inquiry'
  | 'consultation'
  | 'proposal'
  | 'contract'
  | 'active'
  | 'suspended'

export type PlanRow = {
  id: string
  code: string
  name: string
  plan_type: PlanType
  monthly_fee_yen: number
  joining_fee_yen: number
  display_order: number
  description: string | null
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}
export type PlanInsert = {
  code: string
  name: string
  plan_type: PlanType
  monthly_fee_yen?: number
  joining_fee_yen?: number
  display_order?: number
  description?: string | null
  features?: string[]
  is_active?: boolean
}

export type PortalUserRow = {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export type MemberRow = {
  id: string
  user_id: string | null
  company_name: string | null
  member_name: string
  phone: string | null
  email: string | null
  address: string | null
  plan_id: string | null
  status: MemberStatus
  joining_fee_yen: number | null
  monthly_fee_yen: number | null
  payment_status: PaymentStatus
  registration_date: string
  last_login_at: string | null
  onboarding_total: number
  onboarding_done: number
  admin_notes: string | null
  created_at: string
  updated_at: string
}
export type MemberInsert = {
  user_id?: string | null
  company_name?: string | null
  member_name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  plan_id?: string | null
  status?: MemberStatus
  joining_fee_yen?: number | null
  monthly_fee_yen?: number | null
  payment_status?: PaymentStatus
  registration_date?: string
  admin_notes?: string | null
}

export type PaymentRow = {
  id: string
  member_id: string
  amount_yen: number
  payment_date: string
  kind: 'joining' | 'monthly' | 'other'
  status: 'pending' | 'confirmed' | 'failed'
  note: string | null
  created_at: string
}

export type CrmLeadRow = {
  id: string
  name: string
  company: string | null
  phone: string | null
  email: string | null
  status: LeadStatus
  source: string | null
  memo: string | null
  converted_member_id: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}
export type CrmLeadInsert = {
  name: string
  company?: string | null
  phone?: string | null
  email?: string | null
  status?: LeadStatus
  source?: string | null
  memo?: string | null
}

export type CrmLeadNoteRow = {
  id: string
  lead_id: string
  author_id: string | null
  body: string
  created_at: string
}

export type NotificationRow = {
  id: string
  user_id: string | null
  audience: 'user' | 'admin'
  kind: string
  title: string
  message: string | null
  is_read: boolean
  created_at: string
}

export type Database = {
  portal: {
    Tables: {
      plans: { Row: PlanRow; Insert: PlanInsert; Update: Partial<PlanInsert> }
      users: { Row: PortalUserRow; Insert: Partial<PortalUserRow>; Update: Partial<PortalUserRow> }
      members: { Row: MemberRow; Insert: MemberInsert; Update: Partial<MemberInsert> }
      payments: { Row: PaymentRow; Insert: Partial<PaymentRow>; Update: Partial<PaymentRow> }
      crm_leads: { Row: CrmLeadRow; Insert: CrmLeadInsert; Update: Partial<CrmLeadInsert> }
      crm_lead_notes: { Row: CrmLeadNoteRow; Insert: Partial<CrmLeadNoteRow>; Update: Partial<CrmLeadNoteRow> }
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow>; Update: Partial<NotificationRow> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
}
