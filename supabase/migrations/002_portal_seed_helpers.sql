-- =====================================================================
-- Carbey Portal — Phase 1: ブートストラップ用ヘルパー
-- =====================================================================
-- 最初の本部管理者を登録する。auth.users に既にユーザーが存在する前提
-- (Supabase ダッシュボード or signUp で作成済み) で、その user_id を admin にする。
--
-- 使い方 (SQL エディタで実行):
--   select portal.bootstrap_admin('<auth.users の UUID>', '本部管理者');
-- =====================================================================

create or replace function portal.bootstrap_admin(p_user_id uuid, p_name text default null)
returns void
language plpgsql
security definer
set search_path = portal
as $$
begin
  insert into portal.memberships (user_id, franchise_id, role, display_name)
  values (p_user_id, null, 'admin', p_name)
  on conflict (user_id) do update
    set role = 'admin', franchise_id = null, display_name = coalesce(excluded.display_name, portal.memberships.display_name);
end;
$$;

comment on function portal.bootstrap_admin is
  '最初の本部管理者を登録/昇格する。auth.users に存在する user_id を渡す。';

-- 加盟店ユーザーを作成済み auth ユーザーに紐付けるヘルパー
create or replace function portal.attach_franchise_user(
  p_user_id uuid,
  p_franchise_id uuid,
  p_role text default 'franchise',
  p_name text default null
)
returns void
language plpgsql
security definer
set search_path = portal
as $$
begin
  if p_role not in ('franchise', 'crm_staff', 'chat_only') then
    raise exception 'invalid franchise role: %', p_role;
  end if;
  insert into portal.memberships (user_id, franchise_id, role, display_name)
  values (p_user_id, p_franchise_id, p_role, p_name)
  on conflict (user_id) do update
    set franchise_id = excluded.franchise_id,
        role = excluded.role,
        display_name = coalesce(excluded.display_name, portal.memberships.display_name);
end;
$$;

comment on function portal.attach_franchise_user is
  '作成済み auth ユーザーを加盟店メンバー (franchise/crm_staff/chat_only) として紐付ける。';
