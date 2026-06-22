import { z } from 'zod'

const publicSupabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
})

/** Validates public Supabase env. Safe on server or in client bundles (values are public). */
export function getPublicSupabaseConfig() {
  const parsed = publicSupabaseSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors
    throw new Error(`Invalid Supabase env: ${JSON.stringify(msg)}`)
  }
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey } = parsed.data
  return { url, anonKey }
}

export function getServiceRoleKey(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (k == null || k.trim() === '') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  return k
}
