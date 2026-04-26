'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { Employee } from '@/types'
import { useOrgConfig } from '@/context/OrgConfigContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { subDays, format } from 'date-fns'

interface ReportConfig {
  metric: 'leads' | 'activities' | 'sla_breaches'
  groupBy: string
  chartType: 'bar' | 'line' | 'pie'
  dateRange: 7 | 30 | 90
}

interface Props {
  orgId: string
  employeeId: string
  employees: Employee[]
}

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

const METRICS = [
  { value: 'leads' as const, label: 'Leads', groupByOptions: [
    { value: 'stage', label: 'Stage' },
    { value: 'source', label: 'Source' },
    { value: 'owner', label: 'Owner' },
    { value: 'date', label: 'Date' },
  ]},
  { value: 'activities' as const, label: 'Activities', groupByOptions: [
    { value: 'activity_type', label: 'Activity Type' },
    { value: 'owner', label: 'Owner' },
    { value: 'date', label: 'Date' },
  ]},
  { value: 'sla_breaches' as const, label: 'SLA Breaches', groupByOptions: [
    { value: 'stage', label: 'Stage' },
    { value: 'owner', label: 'Owner' },
    { value: 'resolution', label: 'Resolution' },
  ]},
]

const DATE_RANGES: { value: 7 | 30 | 90; label: string }[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
]

type ChartDataPoint = { name: string; value: number }

function aggregateByKey<T extends Record<string, unknown>>(
  data: T[],
  keyFn: (item: T) => string
): ChartDataPoint[] {
  const counts: Record<string, number> = {}
  for (const item of data) {
    const key = keyFn(item)
    if (key) counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function renderChart(chartType: 'bar' | 'line' | 'pie', data: ChartDataPoint[]) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No data available for the selected configuration
      </div>
    )
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            dataKey="value"
            label={(p) => `${p.name ?? ''} ${(((p.percent as number | undefined) ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} name="Count" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ReportBuilderClient({ orgId, employeeId, employees }: Props) {
  const { stageMap } = useOrgConfig()
  const [isDesktop, setIsDesktop] = useState(false)
  const [reportName, setReportName] = useState('')
  const [metric, setMetric] = useState<ReportConfig['metric']>('leads')
  const [groupBy, setGroupBy] = useState('stage')
  const [chartType, setChartType] = useState<ReportConfig['chartType']>('bar')
  const [dateRange, setDateRange] = useState<ReportConfig['dateRange']>(30)
  const [visibleToTeam, setVisibleToTeam] = useState(false)
  const [previewData, setPreviewData] = useState<ChartDataPoint[] | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // When metric changes, reset groupBy to first option of new metric
  useEffect(() => {
    const m = METRICS.find(m => m.value === metric)
    if (m) setGroupBy(m.groupByOptions[0].value)
  }, [metric])

  // Line chart only valid for date groupBy
  useEffect(() => {
    if (groupBy !== 'date' && chartType === 'line') {
      setChartType('bar')
    }
  }, [groupBy, chartType])

  if (!isDesktop) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="text-4xl">🖥️</div>
          <p className="text-lg font-semibold text-slate-700">Available on desktop only</p>
          <p className="text-sm">The report builder requires a larger screen. Please open this page on a desktop or laptop.</p>
        </div>
      </div>
    )
  }

  const currentMetric = METRICS.find(m => m.value === metric)!

  async function handlePreview() {
    setLoadingPreview(true)
    setPreviewData(null)
    setSaveError('')

    try {
      const supabase = createClient()
      const cutoff = subDays(new Date(), dateRange).toISOString()
      let data: ChartDataPoint[] = []

      if (metric === 'leads') {
        const { data: rows, error } = await supabase
          .from('leads')
          .select('main_stage, source, owner_id, created_at, owner:employees!leads_owner_id_fkey(name)')
          .eq('org_id', orgId)
          .gte('created_at', cutoff)

        if (error) throw error

        const leads = rows || []

        if (groupBy === 'stage') {
          data = aggregateByKey(leads, (l) => {
            const stage = l.main_stage as string
            return stage ? `${stage} — ${stageMap[stage]?.label ?? stage}` : ''
          })
        } else if (groupBy === 'source') {
          data = aggregateByKey(leads, (l) => (l.source as string) || 'Unknown')
        } else if (groupBy === 'owner') {
          data = aggregateByKey(leads, (l) => {
            const owner = l.owner as { name?: string } | null
            return owner?.name || employees.find(e => e.id === l.owner_id)?.name || 'Unassigned'
          })
        } else if (groupBy === 'date') {
          data = aggregateByKey(leads, (l) =>
            l.created_at ? format(new Date(l.created_at as string), 'dd MMM') : ''
          )
        }
      } else if (metric === 'activities') {
        const { data: rows, error } = await supabase
          .from('activities')
          .select('activity_type, employee_id, created_at, employee:employees(name)')
          .eq('org_id', orgId)
          .gte('created_at', cutoff)

        if (error) throw error

        const acts = rows || []

        if (groupBy === 'activity_type') {
          data = aggregateByKey(acts, (a) => (a.activity_type as string)?.replace(/_/g, ' ') || 'Unknown')
        } else if (groupBy === 'owner') {
          data = aggregateByKey(acts, (a) => {
            const emp = a.employee as { name?: string } | null
            return emp?.name || employees.find(e => e.id === a.employee_id)?.name || 'Unknown'
          })
        } else if (groupBy === 'date') {
          data = aggregateByKey(acts, (a) =>
            a.created_at ? format(new Date(a.created_at as string), 'dd MMM') : ''
          )
        }
      } else if (metric === 'sla_breaches') {
        const { data: rows, error } = await supabase
          .from('sla_breaches')
          .select('stage, owner_id, resolution, created_at, owner:employees!sla_breaches_owner_id_fkey(name)')
          .eq('org_id', orgId)
          .gte('created_at', cutoff)

        if (error) throw error

        const breaches = rows || []

        if (groupBy === 'stage') {
          data = aggregateByKey(breaches, (b) => {
            const stage = b.stage as string
            return stage ? `${stage} — ${stageMap[stage]?.label ?? stage}` : ''
          })
        } else if (groupBy === 'owner') {
          data = aggregateByKey(breaches, (b) => {
            const owner = b.owner as { name?: string } | null
            return owner?.name || employees.find(e => e.id === b.owner_id)?.name || 'Unknown'
          })
        } else if (groupBy === 'resolution') {
          data = aggregateByKey(breaches, (b) => (b.resolution as string)?.replace(/_/g, ' ') || 'Unknown')
        }
      }

      setPreviewData(data)
    } catch (err) {
      setSaveError('Failed to load preview data. Please try again.')
      console.error(err)
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handleSave() {
    if (!reportName.trim()) {
      setSaveError('Please enter a report name.')
      return
    }
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      const supabase = createClient()
      const config: ReportConfig = { metric, groupBy, chartType, dateRange }

      const { error } = await supabase.from('reports').insert({
        org_id: orgId,
        created_by: employeeId,
        name: reportName.trim(),
        config,
        visible_to_team: visibleToTeam,
      })

      if (error) throw error

      setSaveSuccess(true)
      setReportName('')
      setPreviewData(null)
    } catch (err) {
      setSaveError('Failed to save report. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Create Report</h1>

      <div className="flex gap-6">
        {/* Left panel: configuration */}
        <div className="w-1/3 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Report name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Report Name</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                  placeholder="e.g. Monthly Lead Source Breakdown"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Metric */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Metric</label>
                <select
                  value={metric}
                  onChange={e => setMetric(e.target.value as ReportConfig['metric'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {METRICS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Group By */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Group By</label>
                <select
                  value={groupBy}
                  onChange={e => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currentMetric.groupByOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Chart Type */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Chart Type</label>
                <select
                  value={chartType}
                  onChange={e => setChartType(e.target.value as ReportConfig['chartType'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="bar">Bar Chart</option>
                  {groupBy === 'date' && <option value="line">Line Chart</option>}
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Date Range</label>
                <select
                  value={dateRange}
                  onChange={e => setDateRange(Number(e.target.value) as ReportConfig['dateRange'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DATE_RANGES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Visible to team toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Visible to Team</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={visibleToTeam}
                  onClick={() => setVisibleToTeam(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    visibleToTeam ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      visibleToTeam ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  Report saved successfully!
                </p>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={handlePreview}
                  loading={loadingPreview}
                  className="w-full"
                >
                  Preview
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                  className="w-full"
                >
                  Save Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel: preview */}
        <div className="flex-1 min-w-0">
          <Card className="h-full min-h-[480px]">
            <CardHeader>
              <CardTitle>
                {previewData !== null
                  ? reportName.trim() || `${currentMetric.label} by ${groupBy}`
                  : 'Chart Preview'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPreview ? (
                <div className="flex items-center justify-center h-64 text-slate-400 text-sm gap-2">
                  <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Loading data...
                </div>
              ) : previewData !== null ? (
                renderChart(chartType, previewData)
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                  <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-500">Configure your report and click Preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
