import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useRequireAuth } from '../../lib/auth'
import { authenticatedFetch } from '../../lib/apiClient'
import type { LoginHistoryEntry } from '../../lib/loginHistory'

export default function StaffLoginHistory() {
  const router = useRouter()
  useRequireAuth(router, 'staff')
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    authenticatedFetch('/api/login-history')
      .then(async (response) => {
        if (!response.ok) throw new Error('ログイン履歴を取得できませんでした。')
        return response.json()
      })
      .then((data) => setLoginHistory(Array.isArray(data) ? data : []))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'ログイン履歴を取得できませんでした。'))
      .finally(() => setIsLoading(false))
  }, [])

  const formatLoginTime = (value: string) => new Date(value).toLocaleString('ja-JP')

  return (
    <div className="staff-login-history-page">
      <div className="student-top">
        <div className="header">
          <h2>LOGIN HISTORY</h2>
          <Link href="/staff" className="button logout">ホームに戻る</Link>
        </div>
      </div>

      <main className="container">
        <section className="card">
          <h3>ログイン履歴</h3>
          {isLoading ? <p>読み込み中...</p> : null}
          {error ? <p className="login-history-error">{error}</p> : null}
          {!isLoading && !error && !loginHistory.length ? <p>ログイン履歴はありません。</p> : null}
          {!isLoading && !error && loginHistory.length ? (
            <div className="login-history-list">
              {loginHistory.map((entry) => (
                <div className="login-history-entry" key={entry.id}>
                  <span>{entry.role === 'student' ? '学生' : '教職員'}</span>
                  <time dateTime={entry.logged_in_at}>{formatLoginTime(entry.logged_in_at)}</time>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}