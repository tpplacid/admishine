'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Check, X, GitBranch, MousePointer2,
} from 'lucide-react'

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
  { bg: 'bg-slate-100',  text: 'text-slate-600',  preview: '#f1f5f9', hex: '#475569', label: 'Slate'  },
  { bg: 'bg-blue-50',    text: 'text-blue-600',    preview: '#eff6ff', hex: '#2563eb', label: 'Blue'   },
  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  preview: '#fefce8', hex: '#b45309', label: 'Yellow' },
  { bg: 'bg-orange-50',  text: 'text-orange-600',  preview: '#fff7ed', hex: '#ea580c', label: 'Orange' },
  { bg: 'bg-green-50',   text: 'text-green-600',   preview: '#f0fdf4', hex: '#16a34a', label: 'Green'  },
  { bg: 'bg-red-50',     text: 'text-red-600',     preview: '#fef2f2', hex: '#dc2626', label: 'Red'    },
  { bg: 'bg-purple-50',  text: 'text-purple-600',  preview: '#faf5ff', hex: '#9333ea', label: 'Purple' },
  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  preview: '#eef2ff', hex: '#4f46e5', label: 'Indigo' },
  { bg: 'bg-pink-50',    text: 'text-pink-600',    preview: '#fdf2f8', hex: '#db2777', label: 'Pink'   },
  { bg: 'bg-teal-50',    text: 'text-teal-600',    preview: '#f0fdfa', hex: '#0d9488', label: 'Teal'   },
]

const TEXT_TO_HEX: Record<string, string> = Object.fromEntries(
  COLOR_PRESETS.map(c => [c.text, c.hex])
)

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

// ── Canvas layout constants ─────────────────────────────────────────────────
const NW = 148   // node width
const NH = 64    // node height
const HG = 52    // horizontal gap between nodes
const VG = 88    // vertical gap between rows
const PAD = 28   // canvas padding
const COLS = 4   // main stages per row

function getPositions(mainStages: Stage[], terminalStages: Stage[]) {
  const pos: Record<string, { x: number; y: number }> = {}
  mainStages.forEach((s, i) => {
    pos[s.key] = {
      x: PAD + (i % COLS) * (NW + HG),
      y: PAD + Math.floor(i / COLS) * (NH + VG),
    }
  })
  const mainRows = Math.ceil(mainStages.length / COLS)
  const termY = PAD + mainRows * (NH + VG) + 32
  terminalStages.forEach((s, i) => {
    pos[s.key] = { x: PAD + i * (NW + HG), y: termY }
  })
  return pos
}

function buildArrows(flows: Flow[], pos: Record<string, { x: number; y: number }>) {
  return flows.map(f => {
    const fp = pos[f.from_stage]
    const tp = pos[f.to_stage]
    if (!fp || !tp) return null
    const fromRowY = fp.y
    const toRowY = tp.y

    let d: string
    if (Math.abs(fromRowY - toRowY) < 4) {
      // Same row — right edge → left edge horizontal bezier
      const x1 = fp.x + NW, y1 = fp.y + NH / 2
      const x2 = tp.x,      y2 = tp.y + NH / 2
      const cx = (x2 - x1) * 0.45
      if (x2 > x1) {
        d = `M${x1},${y1} C${x1 + cx},${y1} ${x2 - cx},${y2} ${x2},${y2}`
      } else {
        // Backwards on same row — arc above
        const mid = (fp.x + tp.x + NW) / 2
        const above = fromRowY - 36
        d = `M${x1},${y1} C${x1 + 32},${y1} ${mid},${above} ${mid},${above}
             C${mid},${above} ${x2 - 32},${y2} ${x2},${y2}`
      }
    } else if (toRowY > fromRowY) {
      // Going down — exit bottom center, enter top center
      const x1 = fp.x + NW / 2, y1 = fp.y + NH
      const x2 = tp.x + NW / 2, y2 = tp.y
      d = `M${x1},${y1} C${x1},${y1 + 36} ${x2},${y2 - 36} ${x2},${y2}`
    } else {
      // Going up — exit top center, enter bottom center
      const x1 = fp.x + NW / 2, y1 = fp.y
      const x2 = tp.x + NW / 2, y2 = tp.y + NH
      d = `M${x1},${y1} C${x1},${y1 - 36} ${x2},${y2 + 36} ${x2},${y2}`
    }
    return { key: `${f.from_stage}-${f.to_stage}`, d }
  }).filter(Boolean) as { key: string; d: string }[]
}

// ── Main component ──────────────────────────────────────────────────────────

export function PipelineClient({ orgId, initialStages, initialFlows }: Props) {
  const [tab, setTab] = useState<Tab>('stages')
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [flows, setFlows] = useState<Flow[]>(initialFlows)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const supabase = createClient()

  // ── Stage CRUD ─────────────────────────────────────────────────────────────

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

  // ── Substage CRUD ──────────────────────────────────────────────────────────

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

  // ── Drag to reorder ────────────────────────────────────────────────────────

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

  // ── Flow toggle ────────────────────────────────────────────────────────────

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
  const selectedStage = sorted.find(s => s.key === selectedKey) ?? null

  // Canvas geometry (computed once per render)
  const positions = getPositions(mainStages, terminalStages)
  const arrows = buildArrows(flows, positions)
  const maxMainCols = Math.min(mainStages.length, COLS)
  const maxTermCols = terminalStages.length
  const canvasW = PAD * 2 + Math.max(maxMainCols, maxTermCols) * (NW + HG) - HG
  const mainRows = Math.ceil(mainStages.length / COLS)
  const termY = PAD + mainRows * (NH + VG) + 32
  const canvasH = (terminalStages.length > 0 ? termY + NH : PAD + mainRows * (NH + VG) - VG + NH) + PAD

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-800">Pipeline Configuration</h1>
          <p className="text-[8px] text-brand-400 font-semibold mt-0.5">Define your lead stages, sub-stages, deadlines, and flow connections</p>
        </div>
        {tab === 'stages' && <Button size="sm" onClick={addStage}><Plus size={14} />Add Stage</Button>}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-brand-100 px-6">
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2 max-w-3xl">
            {stages.map((stage, idx) => (
              <div key={stage.id || stage.key} draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                className={`bg-white border rounded-xl transition-all ${dragIdx === idx ? 'opacity-40' : ''} ${
                  expanded === stage.id ? 'border-brand-300 shadow-sm' : 'border-brand-100'}`}>

                <div className="px-4 py-3 space-y-2">
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
        </div>
      )}

      {/* ── FLOW MAP TAB ── */}
      {tab === 'flow' && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── Canvas ── */}
          <div
            className="flex-1 overflow-auto relative"
            style={{
              background: '#f4f6f8',
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
            }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedKey(null) }}
          >
            <div
              className="relative"
              style={{ width: canvasW, height: canvasH, minWidth: '100%', minHeight: '100%' }}
            >
              {/* SVG layer — arrows */}
              <svg
                style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
                width={canvasW} height={canvasH}
              >
                <defs>
                  <marker id="ah" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 9 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                  <marker id="ah-active" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 9 3.5, 0 7" fill="#3d9191" />
                  </marker>
                </defs>
                {arrows.map(a => {
                  const fromSelected = selectedKey && a.key.startsWith(selectedKey + '-')
                  const toSelected = selectedKey && a.key.endsWith('-' + selectedKey)
                  const highlight = fromSelected || toSelected
                  return (
                    <path
                      key={a.key}
                      d={a.d}
                      stroke={highlight ? '#3d9191' : '#94a3b8'}
                      strokeWidth={highlight ? 2 : 1.5}
                      fill="none"
                      strokeDasharray={toSelected ? '5,3' : undefined}
                      markerEnd={highlight ? 'url(#ah-active)' : 'url(#ah)'}
                      style={{ transition: 'stroke 0.15s, stroke-width 0.15s' }}
                    />
                  )
                })}
              </svg>

              {/* Stage nodes */}
              {sorted.map(s => {
                const pos = positions[s.key]
                if (!pos) return null
                const isSelected = selectedKey === s.key
                const accentColor = TEXT_TO_HEX[s.color_text] ?? '#475569'
                const outgoing = flows.filter(f => f.from_stage === s.key).length
                const incoming = flows.filter(f => f.to_stage === s.key).length

                return (
                  <div
                    key={s.key}
                    onClick={e => { e.stopPropagation(); setSelectedKey(isSelected ? null : s.key) }}
                    style={{
                      position: 'absolute',
                      left: pos.x,
                      top: pos.y,
                      width: NW,
                      height: NH,
                    }}
                    className="cursor-pointer group"
                  >
                    <div
                      className={`w-full h-full bg-white flex items-stretch rounded-lg overflow-hidden transition-all duration-150 ${
                        isSelected
                          ? 'shadow-[0_0_0_2px_#3d9191,0_4px_16px_rgba(61,145,145,0.2)]'
                          : 'shadow-[0_1px_4px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.13),0_0_0_1px_rgba(0,0,0,0.09)]'
                      }`}
                    >
                      {/* Coloured left accent bar */}
                      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />

                      {/* Content */}
                      <div className="flex-1 px-3 py-2 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded-sm"
                            style={{ backgroundColor: accentColor + '20', color: accentColor }}
                          >
                            {s.key}
                          </span>
                          {s.is_won && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">WON</span>
                          )}
                          {s.is_lost && (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm">LOST</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 leading-tight truncate">{s.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {outgoing} out · {incoming} in
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Row labels */}
              {mainStages.length > 0 && (
                <div
                  style={{ position: 'absolute', left: PAD, top: PAD - 20 }}
                  className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Pipeline stages
                </div>
              )}
              {terminalStages.length > 0 && (
                <div
                  style={{ position: 'absolute', left: PAD, top: termY - 18 }}
                  className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Terminal stages
                </div>
              )}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="w-64 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
            {selectedStage ? (
              <>
                {/* Panel header */}
                <div className="px-4 py-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: (TEXT_TO_HEX[selectedStage.color_text] ?? '#475569') + '18',
                        color: TEXT_TO_HEX[selectedStage.color_text] ?? '#475569',
                      }}
                    >
                      {selectedStage.key}
                    </span>
                    {selectedStage.is_won && <span className="text-[9px] font-bold text-emerald-600">WON</span>}
                    {selectedStage.is_lost && <span className="text-[9px] font-bold text-red-500">LOST</span>}
                  </div>
                  <p className="text-sm font-bold text-slate-800">{selectedStage.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {flows.filter(f => f.from_stage === selectedKey).length} outgoing ·{' '}
                    {flows.filter(f => f.to_stage === selectedKey).length} incoming connections
                  </p>
                </div>

                {/* Transition toggles */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lead can move to</p>
                  </div>
                  <div className="px-3 pb-4 space-y-1">
                    {sorted
                      .filter(s => s.key !== selectedKey)
                      .map(to => {
                        const active = flows.some(f => f.from_stage === selectedKey && f.to_stage === to.key)
                        const toAccent = TEXT_TO_HEX[to.color_text] ?? '#475569'
                        return (
                          <button
                            key={to.key}
                            onClick={() => toggleFlow(selectedKey!, to.key)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                              active ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                              active ? 'bg-brand-400 border-brand-400 border' : 'border border-slate-300 bg-white'
                            }`}>
                              {active && <Check size={10} className="text-white" />}
                            </div>
                            {/* Stage badge */}
                            <span
                              className="text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ backgroundColor: toAccent + '18', color: toAccent }}
                            >
                              {to.key}
                            </span>
                            <span className="text-xs text-slate-600 font-medium truncate">{to.label}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <MousePointer2 size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Select a stage</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click any node on the canvas to view and edit its allowed transitions
                </p>
                <div className="mt-6 w-full space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <div className="w-6 h-0.5 bg-slate-300 flex-shrink-0" />
                    outgoing flow
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <div className="w-6 h-0.5 flex-shrink-0" style={{background: 'repeating-linear-gradient(to right, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 8px)'}} />
                    incoming flow
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <div className="w-6 h-0.5 bg-brand-400 flex-shrink-0" />
                    selected connection
                  </div>
                </div>
              </div>
            )}

            {/* Panel footer — legend */}
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <GitBranch size={11} className="text-slate-400" />
                <span className="text-[10px] text-slate-400">
                  {flows.length} transition{flows.length !== 1 ? 's' : ''} · {stages.length} stage{stages.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
