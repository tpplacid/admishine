'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { UpgradeModal } from './UpgradeModal'

interface Props {
  featureLabel: string
  featureKey: string
  description: string
}

export function FeatureGate({ featureLabel, featureKey, description }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center">
        {/* Gold lock icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-5 shadow-sm">
          <Lock size={26} className="text-amber-600" />
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-2">{featureLabel} is not enabled</h2>
        <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">{description}</p>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-sm font-bold transition shadow-sm"
        >
          <Lock size={13} />
          Contact Consultrack to upgrade
        </button>

        <p className="text-xs text-slate-400 mt-3">
          Raise a request and we'll enable this module for your organisation.
        </p>
      </div>

      {showModal && (
        <UpgradeModal
          featureLabel={featureLabel}
          featureKey={featureKey}
          description={description}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
