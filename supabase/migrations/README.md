# Portal マイグレーション

Carbey Portal は既存 Carbey と**同じ Supabase プロジェクトに相乗り**する。
新システムのテーブルは衝突回避のため専用スキーマ `portal` に置く（`docs/architecture.md` 参照）。

## 適用順

1. `001_portal_schema.sql` — `portal` スキーマ・テーブル・RLS・GRANT・ヘルパー
   （**注意**: 冒頭で `drop schema if exists portal cascade` する＝既存 portal データを作り直す）
2. `002_portal_seed_helpers.sql` — ブートストラップ用関数

Supabase SQL エディタに順に貼り付けて実行する（または Supabase CLI で `supabase db push`）。

### ロール / プラン / ステータス (新スペック)

- ロール: `super_admin`（全権）/ `staff`（内部オペレーター）/ `member`（加盟店）
- プラン: `home_dealer` / `economy` / `bronze` / `silver` / `gold`
- 会員ステータス: `pending` / `active` / `suspended` / `cancelled`

## ⚠️ 重要: PostgREST に portal スキーマを公開する

`portal` スキーマを Supabase クライアント (`createClient(...).schema('portal')`) から
読み書きするには、PostgREST の公開スキーマに `portal` を追加する必要がある。

Supabase ダッシュボード → **Project Settings → API → Exposed schemas** に
`portal` を追加する（`public, portal` のように）。

CLI/セルフホストの場合は PostgREST の `db-schemas`（環境変数 `PGRST_DB_SCHEMAS`）に追加。

## 初回セットアップ手順

1. **マイグレーションを適用（再実行可能）。**
   `001` / `002` は冪等化済み（`if not exists` / `drop ... if exists`）なので、
   途中でエラーが出た場合や既に一部適用済みの場合でも、丸ごと貼り直して再実行してよい。
   > 以前 `relation "plans" already exists` で止まった場合、`franchises` 以降や
   > ヘルパー関数が未作成のことがある。冪等化済みの現行版を**最後まで再実行**すること。

2. 本部管理者にするユーザーを Auth で作成（`scripts/create-admin.mjs` が自動で行う。
   既に作成済みなら再利用される）。

3. 管理者を登録（2通り）:

   - **スクリプト（推奨・portal 公開不要）**:
     ```bash
     node --env-file=.env scripts/create-admin.mjs 'admin@example.com' 'password123!' '本部管理者'
     ```
     `002` で作成した `public.portal_bootstrap_super_admin` ラッパー経由で動くため、
     `portal` を Exposed schemas に追加する前でも実行できる。

   - **SQL エディタ**:
     ```sql
     select portal.bootstrap_super_admin('<auth.users の UUID>', '本部管理者', 'admin@example.com');
     ```

4. **アプリを動かすには `portal` を Exposed schemas に追加**
   （Project Settings → API → Exposed schemas に `portal` を追加）。
   ※ 管理者登録だけなら手順3のスクリプトで完結するが、ログイン後の画面表示には公開が必須。

5. staff / member ユーザーは以下で紐付け:

   ```sql
   select portal.attach_user('<user_id>', 'staff', 'スタッフ名', 'staff@example.com');
   ```
