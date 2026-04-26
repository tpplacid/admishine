'use client'

import { useOrgConfig } from '@/context/OrgConfigContext'
import { cn } from '@/lib/utils'

export function StageBadge({ stage }: { stage: string }) {
  const { stageMap } = useOrgConfig()
  const s = stageMap[stage]
  const label = s?.label ?? stage
  const color = s ? `${s.color_bg} ${s.color_text}` : 'bg-gray-100 text-gray-700'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold', color)}>
      {label}
    </span>
  )
}
