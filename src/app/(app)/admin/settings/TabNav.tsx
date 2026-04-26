'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock } from 'lucide-react'
import { useOrgConfig, OrgFeatures } from '@/context/OrgConfigContext'

interface Tab {
  href: string
  label: string
  feature?: keyof OrgFeatures
  upgradeLabel?: string   // short name shown on the locked tab
  upgradeDesc?: string    // tooltip / hover text
}

const TABS: Tab[] = [
  {
    href: '/admin/settings/pipeline',
    label: 'Pipeline',
    feature: 'pipeline',
    upgradeLabel: 'Pipeline',
    upgradeDesc: 'Customise lead stages, substages and transition flows',
  },
  {
    href: '/admin/settings/roles',
    label: 'Roles',
    feature: 'roles',
    upgradeLabel: 'Roles',
    upgradeDesc: 'Define custom roles with granular access permissions',
  },
  {
    href: '/admin/settings/templates',
    label: 'WA Templates',
    feature: 'lead_crm',
    upgradeLabel: 'WA Templates',
    upgradeDesc: 'Manage WhatsApp message templates for lead communication',
  },
  {
    href: '/admin/settings/meta',
    label: 'Meta Leads',
    feature: 'meta',
    upgradeLabel: 'Meta Integration',
    upgradeDesc: 'Automatically pull leads from Meta (Facebook/Instagram) ad campaigns',
  },
  {
    href: '/admin/settings/bulk-upload',
    label: 'Bulk Upload',
    feature: 'lead_crm',
    upgradeLabel: 'Bulk Upload',
    upgradeDesc: 'Import hundreds of leads at once via CSV',
  },
  {
    href: '/admin/settings/sla-thresholds',
    label: 'SLA Thresholds',
    feature: 'sla',
    upgradeLabel: 'Deadline Rules',
    upgradeDesc: 'Set custom deadline windows per pipeline stage',
  },
]

export function SettingsTabNav() {
  const pathname = usePathname()
  const { features } = useOrgConfig()

  const enabledTabs = TABS.filter(t => !t.feature || features[t.feature])
  const disabledTabs = TABS.filter(t => t.feature && !features[t.feature])

  return (
    <div className="bg-white border-b border-slate-200 px-4 md:px-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        {/* Enabled tabs */}
        {enabledTabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-brand-400 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}

        {/* Divider if there are locked tabs */}
        {disabledTabs.length > 0 && enabledTabs.length > 0 && (
          <div className="flex-shrink-0 w-px h-5 bg-slate-200 mx-1 self-center" />
        )}

        {/* Locked tabs — shown last, greyed out */}
        {disabledTabs.map(tab => (
          <div key={tab.href} className="group relative flex-shrink-0">
            <div className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 border-transparent text-slate-300 cursor-not-allowed select-none whitespace-nowrap">
              <Lock size={11} className="text-slate-300 flex-shrink-0" />
              {tab.upgradeLabel || tab.label}
            </div>

            {/* Upgrade tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white rounded-xl p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="flex items-center gap-1.5 mb-1">
                <Lock size={11} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400">Upgrade required</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{tab.upgradeDesc}</p>
              <p className="text-[10px] text-slate-500 mt-2">Contact your Consultrack account manager to unlock this module.</p>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
