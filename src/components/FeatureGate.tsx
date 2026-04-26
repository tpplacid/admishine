'use client'

import { Lock } from 'lucide-react'

interface Props {
  featureLabel: string
  description: string
}

/**
 * Full-page upgrade wall shown when a feature is disabled for the org.
 * Wrap page content with this in server pages that check the feature flag.
 */
export function FeatureGate({ featureLabel, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <Lock size={24} className="text-slate-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-2">{featureLabel} is not enabled</h2>
      <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-sm font-bold transition cursor-default">
        <Lock size={13} />
        Contact Consultrack to upgrade
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Reach out to your Consultrack account manager to enable this module.
      </p>
    </div>
  )
}
