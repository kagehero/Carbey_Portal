-- =====================================================================
-- Carbey Portal — Phase 1: システム基盤構築 (DB設計)
-- =====================================================================
-- 設計方針 (docs/architecture.md 参照):
--   - 既存 Carbey と同じ Supabase プロジェクトに「相乗り」する。
--   - 名前空間の衝突を避けるため、新システムは専用スキーマ `portal` に置く (論点X)。
--   - 認証は既存 Carbey と同じ auth.users を共有する。新システムのユーザー属性は
--     portal.memberships で管理し、auth.users とは id で紐付ける (論点Y)。
--   - 既存 public スキーマ (user_profiles, inventories 等) には一切触れない。
--   - tenant_id (= portal.franchises.id) を業務テーブルの分離キーとして一貫導入する (論点A)。
-- =====================================================================

create schema if not exists portal;

-- 認証ユーザーは anon/authenticated ロールでスキーマを使える必要がある
grant usage on schema portal to anon, authenticated, service_role;

-- updated_at 自動更新 (portal スキーマ内に独立して定義し public のものに依存しない)
create or replace function portal.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- プラン定義 (要求書 4節)
--   全自動: economy / bronze / platinum / gold、半自動: semi_auto
--   表示順は加盟金の安いものから。AI壁打ち権限は全プラン同一 (要求書 P5)。
-- ---------------------------------------------------------------------
create table portal.plans (
  code         text primary key,                      -- 'semi_auto' | 'economy' | 'bronze' | 'platinum' | 'gold'
  name         text not null,                          -- 表示名
  plan_type    text not null check (plan_type in ('semi_auto', 'full_auto')),
  display_order int  not null,                          -- サイト表示順
  description  text,
  created_at   timestamptz not null default now()
);

insert into portal.plans (code, name, plan_type, display_order, description) values
  ('semi_auto', '半自動 (カーベイホームディーラー)', 'semi_auto', 0, '加盟者主体で車両選定・仕入れ・販売を行うプラン'),
  ('economy',   'エコノミー', 'full_auto', 1, '全自動プランの入門ランク'),
  ('bronze',    'ブロンズ',   'full_auto', 2, '中位プラン。自動売買機能に一部制限あり'),
  ('platinum',  'プラチナ',   'full_auto', 3, '上位プラン'),
  ('gold',      'ゴールド',   'full_auto', 4, '最上位プラン')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- 加盟店 (テナント) — 要求書 5.2
-- ---------------------------------------------------------------------
create table portal.franchises (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                        -- 加盟店名 / 氏名
  status          text not null default 'active'
                    check (status in ('active', 'suspended', 'terminated')),  -- 有効/停止/解約
  plan_code       text references portal.plans(code),
  -- 基本情報 (要求書 5.2)
  address         text,
  phone_mobile    text,
  phone_landline  text,
  email           text,
  -- 陸送先
  delivery_name   text,
  delivery_address text,
  delivery_contact text,
  -- 契約情報
  contract_date   date,
  -- 財務情報 (詳細は Phase 3 / 別テーブルで拡張)
  monthly_fee_yen integer,
  -- オンボーディング状態 (AIロック判定の前提。フロー本体は Phase 2)
  onboarding_completed boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_portal_franchises_status on portal.franchises(status);
create index idx_portal_franchises_plan   on portal.franchises(plan_code);

create trigger trg_portal_franchises_touch
  before update on portal.franchises
  for each row execute function portal.touch_updated_at();

-- ---------------------------------------------------------------------
-- メンバーシップ — auth.users と加盟店/ロールの紐付け (論点Y)
--   ロール: 要求書 5.1 の4区分
--     admin        : 本部管理者 (franchise_id は null。全テナント横断)
--     franchise    : 加盟店オーナー
--     crm_staff    : CRM入力担当
--     chat_only    : チャット専用
--   1ユーザーは原則1メンバーシップ。本部 admin は franchise_id = null。
-- ---------------------------------------------------------------------
create table portal.memberships (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  franchise_id uuid references portal.franchises(id) on delete cascade,
  role         text not null check (role in ('admin', 'franchise', 'crm_staff', 'chat_only')),
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- 本部 admin は franchise_id null、それ以外は franchise_id 必須
  constraint chk_membership_franchise check (
    (role = 'admin' and franchise_id is null) or
    (role <> 'admin' and franchise_id is not null)
  )
);

create index idx_portal_memberships_franchise on portal.memberships(franchise_id);
create index idx_portal_memberships_role      on portal.memberships(role);

create trigger trg_portal_memberships_touch
  before update on portal.memberships
  for each row execute function portal.touch_updated_at();

-- ---------------------------------------------------------------------
-- RLS ヘルパー関数 (security definer で portal.memberships を参照)
-- ---------------------------------------------------------------------

-- 本部管理者か?
create or replace function portal.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = portal as $$
  select exists (
    select 1 from portal.memberships m where m.user_id = uid and m.role = 'admin'
  );
$$;

-- uid が属する加盟店ID (本部 admin は null)
create or replace function portal.current_franchise_id(uid uuid)
returns uuid language sql stable security definer set search_path = portal as $$
  select m.franchise_id from portal.memberships m where m.user_id = uid;
$$;

-- ---------------------------------------------------------------------
-- 契約情報 — 要求書 5.2 (契約日・プラン・ステータス履歴)
--   franchises に最新値を持たせつつ、変更履歴を contracts に残す。
-- ---------------------------------------------------------------------
create table portal.contracts (
  id           uuid primary key default gen_random_uuid(),
  franchise_id uuid not null references portal.franchises(id) on delete cascade,
  plan_code    text references portal.plans(code),
  status       text not null default 'active'
                 check (status in ('active', 'suspended', 'terminated')),
  started_at   date not null default current_date,
  ended_at     date,
  note         text,
  created_at   timestamptz not null default now()
);

create index idx_portal_contracts_franchise on portal.contracts(franchise_id);

-- ---------------------------------------------------------------------
-- CRM (基本) — 要求書 5.12 (本部管理画面で MVP 範囲実装)
--   将来の外部CRM連携・加盟店側拡張を見据え、franchise_id でモジュール化。
-- ---------------------------------------------------------------------
create table portal.crm_customers (
  id           uuid primary key default gen_random_uuid(),
  franchise_id uuid references portal.franchises(id) on delete set null,  -- 本部直管理は null 可
  name         text not null,
  phone        text,
  email        text,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_portal_crm_customers_franchise on portal.crm_customers(franchise_id);

create trigger trg_portal_crm_customers_touch
  before update on portal.crm_customers
  for each row execute function portal.touch_updated_at();

create table portal.crm_deals (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references portal.crm_customers(id) on delete cascade,
  status       text not null default 'open'
                 check (status in ('open', 'in_progress', 'won', 'lost')),
  title        text,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_portal_crm_deals_customer on portal.crm_deals(customer_id);

create trigger trg_portal_crm_deals_touch
  before update on portal.crm_deals
  for each row execute function portal.touch_updated_at();

-- =====================================================================
-- RLS
-- =====================================================================
alter table portal.franchises    enable row level security;
alter table portal.memberships   enable row level security;
alter table portal.contracts     enable row level security;
alter table portal.crm_customers enable row level security;
alter table portal.crm_deals     enable row level security;
alter table portal.plans         enable row level security;

-- plans: 認証ユーザーは誰でも読める / 書き込みは admin
create policy portal_plans_read on portal.plans
  for select using (auth.uid() is not null);
create policy portal_plans_admin_write on portal.plans
  for all using (portal.is_admin(auth.uid())) with check (portal.is_admin(auth.uid()));

-- franchises: admin は全件、加盟店ユーザーは自分の加盟店のみ読める。書き込みは admin。
create policy portal_franchises_read on portal.franchises
  for select using (
    portal.is_admin(auth.uid())
    or id = portal.current_franchise_id(auth.uid())
  );
create policy portal_franchises_admin_write on portal.franchises
  for all using (portal.is_admin(auth.uid())) with check (portal.is_admin(auth.uid()));

-- memberships: admin は全件、本人は自分の行を読める。書き込みは admin のみ。
create policy portal_memberships_read on portal.memberships
  for select using (
    portal.is_admin(auth.uid())
    or user_id = auth.uid()
  );
create policy portal_memberships_admin_write on portal.memberships
  for all using (portal.is_admin(auth.uid())) with check (portal.is_admin(auth.uid()));

-- contracts: admin 全件 / 加盟店は自分の分のみ読める。書き込みは admin。
create policy portal_contracts_read on portal.contracts
  for select using (
    portal.is_admin(auth.uid())
    or franchise_id = portal.current_franchise_id(auth.uid())
  );
create policy portal_contracts_admin_write on portal.contracts
  for all using (portal.is_admin(auth.uid())) with check (portal.is_admin(auth.uid()));

-- CRM: MVP では本部管理。admin 全件 read/write、加盟店は自分の分を読める (将来の加盟店拡張に備え franchise_id 分離)。
create policy portal_crm_customers_admin_write on portal.crm_customers
  for all using (portal.is_admin(auth.uid())) with check (portal.is_admin(auth.uid()));
create policy portal_crm_customers_franchise_read on portal.crm_customers
  for select using (
    portal.is_admin(auth.uid())
    or franchise_id = portal.current_franchise_id(auth.uid())
  );

create policy portal_crm_deals_admin_write on portal.crm_deals
  for all using (portal.is_admin(auth.uid())) with check (portal.is_admin(auth.uid()));
create policy portal_crm_deals_franchise_read on portal.crm_deals
  for select using (
    portal.is_admin(auth.uid())
    or exists (
      select 1 from portal.crm_customers c
      where c.id = crm_deals.customer_id
        and c.franchise_id = portal.current_franchise_id(auth.uid())
    )
  );

-- service_role (サーバー側 admin クライアント) は RLS をバイパスするため明示ポリシー不要。
