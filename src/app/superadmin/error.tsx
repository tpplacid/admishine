'use client'

export default function SuperAdminError({ error }: { error: Error }) {
  return (
    <div style={{ color: 'white', padding: 40, fontFamily: 'monospace' }}>
      <h2 style={{ color: '#f87171', marginBottom: 12 }}>Superadmin page error</h2>
      <pre style={{ background: '#1e293b', padding: 16, borderRadius: 8, fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {error?.message || String(error)}
        {'\n\n'}
        {error?.stack}
      </pre>
    </div>
  )
}
