import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'

export default async function Home() {
  const session = await getSessionUser()
  if (!session) redirect('/login')
  redirect(session.role === 'admin' ? '/admin/franchises' : '/portal/dashboard')
}
