import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Workshop = { id:string; title:string; date:string; pdfUrl?:string }

function ensureAuth(router:any){
  useEffect(()=>{
    const raw = typeof window !== 'undefined' ? localStorage.getItem('amtjt_user') : null
    if(!raw){
      router.replace('/')
    }
  },[])
}

export default function StudentIndex(){
  const router = useRouter()
  ensureAuth(router)
  const [items,setItems] = useState<Workshop[]>([])
  const [idx,setIdx] = useState(0)

  useEffect(()=>{
    fetch('/api/workshops').then(r=>r.json()).then(setItems)
  },[])

  useEffect(()=>{
    if(items.length<=1) return
    const t = setInterval(()=>setIdx(i=> (i+1)%items.length),4000)
    return ()=>clearInterval(t)
  },[items])

  const current = items[idx]

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>STUDENT PAGE</h2>
          <div>
            <a className="button logout" onClick={()=>{localStorage.removeItem('amtjt_user');router.push('/')}}>ログアウト</a>
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
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/><path d="M9 11h6"/></g></svg>
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
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="2.2"/><path d="M6 20c1.5-2 4-3 6-3s4.5 1 6 3"/><path d="M17 11h4v4"/></g></svg>
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
            <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:12}}>
              <a className="button btn-blue" href="#">就職活動マニュアル～準備編～</a>
              <a className="button btn-blue" href="#">就職活動マニュアル～面接備編～</a>
            </div>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>INFORMATION SESSION</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>勉強会や外部の説明会の情報を公開しています。詳しくは詳細ページへ。</p>
            {current ? (
              <div style={{marginTop:12,textAlign:'center'}}>
                <div className="preview-frame" style={{marginLeft:'auto',marginRight:'auto',maxWidth:720}}>
                  {current.pdfUrl ? (
                    <iframe src={current.pdfUrl} style={{width:'100%',height:'100%',border:0}} />
                  ) : (
                    <div style={{padding:24}}><strong>{current.title}</strong></div>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:12,gap:10}}>
                  <div style={{fontSize:14,color:'#666'}}><strong>{current.title}</strong> — {current.date}</div>
                  <div>
                    <Link href="/student/workshops" className="button btn-blue">詳しくはこちら</Link>
                  </div>
                </div>
                <div className="carousel-dots" style={{marginTop:12}}>
                  {items.map((it,i)=> <span key={it.id} style={{background:i===idx? '#111':'#ddd'}} />)}
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
