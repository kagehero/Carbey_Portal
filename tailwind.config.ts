import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'var(--font-noto-sans-jp)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        // === CARBAY ブランドカラー (デザインカンプの鮮やかなレッド基調) ===
        brand: {
          50: '#fef2f1',
          100: '#fde3e0',
          200: '#fbc9c4',
          300: '#f7a39b',
          400: '#f06d62',
          500: '#e8392e', // ブランド赤 (カンプ準拠・プライマリ)
          600: '#d42619',
          700: '#b11d12',
          800: '#921c13',
          900: '#791d16',
        },
        // === エンタープライズ SaaS シェル (Deep Navy 基調) ===
        // サイドバー・ダーク面に使用
        navy: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          700: '#1e293b',
          800: '#0f172a', // Deep Navy (要求: #0F172A)
          850: '#0b1220',
          900: '#0a0f1d',
          950: '#070a14',
        },
        // === スレートグレー (本文・ボーダー・サブテキスト) ===
        // Tailwind 標準 slate を踏襲しつつ意味づけ
        ink: {
          DEFAULT: '#0f172a',
          muted: '#334155', // Secondary: Slate Gray (要求: #334155)
        },
        // === 情報系アクセント (リンク・補助・チャート) ===
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb', // Electric Blue (要求: #2563EB) — データ可視化・リンク補助
          700: '#1d4ed8',
        },
        teal: {
          50: '#ecfeff',
          100: '#cffafe',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // 互換: ログイン画面のグラデーション用 (teal と同義)
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 4px 12px -2px rgb(15 23 42 / 0.10)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
}

export default config
