-- =====================================================================
-- Carbey Portal — Phase 1: ブートストラップ用ヘルパー (新スペック版)
-- =====================================================================
-- auth.users に存在する user_id を portal.users に登録する。
-- public ラッパーも用意し、portal スキーマ未公開でも RPC で呼べるようにする。
-- =====================================================================

-- super_admin を登録/昇格
create or replace function portal.bootstrap_super_admin(p_user_id uuid, p_name text default null, p_email text default null)
returns void language plpgsql security definer set search_path = portal as $$
begin
  insert into portal.users (id, name, email, role)
  values (p_user_id, p_name, p_email, 'super_admin')
  on conflict (id) do update
    set role = 'super_admin',
        name = coalesce(excluded.name, portal.users.name),
        email = coalesce(excluded.email, portal.users.email);
end;
$$;

comment on function portal.bootstrap_super_admin is
  '最初の super_admin を登録/昇格する。auth.users に存在する user_id を渡す。';

-- public ラッパー (PostgREST は public のみ公開のため)
create or replace function public.portal_bootstrap_super_admin(p_user_id uuid, p_name text default null, p_email text default null)
returns void language sql security definer set search_path = public, portal as $$
  select portal.bootstrap_super_admin(p_user_id, p_name, p_email);
$$;

comment on function public.portal_bootstrap_super_admin is
  'portal.bootstrap_super_admin の public ラッパー。スキーマ未公開でも RPC 呼び出し可能にするため。';

-- 任意ロールのユーザーを登録 (staff など)
create or replace function portal.attach_user(p_user_id uuid, p_role text, p_name text default null, p_email text default null)
returns void language plpgsql security definer set search_path = portal as $$
begin
  if p_role not in ('super_admin', 'staff', 'member') then
    raise exception 'invalid role: %', p_role;
  end if;
  insert into portal.users (id, name, email, role)
  values (p_user_id, p_name, p_email, p_role)
  on conflict (id) do update
    set role = excluded.role,
        name = coalesce(excluded.name, portal.users.name),
        email = coalesce(excluded.email, portal.users.email);
end;
$$;

comment on function portal.attach_user is
  '作成済み auth ユーザーを portal.users に登録する (super_admin/staff/member)。';
