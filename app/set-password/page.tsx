'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff } from 'lucide-react'
import Logo from '@/components/Logo'

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

  // 招待/再設定リンクから来ると、Supabase の /auth/v1/verify が
  //   redirect_to#access_token=...&refresh_token=...&type=recovery
  // のハッシュ形式 (implicit) でリダイレクトしてくる。
  // @supabase/ssr は既定で PKCE 想定のためこのハッシュを自動取得しないことがあるので、
  // ハッシュからトークンを明示的に取り出して setSession する。
  useEffect(() => {
    const supabase = createClient()

    async function init() {
      // 1) 既にセッションがあるか
      const { data: cur } = await supabase.auth.getSession()
      if (cur.session) {
        setReady(true)
        return
      }

      // 2) URL ハッシュ (#...) を解析
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
      const hp = new URLSearchParams(hash)

      // エラーが返ってきている場合 (期限切れ等)
      const errCode = hp.get('error_code') || hp.get('error')
      const errDesc = hp.get('error_description')
      if (errCode) {
        setError(
          errDesc?.replace(/\+/g, ' ') ||
            'リンクが無効か期限切れです。再度パスワード再設定をリクエストしてください。',
        )
        return
      }

      const access_token = hp.get('access_token')
      const refresh_token = hp.get('refresh_token')
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) {
          setError('リンクの検証に失敗しました。再度パスワード再設定をリクエストしてください。')
          return
        }
        // ハッシュを URL から消す (トークンが履歴に残らないように)
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        setReady(true)
        return
      }

      // 3) PKCE フロー (?code=...) の場合
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          setReady(true)
          return
        }
      }

      // どれにも該当しない = リンク経由でない or トークン無し
      setError('有効なリンクが見つかりません。メールのリンクを再度開いてください。')
    }

    void init()
  }, [params])

  // 招待か再設定かで見出しを変える (type=invite/recovery がURLに付く)
  const isInvite = params.get('type') === 'invite'
  const heading = isInvite ? 'パスワードを設定' : '新しいパスワード'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('パスワードは8文字以上にしてください')
      return
    }
    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }
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

  const input =
    'w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-gray-900 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100'

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <Logo variant="icon" className="h-12 w-12 rounded-xl" priority />
          <h1 className="mt-4 text-xl font-bold text-gray-900">{heading}</h1>
        </div>

        {done ? (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            パスワードを設定しました。ログイン画面へ移動します...
          </div>
        ) : !ready && error ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            <a
              href="/forgot-password"
              className="block w-full rounded-xl bg-brand-500 px-4 py-3 text-center font-medium text-white hover:bg-brand-600"
            >
              パスワード再設定をやり直す
            </a>
          </div>
        ) : !ready ? (
          <div className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            リンクを検証しています... 反映されない場合はメールのリンクを再度開いてください。
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">パスワード</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={input}
                    placeholder="8文字以上"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">確認用</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={input}
                    placeholder="もう一度入力"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-500 px-4 py-3 font-medium text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 disabled:opacity-60"
              >
                {loading ? '設定中...' : 'パスワードを設定'}
              </button>
            </form>
          </>
        )}
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
