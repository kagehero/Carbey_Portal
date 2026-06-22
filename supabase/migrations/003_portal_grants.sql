-- =====================================================================
-- Carbey Portal — Phase 1: portal スキーマのテーブル権限 (GRANT)
-- =====================================================================
-- 新規スキーマ portal には public のようなデフォルト権限が無いため、
-- PostgREST が使う anon / authenticated ロールにテーブル権限を明示付与する。
-- 行レベルのアクセス制御は RLS (001) が担うので、テーブル権限は広めに付与してよい
-- (RLS が有効なテーブルでは GRANT だけではデータは見えない)。
-- service_role は RLS バイパスのため全権限を持つ。
-- =====================================================================

-- スキーマ使用権 (001 で付与済みだが冪等に再付与)
grant usage on schema portal to anon, authenticated, service_role;

-- 既存テーブルへの権限
grant select on all tables in schema portal to anon, authenticated;
grant insert, update, delete on all tables in schema portal to authenticated;
grant all on all tables in schema portal to service_role;

-- シーケンス (将来 serial を使う場合に備え)
grant usage, select on all sequences in schema portal to authenticated, service_role;

-- 関数の実行権 (portal.is_admin / current_franchise_id 等)
grant execute on all functions in schema portal to anon, authenticated, service_role;

-- 今後 portal に追加されるオブジェクトのデフォルト権限
alter default privileges in schema portal
  grant select on tables to anon, authenticated;
alter default privileges in schema portal
  grant insert, update, delete on tables to authenticated;
alter default privileges in schema portal
  grant all on tables to service_role;
alter default privileges in schema portal
  grant execute on functions to anon, authenticated, service_role;
alter default privileges in schema portal
  grant usage, select on sequences to authenticated, service_role;
