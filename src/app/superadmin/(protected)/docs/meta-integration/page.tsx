'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

// ── Prose primitives ──────────────────────────────────────────
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-[var(--sa-text)] mt-10 mb-3 pb-2 border-b border-[var(--sa-border)]">{children}</h2>
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-neutral-200 mt-6 mb-2">{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--sa-text-secondary)] leading-relaxed mb-3">{children}</p>
}
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="w-7 h-7 rounded-full bg-[var(--sa-surface-hover)] border border-[var(--sa-border-strong)] text-xs font-bold text-[var(--sa-text-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--sa-text)] mb-1">{title}</p>
        <div className="text-xs text-[var(--sa-text-secondary)] leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  )
}
function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[var(--sa-success)] bg-emerald-500/[0.08] px-1.5 py-0.5 rounded text-[11px]">{children}</code>
}
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-white/[0.03] border border-[var(--sa-border)] rounded-xl p-4 text-xs text-emerald-300 font-mono overflow-x-auto my-3 leading-relaxed whitespace-pre">
      {children}
    </pre>
  )
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-[var(--sa-border)] rounded-xl p-3.5 bg-[var(--sa-surface)] my-4">
      <p className="text-xs text-[var(--sa-text-secondary)] leading-relaxed">{children}</p>
    </div>
  )
}
function Pitfall({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-amber-500/20 rounded-xl p-3.5 bg-amber-500/[0.04] my-4">
      <p className="text-xs font-semibold text-amber-300 mb-1">⚠ Pitfall — {title}</p>
      <div className="text-xs text-[var(--sa-text-secondary)] leading-relaxed">{children}</div>
    </div>
  )
}
function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--sa-border)]">
            {['What', 'Scope', 'Where stored'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[var(--sa-text-muted)] font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([what, scope, where], i) => (
            <tr key={i} className="border-b border-white/[0.04] last:border-0">
              <td className="px-3 py-2.5 text-[var(--sa-text)] font-medium">{what}</td>
              <td className="px-3 py-2.5 text-[var(--sa-text-secondary)]">{scope}</td>
              <td className="px-3 py-2.5 text-[var(--sa-text-secondary)]">{where}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[var(--sa-text)]/70 hover:text-[var(--sa-text)] underline underline-offset-2 transition-colors">
      {children} <ExternalLink size={10} />
    </a>
  )
}
function FlowStep({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="px-4 py-2 rounded-lg border border-[var(--sa-border-strong)] bg-[var(--sa-surface)] text-xs text-[var(--sa-text)] text-center font-medium w-64">{label}</div>
      {sub && <p className="text-[10px] text-[var(--sa-text-muted)] mt-0.5 mb-0.5">{sub}</p>}
    </div>
  )
}
function Arrow() {
  return <div className="w-px h-4 bg-[var(--sa-surface-strong)] mx-auto" />
}

// ── Page ─────────────────────────────────────────────────────
type Mode = 'sa' | 'client'

export default function MetaIntegrationDoc() {
  const [mode, setMode] = useState<Mode>('sa')

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        <Link href="/superadmin/docs"
          className="inline-flex items-center gap-1.5 text-[var(--sa-text-muted)] hover:text-[var(--sa-text)] text-sm mb-8 transition-colors">
          <ArrowLeft size={13} /> All docs
        </Link>

        <div className="mb-6">
          <p className="text-[11px] font-semibold text-[var(--sa-text-muted)] uppercase tracking-widest mb-2">Integration guide</p>
          <h1 className="text-2xl font-semibold text-[var(--sa-text)] tracking-tight mb-2">Meta Lead Integration</h1>
          <p className="text-sm text-[var(--sa-text-secondary)]">
            End-to-end setup for connecting Facebook Lead Ad forms to the Consultrack pipeline.
          </p>
        </div>

        {/* Mode toggle — switches between SA-managed central app and
            per-client own-app bridge mode. Default = SA. */}
        <div className="inline-flex p-0.5 rounded-xl border border-[var(--sa-divider)] bg-[var(--sa-surface)] mb-2">
          <button onClick={() => setMode('sa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'sa'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--sa-text-muted)] hover:text-[var(--sa-text)]'
            }`}>
            SA / Consultrack&rsquo;s app
          </button>
          <button onClick={() => setMode('client')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'client'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-[var(--sa-text-muted)] hover:text-[var(--sa-text)]'
            }`}>
            Client&rsquo;s own app
          </button>
        </div>
        <p className="text-[11px] text-[var(--sa-text-muted)] mb-2">
          {mode === 'sa'
            ? 'Use this when Consultrack’s own central Meta app is verified — the standard production flow.'
            : 'Use this during the App Review window: each client creates their own Meta app and pastes credentials into Superadmin.'}
        </p>

        {mode === 'sa' ? <SaSetup /> : <ClientSetup />}

        <div className="mt-12 pt-6 border-t border-[var(--sa-divider)]">
          <p className="text-[11px] text-[var(--sa-text-muted)]">Consultrack internal docs · Meta Integration</p>
        </div>
      </div>
    </div>
  )
}

// ── SA Setup (Consultrack's central Meta app) ────────────────
function SaSetup() {
  return (
    <>
      <H2>Overview</H2>
      <P>
        One Meta Developer App (owned by you, Consultrack) acts as the bridge between all client Facebook Pages and the platform.
        When a lead fills a Meta Lead Ad form on any client&rsquo;s page, Meta sends a webhook event to your server. The server identifies
        the org by Page ID, fetches the lead data using that org&rsquo;s Page Access Token, and inserts the lead into their pipeline —
        fully automated, no manual entry.
      </P>

      <Table rows={[
        ['App Secret',         'Global — your Meta App',  'Vercel env → META_APP_SECRET'],
        ['Verify Token',       'Global — your Meta App',  'Vercel env → META_VERIFY_TOKEN'],
        ['Page ID',            'Per client org',          'Superadmin → org → Meta Integration'],
        ['Page Access Token',  'Per client org',          'Superadmin → org → Meta Integration'],
      ]} />

      <H2>Lead flow</H2>
      <div className="my-5">
        <FlowStep label="Lead submits a Meta Lead Ad form" />
        <Arrow />
        <FlowStep label="Meta sends POST to your webhook" sub="consultrackk.vercel.app/api/meta/webhook" />
        <Arrow />
        <FlowStep label="Signature verified using META_APP_SECRET" />
        <Arrow />
        <FlowStep label="Page ID looked up → org identified" />
        <Arrow />
        <FlowStep label="Meta Graph API called using org's access_token" sub="Fetches: name, phone, email, course, city" />
        <Arrow />
        <FlowStep label="Duplicate check (phone + meta_lead_id)" />
        <Arrow />
        <FlowStep label="Weighted allocation → employee assigned" />
        <Arrow />
        <FlowStep label="Lead inserted at Stage 0, employee notified" />
      </div>

      <H2>Part 1 — One-time setup (you, once)</H2>

      <H3>Create the Meta Developer App</H3>
      <Step n={1} title="Create the app">
        <p>Go to <A href="https://developers.facebook.com">developers.facebook.com</A> → My Apps → Create App.</p>
        <p>Choose <strong className="text-[var(--sa-text)]">Other</strong> → <strong className="text-[var(--sa-text)]">Business</strong> type. Name it <em>Consultrack</em> and attach your Business portfolio.</p>
      </Step>

      <Step n={2} title="Get the App Secret">
        <p>Inside your app → <strong className="text-[var(--sa-text)]">Settings → Basic</strong>.</p>
        <p>Click Show next to <strong className="text-[var(--sa-text)]">App Secret</strong> → copy it.</p>
        <p>Add to Vercel: <Code>META_APP_SECRET = (value)</Code></p>
      </Step>

      <Step n={3} title="Set a Verify Token">
        <p>Choose any string, e.g. <Code>consultrackk_wh_2024</Code>. Keep it secret.</p>
        <p>Add to Vercel: <Code>META_VERIFY_TOKEN = (your string)</Code></p>
      </Step>

      <H3>Configure the Webhook</H3>
      <Step n={4} title="Add Webhooks product">
        <p>App dashboard → <strong className="text-[var(--sa-text)]">Add Product → Webhooks</strong>.</p>
        <p>Under Webhooks → <strong className="text-[var(--sa-text)]">Page</strong> → click <strong className="text-[var(--sa-text)]">Subscribe to this object</strong>.</p>
      </Step>

      <Step n={5} title="Register the endpoint">
        <p>Enter:</p>
        <p>Callback URL: <Code>https://consultrackk.vercel.app/api/meta/webhook</Code></p>
        <p>Verify Token: the value you set in Step 3.</p>
        <p>Click <strong className="text-[var(--sa-text)]">Verify and Save</strong> — Meta calls your GET endpoint to confirm. Then find the <strong className="text-[var(--sa-text)]">leadgen</strong> field and click <strong className="text-[var(--sa-text)]">Subscribe</strong>.</p>
      </Step>

      <Pitfall title="Always use consultrackk.vercel.app, never admishine.vercel.app">
        The legacy domain <Code>admishine.vercel.app</Code> is a 308 redirect to{' '}
        <Code>consultrackk.vercel.app</Code>. GET verification follows the redirect and
        succeeds, but POST webhooks <em>do not follow redirects</em> — every lead silently
        disappears. Always paste the canonical URL.
      </Pitfall>

      <Pitfall title="leadgen field doesn't appear in the subscription list">
        You haven&rsquo;t requested <Code>leads_retrieval</Code> permission yet. Go to
        App Review → Permissions and Features → search <Code>leads_retrieval</Code> →
        <em>Get Advanced Access</em> (auto-flips to Standard Access for owned assets). The
        field shows up immediately afterwards.
      </Pitfall>

      <Pitfall title="App Mode must be Live, not Development">
        The Webhooks page has a small red banner: <em>&ldquo;No production webhooks,
        including from app admins, developers or testers, will be delivered unless the app
        has been published.&rdquo;</em> Toggle App Mode to Live (top of dashboard) before
        expecting any webhook delivery.
      </Pitfall>

      <Note>
        Leads are routed to the correct org by matching the incoming Facebook Page ID against <Code>meta_config.page_id</Code> stored per org in superadmin. Make sure every org&rsquo;s Page ID is configured before going live.
      </Note>

      <H2>Part 2 — Per-client setup</H2>

      <H3>Connect the client&rsquo;s Facebook Page</H3>
      <Step n={1} title="Client grants your app access">
        <p>Client goes to <A href="https://business.facebook.com">Meta Business Suite</A> → Settings → Integrations → Connected Apps.</p>
        <p>They add your App ID and grant <strong className="text-[var(--sa-text)]">Leads Access</strong> for their Page.</p>
      </Step>

      <Step n={2} title="Generate a Page Access Token">
        <p>Go to the <A href="https://developers.facebook.com/tools/explorer/">Graph API Explorer</A> → select your app → click <strong className="text-[var(--sa-text)]">Generate Access Token</strong> → select the client&rsquo;s Page.</p>
        <p>Request permissions: <Code>pages_show_list</Code>, <Code>leads_retrieval</Code>, <Code>pages_read_engagement</Code>, <Code>pages_manage_metadata</Code>, <Code>pages_manage_ads</Code>.</p>
        <p>Easy way to extend (no curl): click the <strong className="text-[var(--sa-text)]">i</strong> icon next to the Access Token → <em>Open in Access Token Tool</em> → at the bottom click <strong className="text-[var(--sa-text)]">Extend Access Token</strong> → enter FB password. Returns a long-lived (60-day) User Token.</p>
        <p>Curl alternative if you prefer scripting:</p>
      </Step>

      <CodeBlock>{`GET https://graph.facebook.com/v19.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={APP_ID}
  &client_secret={APP_SECRET}
  &fb_exchange_token={SHORT_LIVED_TOKEN}`}</CodeBlock>

      <P>The response contains a long-lived User Token. Now query <Code>me/accounts</Code> in Graph Explorer with that token — copy the Page&rsquo;s <Code>access_token</Code> field. That&rsquo;s the long-lived <em>Page</em> Access Token (typically never expires) and what goes into the org&rsquo;s access token field.</P>

      <Pitfall title="me/accounts returns empty array">
        The User Token doesn&rsquo;t see the Page yet. Click <em>Generate Access Token</em>
        again, find the <em>Edit access</em> link in the consent popup, ensure the Page is
        ticked. Newly-created Pages default to unchecked.
      </Pitfall>

      <Pitfall title="Page-level subscription is also required">
        App-level subscription (Step 5) tells Meta that the app cares about leadgen.
        Page-level subscription tells <em>that specific Page</em> to forward leadgen events
        to the app. Both are needed. Run this in Graph API Explorer with method=POST and
        the <strong>Page</strong> Access Token (not User Token):
        <div className="mt-2"><Code>{'POST {page_id}/subscribed_apps?subscribed_fields=leadgen'}</Code></div>
        Expected response: <Code>{'{"success": true}'}</Code>.
      </Pitfall>

      <Step n={3} title="Find the client's Facebook Page ID">
        <p>Option A: Facebook Page → About → Page ID (shown at the bottom).</p>
        <p>Option B: Business Suite → Settings → Page Info.</p>
        <p>It&rsquo;s a numeric string like <Code>123456789012345</Code>.</p>
      </Step>

      <Step n={4} title="Enter in Superadmin">
        <p>Superadmin → client org → <strong className="text-[var(--sa-text)]">Settings → Meta Integration</strong>.</p>
        <p>Enter Page ID and Page Access Token → Save.</p>
        <p>Click <strong className="text-[var(--sa-text)]">Send Setup Guide</strong> — this makes the setup guide visible on the client&rsquo;s Meta Leads settings page.</p>
      </Step>

      <H2>Token expiry</H2>
      <P>
        Long-lived Page Access Tokens for Pages do not expire as long as the app retains <Code>pages_show_list</Code> permission and the token is used within a 60-day rolling window.
        In practice, as long as leads are coming in regularly the token stays alive indefinitely.
      </P>
      <P>
        If a token expires you will see Graph API errors in Vercel logs (function logs → api/meta/webhook). Simply regenerate via Graph Explorer and update in superadmin → org → Meta Integration.
      </P>

      <H2>Troubleshooting</H2>
      <div className="space-y-3">
        {[
          { q: 'Webhook verification failing (GET returns 403)',
            a: 'META_VERIFY_TOKEN in Vercel does not match what you entered in Meta Developer Console. They must be identical.' },
          { q: 'Leads arriving but owner_id is null',
            a: 'No active, auto-allocate-enabled employees available at the time of lead receipt. Check is_active, is_on_leave, auto_allocate on employee records, and weekoffs.' },
          { q: 'Graph API error: Invalid OAuth access token',
            a: "The org's Page Access Token has expired or been revoked. Regenerate via Graph Explorer and update in superadmin." },
          { q: 'Leads going to the wrong org',
            a: "The Page ID in meta_config doesn't match the Facebook Page ID sending the events. Verify entry.id in Vercel logs matches what's stored." },
          { q: 'Duplicate leads appearing',
            a: 'Dedup runs on phone + meta_lead_id per org. If the same phone appears on a different org, both will insert — this is expected.' },
        ].map((item, i) => (
          <div key={i} className="border border-[var(--sa-divider)] rounded-xl p-4">
            <p className="text-xs font-semibold text-[var(--sa-text)] mb-1">{item.q}</p>
            <p className="text-xs text-[var(--sa-text-muted)]">{item.a}</p>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Client Setup (own Meta app, App Review bridge) ───────────
function ClientSetup() {
  return (
    <>
      <Note>
        Use this mode while Consultrack&rsquo;s central Meta app is going through Business Verification + App Review (60-75 day window).
        Each client creates their own Meta app, points it at the same Consultrack webhook URL, and pastes three credentials
        (App ID, App Secret, Verify Token) into Superadmin. Once Consultrack is verified, flip back to <em>SA / Consultrack&rsquo;s app</em>;
        their lead history persists across the migration.
      </Note>

      <H2>Before you start — what the client needs</H2>
      <P>Send this list to the client a day before the setup call:</P>
      <ul className="list-disc pl-6 text-xs text-[var(--sa-text-secondary)] leading-relaxed space-y-1 mb-6">
        <li>A personal Facebook account with admin permissions on the Page</li>
        <li>A Facebook <strong className="text-[var(--sa-text)]">Page</strong> for the business
          (create one at <A href="https://facebook.com/pages/create">facebook.com/pages/create</A> if needed — 2 min)</li>
        <li>An <strong className="text-[var(--sa-text)]">Instagram Business Account</strong> linked to that Page (optional, only for IG features — see Instagram Integration → Client&rsquo;s own app)</li>
        <li>~45 min uninterrupted on a desktop browser (Meta Developer Console doesn&rsquo;t work well on mobile)</li>
        <li>Their phone — Meta sometimes 2FAs the FB account during this flow</li>
      </ul>

      <H2>Part 1 — Create the Meta Developer App (5 min)</H2>

      <Step n={1} title="Sign in at developers.facebook.com">
        <p>Open <A href="https://developers.facebook.com">developers.facebook.com</A>. Click <strong className="text-[var(--sa-text)]">Get Started</strong> if it&rsquo;s the client&rsquo;s first visit; accept the developer terms.</p>
      </Step>

      <Step n={2} title="Create the app">
        <p>My Apps → <strong className="text-[var(--sa-text)]">Create App</strong>.</p>
        <p>Use case: <strong className="text-[var(--sa-text)]">Other</strong> → Next.</p>
        <p>App type: <strong className="text-[var(--sa-text)]">Business</strong> → Next.</p>
        <p>App name: anything recognisable, e.g. <em>Acme Marketing CRM</em>. Confirm with FB password.</p>
      </Step>

      <Step n={3} title="Copy App ID + App Secret">
        <p>Inside the app dashboard → left sidebar → <strong className="text-[var(--sa-text)]">App Settings → Basic</strong>.</p>
        <p>Copy the <strong className="text-[var(--sa-text)]">App ID</strong> (top of page).</p>
        <p>Click <strong className="text-[var(--sa-text)]">Show</strong> next to App Secret, enter FB password again, copy the value.</p>
        <p>Both go into Superadmin → Org → Meta Integration → Client&rsquo;s own app — but don&rsquo;t paste yet, finish the rest first.</p>
      </Step>

      <H2>Part 2 — Fill in App Settings → Basic (5 min)</H2>

      <Step n={4} title="Add legal URLs">
        <p>While still on App Settings → Basic, paste:</p>
        <p>Privacy Policy URL: <Code>https://consultrackk.vercel.app/privacy</Code></p>
        <p>Terms of Service URL: <Code>https://consultrackk.vercel.app/terms</Code></p>
        <p>User Data Deletion: <Code>https://consultrackk.vercel.app/data-deletion</Code></p>
        <p>Category: <strong className="text-[var(--sa-text)]">Business and Pages</strong>.</p>
      </Step>

      <Step n={5} title="Upload App Icon">
        <p>Scroll to the App Icon field. Upload a 1024×1024 PNG.</p>
        <p>If the client has no logo handy, the Consultrack icon at <A href="https://consultrackk.vercel.app/consultrack-mark.svg">/consultrack-mark.svg</A> works. Save Changes.</p>
      </Step>

      <H2>Part 3 — Pick a Verify Token (1 min)</H2>

      <Step n={6} title="Generate any random string">
        <p>The verify token is a shared secret between the client&rsquo;s Meta app and Consultrack&rsquo;s server. Pick anything random:</p>
        <p><Code>acme_meta_verify_2026</Code> or <Code>openssl rand -hex 16</Code>.</p>
        <p>You will paste this into both Superadmin (now) and Meta&rsquo;s webhook setup (Part 6 below). It must match exactly.</p>
      </Step>

      <H2>Part 4 — Save what you have so far in Superadmin</H2>

      <Step n={7} title="Paste App ID + App Secret + Verify Token">
        <p>Open Superadmin → the client&rsquo;s org → Meta Integration → toggle <strong className="text-[var(--sa-text)]">Client&rsquo;s own app</strong>.</p>
        <p>Paste App ID, App Secret, Verify Token. Click Save Settings.</p>
        <p>This unlocks step 9: Meta&rsquo;s webhook verification will succeed because Consultrack now knows this org&rsquo;s verify token.</p>
      </Step>

      <H2>Part 5 — Request Standard Access on permissions (5 min)</H2>

      <Step n={8} title="App Review → Permissions and Features">
        <p>Left sidebar → <strong className="text-[var(--sa-text)]">App Review → Permissions and Features</strong>.</p>
        <p>Click <strong className="text-[var(--sa-text)]">Get Advanced Access</strong> on these (Meta auto-grants Standard Access to a Business app for its own owned assets):</p>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
          <li><Code>leads_retrieval</Code> — without this, the leadgen webhook field is hidden in step 10</li>
          <li><Code>pages_show_list</Code></li>
          <li><Code>pages_manage_metadata</Code></li>
          <li><Code>pages_read_engagement</Code></li>
          <li><Code>pages_manage_ads</Code></li>
        </ul>
      </Step>

      <Pitfall title="leads_retrieval is the gatekeeper">
        The <Code>leadgen</Code> field literally won&rsquo;t appear in the webhook subscription list
        until <Code>leads_retrieval</Code> shows Standard Access (green). Click <em>Get Advanced
        Access</em> on it first; it auto-flips to Standard Access for owned assets.
      </Pitfall>

      <H2>Part 6 — Add the Webhooks product (5 min)</H2>

      <Step n={9} title="Add Product → Webhooks → Set Up">
        <p>Left sidebar → <strong className="text-[var(--sa-text)]">+ Add Product</strong> → find <strong className="text-[var(--sa-text)]">Webhooks</strong> → Set Up.</p>
        <p>Top dropdown: select <strong className="text-[var(--sa-text)]">Page</strong>.</p>
        <p>Click <strong className="text-[var(--sa-text)]">Subscribe to this object</strong>. Enter:</p>
        <p>Callback URL: <Code>https://consultrackk.vercel.app/api/meta/webhook</Code></p>
        <p>Verify Token: the string from step 6.</p>
        <p>Click <strong className="text-[var(--sa-text)]">Verify and Save</strong>.</p>
      </Step>

      <Pitfall title="Always use consultrackk.vercel.app, never admishine.vercel.app">
        <Code>admishine.vercel.app</Code> is a 308 redirect to <Code>consultrackk.vercel.app</Code>. GET
        verification follows the redirect and succeeds, but POST webhooks do not — every lead, DM, and
        comment silently disappears.
      </Pitfall>

      <Step n={10} title="Subscribe to the leadgen field">
        <p>After the URL is verified, the field list appears below. Search for <Code>leadgen</Code> and toggle Subscribe.</p>
        <p>If <Code>leadgen</Code> isn&rsquo;t in the list, go back to step 8 and confirm <Code>leads_retrieval</Code> shows Standard Access.</p>
      </Step>

      <H2>Part 7 — Switch the app to Live (1 min)</H2>

      <Step n={11} title="Toggle App Mode: Development → Live">
        <p>Top of the dashboard, next to App Mode, flip from <strong className="text-[var(--sa-text)]">Development</strong> to <strong className="text-[var(--sa-text)]">Live</strong>.</p>
        <p>If Meta blocks the toggle saying &ldquo;some permissions need access&rdquo;, go back to step 8 and confirm every permission shows at least Standard Access.</p>
      </Step>

      <Pitfall title="Development mode silently blocks production webhooks">
        Webhooks page banner: <em>&ldquo;No production webhooks, including from app admins, developers
        or testers, will be delivered unless the app has been published.&rdquo;</em> Forget step 11 and
        every test you run will arrive at Meta but never reach our server.
      </Pitfall>

      <H2>Part 8 — Get the Page Access Token (10 min, the trickiest part)</H2>

      <Step n={12} title="Open Graph API Explorer">
        <p>Tools → <A href="https://developers.facebook.com/tools/explorer">Graph API Explorer</A>.</p>
        <p>Top right: <strong className="text-[var(--sa-text)]">Meta App</strong> dropdown → select the app you just created.</p>
      </Step>

      <Step n={13} title="Generate a User Access Token">
        <p>Click <strong className="text-[var(--sa-text)]">Generate Access Token</strong>. A consent popup opens.</p>
        <p>Tick at minimum: <Code>pages_show_list</Code>, <Code>pages_manage_metadata</Code>, <Code>pages_read_engagement</Code>, <Code>leads_retrieval</Code>, <Code>pages_manage_ads</Code>.</p>
        <p>The popup also shows a Page picker — <strong className="text-[var(--sa-text)]">make sure the client&rsquo;s Page is checked</strong>. Newly-created Pages default to unchecked.</p>
        <p>Click Continue. The Access Token field at the top of the explorer now holds a User Token.</p>
      </Step>

      <Pitfall title="If me/accounts returns empty data">
        User Token doesn&rsquo;t see the Page yet — usually because the Page was created <em>after</em>
        the token was generated, or it wasn&rsquo;t ticked in the picker. Click <em>Generate Access
        Token</em> again, find the <em>Edit access</em> link in the consent popup, ensure the Page is
        checked. Workaround: query <Code>{'{page_id}'}?fields=name,access_token</Code> directly with
        the User Token — returns the Page Access Token without going through <Code>me/accounts</Code>.
      </Pitfall>

      <Step n={14} title="Extend to a long-lived token">
        <p>Default User Tokens last ~1 hour. Without extending, leads stop arriving an hour after setup.</p>
        <p>Click the <strong className="text-[var(--sa-text)]">i</strong> icon next to the Access Token → <strong className="text-[var(--sa-text)]">Open in Access Token Tool</strong>.</p>
        <p>On the Access Token Tool page, scroll to the bottom → click <strong className="text-[var(--sa-text)]">Extend Access Token</strong>. Confirm with FB password.</p>
        <p>Copy the long-lived User Token (~60 days). Paste it back into Graph API Explorer&rsquo;s Access Token field.</p>
      </Step>

      <Step n={15} title="Fetch the Page ID and Page Access Token">
        <p>In Graph API Explorer, query: <Code>me/accounts</Code> → Submit.</p>
        <p>In the JSON response, copy:</p>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
          <li><Code>id</Code> — Page ID</li>
          <li><Code>access_token</Code> — Page Access Token (also long-lived because it inherited from the long-lived User Token)</li>
        </ul>
      </Step>

      <Step n={16} title="Subscribe the Page to leadgen via API">
        <p>App-level subscription (Part 6) tells Meta that the app cares about leadgen.
          Page-level subscription tells <em>that specific Page</em> to forward leadgen events
          to the app. Both are required.</p>
        <p>In Graph API Explorer:</p>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
          <li>Method dropdown: GET → <strong className="text-[var(--sa-text)]">POST</strong></li>
          <li>Query: <Code>{'{page_id}/subscribed_apps'}</Code></li>
          <li>Add a parameter: name <Code>subscribed_fields</Code>, value <Code>leadgen</Code></li>
          <li><strong className="text-[var(--sa-text)]">Paste the Page Access Token directly into the Access Token field</strong> — not the User Token</li>
          <li>Submit. Expected: <Code>{'{"success":true}'}</Code></li>
        </ul>
      </Step>

      <Pitfall title="(#210) A page access token is required">
        You forgot to swap the Access Token field from User Token to Page Token. Both look like
        <Code>EAA...</Code> strings — they&rsquo;re different. Copy the <Code>access_token</Code> value
        from <Code>me/accounts</Code> in step 15 and paste explicitly.
      </Pitfall>

      <H2>Part 9 — Lead Access Manager (2 min)</H2>

      <Step n={17} title="Grant lead access on the Page">
        <p>Open <Code>business.facebook.com/{'{page_id}'}/lead_access_manager</Code>, or via Business Suite → Page settings → Lead Access.</p>
        <p>Click <strong className="text-[var(--sa-text)]">Add People</strong> → add the client&rsquo;s FB profile → grant <strong className="text-[var(--sa-text)]">Lead Access</strong> + <strong className="text-[var(--sa-text)]">CRM Access</strong>.</p>
        <p>Without this, Lead Ads Testing diagnostics show an orange triangle. Non-blocking for the page admin themselves but other team members won&rsquo;t see leads.</p>
      </Step>

      <H2>Part 10 — Save tokens in Superadmin and test</H2>

      <Step n={18} title="Paste Page ID + Page Access Token">
        <p>Superadmin → Meta Integration card → paste Page ID and Page Access Token from step 15. Save Settings.</p>
      </Step>

      <Step n={19} title="Click Test Connection">
        <p>The Meta Integration card has a <strong className="text-[var(--sa-text)]">Test Connection</strong> button (parked feature; ships with the per-org-meta-app branch).</p>
        <p>Expected: green toast with the Page name. Red toast = the actual Meta error — usually &ldquo;token expired&rdquo; or &ldquo;page not found&rdquo;.</p>
      </Step>

      <Step n={20} title="Fire a real test lead">
        <p><A href="https://developers.facebook.com/tools/lead-ads-testing">developers.facebook.com/tools/lead-ads-testing</A></p>
        <p>Select the app + the client&rsquo;s Page + a Lead Form. If no Lead Form exists, create one in Business Suite → Page → All Tools → Forms Library → Create. Form needs Name, Phone, Email + a privacy URL (<Code>https://consultrackk.vercel.app/privacy</Code>).</p>
        <p>Preview Form → fill the test data → submit. The lead should appear in Consultrack within 5 seconds in <em>All Leads</em> or <em>Facebook Leads</em>.</p>
      </Step>

      <Pitfall title="The dashboard Test button is unreliable">
        The Webhooks product page has a Test button next to each subscribed field. It often claims success
        without delivering. Always confirm by submitting a real lead via Lead Ads Testing tool.
      </Pitfall>

      <H2>What changes once Consultrack is verified</H2>
      <P>
        Switch the org back to <strong className="text-[var(--sa-text)]">Connection mode: Consultrack&rsquo;s app</strong>.
        The per-app fields (App ID, Secret, Verify Token) clear automatically. Send the client a <em>Reconnect with Facebook</em>
        link — single OAuth click and they&rsquo;re migrated. All historical leads and conversation data persist.
      </P>
    </>
  )
}
