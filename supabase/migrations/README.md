# Portal マイグレーション

Carbey Portal は既存 Carbey と**同じ Supabase プロジェクトに相乗り**する。
新システムのテーブルは衝突回避のため専用スキーマ `portal` に置く（`docs/architecture.md` 参照）。

## 適用順

1. `001_portal_schema.sql` — `portal` スキーマ・テーブル・RLS・ヘルパー関数
2. `002_portal_seed_helpers.sql` — 管理者ブートストラップ用関数

Supabase SQL エディタに順に貼り付けて実行する（または Supabase CLI で `supabase db push`）。

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
     `002` で作成した `public.portal_bootstrap_admin` ラッパー経由で動くため、
     `portal` を Exposed schemas に追加する前でも実行できる。

   - **SQL エディタ**:
     ```sql
     select portal.bootstrap_admin('<auth.users の UUID>', '本部管理者');
     ```

4. **アプリを動かすには `portal` を Exposed schemas に追加**
   （Project Settings → API → Exposed schemas に `portal` を追加）。
   ※ 管理者登録だけなら手順3のスクリプトで完結するが、ログイン後の画面表示には公開が必須。

5. 加盟店ユーザーは管理画面から（または以下で）紐付け:

   ```sql
   select portal.attach_franchise_user('<user_id>', '<franchise_id>', 'franchise', '加盟店名');
   ```
