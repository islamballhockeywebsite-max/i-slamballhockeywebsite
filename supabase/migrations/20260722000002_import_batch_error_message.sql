-- Surfaces why a commit failed on the results page instead of leaving the admin with just
-- a "failed" badge and no explanation.
alter table public.import_batches add column error_message text;
