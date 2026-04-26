'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useOrgConfig } from '@/context/OrgConfigContext'

function toDaysHours(val: number | null | undefined): { d: number; h: number } {
  if (val == null) return { d: 0, h: 0 }
  const d = Math.floor(val)
  const h = Math.round((val - d) * 24)
  return { d, h }
}

interface Props { orgId: string; slaConfig: Record<string, number> }

export function SlaThresholdsClient({ orgId, slaConfig: initial }: Props) {
  const { stages } = useOrgConfig()
  const slaStages = stages.filter(s => s.sla_days != null && !s.is_won && !s.is_lost)
  const [config, setConfig] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('orgs').update({ sla_config: config }).eq('id', orgId)
    if (error) toast.error(error.message)
    else toast.success('SLA thresholds saved')
    setSaving(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Deadline Thresholds</h1>
        <p className="text-sm text-slate-500 mt-1">Set how many days a lead can remain at each stage before a deadline breach is triggered. Referral and offline leads are excluded.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {slaStages.map(s => {
          const val = config[s.key] ?? s.sla_days ?? null
          const { d, h } = toDaysHours(val)
          return (
            <div key={s.key} className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap">
              <p className="text-sm font-semibold text-slate-900">{s.label}</p>
              <div className="flex items-center gap-2">
                <input type="number" min={0} value={d}
                  onChange={e => setConfig(prev => ({ ...prev, [s.key]: (parseInt(e.target.value) || 0) + h / 24 }))}
                  className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-sm text-slate-500">d</span>
                <input type="number" min={0} max={23} value={h}
                  onChange={e => setConfig(prev => ({ ...prev, [s.key]: d + (parseInt(e.target.value) || 0) / 24 }))}
                  className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-sm text-slate-500">h</span>
              </div>
            </div>
          )
        })}
        {slaStages.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-400">No stages with deadlines configured. Set deadline days in Settings → Pipeline.</p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Note</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Entry and terminal stages have no deadline.</li>
          <li>Referral and offline leads are excluded from all deadline breaches.</li>
          <li>The deadline resets automatically when a lead moves to a new stage.</li>
        </ul>
      </div>

      <Button onClick={handleSave} loading={saving}>Save Thresholds</Button>
    </div>
  )
}
