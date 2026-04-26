'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Ticket, CheckCircle2, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { UpgradeModal } from '@/components/UpgradeModal'

type TicketStatus = 'open' | 'in_progress' | 'resolved'
type TicketType = 'upgrade_request' | 'general' | 'bug'

interface Ticket {
  id: string
  subject: string
  message: string
  type: TicketType
  feature_key: string | null
  status: TicketStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const TYPE_LABELS: Record<TicketType, string> = {
  upgrade_request: 'Upgrade Request',
  general: 'General',
  bug: 'Bug Report',
}

interface Props { initialTickets: Ticket[] }

export default function SupportClient({ initialTickets }: Props) {
  const [tickets, setTickets] = useState(initialTickets)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newType, setNewType] = useState<TicketType>('general')
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: newSubject, message: newMessage, type: newType }),
    })
    if (res.ok) {
      const { ticket } = await res.json()
      setTickets(prev => [ticket, ...prev])
      setNewSubject(''); setNewMessage(''); setNewType('general')
      setShowNewModal(false)
    }
    setSubmitting(false)
  }

  const openCount = tickets.filter(t => t.status === 'open').length

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-800">Support</h1>
          <p className="text-[8px] text-brand-400 font-semibold mt-0.5">
            Raise tickets with the Consultrack team — upgrade requests, issues, or general enquiries
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-sm font-bold transition"
        >
          <Plus size={14} />
          New ticket
        </button>
      </div>

      {/* Stats */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Open', count: tickets.filter(t => t.status === 'open').length, color: 'text-amber-600' },
            { label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length, color: 'text-blue-600' },
            { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 px-4 py-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* New ticket form (inline) */}
      {showNewModal && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">New support ticket</h3>
            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          </div>
          <form onSubmit={handleSubmitNew} className="px-5 py-4 space-y-3">
            <div className="flex gap-2">
              {(['general', 'upgrade_request', 'bug'] as TicketType[]).map(t => (
                <button key={t} type="button" onClick={() => setNewType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    newType === t ? 'bg-brand-800 text-white border-brand-800' : 'text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
              <input required value={newSubject} onChange={e => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Brief summary of your request" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
              <textarea required rows={4} value={newMessage} onChange={e => setNewMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                placeholder="Describe your issue or request in detail…" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-sm font-bold transition disabled:opacity-60">
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Ticket size={13} />}
                {submitting ? 'Submitting…' : 'Submit ticket'}
              </button>
              <button type="button" onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Ticket size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">No tickets yet</p>
          <p className="text-xs text-slate-400">Raise a ticket to get help from the Consultrack team</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => (
            <div key={t.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
              >
                {t.status === 'resolved'
                  ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  : t.status === 'in_progress'
                  ? <Clock size={16} className="text-blue-500 flex-shrink-0" />
                  : <Clock size={16} className="text-amber-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{t.subject}</p>
                  <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 ${STATUS_STYLES[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
                {expanded === t.id ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
              </button>

              {expanded === t.id && (
                <div className="border-t border-slate-50 px-4 py-3 space-y-2.5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Your message</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{t.message}</p>
                  </div>
                  {t.admin_notes && (
                    <div className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5">
                      <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wide mb-1">Response from Consultrack</p>
                      <p className="text-sm text-brand-800 leading-relaxed">{t.admin_notes}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    {TYPE_LABELS[t.type]} · Ticket #{t.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
