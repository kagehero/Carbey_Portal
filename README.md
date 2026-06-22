# Carbey Portal

Carbey の新プロジェクト。既存 [Carbey](../Carbey) と同じ技術スタック（Next.js 15 / React 19 / TypeScript / Tailwind / Supabase）で構成し、既存プロジェクトのAI機能を移植して実装する。

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を埋める
npm run dev
```

## AI機能の移植について

既存 Carbey のAI機能は `lib/ai/` に集約されている:

- `lib/ai/client.ts` — AIクライアントのエントリ
- `lib/ai/providers/` — Claude / OpenAI / Gemini のプロバイダ実装 + registry
- `lib/ai/tools.ts` / `executeTool.ts` — ツール定義・実行
- `lib/ai/conversationRepo.ts` — 会話履歴の永続化

移植時は、これらと依存する `lib/supabase/`・関連APIルート（`app/api/admin/ai`、`app/api/public/ai-assessment` 等）をセットで持ってくる。

## 構成

- `app/` — Next.js App Router
- `lib/ai/` — AI機能（移植先）
- `lib/supabase/` — Supabaseクライアント
