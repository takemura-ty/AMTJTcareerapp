import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DocumentPreview from '../../components/DocumentPreview'
import { JobHuntingTip, mergeJobHuntingTips } from '../../lib/jobHuntingTips'
import { InformationSession, isImageAsset } from '../../lib/informationSessions'
import { clearStoredUser, useRequireAuth } from '../../lib/auth'
import { getSupabaseBrowserClient } from '../../lib/supabase-browser'
import { authenticatedFetch } from '../../lib/apiClient'

type Workshop = { id:string; title:string; date:string; pdfUrl?:string }

export default function StudentIndex(){
  const router = useRouter()
  useRequireAuth(router, ['student', 'staff'])
  const [items,setItems] = useState<Workshop[]>([])
  const [idx,setIdx] = useState(0)
  const [tips, setTips] = useState<JobHuntingTip[]>(() => mergeJobHuntingTips(undefined))
  const [sessions, setSessions] = useState<InformationSession[]>([])
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  useEffect(()=>{
    authenticatedFetch('/api/workshops')
      .then(r=>r.json())
      .then((base: Workshop[]) => {
        setItems(base)
        setSessions(base)
      })
  },[])

  useEffect(() => {
    authenticatedFetch('/api/job-hunting-tips')
      .then((r) => r.json())
      .then((data) => setTips(mergeJobHuntingTips(data)))
      .catch(() => setTips(mergeJobHuntingTips(undefined)))
  }, [])

  useEffect(()=>{
    if(sessions.length<=1) return
    const t = setInterval(()=>setIdx(i=> (i+1)%sessions.length),4000)
    return ()=>clearInterval(t)
  },[sessions])

  const current = sessions[idx]

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>STUDENT PAGE</h2>
          <div>
            <a className="button logout" onClick={async ()=>{try{await getSupabaseBrowserClient().auth.signOut()}catch{} clearStoredUser();router.push('/')}}>ログアウト</a>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>REPORTS</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>先輩たちの報告書を確認できます。</p>

            <div className="report-grid">
              <Link href="/student/reports?type=visit" className="report-card">
                <div className="card-row">
                  <div className="card-icon accent-1">
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 5.5a5 5 0 1 0 0 10a5 5 0 0 0 0-10Z"/><path d="m14 14 4.5 4.5"/><path d="M7.5 10.5h6"/><path d="M10.5 7.5v6"/></g></svg>
                  </div>
                  <div>
                    <h4>見学報告書</h4>
                    <p>治療院を見学した際の、感想や院の雰囲気を確認することができます。</p>
                  </div>
                </div>
              </Link>

              <Link href="/student/reports?type=interview" className="report-card">
                <div className="card-row">
                  <div className="card-icon accent-2">
                    <svg width="38" height="38" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 4.75h7l2 2.2v10.8a1.9 1.9 0 0 1-1.9 1.9h-7.2a1.9 1.9 0 0 1-1.9-1.9V6.65a1.9 1.9 0 0 1 1.9-1.9Z"/><path d="M11.4 4.75h1.2"/><path d="M14.5 4.75v3.1h3"/><path d="M9 10.8h6"/><path d="M9 13.7h6"/><path d="M9 16.6h4.6"/></g></svg>
                  </div>
                  <div>
                    <h4>面接報告書</h4>
                    <p>面接などの試験内容に関する、先輩たちの報告書を確認できます。</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>SUBMIT A REPORT</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>該当するフォームを選んで報告してください。</p>

            <div style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:220}}>
                <h4>鍼灸師学科</h4>
                <div style={{display:'flex',gap:8,flexDirection:'column',marginTop:8}}>
                  <a className="button btn-acu" href="https://customform.jp/form/input/93875" target="_blank" rel="noreferrer">見学報告</a>
                  <a className="button btn-acu" href="https://customform.jp/form/input/93877" target="_blank" rel="noreferrer">面接報告</a>
                </div>
              </div>

              <div style={{flex:1,minWidth:220}}>
                <h4>柔道整復師学科</h4>
                <div style={{display:'flex',gap:8,flexDirection:'column',marginTop:8}}>
                  <a className="button btn-judo" href="https://customform.jp/form/input/91482" target="_blank" rel="noreferrer">見学報告</a>
                  <a className="button btn-judo" href="https://customform.jp/form/input/93880" target="_blank" rel="noreferrer">面接報告</a>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>JOB HUNTING TIPS</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>就職活動における準備物や面接マナーなどの豆知識をご紹介！</p>
            <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:12,flexWrap:'wrap'}}>
              {tips.map((tip) => (
                tip.pdfUrl ? (
                  <a key={tip.key} className="button btn-blue" href={tip.pdfUrl} target="_blank" rel="noreferrer">{tip.title}</a>
                ) : (
                  <span key={tip.key} className="button btn-blue" style={{opacity:0.55,cursor:'not-allowed'}}>{tip.title} 未登録</span>
                )
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>INFORMATION SESSION</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>勉強会や外部の説明会の情報を公開しています。詳しくは詳細ページへ。</p>
            {current ? (
              <div
                style={{marginTop:12,textAlign:'center'}}
                onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
                onTouchEnd={(event) => {
                  if (touchStartX === null) return
                  const distance = touchStartX - event.changedTouches[0].clientX
                  setTouchStartX(null)
                  if (Math.abs(distance) < 50) return
                  setIdx((currentIdx) => (currentIdx + (distance > 0 ? 1 : sessions.length - 1)) % sessions.length)
                }}
              >
                <div className="preview-frame" style={{marginLeft:'auto',marginRight:'auto',maxWidth:600}}>
                  {current.pdfUrl ? (
                    isImageAsset(current.pdfUrl) ? (
                      <img src={current.pdfUrl} alt={current.title} style={{width:'100%',height:'100%',objectFit:'contain',background:'#fff'}} />
                    ) : (
                      <DocumentPreview src={current.pdfUrl} title={current.title} />
                    )
                  ) : (
                    <div style={{padding:24}}><strong>{current.title}</strong></div>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:12,gap:10}}>
                  <div className="session-summary">
                    <strong className="session-title">{current.title}</strong>
                    <span className="session-date">{current.date} 開催</span>
                  </div>
                  <div>
                    <Link href="/student/workshops" className="button btn-blue">詳しくはコチラ</Link>
                  </div>
                </div>
                <div className="carousel-dots" style={{marginTop:12}}>
                  {sessions.map((it,i)=> (
                    <button key={it.id} type="button" className="carousel-dot" aria-label={`${it.title}を表示`} aria-pressed={i===idx} onClick={() => setIdx(i)} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{marginTop:12,textAlign:'center',color:'#666'}}>資料がありません</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
