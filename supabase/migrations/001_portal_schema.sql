-- =====================================================================
-- Carbey Portal — Phase 1: Operational Foundation (DB設計, 新スペック版)
-- =====================================================================
-- 設計方針 (docs/architecture.md 参照):
--   - 既存 Carbey と同じ Supabase プロジェクトに「相乗り」。新システムは専用スキーマ portal。
--   - 認証は auth.users を共有。新システムのユーザー属性は portal.users で管理 (論点Y)。
--   - tenant 分離キーは member_id / user_id。RLS でロール別アクセス制御 (論点A)。
--
-- ロール (新スペック): super_admin / staff / member
-- プラン:             home_dealer / economy / bronze / silver / gold
-- 会員ステータス:     pending / active / suspended / cancelled
--
-- 全文を再実行可能 (冪等)。 既存の portal スキーマがあれば drop して作り直す。
-- =====================================================================

-- クリーンに作り直す (rewrite fresh)
drop schema if exists portal cascade;
create schema portal;

grant usage on schema portal to anon, authenticated, service_role;

-- updated_at 自動更新
create or replace function portal.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- plans — プランマスタ (Admin が作成・編集)
-- ---------------------------------------------------------------------
create table portal.plans (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,                  -- 'home_dealer' | 'economy' | 'bronze' | 'silver' | 'gold'
  name          text not null,
  plan_type     text not null check (plan_type in ('semi_auto', 'full_auto')),
  monthly_fee_yen integer not null default 0,
  joining_fee_yen integer not null default 0,
  display_order int not null default 0,
  description   text,
  features      jsonb not null default '[]'::jsonb,     -- 機能リスト (文字列配列)
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_portal_plans_order on portal.plans(display_order);

create trigger trg_portal_plans_touch
  before update on portal.plans
  for each row execute function portal.touch_updated_at();

insert into portal.plans (code, name, plan_type, monthly_fee_yen, joining_fee_yen, display_order, description) values
  ('home_dealer', 'ホームディーラー (半自動)', 'semi_auto', 10000, 0, 0, '加盟者主体の半自動プラン'),
  ('economy',     'エコノミー', 'full_auto', 10000, 0, 1, '全自動プランの入門ランク'),
  ('bronze',      'ブロンズ',   'full_auto', 20000, 0, 2, '中位プラン。自動売買機能に一部制限あり'),
  ('silver',      'シルバー',   'full_auto', 30000, 0, 3, '上位プラン'),
  ('gold',        'ゴールド',   'full_auto', 50000, 0, 4, '最上位プラン');

-- ---------------------------------------------------------------------
-- users — 新システムのユーザー属性 (auth.users と id で 1:1)
--   role: super_admin (全権) / staff (内部オペレーター) / member (加盟店)
-- ---------------------------------------------------------------------
create table portal.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  role        text not null check (role in ('super_admin', 'staff', 'member')),
  status      text not null default 'active' check (status in ('active', 'suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_portal_users_role on portal.users(role);

create trigger trg_portal_users_touch
  before update on portal.users
  for each row execute function portal.touch_updated_at();

-- ---------------------------------------------------------------------
-- members — 加盟店 (franchisee) の業務情報。role='member' の user に紐付く。
-- ---------------------------------------------------------------------
create table portal.members (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique references auth.users(id) on delete set null,  -- ログインユーザー (未招待なら null)
  company_name    text,
  member_name     text not null,                         -- 担当者氏名
  phone           text,
  email           text,
  address         text,
  plan_id         uuid references portal.plans(id),
  status          text not null default 'pending'
                    check (status in ('pending', 'active', 'suspended', 'cancelled')),
  -- 財務
  joining_fee_yen integer,
  monthly_fee_yen integer,
  payment_status  text not null default 'unpaid'
                    check (payment_status in ('unpaid', 'paid', 'overdue')),
  -- 利用状況
  registration_date date not null default current_date,
  last_login_at   timestamptz,
  -- オンボーディング進捗 (Phase 2 で本体実装。ここでは完了ステップ数のみ)
  onboarding_total int not null default 8,
  onboarding_done  int not null default 0,
  -- 管理者内部メモ
  admin_notes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_portal_members_status on portal.members(status);
create index idx_portal_members_plan   on portal.members(plan_id);
create index idx_portal_members_user   on portal.members(user_id);

create trigger trg_portal_members_touch
  before update on portal.members
  for each row execute function portal.touch_updated_at();

-- ---------------------------------------------------------------------
-- payments — 入金履歴
-- ---------------------------------------------------------------------
create table portal.payments (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references portal.members(id) on delete cascade,
  amount_yen   integer not null,
  payment_date date not null default current_date,
  kind         text not null default 'monthly' check (kind in ('joining', 'monthly', 'other')),
  status       text not null default 'confirmed' check (status in ('pending', 'confirmed', 'failed')),
  note         text,
  created_at   timestamptz not null default now()
);

create index idx_portal_payments_member on portal.payments(member_id);
create index idx_portal_payments_date   on portal.payments(payment_date);

-- ---------------------------------------------------------------------
-- crm_leads — 見込み客パイプライン (prospect → member 変換)
--   status: inquiry → consultation → proposal → contract → active / suspended
-- ---------------------------------------------------------------------
create table portal.crm_leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  company      text,
  phone        text,
  email        text,
  status       text not null default 'inquiry'
                 check (status in ('inquiry', 'consultation', 'proposal', 'contract', 'active', 'suspended')),
  source       text,                                    -- 流入経路 (任意)
  memo         text,
  -- 変換時に作成された member への参照 (convert lead → member)
  converted_member_id uuid references portal.members(id) on delete set null,
  assigned_to  uuid references auth.users(id) on delete set null,  -- 担当 staff/admin
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_portal_crm_leads_status on portal.crm_leads(status);

create trigger trg_portal_crm_leads_touch
  before update on portal.crm_leads
  for each row execute function portal.touch_updated_at();

-- フォローアップ履歴
create table portal.crm_lead_notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references portal.crm_leads(id) on delete cascade,
  author_id  uuid references auth.users(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);

create index idx_portal_crm_lead_notes_lead on portal.crm_lead_notes(lead_id);

-- ---------------------------------------------------------------------
-- notifications — 通知 (新規会員登録・入金確認・オーダー・チャット等)
-- ---------------------------------------------------------------------
create table portal.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,  -- 宛先 (null = 全 admin/staff 向け)
  audience    text not null default 'user' check (audience in ('user', 'admin')),
  kind        text not null default 'info',              -- 'member_registered' | 'payment_confirmed' | 'order' | 'chat' | 'info'
  title       text not null,
  message     text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_portal_notifications_user on portal.notifications(user_id, is_read);
create index idx_portal_notifications_audience on portal.notifications(audience, is_read);

-- =====================================================================
-- RLS ヘルパー関数
-- =====================================================================

-- super_admin か?
create or replace function portal.is_super_admin(uid uuid)
returns boolean language sql stable security definer set search_path = portal as $$
  select exists (select 1 from portal.users u where u.id = uid and u.role = 'super_admin');
$$;

-- super_admin か staff か? (内部スタッフ)
create or replace function portal.is_staff_or_admin(uid uuid)
returns boolean language sql stable security definer set search_path = portal as $$
  select exists (select 1 from portal.users u where u.id = uid and u.role in ('super_admin', 'staff'));
$$;

-- uid が紐付く member.id (member 本人のみ。staff/admin は null)
create or replace function portal.current_member_id(uid uuid)
returns uuid language sql stable security definer set search_path = portal as $$
  select m.id from portal.members m where m.user_id = uid;
$$;

-- =====================================================================
-- RLS ポリシー
-- =====================================================================
alter table portal.plans          enable row level security;
alter table portal.users          enable row level security;
alter table portal.members        enable row level security;
alter table portal.payments       enable row level security;
alter table portal.crm_leads      enable row level security;
alter table portal.crm_lead_notes enable row level security;
alter table portal.notifications  enable row level security;

-- plans: 認証ユーザーは閲覧可 / 書き込みは super_admin
create policy portal_plans_read on portal.plans
  for select using (auth.uid() is not null);
create policy portal_plans_admin_write on portal.plans
  for all using (portal.is_super_admin(auth.uid())) with check (portal.is_super_admin(auth.uid()));

-- users: admin/staff は全件 / 本人は自分の行
create policy portal_users_read on portal.users
  for select using (portal.is_staff_or_admin(auth.uid()) or id = auth.uid());
create policy portal_users_admin_write on portal.users
  for all using (portal.is_super_admin(auth.uid())) with check (portal.is_super_admin(auth.uid()));

-- members: admin/staff は全件 / member 本人は自分の行のみ
create policy portal_members_read on portal.members
  for select using (
    portal.is_staff_or_admin(auth.uid())
    or user_id = auth.uid()
  );
create policy portal_members_staff_write on portal.members
  for all using (portal.is_staff_or_admin(auth.uid())) with check (portal.is_staff_or_admin(auth.uid()));

-- payments: admin/staff 全件 / member は自分の分を閲覧
create policy portal_payments_read on portal.payments
  for select using (
    portal.is_staff_or_admin(auth.uid())
    or member_id = portal.current_member_id(auth.uid())
  );
create policy portal_payments_staff_write on portal.payments
  for all using (portal.is_staff_or_admin(auth.uid())) with check (portal.is_staff_or_admin(auth.uid()));

-- crm_leads / notes: admin/staff のみ (member は不可)
create policy portal_crm_leads_staff_all on portal.crm_leads
  for all using (portal.is_staff_or_admin(auth.uid())) with check (portal.is_staff_or_admin(auth.uid()));
create policy portal_crm_lead_notes_staff_all on portal.crm_lead_notes
  for all using (portal.is_staff_or_admin(auth.uid())) with check (portal.is_staff_or_admin(auth.uid()));

-- notifications: 宛先本人 (user_id=自分) または admin宛て(audience='admin')をadmin/staffが読む
create policy portal_notifications_read on portal.notifications
  for select using (
    user_id = auth.uid()
    or (audience = 'admin' and portal.is_staff_or_admin(auth.uid()))
  );
create policy portal_notifications_update_own on portal.notifications
  for update using (
    user_id = auth.uid()
    or (audience = 'admin' and portal.is_staff_or_admin(auth.uid()))
  );
create policy portal_notifications_staff_write on portal.notifications
  for insert with check (portal.is_staff_or_admin(auth.uid()));

-- =====================================================================
-- GRANTS (新規スキーマには public のデフォルト権限が無いため明示付与)
-- =====================================================================
grant select on all tables in schema portal to anon, authenticated;
grant insert, update, delete on all tables in schema portal to authenticated;
grant all on all tables in schema portal to service_role;
grant execute on all functions in schema portal to anon, authenticated, service_role;

alter default privileges in schema portal grant select on tables to anon, authenticated;
alter default privileges in schema portal grant insert, update, delete on tables to authenticated;
alter default privileges in schema portal grant all on tables to service_role;
alter default privileges in schema portal grant execute on functions to anon, authenticated, service_role;
