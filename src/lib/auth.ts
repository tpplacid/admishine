import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Employee } from '@/types'
import { redirect } from 'next/navigation'

// cache() deduplicates this across all server components within a single request —
// no matter how many layouts/pages call getEmployee(), Supabase is queried only once.
export const getEmployee = cache(async (): Promise<Employee | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('employees')
    .select('*')
    .eq('email', user.email!)
    .single()

  return data
})

export async function requireAuth() {
  const employee = await getEmployee()
  if (!employee) redirect('/login')
  return employee
}

export async function requireRole(roles: string[]) {
  const employee = await requireAuth()
  if (!roles.includes(employee.role)) redirect('/dashboard')
  return employee
}
