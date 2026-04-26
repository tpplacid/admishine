-- Allow fractional days (e.g. 1.5 = 1 day 12 hours) for SLA deadlines
ALTER TABLE org_stages ALTER COLUMN sla_days TYPE numeric USING sla_days::numeric;
