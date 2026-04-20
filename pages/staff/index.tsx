import Link from 'next/link'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { JOB_HUNTING_TIPS_STORAGE_KEY, JobHuntingTip, JobHuntingTipKey, mergeJobHuntingTips } from '../../lib/jobHuntingTips'
import { INFORMATION_SESSIONS_STORAGE_KEY, InformationSession, isImageAsset, mergeInformationSessions } from '../../lib/informationSessions'

export default function StaffIndex(){
  const [tips, setTips] = useState<JobHuntingTip[]>(() => mergeJobHuntingTips(undefined))
  const [sessions, setSessions] = useState<InformationSession[]>([])
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0,10))
  const [sessionFile, setSessionFile] = useState<File | null>(null)
  const [sessionIdx, setSessionIdx] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(JOB_HUNTING_TIPS_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      setTips(mergeJobHuntingTips(parsed))
    } catch {
      setTips(mergeJobHuntingTips(undefined))
    }
  }, [])

  useEffect(() => {
    fetch('/api/workshops')
      .then((r) => r.json())
      .then((base) => {
        try {
          const raw = localStorage.getItem(INFORMATION_SESSIONS_STORAGE_KEY)
          const parsed = raw ? JSON.parse(raw) : []
          setSessions(mergeInformationSessions(base, parsed))
        } catch {
          setSessions(mergeInformationSessions(base, undefined))
        }
      })
  }, [])

  useEffect(() => {
    if (sessions.length <= 1) return
    const timer = setInterval(() => setSessionIdx((index) => (index + 1) % sessions.length), 4000)
    return () => clearInterval(timer)
  }, [sessions])

  function readFileAsDataUrl(file: File){
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  async function onTipFileChange(key: JobHuntingTipKey, event: ChangeEvent<HTMLInputElement>){
    const file = event.target.files?.[0]
    if(!file) return

    const pdfUrl = await readFileAsDataUrl(file)
    const nextTips = tips.map((tip) => tip.key === key ? {
      ...tip,
      pdfUrl,
      fileName: file.name,
      updatedAt: new Date().toISOString()
    } : tip)

    setTips(nextTips)
    localStorage.setItem(JOB_HUNTING_TIPS_STORAGE_KEY, JSON.stringify(nextTips))
    event.target.value = ''
  }

  function clearTip(key: JobHuntingTipKey){
    const nextTips = tips.map((tip) => tip.key === key ? {
      ...tip,
      pdfUrl: undefined,
      fileName: undefined,
      updatedAt: undefined
    } : tip)

    setTips(nextTips)
    localStorage.setItem(JOB_HUNTING_TIPS_STORAGE_KEY, JSON.stringify(nextTips))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
  }

  function onSessionFileChange(event: ChangeEvent<HTMLInputElement>){
    setSessionFile(event.target.files?.[0] || null)
  }

  async function onSessionSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    if(!sessionTitle || !sessionDate || !sessionFile) return

    const assetUrl = await readFileAsDataUrl(sessionFile)
    const nextSession: InformationSession = {
      id: `staff-session-${Date.now()}`,
      title: sessionTitle,
      date: sessionDate,
      pdfUrl: assetUrl,
      fileName: sessionFile.name,
      updatedAt: new Date().toISOString()
    }

    const savedOnly = [nextSession, ...sessions.filter((item) => item.updatedAt)]
    const nextSessions = [nextSession, ...sessions]
    setSessions(nextSessions)
    setSessionIdx(0)
    localStorage.setItem(INFORMATION_SESSIONS_STORAGE_KEY, JSON.stringify(savedOnly))
    setSessionTitle('')
    setSessionDate(new Date().toISOString().slice(0,10))
    setSessionFile(null)
    const form = event.currentTarget
    form.reset()
  }

  function removeSession(id: string){
    const nextSessions = sessions.filter((item) => item.id !== id)
    setSessions(nextSessions)
    setSessionIdx((current) => {
      if(nextSessions.length === 0) return 0
      return Math.min(current, nextSessions.length - 1)
    })
    const savedOnly = nextSessions.filter((item) => item.updatedAt)
    localStorage.setItem(INFORMATION_SESSIONS_STORAGE_KEY, JSON.stringify(savedOnly))
  }

  const currentSession = sessions[sessionIdx]

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>STAFF PAGE</h2>
          <Link href="/" className="button logout">トップへ</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>REPORTS</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>学生ページと同様に、見学報告書と面接報告書を確認できます。</p>

            <div className="report-grid">
              <Link href="/staff/reports?type=visit" className="report-card">
                <div className="card-row">
                  <div className="card-icon accent-1">
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/><path d="M9 11h6"/></g></svg>
                  </div>
                  <div>
                    <h4>見学報告書</h4>
                    <p>治療院の雰囲気や見学時の感想を、職員ページからも確認できます。</p>
                  </div>
                </div>
              </Link>

              <Link href="/staff/reports?type=interview" className="report-card">
                <div className="card-row">
                  <div className="card-icon accent-2">
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="2.2"/><path d="M6 20c1.5-2 4-3 6-3s4.5 1 6 3"/><path d="M17 11h4v4"/></g></svg>
                  </div>
                  <div>
                    <h4>面接報告書</h4>
                    <p>面接や試験内容に関する報告書を、学生ページと同じ見た目で確認できます。</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>JOB HUNTING TIPS</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>学生ページに表示する就職活動マニュアル PDF をここで登録できます。</p>

            <form onSubmit={onSubmit} style={{display:'grid',gap:14,maxWidth:760,margin:'18px auto 0'}}>
              {tips.map((tip) => (
                <div key={tip.key} style={{border:'1px solid #ececec',borderRadius:10,padding:16,background:'#fafafa'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
                    <div>
                      <h4 style={{margin:'0 0 6px'}}>{tip.title}</h4>
                      <div style={{fontSize:13,color:'#666'}}>
                        {tip.fileName ? `${tip.fileName} を保存済み` : 'PDF 未登録'}
                      </div>
                      {tip.updatedAt ? (
                        <div style={{fontSize:12,color:'#888',marginTop:4}}>更新日時: {new Date(tip.updatedAt).toLocaleString('ja-JP')}</div>
                      ) : null}
                    </div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      {tip.pdfUrl ? <a className="button btn-blue" href={tip.pdfUrl} target="_blank" rel="noreferrer">PDF を確認</a> : null}
                      <button type="button" className="button outline" onClick={() => clearTip(tip.key)}>削除</button>
                    </div>
                  </div>
                  <div style={{marginTop:12,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                    <input type="file" accept=".pdf,application/pdf" onChange={(event) => onTipFileChange(tip.key, event)} />
                  </div>
                </div>
              ))}
            </form>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>INFORMATION SESSION</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>勉強会や外部の説明会の情報を公開しています。詳しくは詳細ページへ。</p>
            {currentSession ? (
              <div style={{marginTop:12,textAlign:'center'}}>
                <div className="preview-frame" style={{marginLeft:'auto',marginRight:'auto',maxWidth:720}}>
                  {currentSession.pdfUrl ? (
                    isImageAsset(currentSession.pdfUrl) ? (
                      <img src={currentSession.pdfUrl} alt={currentSession.title} style={{width:'100%',height:'100%',objectFit:'contain',background:'#fff'}} />
                    ) : (
                      <iframe src={currentSession.pdfUrl} style={{width:'100%',height:'100%',border:0}} />
                    )
                  ) : (
                    <div style={{padding:24}}><strong>{currentSession.title}</strong></div>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:12,gap:10}}>
                  <div style={{fontSize:14,color:'#666'}}><strong>{currentSession.title}</strong> — {currentSession.date}</div>
                  <div>
                    <Link href="/staff/workshops" className="button btn-blue">詳しくはこちら</Link>
                  </div>
                </div>
                <div className="carousel-dots" style={{marginTop:12}}>
                  {sessions.map((item, index) => <span key={item.id} style={{background:index===sessionIdx? '#111':'#ddd'}} />)}
                </div>
              </div>
            ) : (
              <div style={{marginTop:12,textAlign:'center',color:'#666'}}>資料がありません</div>
            )}

            <form onSubmit={onSessionSubmit} style={{display:'grid',gap:12,maxWidth:760,margin:'20px auto 0'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
                <label>
                  タイトル
                  <input value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} placeholder="例: 学外説明会 2026" />
                </label>
                <label>
                  開催日
                  <input type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} />
                </label>
              </div>
              <label>
                PDF または写真
                <input type="file" accept=".pdf,application/pdf,image/*" onChange={onSessionFileChange} />
              </label>
              <div style={{display:'flex',justifyContent:'center'}}>
                <button className="button btn-blue" type="submit">資料を追加</button>
              </div>
            </form>

            {sessions.length > 0 ? (
              <div style={{marginTop:18,display:'grid',gap:10}}>
                {sessions.filter((item) => item.updatedAt).map((item) => (
                  <div key={item.id} style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',padding:'12px 14px',border:'1px solid #ececec',borderRadius:8,background:'#fafafa',flexWrap:'wrap'}}>
                    <div>
                      <strong>{item.title}</strong>
                      <div style={{fontSize:13,color:'#666'}}>{item.date}{item.fileName ? ` / ${item.fileName}` : ''}</div>
                    </div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      {item.pdfUrl ? <a className="button btn-blue" href={item.pdfUrl} target="_blank" rel="noreferrer">確認</a> : null}
                      <button type="button" className="button outline" onClick={() => removeSession(item.id)}>削除</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
