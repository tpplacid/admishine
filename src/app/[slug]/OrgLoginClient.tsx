'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Props {
  orgName: string
  orgSlug: string
  logoUrl: string | null
}

export default function OrgLoginClient({ orgName, orgSlug, logoUrl }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 px-4">
      <div className="w-full max-w-sm">

        {/* Org brand — above the card, same as login page org-login mode */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={orgName} className="h-16 object-contain mx-auto mb-3" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-800 flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-3xl uppercase">{orgName.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-slate-900">{orgName}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Sign in to your workspace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-sm font-bold transition disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/login" className="text-xs text-slate-400 hover:text-slate-600 transition">
              ← Switch workspace
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Forgot your workspace URL? Contact your admin.
        </p>
      </div>
    </div>
  )
}
