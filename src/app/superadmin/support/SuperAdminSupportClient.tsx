'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

type TicketStatus = 'open' | 'in_progress' | 'resolved'
type TicketType = 'upgrade_request' | 'general' | 'bug'

interface Ticket {
  id: string
  org_id: string
  org_name: string
  employee_name: string
  employee_email: string
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
  upgrade_request: '🔒 Upgrade',
  general: 'General',
  bug: '🐛 Bug',
}

const FEATURE_LABELS: Record<string, string> = {
  lead_crm: 'Lead CRM',
  sla: 'Deadline Breach',
  pipeline: 'Pipeline',
  roles: 'Roles',
  attendance: 'Attendance',
  meta: 'Meta Integration',
}

interface Props { initialTickets: Ticket[] }

export default function SuperAdminSupportClient({ initialTickets }: Props) {
  const [tickets, setTickets] = useState(initialTickets)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const filtered = filterStatus === 'all' ? tickets : tickets.filter(t => t.status === filterStatus)

  async function updateTicket(id: string, status: TicketStatus) {
    setSaving(id)
    const adminNotes = notes[id] ?? tickets.find(t => t.id === id)?.admin_notes ?? ''
    const res = await fetch(`/api/superadmin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    })
    if (res.ok) {
      const { ticket } = await res.json()
      setTickets(prev => prev.map(t => t.id === id ? ticket : t))
    }
    setSaving(null)
  }

  async function saveNotes(id: string) {
    setSaving(id + '-notes')
    const ticket = tickets.find(t => t.id === id)!
    const res = await fetch(`/api/superadmin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: ticket.status, admin_notes: notes[id] ?? ticket.admin_notes ?? '' }),
    })
    if (res.ok) {
      const { ticket: updated } = await res.json()
      setTickets(prev => prev.map(t => t.id === id ? updated : t))
    }
    setSaving(null)
  }

  const openCount = tickets.filter(t => t.status === 'open').length
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-slate-400 text-sm mt-0.5">Requests raised by orgs across all workspaces</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Open', count: openCount, color: 'text-amber-400', icon: <AlertCircle size={18} /> },
            { label: 'In Progress', count: inProgressCount, color: 'text-blue-400', icon: <Clock size={18} /> },
            { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, color: 'text-green-400', icon: <CheckCircle2 size={18} /> },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className={s.color}>{s.icon}</span>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-1 mb-4">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${
                filterStatus === f ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}>
              {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span className="ml-1.5 opacity-70">{tickets.filter(t => t.status === f).length}</span>}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No tickets {filterStatus !== 'all' ? `with status "${STATUS_LABELS[filterStatus as TicketStatus]}"` : 'yet'}.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(ticket => (
              <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-800/50 transition-colors"
                >
                  {ticket.status === 'resolved'
                    ? <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
                    : ticket.status === 'in_progress'
                    ? <Clock size={15} className="text-blue-400 flex-shrink-0" />
                    : <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">{ticket.subject}</span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">#{ticket.id.slice(0,8).toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="text-teal-400 font-semibold">{ticket.org_name}</span>
                      {' · '}{ticket.employee_name}
                      {' · '}{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500">{TYPE_LABELS[ticket.type]}</span>
                    {ticket.feature_key && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-400 font-semibold border border-amber-800/40">
                        {FEATURE_LABELS[ticket.feature_key] || ticket.feature_key}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[ticket.status]}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                    {expanded === ticket.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded === ticket.id && (
                  <div className="border-t border-slate-800 px-4 py-4 space-y-4">
                    {/* Contact info */}
                    <div className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">{ticket.employee_name}</span>
                      {' '}·{' '}{ticket.employee_email}
                    </div>

                    {/* Message */}
                    <div className="bg-slate-800/60 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Message</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                    </div>

                    {/* Admin response */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Your response (shown to org)</p>
                      <textarea
                        rows={3}
                        value={notes[ticket.id] ?? ticket.admin_notes ?? ''}
                        onChange={e => setNotes(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        placeholder="Add a note or response visible to the org admin…"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status buttons */}
                      {(['open', 'in_progress', 'resolved'] as TicketStatus[]).map(s => (
                        <button key={s} onClick={() => updateTicket(ticket.id, s)}
                          disabled={saving === ticket.id || ticket.status === s}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-40 ${
                            ticket.status === s
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                          }`}>
                          {saving === ticket.id ? <Loader2 size={11} className="animate-spin inline mr-1" /> : null}
                          {STATUS_LABELS[s]}
                        </button>
                      ))}

                      <div className="flex-1" />

                      <button onClick={() => saveNotes(ticket.id)}
                        disabled={saving === ticket.id + '-notes'}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition disabled:opacity-60 flex items-center gap-1.5">
                        {saving === ticket.id + '-notes' ? <Loader2 size={11} className="animate-spin" /> : null}
                        Save response
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
