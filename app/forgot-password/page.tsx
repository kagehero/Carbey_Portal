'use client'

import { useState } from 'react'
import { ArrowLeft, Mail, Lock, ShieldCheck } from 'lucide-react'
import Wordmark from '@/components/Wordmark'
import AuthStepper from '@/components/auth/AuthStepper'

const STEPS = [{ label: 'メール入力' }, { label: 'メール送信' }, { label: '確認' }]

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          body.error === 'SMTP not configured'
            ? 'メール送信が未設定です。本部にお問い合わせください。'
            : '送信に失敗しました',
        )
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const input =
    'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-800 via-navy-850 to-navy-950 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
          {/* 左: フォーム */}
          <div className="p-8 sm:p-10">
            <Wordmark size="sm" />

            <div className="mt-8">
              <AuthStepper steps={STEPS} current={sent ? 1 : 0} />
            </div>

            <h1 className="mt-8 text-xl font-bold text-slate-900">パスワードをお忘れの方</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              ご登録のメールアドレスを入力してください。
              <br />
              パスワード再設定用のリンクをお送りします。
            </p>

            {sent ? (
              <div className="mt-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                {email} に再設定リンクを送信しました。メールをご確認ください。
              </div>
            ) : (
              <>
                {error && (
                  <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-700">メールアドレス</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="メールアドレスを入力してください" autoComplete="email" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-600 disabled:opacity-60">
                    {loading ? '送信中...' : '送信する'}
                  </button>
                </form>
              </>
            )}

            <a href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
              <ArrowLeft className="h-4 w-4" />
              ログインページに戻る
            </a>
          </div>

          {/* 右: イラスト + 安心ノート */}
          <div className="hidden flex-col items-center justify-center gap-6 bg-slate-50 p-10 md:flex">
            <EnvelopeIllustration />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-info-600" />
                ご安心ください
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                ご入力いただいたメールアドレスが登録されている場合のみ、パスワード再設定メールをお送りします。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnvelopeIllustration() {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-50 to-info-50" />
      <div className="relative flex h-24 w-32 items-center justify-center rounded-xl bg-white shadow-lg ring-1 ring-slate-100">
        <Mail className="h-12 w-12 text-slate-200" strokeWidth={1.2} />
        <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
          <Lock className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}
