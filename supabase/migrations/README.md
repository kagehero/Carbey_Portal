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

1. 上記マイグレーションを適用。
2. ダッシュボードで `portal` を Exposed schemas に追加。
3. 本部管理者にするユーザーを Auth で作成（招待 or signUp）。
4. SQL エディタで管理者を登録:

   ```sql
   select portal.bootstrap_admin('<auth.users の UUID>', '本部管理者');
   ```

5. 加盟店ユーザーは管理画面から（または以下で）紐付け:

   ```sql
   select portal.attach_franchise_user('<user_id>', '<franchise_id>', 'franchise', '加盟店名');
   ```
