-- ============================================================================
-- MenuScan — the guest languages added with the language picker
--
-- Every *_translations table points at public.locales, so a German dish name
-- cannot be stored until German exists here. Run once, after schema.sql.
-- Safe to re-run.
--
-- These are NOT added to restaurant_locales: that list is what the admin form
-- shows fields for, and nobody types nine languages by hand. The app fills
-- these in automatically (frontend/lib/translate.mjs).
-- ============================================================================

insert into public.locales (code, label, native_label) values
  ('sv', 'Swedish', 'Svenska'),
  ('da', 'Danish', 'Dansk'),
  ('de', 'German', 'Deutsch'),
  ('fr', 'French', 'Français'),
  ('es', 'Spanish', 'Español'),
  ('it', 'Italian', 'Italiano'),
  ('pl', 'Polish', 'Polski'),
  ('uk', 'Ukrainian', 'Українська'),
  ('ja', 'Japanese', '日本語')
on conflict (code) do update
  set label = excluded.label, native_label = excluded.native_label;
