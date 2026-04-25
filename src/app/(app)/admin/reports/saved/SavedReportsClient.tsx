'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { Employee, STAGE_LABELS } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { subDays, format } from 'date-fns'

interface ReportConfig {
  metric: 'leads' | 'activities' | 'sla_breaches'
  groupBy: string
  chartType: 'bar' | 'line' | 'pie'
  dateRange: 7 | 30 | 90
}

interface SavedReport {
  id: string
  org_id: string
  created_by: string
  name: string
  config: ReportConfig
  visible_to_team: boolean
  created_at: string
  creator?: { name: string }
}

interface Props {
  reports: SavedReport[]
  employees: Employee[]
  orgId: string
}

type ChartDataPoint = { name: string; value: number }

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

const METRIC_LABELS: Record<string, string> = {
  leads: 'Leads',
  activities: 'Activities',
  sla_breaches: 'SLA Breaches',
}

const GROUP_BY_LABELS: Record<string, string> = {
  stage: 'Stage',
  source: 'Source',
  owner: 'Owner',
  date: 'Date',
  activity_type: 'Activity Type',
  resolution: 'Resolution',
}

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

function ChartRenderer({ chartType, data }: { chartType: 'bar' | 'line' | 'pie'; data: ChartDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No data available
      </div>
    )
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
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
      <ResponsiveContainer width="100%" height={280}>
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
    <ResponsiveContainer width="100%" height={280}>
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

function ReportCard({
  report,
  employees,
  orgId,
  onDelete,
  onToggleVisibility,
}: {
  report: SavedReport
  employees: Employee[]
  orgId: string
  onDelete: (id: string) => void
  onToggleVisibility: (id: string, value: boolean) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function loadChart() {
    if (chartData !== null) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { config } = report
      const cutoff = subDays(new Date(), config.dateRange).toISOString()
      let data: ChartDataPoint[] = []

      if (config.metric === 'leads') {
        const { data: rows } = await supabase
          .from('leads')
          .select('main_stage, source, owner_id, created_at, owner:employees!leads_owner_id_fkey(name)')
          .eq('org_id', orgId)
          .gte('created_at', cutoff)

        const leads = rows || []
        if (config.groupBy === 'stage') {
          data = aggregateByKey(leads, (l) => {
            const stage = l.main_stage as string
            return stage ? `${stage} — ${STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}` : ''
          })
        } else if (config.groupBy === 'source') {
          data = aggregateByKey(leads, (l) => (l.source as string) || 'Unknown')
        } else if (config.groupBy === 'owner') {
          data = aggregateByKey(leads, (l) => {
            const owner = l.owner as { name?: string } | null
            return owner?.name || employees.find(e => e.id === l.owner_id)?.name || 'Unassigned'
          })
        } else if (config.groupBy === 'date') {
          data = aggregateByKey(leads, (l) =>
            l.created_at ? format(new Date(l.created_at as string), 'dd MMM') : ''
          )
        }
      } else if (config.metric === 'activities') {
        const { data: rows } = await supabase
          .from('activities')
          .select('activity_type, employee_id, created_at, employee:employees(name)')
          .eq('org_id', orgId)
          .gte('created_at', cutoff)

        const acts = rows || []
        if (config.groupBy === 'activity_type') {
          data = aggregateByKey(acts, (a) => (a.activity_type as string)?.replace(/_/g, ' ') || 'Unknown')
        } else if (config.groupBy === 'owner') {
          data = aggregateByKey(acts, (a) => {
            const emp = a.employee as { name?: string } | null
            return emp?.name || employees.find(e => e.id === a.employee_id)?.name || 'Unknown'
          })
        } else if (config.groupBy === 'date') {
          data = aggregateByKey(acts, (a) =>
            a.created_at ? format(new Date(a.created_at as string), 'dd MMM') : ''
          )
        }
      } else if (config.metric === 'sla_breaches') {
        const { data: rows } = await supabase
          .from('sla_breaches')
          .select('stage, owner_id, resolution, created_at, owner:employees!sla_breaches_owner_id_fkey(name)')
          .eq('org_id', orgId)
          .gte('created_at', cutoff)

        const breaches = rows || []
        if (config.groupBy === 'stage') {
          data = aggregateByKey(breaches, (b) => {
            const stage = b.stage as string
            return stage ? `${stage} — ${STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}` : ''
          })
        } else if (config.groupBy === 'owner') {
          data = aggregateByKey(breaches, (b) => {
            const owner = b.owner as { name?: string } | null
            return owner?.name || employees.find(e => e.id === b.owner_id)?.name || 'Unknown'
          })
        } else if (config.groupBy === 'resolution') {
          data = aggregateByKey(breaches, (b) => (b.resolution as string)?.replace(/_/g, ' ') || 'Unknown')
        }
      }

      setChartData(data)
    } catch (err) {
      console.error(err)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  function handleExpand() {
    setExpanded(e => !e)
    if (!expanded) loadChart()
  }

  async function handleDelete() {
    if (!confirm(`Delete report "${report.name}"?`)) return
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('reports').delete().eq('id', report.id)
      onDelete(report.id)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleVisibility() {
    setToggling(true)
    try {
      const supabase = createClient()
      const newValue = !report.visible_to_team
      await supabase.from('reports').update({ visible_to_team: newValue }).eq('id', report.id)
      onToggleVisibility(report.id, newValue)
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  const { config } = report
  const dateRangeLabel = `Last ${config.dateRange} days`
  const chartTypeLabel = config.chartType.charAt(0).toUpperCase() + config.chartType.slice(1)

  return (
    <Card>
      <div
        className="px-5 py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-xl"
        onClick={handleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-slate-900 truncate">{report.name}</h3>
            {report.visible_to_team && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Team
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            <span className="text-xs text-slate-500">
              <span className="font-medium text-slate-600">{METRIC_LABELS[config.metric]}</span>
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              Grouped by <span className="font-medium text-slate-600">{GROUP_BY_LABELS[config.groupBy] || config.groupBy}</span>
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              <span className="font-medium text-slate-600">{chartTypeLabel} chart</span>
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{dateRangeLabel}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            {report.creator && (
              <span className="text-xs text-slate-400">by {report.creator.name}</span>
            )}
            <span className="text-xs text-slate-400">
              {format(new Date(report.created_at), 'dd MMM yyyy')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleVisibility}
            loading={toggling}
            className="text-xs"
          >
            {report.visible_to_team ? 'Hide from team' : 'Share with team'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </Button>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm gap-2">
                <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Loading chart data...
              </div>
            ) : chartData !== null ? (
              <ChartRenderer chartType={config.chartType} data={chartData} />
            ) : null}
          </CardContent>
        </div>
      )}
    </Card>
  )
}

export function SavedReportsClient({ reports: initialReports, employees, orgId }: Props) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [reports, setReports] = useState<SavedReport[]>(initialReports)

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isDesktop) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="text-4xl">🖥️</div>
          <p className="text-lg font-semibold text-slate-700">Available on desktop only</p>
          <p className="text-sm">Saved reports are viewable on a desktop or laptop screen.</p>
        </div>
      </div>
    )
  }

  function handleDelete(id: string) {
    setReports(r => r.filter(rep => rep.id !== id))
  }

  function handleToggleVisibility(id: string, value: boolean) {
    setReports(r => r.map(rep => rep.id === id ? { ...rep, visible_to_team: value } : rep))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Saved Reports</h1>
        <span className="text-sm text-slate-500">{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <svg className="h-14 w-14 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-base font-medium text-slate-500">No saved reports yet</p>
          <p className="text-sm">Use the Create Report tab to build and save custom reports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              employees={employees}
              orgId={orgId}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}
    </div>
  )
}
