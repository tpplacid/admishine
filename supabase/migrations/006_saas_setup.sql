-- ============================================================
-- SaaS setup: org logo, invite links
-- ============================================================

-- Add logo_url to orgs (slug already exists from 001_schema.sql)
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS logo_url text;

-- Invite links table
CREATE TABLE IF NOT EXISTS org_invites (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  token       text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64url'),
  email       text,                         -- optional: pre-fill email
  role        text NOT NULL DEFAULT 'ad',
  name        text,                         -- optional: pre-fill name
  used_at     timestamptz,
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at  timestamptz DEFAULT now()
);

-- No RLS — only accessible via service-role key (super admin)
-- Public: allow reading own invite by token (for accept page)
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invite_read_by_token" ON org_invites FOR SELECT USING (true);
