import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [role, setRole] = useState<'student'|'staff'>('student')

  const login = (e:any) =>{
    e.preventDefault()
    localStorage.setItem('amtjt_user', JSON.stringify({role}))
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
          <p style={{color:'#888'}}>学生IDまたは教員IDでログインしてください</p>

          <div className="login-tabs" role="tablist">
            <button className={role==='student' ? 'active' : ''} onClick={()=>setRole('student')}>学生</button>
            <button className={role==='staff' ? 'active' : ''} onClick={()=>setRole('staff')}>教員</button>
          </div>

          <form className="login-form" onSubmit={login}>
            <label>学生ID / 教員ID</label>
            <input placeholder="例: elt" />

            <label>パスワード</label>
            <input type="password" placeholder="パスワード" />

            <div className="login-cta">
              <button className="button" type="submit">ログイン</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
