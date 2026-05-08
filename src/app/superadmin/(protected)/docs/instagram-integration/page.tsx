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

export default function InstagramIntegrationDoc() {
  const [mode, setMode] = useState<Mode>('sa')

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        <Link href="/superadmin/docs"
          className="inline-flex items-center gap-1.5 text-[var(--sa-text-muted)] hover:text-[var(--sa-text)] text-sm mb-8 transition-colors">
          <ArrowLeft size={13} /> All docs
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{ background: 'rgba(225,48,108,0.1)', borderColor: 'rgba(225,48,108,0.2)', color: '#e1306c' }}>
            Instagram Lead Ads
          </div>
          <h1 className="text-2xl font-semibold text-[var(--sa-text)] tracking-tight">Instagram Integration</h1>
          <p className="text-[var(--sa-text-secondary)] text-sm mt-2 leading-relaxed">
            Auto-import leads, DMs, comments, and mentions from Instagram. Fully bifurcated from Facebook — separate account config, separate lead source, separate admin view.
          </p>
        </div>

        {/* Mode toggle — same shape as Meta Integration so navigating
            between the two pages stays consistent. */}
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
            : 'Use this during the App Review window. Prereq: the client must already have completed Meta Integration → Client’s own app first.'}
        </p>

        {mode === 'sa' ? <SaSetup /> : <ClientSetup />}

        <div className="mt-12 pt-6 border-t border-[var(--sa-border)]">
          <Link href="/superadmin/docs" className="text-sm text-[var(--sa-text-muted)] hover:text-[var(--sa-text)] transition-colors">
            ← Back to all docs
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── SA Setup (Consultrack's central Meta app) ────────────────
function SaSetup() {
  return (
    <>
      <div className="rounded-xl border p-4 mb-8"
        style={{ background: 'rgba(225,48,108,0.05)', borderColor: 'rgba(225,48,108,0.15)' }}>
        <p className="text-xs font-semibold text-pink-400 mb-1">FB vs IG — what&apos;s different</p>
        <p className="text-xs text-[var(--sa-text-secondary)] leading-relaxed">
          Facebook sends <Code>object: &quot;page&quot;</Code> events keyed by <Code>page_id</Code>.<br />
          Instagram sends <Code>object: &quot;instagram&quot;</Code> events keyed by <Code>ig_account_id</Code>.<br />
          Both come to the <strong>same webhook URL</strong> — Consultrack routes them separately based on object type. A client can run both simultaneously without conflict.
        </p>
      </div>

      <H2>Credentials overview</H2>
      <Table rows={[
        ['META_VERIFY_TOKEN',          'Global',   '.env — shared with Facebook'],
        ['META_APP_SECRET',            'Global',   '.env — shared with Facebook'],
        ['IG Business Account ID',     'Per-org',  'orgs.instagram_config.ig_account_id'],
        ['IG Page Access Token',       'Per-org',  'orgs.instagram_config.access_token'],
        ['IG CAPI Dataset ID',         'Per-org',  'orgs.instagram_config.capi_dataset_id (optional)'],
        ['INSTAGRAM_CAPI_TOKEN',       'Global',   '.env — fallback for CAPI push (optional)'],
        ['INSTAGRAM_CAPI_DATASET_ID',  'Global',   '.env — fallback if no per-org dataset set (optional)'],
      ]} />

      <H2>One-time setup (Meta app level)</H2>
      <P>If you already set up the Meta app for Facebook Lead Ads, the same app can handle Instagram. No new app needed.</P>

      <Step n={1} title="Open the Meta app dashboard">
        <p>Go to <A href="https://developers.facebook.com">developers.facebook.com</A> → My Apps → select your existing app.</p>
      </Step>
      <Step n={2} title="Subscribe Instagram webhook">
        <p>In the app dashboard → Webhooks → change the dropdown from <strong>Page</strong> to <strong>Instagram</strong>.</p>
        <p>Click <strong>Subscribe to this object</strong>. Use the same Callback URL and Verify Token as Facebook.</p>
        <p>Under Fields, subscribe: <Code>messages</Code>, <Code>comments</Code>, <Code>mentions</Code>. (IG Lead Ads come through the <strong>Page</strong> object set up in the Facebook integration doc, not Instagram — don&rsquo;t look for <Code>leadgen</Code> here.)</p>
      </Step>

      <Pitfall title="Newer apps see a different IG product UI">
        Recent Meta accounts now have a dedicated <strong>Instagram</strong> product (separate
        from Webhooks) with four numbered steps: Generate access tokens, Configure webhooks,
        Set up business login, App Review. Use <em>Step 1 — Add account</em> to attach the
        client&rsquo;s IG Business Account; <em>Step 2 — Configure webhooks</em> auto-fills
        if step 1 succeeds, otherwise paste the same Callback URL + Verify Token. Skip steps
        3 and 4 — both are for OAuth and App Review submissions you don&rsquo;t need for
        owned-asset testing.
      </Pitfall>

      <Step n={3} title="Add Instagram permissions">
        <p>App Review → Permissions and Features. Request <strong>Get Advanced Access</strong> on:</p>
        <p><Code>instagram_basic</Code>, <Code>instagram_manage_messages</Code>, <Code>instagram_manage_comments</Code>, <Code>instagram_manage_insights</Code>, plus <Code>pages_show_list</Code>, <Code>pages_manage_metadata</Code>.</p>
        <p>Standard Access works for testing on the app&rsquo;s own assets. Advanced Access (post-App-Review) is required to enrich profiles for users outside the app&rsquo;s test list.</p>
      </Step>

      <Pitfall title="DM webhooks fire but profile fetch fails (#200)">
        Standard Access on <Code>instagram_manage_messages</Code> can&rsquo;t fetch the
        profile of a DM sender unless that sender is added as an Instagram Tester in App
        Roles. Without it, the lead still gets created but the name is a placeholder
        (<em>&ldquo;Instagram User 1234&rdquo;</em>). Real usernames come automatically once
        Advanced Access is approved via App Review — no code change needed.
      </Pitfall>

      <H2>Per-client setup (SA actions)</H2>
      <P>Do this in the Org detail page → Settings tab → Instagram Integration card.</P>

      <Step n={1} title="Get the client's IG Business Account ID">
        <p>Ask the client to go to Meta Business Suite → Settings → Instagram Accounts.</p>
        <p>They click their account — the ID appears in the URL: <Code>business.facebook.com/settings/instagram-accounts/<strong>17841400000000000</strong></Code></p>
        <p>Or via Graph API: <Code>GET /me/instagram_accounts?access_token=TOKEN</Code></p>
      </Step>
      <Step n={2} title="Generate and save a long-lived Page Access Token">
        <p>The token must be a <strong>Page Access Token</strong> (not a User token) with <Code>instagram_manage_leads</Code>, <Code>instagram_manage_messages</Code>, and <Code>pages_show_list</Code> permissions.</p>
        <p>Use Graph API Explorer or Business Suite to generate and extend the token (60-day tokens need refresh; permanent tokens via system users are recommended).</p>
        <p>Paste the token into the IG Page Access Token field in the SA org settings.</p>
      </Step>
      <Step n={3} title="Send the setup guide to the client admin">
        <p>Click &quot;Send Guide&quot; in the Instagram Integration card. This sets <Code>instagram_setup_sent_at</Code> so the client admin sees the step-by-step instructions on their Settings → Instagram Ads page.</p>
      </Step>
      <Step n={4} title="(Optional) Configure CAPI Dataset ID">
        <p>If the client wants to push conversion signals (qualified/unqualified) back to Instagram, create a Dataset in Meta Events Manager and paste the Dataset ID in the CAPI Dataset ID field.</p>
      </Step>

      <H2>Client admin setup (user actions)</H2>
      <P>Direct the client admin to Settings → Instagram Ads in their Consultrack dashboard.</P>

      <Step n={1} title="Connect Instagram Business Account">
        <p>The client must have an Instagram Business or Creator account linked to a Facebook Page in Meta Business Suite.</p>
        <p>If not linked: Business Suite → Settings → Instagram Accounts → Connect.</p>
      </Step>
      <Step n={2} title="Create an Instagram Lead Ad">
        <p>In Ads Manager → New Campaign → Objective: <strong>Leads</strong>.</p>
        <p>At the ad level, select <strong>Instagram</strong> as the placement and use <strong>Instant Form</strong>. Publish the ad.</p>
      </Step>
      <Step n={3} title="Test the connection">
        <p>Use Meta&apos;s Lead Ads Testing Tool: <A href="https://developers.facebook.com/tools/lead-ads-testing">developers.facebook.com/tools/lead-ads-testing</A></p>
        <p>Submit a test lead. Within seconds it should appear in the client&apos;s <strong>Admin → Instagram Leads</strong> page.</p>
      </Step>

      <H2>Lead data flow</H2>
      <div className="my-6 flex flex-col items-center gap-0">
        <FlowStep label="User submits Instagram Lead Ad form" />
        <Arrow />
        <FlowStep label="Meta sends webhook event" sub="object: 'instagram', entry.id = IG Account ID" />
        <Arrow />
        <FlowStep label="Consultrack /api/meta/webhook" sub="routes to handleInstagramLeads()" />
        <Arrow />
        <FlowStep label="Org resolved via instagram_config.ig_account_id" />
        <Arrow />
        <FlowStep label="Lead fetched from Graph API" sub="fields: name, phone, email, course, location, ig_username" />
        <Arrow />
        <FlowStep label="Dedup check" sub="phone + instagram_lead_id per org" />
        <Arrow />
        <FlowStep label="Weighted allocation to best available employee" />
        <Arrow />
        <FlowStep label="Lead created" sub="source='instagram', main_stage='0', approved=true" />
        <Arrow />
        <FlowStep label="Activity log + cache bust" sub="admin-leads and analytics tags revalidated" />
      </div>

      <H2>Field mapping</H2>
      <Note>
        Instagram Lead Ads use the same <Code>field_data</Code> array as Facebook. All standard and custom fields work identically. The extra IG-specific data (<Code>ig_username</Code>) is stored in <Code>custom_data.ig_username</Code>.
      </Note>
      <Table rows={[
        ['first_name + last_name / full_name', 'leads.name',                    'Standard'],
        ['phone_number / phone',               'leads.phone',                   'Required for dedup'],
        ['email',                              'custom_data.email',             'Standard'],
        ['course / program',                   'custom_data.preferred_course',  'Standard'],
        ['city / location',                    'custom_data.location',          'Standard'],
        ['username / ig_username',             'custom_data.ig_username',       'IG-specific handle'],
        ['leadgen_id',                         'instagram_lead_id',             'IG dedup key'],
        ['Any custom form question',           'custom_data.<field_name>',      'Passed through as-is'],
      ]} />

      <H2>Token expiry</H2>
      <Note>
        Standard Page Access Tokens expire in ~60 days. Use a <strong>System User</strong> in Meta Business Suite for a non-expiring token: Business Suite → Settings → System Users → Generate Token with <Code>instagram_manage_leads</Code> permission. Paste the system user token in the SA org settings.
      </Note>

      <H2>Troubleshooting</H2>
      <H3>No leads arriving</H3>
      <CodeBlock>{`1. Check the ig_account_id saved in SA org settings matches the
   client's Instagram Business Account ID exactly.

2. Verify the access token has instagram_manage_leads permission:
   GET https://graph.facebook.com/debug_token?input_token=TOKEN
       &access_token=APP_ID|APP_SECRET

3. Confirm the Meta app Webhook is subscribed to Instagram → leadgen.

4. Check Vercel function logs (/api/meta/webhook) for
   [Instagram Webhook] error messages.`}</CodeBlock>

      <H3>Leads showing source=&quot;meta&quot; instead of &quot;instagram&quot;</H3>
      <P>This means the client used a Facebook form, not Instagram. The webhook correctly identifies the source from the object type. Check that the ad placement is set to Instagram in Ads Manager.</P>

      <H3>Push-audience returns &quot;No Instagram CAPI dataset configured&quot;</H3>
      <P>Add a Dataset ID in the SA org settings → Instagram Integration → CAPI Dataset ID field. Create the dataset in Meta Events Manager if it doesn&apos;t exist yet.</P>
    </>
  )
}

// ── Client Setup (own Meta app, IG-specific delta) ────────────
function ClientSetup() {
  return (
    <>
      <Note>
        <strong className="text-[var(--sa-text)]">Prerequisite:</strong> the client must have already completed
        the <Link href="/superadmin/docs/meta-integration" className="underline">Meta Integration → Client&rsquo;s
        own app</Link> walkthrough first. Their own Meta app needs to exist, be in Live mode, have webhooks
        verified, and have the FB Page subscribed to <Code>leadgen</Code>. The steps below are the
        IG-specific delta that runs <em>inside that same Meta app</em>.
      </Note>

      <H2>What we&rsquo;re wiring up</H2>
      <P>
        Inside the client&rsquo;s existing Meta app, we add the <strong>Instagram</strong> product, link
        their IG Business Account to it, and subscribe the Consultrack webhook to{' '}
        <Code>messages</Code>, <Code>comments</Code>, and <Code>mentions</Code>. This unlocks IG DMs as
        leads, comment-keyword triggers, and brand mention tracking. IG Lead Ads themselves still flow
        through the <strong>Page</strong> object you set up in the FB walkthrough — no extra Page-side
        wiring needed for IG Lead Ads on top.
      </P>

      <H2>Before you start</H2>
      <ul className="list-disc pl-6 text-xs text-[var(--sa-text-secondary)] leading-relaxed space-y-1 mb-6">
        <li>Client&rsquo;s IG Business Account credentials handy (username + password)</li>
        <li>That IG account must be linked to the same Facebook Page as their own Meta app —
          do this in <A href="https://business.facebook.com">Business Suite → Settings → Instagram Accounts → Connect</A> if not already.</li>
        <li>The own Meta app from the FB walkthrough is in <strong>Live</strong> mode (not Development).</li>
      </ul>

      <H2>Part 1 — Add the Instagram product (2 min)</H2>

      <Step n={1} title="+ Add Product → Instagram → Set Up">
        <p>In the client&rsquo;s Meta app dashboard → left sidebar → <strong className="text-[var(--sa-text)]">+ Add Product</strong> → <strong className="text-[var(--sa-text)]">Instagram</strong> → Set Up.</p>
        <p>The new IG product UI shows four numbered steps: <em>Generate access tokens</em>, <em>Configure webhooks</em>, <em>Set up business login</em>, <em>Complete app review</em>. We only need steps 1 and 2.</p>
      </Step>

      <H2>Part 2 — Step 1: Add the IG account (3 min)</H2>

      <Step n={2} title="Add Instagram Tester role first">
        <p>Before clicking <em>Add account</em>, give the IG Business Account a Tester role on the app:</p>
        <p>Left sidebar → <strong className="text-[var(--sa-text)]">App Roles → Roles</strong> → scroll to <strong className="text-[var(--sa-text)]">Instagram Testers</strong> → Add.</p>
        <p>Type the IG handle (e.g. <Code>acme_official</Code>) → Submit.</p>
        <p>Open Instagram on the IG account&rsquo;s phone → <strong className="text-[var(--sa-text)]">Settings → Apps and Websites → Tester Invites</strong> → accept.</p>
      </Step>

      <Step n={3} title="Click Add account on IG product step 1">
        <p>Back in the IG product page, click <strong className="text-[var(--sa-text)]">Add account</strong> on step 1.</p>
        <p>Log in with the IG Business Account credentials. Grant permissions.</p>
        <p>Once added, the access token + IG Business Account ID appear inline. Copy both:</p>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
          <li><Code>access_token</Code> — Instagram Page Access Token</li>
          <li><Code>id</Code> — IG Business Account ID (e.g. <Code>17841400000000000</Code>)</li>
        </ul>
      </Step>

      <H2>Part 3 — Step 2: Configure webhooks (2 min)</H2>

      <Step n={4} title="Step 2 in IG product UI">
        <p>If step 2 already shows a green ✓ (it auto-configures from step 1 in some accounts), skip ahead to step 5.</p>
        <p>If not: click into step 2 → paste the same <strong>Callback URL</strong> and <strong>Verify Token</strong> from the FB walkthrough (the verify token saved in Superadmin):</p>
        <p>Callback URL: <Code>https://consultrackk.vercel.app/api/meta/webhook</Code></p>
        <p>Verify Token: from Superadmin → Meta Integration → Verify Token field</p>
        <p>Click Verify and Save.</p>
      </Step>

      <Step n={5} title="Subscribe to messages, comments, mentions">
        <p>In the field list under step 2, toggle Subscribe on:</p>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
          <li><Code>messages</Code> — DMs to the IG Business Account</li>
          <li><Code>comments</Code> — comments on the IG account&rsquo;s posts</li>
          <li><Code>mentions</Code> — when other accounts @-mention the IG Business Account</li>
        </ul>
        <p><em>Do not</em> look for <Code>leadgen</Code> here — IG Lead Ads come through the Page object you set up in the FB walkthrough.</p>
      </Step>

      <Pitfall title="Skip step 3 (Business Login) and step 4 (App Review)">
        The IG product page nudges you toward both. Step 3 is for OAuth flows that connect
        third-party IG accounts (we don&rsquo;t use that). Step 4 is for going Live with general
        public access — irrelevant since we&rsquo;re only handling the client&rsquo;s own assets.
      </Pitfall>

      <H2>Part 4 — Save tokens in Superadmin (1 min)</H2>

      <Step n={6} title="Paste IG Business Account ID + Access Token">
        <p>Superadmin → the client&rsquo;s org → <strong className="text-[var(--sa-text)]">Instagram Integration</strong> card.</p>
        <p>Paste:</p>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
          <li><Code>ig_account_id</Code> — from step 3</li>
          <li><Code>access_token</Code> — from step 3</li>
        </ul>
        <p>Toggle the signal switches on for the channels they want: DMs / Comments / Mentions. (Comments needs a keywords list to filter on — typed comma-separated in the keywords field.)</p>
        <p>Save Settings.</p>
      </Step>

      <H2>Part 5 — Test (5 min)</H2>

      <Step n={7} title="DM test">
        <p>From any other Instagram account, send a DM to the client&rsquo;s IG Business Account.</p>
        <p>Within ~5 seconds the lead should appear in Consultrack → <strong>Admin → Instagram → DMs</strong> tab.</p>
      </Step>

      <Pitfall title="DM lead has placeholder name like 'Instagram User 1234'">
        Standard Access on <Code>instagram_manage_messages</Code> can&rsquo;t fetch profiles for users
        outside the app&rsquo;s tester list. The lead is still created with the IG-scoped sender ID
        captured for de-dupe; the name fills in once Advanced Access is approved via App Review (no
        code change needed). To test with real names during dev, add the sender as an Instagram Tester
        first.
      </Pitfall>

      <Step n={8} title="Comment test">
        <p>Post anything from the client&rsquo;s IG account. From another account, leave a comment containing one of the keywords configured in Superadmin (e.g. <em>interested</em>).</p>
        <p>Lead should appear in <strong>Admin → Instagram → Comments</strong>.</p>
      </Step>

      <Step n={9} title="Mention test">
        <p>From another account, post a story or comment that @-mentions the client&rsquo;s IG account.</p>
        <p>Lead should appear in <strong>Admin → Instagram → Mentions</strong>.</p>
      </Step>

      <Step n={10} title="IG Lead Ad test (uses FB walkthrough wiring)">
        <p>Same flow as the FB Lead Ad test in the Meta Integration → Client&rsquo;s own app guide.
          The form just needs Instagram placement set in Ads Manager. Lead lands in <strong>All Leads</strong>{' '}
          or <strong>Instagram</strong> with <Code>source = &quot;instagram&quot;</Code>.</p>
      </Step>

      <H2>What changes once Consultrack is verified</H2>
      <P>
        Same migration path as Meta Integration: SA flips back to <em>Consultrack&rsquo;s app</em>,
        client clicks Reconnect with Facebook, all historical IG leads + DM threads + comment leads
        persist. Only the credential wiring changes underneath.
      </P>
    </>
  )
}
