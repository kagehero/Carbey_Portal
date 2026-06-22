# Carbey Portal — アーキテクチャ設計分析

カーベイ FC 加盟店プラットフォームの開発方針・設計判断を記録する。
要求事項定義書 v1.2（`カーベイFC加盟店プラットフォーム_要求事項定義書_v1.2.pdf`）に基づく。

> **本書の位置づけ**
> Phase 1〜3 の実装中も、AI機能移植（Phase 4）の設計判断が散逸しないよう保全するための指針。
> 実装はまだ行っていない。Phase 1 着手時・Phase 4 着手時の両方で参照すること。

---

## 0. プロジェクト構成（確定・実施済み）

同一マシン上に2つの独立したプロジェクトをフォルダで並置している。

```
/home/blast/Working/Carbey/
├── Carbey/          ← 既存の完成プロジェクト（中古車市場分析ツール、独立 git リポジトリ）
└── Carbey_portal/   ← 新プロジェクト（FC加盟店プラットフォーム、独立 git リポジトリ）
```

- 2つは**完全に独立した git リポジトリ**。互いに干渉しない。
- `Carbey_portal` は既存 `Carbey` と同じ技術スタック（Next.js 15 / React 19 / TypeScript / Tailwind / Supabase）で雛形を作成済み。
- 既存 Carbey のAI機能を新プロジェクトへ移植することが、本プロジェクトのAI領域のゴール。

---

## 1. 2つのプロジェクトの関係

| | 既存 Carbey | Carbey Portal（新） |
|---|---|---|
| 性質 | 中古車市場分析ツール | FC加盟店向け統合プラットフォーム |
| 利用者 | 単一事業者（カーベイ本体） | 本部 + 多数の加盟店（**マルチテナント**） |
| AI機能 | 市場分析AI壁打ち（`lib/ai/`） | 既存のAI機能を**移植して活用**（要求書 P9 5.8「既存の市場分析システムを活用」） |
| データ | 市場データ（inventories / sold_estimations / matview群） | 業務データ（加盟店・契約・車両進捗・CRM）+ 市場データ参照 |

**核心**：新システムのAI機能（要求書 5.8 AI分析 / 5.9 AI壁打ち）は、既存 Carbey の `lib/ai/` そのものを移植して実現する。

---

## 2. 確定した設計前提

| 項目 | 決定 | 根拠 |
|---|---|---|
| 進め方 | Phase 1 → 4 の順に開発。AIは最終フェーズ（Phase 4） | 要求書 P13 フェーズ構成 |
| DB構成 | **既存 Carbey と同じ Supabase プロジェクトに相乗り** | ユーザ決定 |
| 市場データ | 既存の `inventories` / `sold_estimations` / matview群をそのまま参照 | 要求書 P9「既存を活用」 |
| AIクライアント | **単一の Supabase クライアントで完結**（2DB分離は不要） | 相乗り決定の帰結 |
| プラン権限 | 全プランでAI壁打ち権限は同一。AIのゲートは「オンボーディング完了」のみ | 要求書 P5 4節 / P7 5.3 |

### 「相乗り」決定の意味（重要）

市場データを既存DB参照とし、かつ業務DBも同じ Supabase に置くことで、
**市場テーブルと業務テーブルが同一プロジェクトに同居する**。

結果として：
- `executeTool`（市場クエリ）も `conversationRepo`（会話履歴）も**同じ1つのクライアントで動く**。
- 当初検討した「2DB分離（admin クライアントを2つに分ける）」は**不要**になった。
- 移植が大幅に簡素化される。

---

## 3. AI機能 移植マップ（ファイル単位）

既存 `Carbey/lib/ai/` の構成と、新システムでの扱い。

| 既存ファイル | 役割 | 新システムでの扱い | 書き換え量 |
|---|---|---|---|
| `lib/ai/providers/types.ts` | プロバイダ抽象化の型 | そのままコピー | ゼロ |
| `lib/ai/providers/registry.ts` | プロバイダ選択 | そのままコピー | ゼロ |
| `lib/ai/providers/{claude,openai,gemini}.ts` | 各SDKの正規化ラッパー | そのままコピー | ゼロ |
| `lib/ai/tools.ts` | 中古車分析ツール6種の定義 | そのままコピー | ゼロ |
| `lib/ai/executeTool.ts`（1241行） | tool 実行（市場クエリに密結合） | ほぼそのまま（相乗りで市場テーブル同居のため動く） | 小 |
| `lib/ai/client.ts` | システムプロンプト（市場分析専門） | ほぼそのまま（要求書 5.8 の市場/相場/車種分析に合致） | 微 |
| `lib/analytics/*` | 市場分析クエリ本体 | コピー（相乗りで動く） | ゼロ |
| `lib/market-intel/generationPresets.ts` | 年式プリセット | コピー | ゼロ |
| `lib/supabase/admin.ts` | Service Role クライアント | コピー（相乗りなので分割不要） | ゼロ〜微 |
| `lib/ai/conversationRepo.ts` | 会話履歴の永続化 | **tenant_id 追加で書き換え** | 中 |
| migration 024/025（AIスキーマ） | ai_conversations / ai_messages | **tenant_id 付きで作り直し + RLS 全面改訂** | 大 |

### 既存AIスキーマの確認結果（migration 024）

既存の RLS は**単一事業者の二値権限**で守られている：

```sql
create policy ai_conv_admin_self_read on public.ai_conversations
  for select using (
    public.is_market_intel_admin(auth.uid())   -- 単一事業者の「管理者」前提
    and (user_id is null or user_id = auth.uid())
  );
```

新システムでは加盟店（テナント）軸が加わるため、`user_id` だけでなく **`tenant_id`（加盟店ID）** が必要。
これが移植時の最大の書き換えポイント。

---

## 4. 新システム特有の設計論点

### 論点A：会話履歴のテナント分離

- `ai_conversations` に `tenant_id`（加盟店ID）を追加。
- RLS を「自分の加盟店の会話だけ見える」に変更。
- 要求書 P8 5.2「本部が加盟店のAI利用状況を監視」のため、**本部ロールは全テナント横断で読める別ポリシー**も必要。

### 論点B：オンボーディング・ロック（既存にない新機能）

- 要求書 P7 5.3：オンボーディング未完了の加盟店はAI機能を**ロック**（オーダー・販売登録も同様）。
- AIエンドポイントの**前段ゲート**として新規実装（middleware または API 層でチェック）。
- 既存 Carbey には存在しない。

### 論点C：プラン権限はシンプル

- 要求書 P5 4節：**全プランでAI壁打ち権限は同一**。
- AI機能にプラン分岐ロジックは不要。ゲートは「オンボーディング完了」の一点のみ。

### 論点X：名前空間の衝突回避（相乗りの副作用）

- 既存 Carbey は `public` スキーマに全テーブルを持つ（`ai_conversations`, `user_profiles` 等）。
- 新システムも `public` に作ると **`user_profiles` 等のテーブル名が衝突**する。
- **対策（推奨）**：新システム用に**別スキーマ**（例 `portal`）を切る。
  代替案はテーブル接頭辞（`portal_*`）。別スキーマを推奨。

### 論点Y：認証ユーザーの共存（相乗りの副作用）

- 既存 Carbey と新システムが**同じ `auth.users` を共有**する。
- 既存の管理者アカウントと新システムの加盟店アカウントが同一テーブルに混在。
- **対策**：新システムは `portal` スキーマ側の membership テーブル（例 `portal.memberships`）で
  「加盟店ID・ロール・プラン」を管理し、`auth.users` とは id で紐付ける。
  どちらのシステムのユーザーかを区別できる設計にする。

---

## 5. 権限モデル（要求書 P6 5.1）

新システムの権限区分は4種：

| ロール | 範囲 | AIアクセス |
|---|---|---|
| 管理者（本部） | 全加盟店・契約・入金・プランを横断管理 | 全テナントのAI利用状況を閲覧 |
| 加盟店 | 自社の車両進捗・実績・AI機能 | オンボーディング完了後に利用可 |
| CRM入力担当 | CRMデータ入力 | （詳細は製作段階で確定） |
| チャット専用 | チャットのみ | 制限 |

- プランに応じて自動切り替え（要求書 P6）。
- AI壁打ちは全プラン同一権限。差別化は自動売買機能・サポート・料金で行う。

---

## 6. フェーズ構成と本書の使いどころ（要求書 P13）

| Phase | 内容 | AI移植との関係 |
|---|---|---|
| Phase 1 | 認証・権限管理・加盟店管理・CRM基本・**DB設計** | **論点X・Y をここで織り込む**（別スキーマ + 認証共存） |
| Phase 2 | ダッシュボード・オンボーディング・オーダー・チャット | **論点B（オンボーディング状態）** がここで生まれる |
| Phase 3 | 車両進捗・販売実績・月次レポート | — |
| Phase 4 | **AI市場分析・AI壁打ち・意思決定支援** | **本書 §3 移植マップ・§4 論点A をここで実行** |

> AI機能は Phase 4。Phase 1〜3 の基盤（テナント・認証・業務DB）が無いと `lib/ai/` は動かない。
> 今 `lib/ai/` をコピーしても一行も動かないため、現時点では移植しない。

### Phase 1 着手時のチェックリスト（AI移植を見据えて）— ✅ 実装済み

- [x] 新システムのテーブルは `portal` スキーマに置く（論点X）→ `supabase/migrations/001_portal_schema.sql`
- [x] 加盟店・ロール・プランを `auth.users` と id で紐付ける membership 設計（論点Y）→ `portal.memberships`
- [x] `franchise_id`（= tenant_id）を業務テーブルの分離キーとして一貫導入（論点A の前提）
- [x] 既存 Carbey の市場テーブル（`inventories` 等）には**触れない**（参照のみ）

#### Phase 1 で実装したもの（実績）

- **DB**: `portal` スキーマ（plans / franchises / memberships / contracts / crm_customers / crm_deals）+ RLS + ヘルパー関数（`portal.is_admin` / `portal.current_franchise_id` / `bootstrap_admin` / `attach_franchise_user`）
- **認証**: middleware（セッション更新 + 保護領域リダイレクト）、ログイン、`/post-login`（ロール振り分け）、サインアウト
- **権限ゲート**: `lib/auth/session.ts`（`requireAdmin` / `requireRole` / `apiRequireRole` など）
- **本部画面**: `/admin/franchises`（一覧・詳細・登録フォーム、Server Action）
- **加盟店画面**: `/portal/dashboard`（要求書 5.4 のウィジェット雛形。Phase 2/3/4 はプレースホルダ）

#### Supabase クライアントの型解決メモ（重要・ハマりどころ）

`portal` スキーマをデフォルトにするため `createClient<Database, 'portal'>(..., { db: { schema: 'portal' } })` を使う。
この時、`types/database.ts` の `Database` 型に **`__InternalSupabase: { PostgrestVersion }` キーが無いと
テーブル型が `never` に潰れる**（supabase-js 2.108 の `SupabaseClient` ジェネリック仕様）。
また `@supabase/ssr` の `createServerClient` はスキーマ名ジェネリックを伝播しないことがあるため、
`.select()` / `.maybeSingle<Row>()` / `.single<Row>()` で結果型を明示している。
insert は `insert(input as never)` で回避（公開関数のシグネチャ側は `FranchiseInsert` で型安全）。

### Phase 4 着手時のチェックリスト（AI移植本番）

- [ ] §3 のマップに従い「そのままコピー」群を移植
- [ ] `conversationRepo.ts` と AIスキーマを `tenant_id` 対応で書き換え（論点A）
- [ ] AIエンドポイントにオンボーディング完了ゲートを追加（論点B）
- [ ] 本部ロール用の全テナント横断 RLS を追加（論点A）
- [ ] 市場クエリ（`executeTool` / `lib/analytics`）が相乗りDBで動くことを確認

---

## 7. 未確定・要確認事項

- 既存 Carbey の Supabase 本番プロジェクトに、新システムのテーブルを相乗りさせてよいか（運用・本番影響の最終確認）。
- 別スキーマ `portal` か接頭辞 `portal_*` か（論点X の最終決定）。
- CRM入力担当・チャット専用ロールの詳細権限（要求書も「製作段階で確定」としている）。
- 「完了」ステータスの実装可否（要求書 P8、MVP範囲外の可能性）。
