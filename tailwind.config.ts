import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Carbey ブランドカラー (営業資料 2色配色より)
        // プライマリ: 赤〜ピンク (CTA・強調・ロゴ地)
        brand: {
          50: '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#f97676', // ロゴ地の赤
          500: '#f15a5a',
          600: '#dd3d3d',
          700: '#ba2e2e',
          800: '#9a2929',
          900: '#802828',
        },
        // アクセント: シアン/ティール (補助アイコン・サブ見出し)
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
        // 背景: 濃紺 (ダーク基調。ログイン画面等)
        navy: {
          800: '#141a2e',
          900: '#0d1220',
          950: '#070a14',
        },
      },
    },
  },
  plugins: [],
}

export default config
