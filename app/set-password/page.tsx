'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Check, ShieldCheck, ArrowLeft } from 'lucide-react'
import Wordmark from '@/components/Wordmark'
import AuthStepper from '@/components/auth/AuthStepper'

const STEPS = [{ label: 'メール入力' }, { label: 'パスワード再設定' }, { label: '完了' }]

type Rule = { label: string; test: (p: string) => boolean }
const RULES: Rule[] = [
  { label: '8文字以上で入力してください', test: (p) => p.length >= 8 },
  { label: '英大文字を含めてください', test: (p) => /[A-Z]/.test(p) },
  { label: '英小文字を含めてください', test: (p) => /[a-z]/.test(p) },
  { label: '数字または記号を含めてください', test: (p) => /[0-9!-/:-@[-`{-~]/.test(p) },
]

function strengthOf(p: string): { score: number; label: string; color: string } {
  const passed = RULES.filter((r) => r.test(p)).length
  const score = p.length === 0 ? 0 : passed
  const label = ['', '弱い', 'やや弱い', '普通', '強い'][score]
  const color = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'][score]
  return { score, label, color }
}

function SetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: cur } = await supabase.auth.getSession()
      if (cur.session) { setReady(true); return }
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
      const hp = new URLSearchParams(hash)
      const errCode = hp.get('error_code') || hp.get('error')
      const errDesc = hp.get('error_description')
      if (errCode) {
        setError(errDesc?.replace(/\+/g, ' ') || 'リンクが無効か期限切れです。再度パスワード再設定をリクエストしてください。')
        return
      }
      const access_token = hp.get('access_token')
      const refresh_token = hp.get('refresh_token')
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) { setError('リンクの検証に失敗しました。再度パスワード再設定をリクエストしてください。'); return }
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        setReady(true)
        return
      }
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { setReady(true); return }
      }
      setError('有効なリンクが見つかりません。メールのリンクを再度開いてください。')
    }
    void init()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!RULES.every((r) => r.test(password))) { setError('パスワードがすべての要件を満たしていません'); return }
    if (password !== confirm) { setError('パスワードが一致しません'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const strength = strengthOf(password)
  const input =
    'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-800 via-navy-850 to-navy-950 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
          {/* 左: フォーム */}
          <div className="p-8 sm:p-10">
            <a href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
              <ArrowLeft className="h-4 w-4" />
              ログインページに戻る
            </a>

            <div className="mt-6">
              <AuthStepper steps={STEPS} current={done ? 2 : 1} />
            </div>

            <h1 className="mt-8 text-xl font-bold text-slate-900">新しいパスワードを設定</h1>
            <p className="mt-2 text-sm text-slate-500">新しいパスワードを入力してください。</p>

            {done ? (
              <div className="mt-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                パスワードを設定しました。ログイン画面へ移動します...
              </div>
            ) : !ready && error ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                <a href="/forgot-password" className="block w-full rounded-xl bg-brand-500 px-4 py-3 text-center font-semibold text-white hover:bg-brand-600">
                  パスワード再設定をやり直す
                </a>
              </div>
            ) : !ready ? (
              <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                リンクを検証しています...
              </div>
            ) : (
              <>
                {error && <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-700">新しいパスワード</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                      <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="新しいパスワード" />
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* 強度バー */}
                    {password.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-slate-500">強度：{strength.label}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-700">新しいパスワード（確認用）</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                      <input type={showPw ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} placeholder="もう一度入力" />
                    </div>
                  </div>

                  {/* 要件チェックリスト */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {RULES.map((r) => {
                      const ok = r.test(password)
                      return (
                        <div key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <Check className={`h-3.5 w-3.5 ${ok ? '' : 'opacity-40'}`} />
                          {r.label}
                        </div>
                      )
                    })}
                  </div>

                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-600 disabled:opacity-60">
                    {loading ? '更新中...' : 'パスワードを更新する'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* 右: シールド + 安全ノート */}
          <div className="hidden flex-col items-center justify-center gap-6 bg-slate-50 p-10 md:flex">
            <ShieldIllustration />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock className="h-4 w-4 text-info-600" />
                安全なパスワードの作成
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                他のサイトで使用していない強力なパスワードを設定してください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShieldIllustration() {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-info-50 to-brand-50" />
      <div className="relative flex h-28 w-24 items-center justify-center rounded-xl">
        <ShieldCheck className="h-24 w-24 text-info-200" strokeWidth={1.1} />
        <span className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
          <Check className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm />
    </Suspense>
  )
}
