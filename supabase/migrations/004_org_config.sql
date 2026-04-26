-- ============================================================
-- Custom pipeline stages per org
-- ============================================================
CREATE TABLE org_stages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  key         text NOT NULL,
  label       text NOT NULL,
  color_bg    text NOT NULL DEFAULT 'bg-slate-100',
  color_text  text NOT NULL DEFAULT 'text-slate-600',
  position    integer NOT NULL DEFAULT 0,
  sla_days    integer,
  is_won      boolean NOT NULL DEFAULT false,
  is_lost     boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(org_id, key)
);

-- ============================================================
-- Sub-stages per stage per org
-- ============================================================
CREATE TABLE org_stage_substages (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  stage_key  text NOT NULL,
  label      text NOT NULL,
  position   integer NOT NULL DEFAULT 0
);

-- ============================================================
-- Stage flow connections (flowchart edges)
-- ============================================================
CREATE TABLE org_stage_flows (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  from_stage text NOT NULL,
  to_stage   text NOT NULL,
  UNIQUE(org_id, from_stage, to_stage)
);

-- ============================================================
-- Custom roles per org
-- ============================================================
CREATE TABLE org_roles (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id               uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  key                  text NOT NULL,
  label                text NOT NULL,
  level                integer NOT NULL DEFAULT 1,
  can_view_team        boolean NOT NULL DEFAULT false,
  can_transfer_leads   boolean NOT NULL DEFAULT false,
  can_approve_leads    boolean NOT NULL DEFAULT false,
  can_access_admin     boolean NOT NULL DEFAULT false,
  position             integer NOT NULL DEFAULT 0,
  created_at           timestamptz DEFAULT now(),
  UNIQUE(org_id, key)
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE org_stages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_stage_substages ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_stage_flows     ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_roles           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_stages_select"    ON org_stages FOR SELECT USING (org_id = auth_employee_org_id());
CREATE POLICY "org_stages_insert"    ON org_stages FOR INSERT WITH CHECK (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
CREATE POLICY "org_stages_update"    ON org_stages FOR UPDATE USING    (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
CREATE POLICY "org_stages_delete"    ON org_stages FOR DELETE USING    (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');

CREATE POLICY "org_substages_select" ON org_stage_substages FOR SELECT USING (org_id = auth_employee_org_id());
CREATE POLICY "org_substages_insert" ON org_stage_substages FOR INSERT WITH CHECK (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
CREATE POLICY "org_substages_update" ON org_stage_substages FOR UPDATE USING    (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
CREATE POLICY "org_substages_delete" ON org_stage_substages FOR DELETE USING    (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');

CREATE POLICY "org_flows_select"     ON org_stage_flows FOR SELECT USING (org_id = auth_employee_org_id());
CREATE POLICY "org_flows_insert"     ON org_stage_flows FOR INSERT WITH CHECK (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
CREATE POLICY "org_flows_delete"     ON org_stage_flows FOR DELETE USING    (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');

CREATE POLICY "org_roles_select"     ON org_roles FOR SELECT USING (org_id = auth_employee_org_id());
CREATE POLICY "org_roles_insert"     ON org_roles FOR INSERT WITH CHECK (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
CREATE POLICY "org_roles_update"     ON org_roles FOR UPDATE USING    (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
CREATE POLICY "org_roles_delete"     ON org_roles FOR DELETE USING    (org_id = auth_employee_org_id() AND auth_employee_role() = 'ad');
