'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, ArrowRight, Check, X } from 'lucide-react'

interface Substage { id?: string; label: string; position: number }
interface Stage {
  id?: string
  key: string
  label: string
  color_bg: string
  color_text: string
  position: number
  sla_days: number | null
  is_won: boolean
  is_lost: boolean
  substages: Substage[]
}
interface Flow { from_stage: string; to_stage: string }

interface Props {
  orgId: string
  initialStages: Stage[]
  initialFlows: Flow[]
}

const COLOR_PRESETS = [
  { bg: 'bg-slate-100',  text: 'text-slate-600',  preview: '#f1f5f9', label: 'Slate'  },
  { bg: 'bg-blue-50',    text: 'text-blue-600',    preview: '#eff6ff', label: 'Blue'   },
  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  preview: '#fefce8', label: 'Yellow' },
  { bg: 'bg-orange-50',  text: 'text-orange-600',  preview: '#fff7ed', label: 'Orange' },
  { bg: 'bg-green-50',   text: 'text-green-600',   preview: '#f0fdf4', label: 'Green'  },
  { bg: 'bg-red-50',     text: 'text-red-600',     preview: '#fef2f2', label: 'Red'    },
  { bg: 'bg-purple-50',  text: 'text-purple-600',  preview: '#faf5ff', label: 'Purple' },
  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  preview: '#eef2ff', label: 'Indigo' },
  { bg: 'bg-pink-50',    text: 'text-pink-600',    preview: '#fdf2f8', label: 'Pink'   },
  { bg: 'bg-teal-50',    text: 'text-teal-600',    preview: '#f0fdfa', label: 'Teal'   },
]

type Tab = 'stages' | 'flow'

export function PipelineClient({ orgId, initialStages, initialFlows }: Props) {
  const [tab, setTab] = useState<Tab>('stages')
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [flows, setFlows] = useState<Flow[]>(initialFlows)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const supabase = createClient()

  // ── Stage CRUD ───────────────────────────────────────────────────────────

  async function addStage() {
    const key = `S${Date.now().toString(36).slice(-4).toUpperCase()}`
    const position = stages.length
    const { data, error } = await supabase.from('org_stages').insert({
      org_id: orgId, key, label: 'New Stage',
      color_bg: 'bg-slate-100', color_text: 'text-slate-600',
      position, sla_days: null, is_won: false, is_lost: false,
    }).select().single()
    if (error) return toast.error(error.message)
    setStages(prev => [...prev, { ...data, substages: [] }])
    setExpanded(data.id)
  }

  async function saveStage(stage: Stage) {
    if (!stage.id) return
    setSaving(stage.id)
    const { error } = await supabase.from('org_stages').update({
      label: stage.label, color_bg: stage.color_bg, color_text: stage.color_text,
      sla_days: stage.sla_days, is_won: stage.is_won, is_lost: stage.is_lost,
    }).eq('id', stage.id)
    if (error) toast.error(error.message)
    else toast.success('Stage saved')
    setSaving(null)
  }

  async function deleteStage(stage: Stage) {
    if (!stage.id) return
    if (!confirm(`Delete stage "${stage.label}"? Leads in this stage won't be affected.`)) return
    const { error } = await supabase.from('org_stages').delete().eq('id', stage.id)
    if (error) return toast.error(error.message)
    setStages(prev => prev.filter(s => s.id !== stage.id))
    setFlows(prev => prev.filter(f => f.from_stage !== stage.key && f.to_stage !== stage.key))
    toast.success('Stage deleted')
  }

  function updateStage(id: string, patch: Partial<Stage>) {
    setStages(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }

  // ── Substage CRUD ────────────────────────────────────────────────────────

  async function addSubstage(stage: Stage) {
    const label = 'New sub-stage'
    const position = stage.substages.length
    const { data, error } = await supabase.from('org_stage_substages').insert({
      org_id: orgId, stage_key: stage.key, label, position,
    }).select().single()
    if (error) return toast.error(error.message)
    setStages(prev => prev.map(s => s.id === stage.id
      ? { ...s, substages: [...s.substages, data] }
      : s))
  }

  async function updateSubstage(stage: Stage, subId: string, label: string) {
    await supabase.from('org_stage_substages').update({ label }).eq('id', subId)
    setStages(prev => prev.map(s => s.id === stage.id
      ? { ...s, substages: s.substages.map(ss => ss.id === subId ? { ...ss, label } : ss) }
      : s))
  }

  async function deleteSubstage(stage: Stage, subId: string) {
    await supabase.from('org_stage_substages').delete().eq('id', subId)
    setStages(prev => prev.map(s => s.id === stage.id
      ? { ...s, substages: s.substages.filter(ss => ss.id !== subId) }
      : s))
  }

  // ── Drag to reorder ──────────────────────────────────────────────────────

  async function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return
    const reordered = [...stages]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(targetIdx, 0, moved)
    const updated = reordered.map((s, i) => ({ ...s, position: i }))
    setStages(updated)
    setDragIdx(null)
    for (const s of updated) {
      if (s.id) await supabase.from('org_stages').update({ position: s.position }).eq('id', s.id)
    }
  }

  // ── Flow toggle ──────────────────────────────────────────────────────────

  async function toggleFlow(from: string, to: string) {
    if (from === to) return
    const exists = flows.some(f => f.from_stage === from && f.to_stage === to)
    if (exists) {
      await supabase.from('org_stage_flows').delete()
        .eq('org_id', orgId).eq('from_stage', from).eq('to_stage', to)
      setFlows(prev => prev.filter(f => !(f.from_stage === from && f.to_stage === to)))
    } else {
      await supabase.from('org_stage_flows').insert({ org_id: orgId, from_stage: from, to_stage: to })
      setFlows(prev => [...prev, { from_stage: from, to_stage: to }])
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-800">Pipeline Configuration</h1>
          <p className="text-[8px] text-brand-400 font-semibold mt-0.5">Define your lead stages, sub-stages, deadlines, and flow connections</p>
        </div>
        {tab === 'stages' && (
          <Button size="sm" onClick={addStage}><Plus size={14} />Add Stage</Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brand-100">
        {(['stages', 'flow'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-colors ${
              tab === t ? 'border-brand-400 text-brand-700' : 'border-transparent text-brand-400 hover:text-brand-600'}`}>
            {t === 'flow' ? 'Flow Map' : 'Stages'}
          </button>
        ))}
      </div>

      {/* ── STAGES TAB ── */}
      {tab === 'stages' && (
        <div className="space-y-2">
          {stages.map((stage, idx) => (
            <div
              key={stage.id || stage.key}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              className={`bg-white border rounded-xl transition-all ${dragIdx === idx ? 'opacity-40' : 'opacity-100'} ${
                expanded === stage.id ? 'border-brand-300 shadow-sm' : 'border-brand-100'}`}
            >
              {/* Stage row */}
              <div className="px-4 py-3 space-y-2">
                {/* Row 1: grip + key badge + label + actions */}
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-brand-300 cursor-grab flex-shrink-0" />
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${stage.color_bg} ${stage.color_text}`}>
                    {stage.key}
                  </span>
                  <input
                    value={stage.label}
                    onChange={e => updateStage(stage.id!, { label: e.target.value })}
                    className="flex-1 text-sm font-semibold text-brand-800 bg-transparent border-0 outline-none focus:ring-0 min-w-0"
                  />
                  <button onClick={() => saveStage(stage)} className="text-brand-400 hover:text-brand-700 transition-colors flex-shrink-0" title="Save">
                    {saving === stage.id ? <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
                  </button>
                  <button onClick={() => setExpanded(expanded === stage.id ? null : stage.id!)} className="text-brand-400 hover:text-brand-700 transition-colors flex-shrink-0">
                    {expanded === stage.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button onClick={() => deleteStage(stage)} className="text-brand-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                {/* Row 2: deadline + won/lost */}
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-xs text-brand-400">Deadline</span>
                  <input
                    type="number"
                    value={stage.sla_days ?? ''}
                    onChange={e => updateStage(stage.id!, { sla_days: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="—"
                    className="w-12 text-xs text-center border border-brand-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  />
                  <span className="text-xs text-brand-400">d</span>
                  <button
                    onClick={() => updateStage(stage.id!, { is_won: !stage.is_won, is_lost: false })}
                    className={`text-xs px-2 py-0.5 rounded font-semibold border transition-colors ${stage.is_won ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-brand-400 border-brand-200'}`}>
                    Won
                  </button>
                  <button
                    onClick={() => updateStage(stage.id!, { is_lost: !stage.is_lost, is_won: false })}
                    className={`text-xs px-2 py-0.5 rounded font-semibold border transition-colors ${stage.is_lost ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-brand-400 border-brand-200'}`}>
                    Lost
                  </button>
                </div>
              </div>

              {/* Expanded: color + substages */}
              {expanded === stage.id && (
                <div className="border-t border-brand-50 px-4 py-4 space-y-4">
                  {/* Color picker */}
                  <div>
                    <p className="text-xs text-brand-500 font-semibold mb-2">Badge colour</p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c.bg}
                          onClick={() => updateStage(stage.id!, { color_bg: c.bg, color_text: c.text })}
                          title={c.label}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            stage.color_bg === c.bg ? 'border-brand-500 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c.preview }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sub-stages */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-brand-500 font-semibold">Sub-stages</p>
                      <button onClick={() => addSubstage(stage)}
                        className="text-xs text-brand-500 hover:text-brand-700 flex items-center gap-1 font-semibold">
                        <Plus size={11} />Add
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {stage.substages.sort((a, b) => a.position - b.position).map(ss => (
                        <div key={ss.id} className="flex items-center gap-2">
                          <input
                            value={ss.label}
                            onChange={e => updateSubstage(stage, ss.id!, e.target.value)}
                            className="flex-1 text-xs px-2 py-1.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 text-brand-700"
                          />
                          <button onClick={() => deleteSubstage(stage, ss.id!)}
                            className="text-brand-300 hover:text-red-500 transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      {stage.substages.length === 0 && (
                        <p className="text-xs text-brand-300 italic">No sub-stages yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {stages.length === 0 && (
            <p className="text-sm text-brand-400 text-center py-8">No stages yet. Add your first stage.</p>
          )}
        </div>
      )}

      {/* ── FLOW MAP TAB ── */}
      {tab === 'flow' && (
        <div className="space-y-6">
          <p className="text-sm text-brand-500">Click a cell to toggle whether a lead can advance from one stage to another. Rows = from, columns = to.</p>

          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="w-32 p-2 text-left text-brand-500 font-semibold">From ↓ / To →</th>
                  {stages.map(s => (
                    <th key={s.key} className="p-2 text-center min-w-[80px]">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.color_bg} ${s.color_text}`}>
                        {s.key}
                      </span>
                      <p className="text-brand-400 font-normal mt-0.5 text-[9px] max-w-[70px] truncate">{s.label}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stages.map(from => (
                  <tr key={from.key} className="border-t border-brand-50">
                    <td className="p-2 pr-4">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${from.color_bg} ${from.color_text}`}>
                        {from.key}
                      </span>
                      <span className="ml-1.5 text-brand-500 text-[10px]">{from.label}</span>
                    </td>
                    {stages.map(to => {
                      const connected = flows.some(f => f.from_stage === from.key && f.to_stage === to.key)
                      const isSelf = from.key === to.key
                      return (
                        <td key={to.key} className="p-2 text-center">
                          {isSelf
                            ? <span className="text-brand-100">—</span>
                            : (
                              <button
                                onClick={() => toggleFlow(from.key, to.key)}
                                className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center mx-auto ${
                                  connected
                                    ? 'bg-brand-400 border-brand-500 text-white shadow-sm'
                                    : 'bg-white border-brand-200 text-brand-200 hover:border-brand-400'}`}>
                                {connected ? <Check size={12} /> : <Plus size={12} />}
                              </button>
                            )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual flowchart */}
          <div>
            <p className="text-xs text-brand-500 font-semibold mb-3">Visual flow</p>
            <div className="bg-brand-50 rounded-xl p-6 overflow-x-auto">
              <FlowChart stages={stages} flows={flows} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Simple flowchart renderer ────────────────────────────────────────────────

function FlowChart({ stages, flows }: { stages: Stage[]; flows: Flow[] }) {
  if (stages.length === 0) return <p className="text-sm text-brand-400 text-center py-4">No stages configured.</p>

  // Build adjacency for layout: topological column assignment
  const columnOf: Record<string, number> = {}
  const toMap: Record<string, string[]> = {}
  for (const s of stages) { toMap[s.key] = []; columnOf[s.key] = -1 }
  for (const f of flows) { if (toMap[f.from_stage]) toMap[f.from_stage].push(f.to_stage) }

  // Simple: use position as column
  const sorted = [...stages].sort((a, b) => a.position - b.position)
  sorted.forEach((s, i) => { columnOf[s.key] = i })

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {sorted.map((s, i) => {
        const hasNext = flows.some(f => f.from_stage === s.key)
        const isLast = i === sorted.length - 1
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${s.color_bg} ${s.color_text} border border-white`}>
                {s.key}
              </span>
              <span className="text-[9px] text-brand-500 text-center max-w-[64px] leading-tight">{s.label}</span>
              {(s.is_won || s.is_lost) && (
                <span className={`text-[8px] font-bold px-1 rounded ${s.is_won ? 'text-green-600' : 'text-red-500'}`}>
                  {s.is_won ? '✓ WON' : '✗ LOST'}
                </span>
              )}
              {s.sla_days && (
                <span className="text-[8px] text-amber-600 font-semibold">{s.sla_days}d deadline</span>
              )}
            </div>
            {!isLast && hasNext && (
              <ArrowRight size={14} className="text-brand-300 flex-shrink-0 mb-4" />
            )}
            {!isLast && !hasNext && (
              <div className="w-4 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
