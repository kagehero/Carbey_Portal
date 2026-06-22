import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'

export default async function Home() {
  const session = await getSessionUser()
  if (!session) redirect('/login')
  const staff = session.role === 'super_admin' || session.role === 'staff'
  redirect(staff ? '/admin/dashboard' : '/portal/dashboard')
}
