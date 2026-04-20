import { useRouter } from 'next/router'
import { useState } from 'react'
import { setStoredUser } from '../lib/auth'
import { getSupabaseBrowserClient } from '../lib/supabase-browser'

const STAFF_LOGIN_EMAIL = 'career@toyoiryo.ac.jp'

export default function Home() {
  const router = useRouter()
  const [role, setRole] = useState<'student'|'staff'>('student')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const login = async (e:any) =>{
    e.preventDefault()

    const normalizedLoginId = loginId.trim()
    const normalizedPassword = password.trim()

    if (!normalizedLoginId || !normalizedPassword) {
      setError('ID とパスワードを入力してください。')
      return
    }

    if(role === 'staff') {
      setIsSubmitting(true)
      try {
        const supabase = getSupabaseBrowserClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedLoginId,
          password: normalizedPassword
        })

        if (signInError) {
          setError('教員IDまたはパスワードが正しくありません。')
          return
        }
      } catch {
        setError('教員ログインに失敗しました。設定を確認してください。')
        return
      } finally {
        setIsSubmitting(false)
      }
    }

    setError('')
    setStoredUser({ role, authenticated: true })
    if(role === 'student') router.push('/student')
    else router.push('/staff')
  }

  return (
    <div>
      <div className="hero">
        <div className="hero-left">
          <h1>
            <div>鍼灸師学科・柔道整復師学科</div>
            <div className="accent">就職活動アプリ</div>
            <div className="accent-green" style={{fontSize:20,marginTop:8}}>Career App</div>
          </h1>
          <p className="subtitle">見学報告書・面接報告書閲覧<br/>勉強会・外部の説明会紹介</p>
        </div>
        <div className="hero-right">
          <h2>ログイン</h2>
          <p style={{color:'#888'}}>学生IDまたは教員メールアドレスでログインしてください</p>

          <div className="login-tabs" role="tablist">
            <button type="button" className={role==='student' ? 'active' : ''} onClick={()=>{setRole('student');setError('')}}>学生</button>
            <button type="button" className={role==='staff' ? 'active' : ''} onClick={()=>{setRole('staff');setError('')}}>教員</button>
          </div>

          <form className="login-form" onSubmit={login}>
            <label>{role === 'staff' ? '教員メールアドレス' : '学生ID'}</label>
            <input value={loginId} onChange={(e)=>{setLoginId(e.target.value);setError('')}} placeholder={role === 'staff' ? `例: ${STAFF_LOGIN_EMAIL}` : '例: elt'} />

            <label>パスワード</label>
            <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value);setError('')}} placeholder="パスワード" />

            {error ? <p style={{color:'#c92a2a',margin:'8px 0 0'}}>{error}</p> : null}

            <div className="login-cta">
              <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? '確認中...' : 'ログイン'}</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
