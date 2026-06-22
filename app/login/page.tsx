'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import Logo from '@/components/Logo'

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: '安心の権限管理', desc: 'ロール別アクセスで安全に運用' },
  { icon: Sparkles, title: 'AI 壁打ち', desc: '相場・需要を踏まえた仕入れ支援' },
  { icon: TrendingUp, title: '収益を可視化', desc: '販売実績と利益をひと目で把握' },
]

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const initialError =
    params.get('error') === 'forbidden' ? 'この画面へのアクセス権限がありません。' : ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const redirect = params.get('redirect')
      router.push(redirect ? `/post-login?redirect=${encodeURIComponent(redirect)}` : '/post-login')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-3 text-gray-900 placeholder-gray-400 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100'

  return (
    <div className="flex min-h-screen bg-white">
      {/* 左: ブランド ショーケース (lg 以上で表示) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-navy-950 lg:block">
        {/* グロー装飾 */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(241,90,90,0.35) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.30) 0%, transparent 70%)' }}
        />
        {/* グリッド */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <Logo variant="icon" className="h-10 w-10 rounded-xl" priority />
            <span className="text-xl font-bold tracking-tight text-white">Carbey</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              家から始める、
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                次世代の中古車ビジネス
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              FC加盟店プラットフォーム。会員管理から AI 壁打ちまで、運営に必要な機能をひとつに。
            </p>

            <div className="mt-10 space-y-4">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <h.icon className="h-5 w-5 text-accent-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{h.title}</div>
                    <div className="text-xs text-white/50">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/30">© {new Date().getFullYear()} Carbey. All rights reserved.</p>
        </div>
      </div>

      {/* 右: ログインフォーム */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* モバイル用ロゴ (lg 未満) */}
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <Logo variant="text" className="h-9 w-auto lg:hidden" priority />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">ログイン</h2>
            <p className="mt-1 text-sm text-gray-500">アカウント情報を入力してください</p>
          </div>

          {(error || initialError) && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error || initialError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-11`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPw ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-brand-600 hover:text-brand-700 hover:underline">
                パスワードをお忘れですか？
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 font-medium text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 hover:shadow-brand-500/40 disabled:opacity-60"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
              {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            ログインすることで利用規約に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
