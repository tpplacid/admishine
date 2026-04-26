import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = createAdminClient()

    const { data: org, error } = await supabase
      .from('orgs')
      .select('id, name, slug, logo_url')
      .eq('slug', slug)
      .single()

    if (error || !org) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ org })
  } catch (err) {
    console.error('[api/org] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
