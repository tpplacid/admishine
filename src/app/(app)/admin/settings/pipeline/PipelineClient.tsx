'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Check, X } from 'lucide-react'

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
interface Props { orgId: string; initialStages: Stage[]; initialFlows: Flow[] }

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

function toDaysHours(val: number | null): { d: number; h: number } {
  if (val == null) return { d: 0, h: 0 }
  const d = Math.floor(val)
  const h = Math.round((val - d) * 24)
  return { d, h }
}

function toDecimalDays(d: number, h: number): number | null {
  if (d === 0 && h === 0) return null
  return d + h / 24
}

export function PipelineClient({ orgId, initialStages, initialFlows }: Props) {
  const [tab, setTab] = useState<Tab>('stages')
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [flows, setFlows] = useState<Flow[]>(initialFlows)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  // SVG flowchart refs
  const chartRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [arrows, setArrows] = useState<Array<{ key: string; d: string }>>([])
  const [chartH, setChartH] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    if (tab !== 'flow') return
    const measure = () => {
      const container = chartRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      setChartH(cRect.height)
      const rects: Record<string, DOMRect> = {}
      for (const [k, el] of Object.entries(nodeRefs.current)) {
        if (el) rects[k] = el.getBoundingClientRect()
      }

      // For each target stage, count how many arrows arrive so we can distribute entry points
      const inbound: Record<string, string[]> = {}
      for (const f of flows) {
        if (!inbound[f.to_stage]) inbound[f.to_stage] = []
        inbound[f.to_stage].push(f.from_stage)
      }
      const stageMap = Object.fromEntries(stages.map(s => [s.key, s]))

      const newArrows = flows.map(f => {
        const fr = rects[f.from_stage]
        const tr = rects[f.to_stage]
        if (!fr || !tr) return null
        const fromS = stageMap[f.from_stage]
        const toS = stageMap[f.to_stage]
        const fromIsMain = !fromS?.is_won && !fromS?.is_lost
        const toIsMain = !toS?.is_won && !toS?.is_lost

        let d: string
        if (fromIsMain && !toIsMain) {
          // Top row → bottom row: exit from bottom of source, enter top of target
          // Distribute entry x across target's top edge based on index
          const arrivals = inbound[f.to_stage] || [f.from_stage]
          const idx = arrivals.indexOf(f.from_stage)
          const total = arrivals.length
          const entryX = tr.left - cRect.left + (tr.width / (total + 1)) * (idx + 1)
          const exitX = fr.left - cRect.left + fr.width * 0.6
          const exitY = fr.bottom - cRect.top
          const entryY = tr.top - cRect.top - 6
          d = `M ${exitX} ${exitY} C ${exitX} ${exitY + 50} ${entryX} ${entryY - 50} ${entryX} ${entryY}`
        } else if (!fromIsMain && toIsMain) {
          // Bottom row → top row (e.g. F → G): exit top of source, enter bottom of target
          const exitX = fr.left - cRect.left + fr.width / 2
          const exitY = fr.top - cRect.top
          const entryX = tr.left - cRect.left + tr.width / 2
          const entryY = tr.bottom - cRect.top + 6
          d = `M ${exitX} ${exitY} C ${exitX} ${exitY - 40} ${entryX} ${entryY + 40} ${entryX} ${entryY}`
        } else {
          // Same row: right edge → left edge horizontal bezier
          const x1 = fr.right - cRect.left
          const y1 = fr.top + fr.height / 2 - cRect.top
          const x2 = tr.left - cRect.left - 6
          const y2 = tr.top + tr.height / 2 - cRect.top
          const dx = Math.max(Math.abs(x2 - x1) * 0.45, 30)
          d = `M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`
        }
        return { key: `${f.from_stage}-${f.to_stage}`, d }
      }).filter(Boolean) as Array<{ key: string; d: string }>
      setArrows(newArrows)
    }
    const t = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(t); window.removeEventListener('resize', measure) }
  }, [tab, stages, flows])

  // ── Stage CRUD ───────────────────────────────────────────────────────────

  async function addStage() {
    const key = `S${Date.now().toString(36).slice(-4).toUpperCase()}`
    const { data, error } = await supabase.from('org_stages').insert({
      org_id: orgId, key, label: 'New Stage',
      color_bg: 'bg-slate-100', color_text: 'text-slate-600',
      position: stages.length, sla_days: null, is_won: false, is_lost: false,
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
    const { data, error } = await supabase.from('org_stage_substages').insert({
      org_id: orgId, stage_key: stage.key, label: 'New sub-stage', position: stage.substages.length,
    }).select().single()
    if (error) return toast.error(error.message)
    setStages(prev => prev.map(s => s.id === stage.id ? { ...s, substages: [...s.substages, data] } : s))
  }

  async function updateSubstage(stage: Stage, subId: string, label: string) {
    await supabase.from('org_stage_substages').update({ label }).eq('id', subId)
    setStages(prev => prev.map(s => s.id === stage.id
      ? { ...s, substages: s.substages.map(ss => ss.id === subId ? { ...ss, label } : ss) } : s))
  }

  async function deleteSubstage(stage: Stage, subId: string) {
    await supabase.from('org_stage_substages').delete().eq('id', subId)
    setStages(prev => prev.map(s => s.id === stage.id
      ? { ...s, substages: s.substages.filter(ss => ss.id !== subId) } : s))
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
      await supabase.from('org_stage_flows').delete().eq('org_id', orgId).eq('from_stage', from).eq('to_stage', to)
      setFlows(prev => prev.filter(f => !(f.from_stage === from && f.to_stage === to)))
    } else {
      await supabase.from('org_stage_flows').insert({ org_id: orgId, from_stage: from, to_stage: to })
      setFlows(prev => [...prev, { from_stage: from, to_stage: to }])
    }
  }

  const sorted = [...stages].sort((a, b) => a.position - b.position)
  const mainStages = sorted.filter(s => !s.is_won && !s.is_lost)
  const terminalStages = sorted.filter(s => s.is_won || s.is_lost)

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-800">Pipeline Configuration</h1>
          <p className="text-[8px] text-brand-400 font-semibold mt-0.5">Define your lead stages, sub-stages, deadlines, and flow connections</p>
        </div>
        {tab === 'stages' && <Button size="sm" onClick={addStage}><Plus size={14} />Add Stage</Button>}
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
            <div key={stage.id || stage.key} draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              className={`bg-white border rounded-xl transition-all ${dragIdx === idx ? 'opacity-40' : ''} ${
                expanded === stage.id ? 'border-brand-300 shadow-sm' : 'border-brand-100'}`}>

              <div className="px-4 py-3 space-y-2">
                {/* Row 1: grip + key badge + label + actions */}
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-brand-300 cursor-grab flex-shrink-0" />
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${stage.color_bg} ${stage.color_text}`}>
                    {stage.key}
                  </span>
                  <input value={stage.label} onChange={e => updateStage(stage.id!, { label: e.target.value })}
                    className="flex-1 text-sm font-semibold text-brand-800 bg-transparent border-0 outline-none focus:ring-0 min-w-0" />
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
                <div className="flex items-center gap-2 pl-6 flex-wrap">
                  <span className="text-xs text-brand-400">Deadline</span>
                  {(() => {
                    const { d, h } = toDaysHours(stage.sla_days)
                    return <>
                      <input type="number" min={0} value={d}
                        onChange={e => updateStage(stage.id!, { sla_days: toDecimalDays(parseInt(e.target.value) || 0, h) })}
                        className="w-10 text-xs text-center border border-brand-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-400" />
                      <span className="text-xs text-brand-400">d</span>
                      <input type="number" min={0} max={23} value={h}
                        onChange={e => updateStage(stage.id!, { sla_days: toDecimalDays(d, parseInt(e.target.value) || 0) })}
                        className="w-10 text-xs text-center border border-brand-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-400" />
                      <span className="text-xs text-brand-400">h</span>
                    </>
                  })()}
                  <button onClick={() => updateStage(stage.id!, { is_won: !stage.is_won, is_lost: false })}
                    className={`text-xs px-2 py-0.5 rounded font-semibold border transition-colors ${stage.is_won ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-brand-400 border-brand-200'}`}>
                    Won
                  </button>
                  <button onClick={() => updateStage(stage.id!, { is_lost: !stage.is_lost, is_won: false })}
                    className={`text-xs px-2 py-0.5 rounded font-semibold border transition-colors ${stage.is_lost ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-brand-400 border-brand-200'}`}>
                    Lost
                  </button>
                </div>
              </div>

              {/* Expanded: color + substages */}
              {expanded === stage.id && (
                <div className="border-t border-brand-50 px-4 py-4 space-y-4">
                  <div>
                    <p className="text-xs text-brand-500 font-semibold mb-2">Badge colour</p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map(c => (
                        <button key={c.bg} onClick={() => updateStage(stage.id!, { color_bg: c.bg, color_text: c.text })}
                          title={c.label}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${stage.color_bg === c.bg ? 'border-brand-500 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c.preview }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-brand-500 font-semibold">Sub-stages</p>
                      <button onClick={() => addSubstage(stage)} className="text-xs text-brand-500 hover:text-brand-700 flex items-center gap-1 font-semibold">
                        <Plus size={11} />Add
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {stage.substages.sort((a, b) => a.position - b.position).map(ss => (
                        <div key={ss.id} className="flex items-center gap-2">
                          <input value={ss.label} onChange={e => updateSubstage(stage, ss.id!, e.target.value)}
                            className="flex-1 text-xs px-2 py-1.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 text-brand-700" />
                          <button onClick={() => deleteSubstage(stage, ss.id!)} className="text-brand-300 hover:text-red-500 transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      {stage.substages.length === 0 && <p className="text-xs text-brand-300 italic">No sub-stages yet</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {stages.length === 0 && <p className="text-sm text-brand-400 text-center py-8">No stages yet. Add your first stage.</p>}
        </div>
      )}

      {/* ── FLOW MAP TAB ── */}
      {tab === 'flow' && (
        <div className="space-y-6">
          {/* Per-stage accordion */}
          <div className="space-y-2">
            {sorted.map(from => {
              const connections = flows.filter(f => f.from_stage === from.key)
              const isOpen = expandedFlow === from.key
              return (
                <div key={from.key} className="bg-white border border-brand-100 rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedFlow(isOpen ? null : from.key)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 ${from.color_bg} ${from.color_text}`}>{from.key}</span>
                      <span className="text-sm font-semibold text-brand-800">{from.label}</span>
                      {from.is_won && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">WON</span>}
                      {from.is_lost && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">LOST</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {connections.length > 0 && (
                        <div className="flex gap-1">
                          {connections.map(c => {
                            const ts = stages.find(s => s.key === c.to_stage)
                            return ts ? (
                              <span key={c.to_stage} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ts.color_bg} ${ts.color_text}`}>{ts.key}</span>
                            ) : null
                          })}
                        </div>
                      )}
                      {connections.length === 0 && <span className="text-xs text-brand-300">no transitions</span>}
                      {isOpen ? <ChevronUp size={14} className="text-brand-400" /> : <ChevronDown size={14} className="text-brand-400" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-brand-50 px-4 py-3">
                      <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-wide mb-2">Lead can move to</p>
                      <div className="flex flex-wrap gap-2">
                        {sorted.filter(s => s.key !== from.key).map(to => {
                          const on = flows.some(f => f.from_stage === from.key && f.to_stage === to.key)
                          return (
                            <button key={to.key} onClick={() => toggleFlow(from.key, to.key)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                on ? `${to.color_bg} ${to.color_text} border-current shadow-sm` : 'bg-white text-brand-400 border-brand-200 hover:border-brand-400'}`}>
                              {on && <Check size={10} />}
                              {to.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Visual flowchart */}
          <div>
            <p className="text-xs text-brand-500 font-semibold mb-3">Visual flow</p>
            <div className="bg-brand-50 rounded-xl p-6 overflow-x-auto">
              <div ref={chartRef} className="relative" style={{ minHeight: terminalStages.length > 0 ? 220 : 80 }}>
                {/* Main stages */}
                <div className="flex flex-wrap gap-3 mb-16">
                  {mainStages.map(s => (
                    <div key={s.key} ref={el => { nodeRefs.current[s.key] = el }}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold shadow-sm min-w-[72px] ${s.color_bg} ${s.color_text}`}>
                      <span className="text-sm font-black">{s.key}</span>
                      <span className="text-[9px] font-normal text-center leading-tight mt-0.5 max-w-[64px]">{s.label}</span>
                    </div>
                  ))}
                </div>
                {/* Terminal stages */}
                {terminalStages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {terminalStages.map(s => (
                      <div key={s.key} ref={el => { nodeRefs.current[s.key] = el }}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold shadow-sm min-w-[72px] ${s.color_bg} ${s.color_text}`}>
                        <span className="text-sm font-black">{s.key}</span>
                        <span className="text-[9px] font-normal text-center leading-tight mt-0.5 max-w-[64px]">{s.label}</span>
                        <span className={`text-[8px] font-bold mt-0.5 ${s.is_won ? 'text-green-600' : 'text-red-500'}`}>
                          {s.is_won ? '✓ WON' : '✗ LOST'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* SVG arrows */}
                <svg className="absolute inset-0 pointer-events-none overflow-visible"
                  width="100%" height={chartH || '100%'} style={{ position: 'absolute', top: 0, left: 0 }}>
                  <defs>
                    <marker id="arr" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                      <polygon points="0 0, 7 2.5, 0 5" fill="#3d9191" fillOpacity="0.6" />
                    </marker>
                  </defs>
                  {arrows.map(a => (
                    <path key={a.key} d={a.d} stroke="#3d9191" strokeWidth="1.5"
                      strokeOpacity="0.5" fill="none" markerEnd="url(#arr)" />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
