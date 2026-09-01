import Link from 'next/link'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DocumentPreview from '../../components/DocumentPreview'
import { JobHuntingTip, JobHuntingTipKey, mergeJobHuntingTips } from '../../lib/jobHuntingTips'
import { InformationSession, isImageAsset } from '../../lib/informationSessions'
import { uploadToStorage } from '../../lib/blobUpload'
import { clearStoredUser, useRequireAuth } from '../../lib/auth'
import { getSupabaseBrowserClient } from '../../lib/supabase-browser'
import { authenticatedFetch } from '../../lib/apiClient'

export default function StaffIndex(){
  const router = useRouter()
  useRequireAuth(router, 'staff')
  const [tips, setTips] = useState<JobHuntingTip[]>(() => mergeJobHuntingTips(undefined))
  const [sessions, setSessions] = useState<InformationSession[]>([])
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0,10))
  const [sessionFile, setSessionFile] = useState<File | null>(null)
  const [sessionIdx, setSessionIdx] = useState(0)
  const [isSavingTip, setIsSavingTip] = useState<JobHuntingTipKey | null>(null)
  const [isSavingSession, setIsSavingSession] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  useEffect(() => {
    authenticatedFetch('/api/job-hunting-tips')
      .then((r) => r.json())
      .then((data) => setTips(mergeJobHuntingTips(data)))
      .catch(() => setTips(mergeJobHuntingTips(undefined)))
  }, [])

  useEffect(() => {
    authenticatedFetch('/api/workshops')
      .then((r) => r.json())
      .then((base) => setSessions(base))
      .catch(() => setSessions([]))
  }, [])

  useEffect(() => {
    if (sessions.length <= 1) return
    const timer = setInterval(() => setSessionIdx((index) => (index + 1) % sessions.length), 4000)
    return () => clearInterval(timer)
  }, [sessions])

  async function getResponseError(response: Response, fallbackMessage: string) {
    try {
      const data = await response.json()
      return data?.error || fallbackMessage
    } catch {
      return fallbackMessage
    }
  }

  function getThrownMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
      return error.message
    }
    return fallbackMessage
  }

  async function onTipFileChange(key: JobHuntingTipKey, event: ChangeEvent<HTMLInputElement>){
    const file = event.target.files?.[0]
    if(!file) return

    setIsSavingTip(key)
    try {
      const blob = await uploadToStorage('job-hunting-tips', file)
      const response = await authenticatedFetch('/api/job-hunting-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, pdfUrl: blob.url, fileName: file.name })
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, 'JOB HUNTING TIPS の保存に失敗しました。'))
      }

      const saved = await response.json()
      setTips((current) => current.map((tip) => tip.key === key ? saved : tip))
    } catch (error) {
      console.error(error)
      alert(getThrownMessage(error, 'PDF の保存に失敗しました'))
    } finally {
      setIsSavingTip(null)
      event.target.value = ''
    }
  }

  async function clearTip(key: JobHuntingTipKey){
    try {
      const response = await authenticatedFetch(`/api/job-hunting-tips?key=${key}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await getResponseError(response, 'JOB HUNTING TIPS の削除に失敗しました。'))
      }
      setTips((current) => current.map((tip) => tip.key === key ? {
        ...tip,
        pdfUrl: undefined,
        fileName: undefined,
        updatedAt: undefined
      } : tip))
    } catch (error) {
      console.error(error)
      alert(getThrownMessage(error, 'PDF の削除に失敗しました'))
    }
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

    setIsSavingSession(true)
    try {
      const blob = await uploadToStorage('information-sessions', sessionFile)
      const response = await authenticatedFetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sessionTitle, date: sessionDate, pdfUrl: blob.url, fileName: sessionFile.name })
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, 'INFORMATION SESSION の保存に失敗しました。'))
      }

      const created = await response.json()
      setSessions((current) => [created, ...current])
      setSessionIdx(0)
      setSessionTitle('')
      setSessionDate(new Date().toISOString().slice(0,10))
      setSessionFile(null)
      const form = event.currentTarget
      form.reset()
    } catch (error) {
      console.error(error)
      alert(getThrownMessage(error, '資料の保存に失敗しました'))
    } finally {
      setIsSavingSession(false)
    }
  }

  const currentSession = sessions[sessionIdx]

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>STAFF PAGE</h2>
          <a className="button logout" onClick={async ()=>{try{await getSupabaseBrowserClient().auth.signOut()}catch{} clearStoredUser();router.push('/')}}>ログアウト</a>
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
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 5.5a5 5 0 1 0 0 10a5 5 0 0 0 0-10Z"/><path d="m14 14 4.5 4.5"/><path d="M7.5 10.5h6"/><path d="M10.5 7.5v6"/></g></svg>
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
                    <svg width="38" height="38" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 4.75h7l2 2.2v10.8a1.9 1.9 0 0 1-1.9 1.9h-7.2a1.9 1.9 0 0 1-1.9-1.9V6.65a1.9 1.9 0 0 1 1.9-1.9Z"/><path d="M11.4 4.75h1.2"/><path d="M14.5 4.75v3.1h3"/><path d="M9 10.8h6"/><path d="M9 13.7h6"/><path d="M9 16.6h4.6"/></g></svg>
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
                    {isSavingTip === tip.key ? <span style={{fontSize:12,color:'#666'}}>アップロード中...</span> : null}
                  </div>
                </div>
              ))}
            </form>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>INFORMATION SESSION</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>勉強会や外部の説明会の情報を公開しています。詳しくは詳細ページへ。</p>
            {currentSession ? (
              <div
                style={{marginTop:12,textAlign:'center'}}
                onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
                onTouchEnd={(event) => {
                  if (touchStartX === null) return
                  const distance = touchStartX - event.changedTouches[0].clientX
                  setTouchStartX(null)
                  if (Math.abs(distance) < 50) return
                  setSessionIdx((currentIdx) => (currentIdx + (distance > 0 ? 1 : sessions.length - 1)) % sessions.length)
                }}
              >
                <div className="session-carousel">
                  <div className="preview-frame" style={{marginLeft:'auto',marginRight:'auto',maxWidth:600}}>
                  {currentSession.pdfUrl ? (
                    isImageAsset(currentSession.pdfUrl) ? (
                      <img src={currentSession.pdfUrl} alt={currentSession.title} style={{width:'100%',height:'100%',objectFit:'contain',background:'#fff'}} />
                    ) : (
                      <DocumentPreview src={currentSession.pdfUrl} title={currentSession.title} />
                    )
                  ) : (
                    <div style={{padding:24}}><strong>{currentSession.title}</strong></div>
                  )}
                  </div>
                  {sessions.length > 1 ? (
                    <>
                      <button type="button" className="carousel-arrow carousel-arrow-previous" aria-label="前の資料を表示" onClick={() => setSessionIdx((currentIdx) => (currentIdx + sessions.length - 1) % sessions.length)}>←</button>
                      <button type="button" className="carousel-arrow carousel-arrow-next" aria-label="次の資料を表示" onClick={() => setSessionIdx((currentIdx) => (currentIdx + 1) % sessions.length)}>→</button>
                    </>
                  ) : null}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:12,gap:10}}>
                  <div className="session-summary">
                    <strong className="session-title">{currentSession.title}</strong>
                    <span className="session-date">{currentSession.date} 開催</span>
                  </div>
                  <div style={{display:'grid',gap:14,width:'100%',maxWidth:760}}>
                    <div>
                      <Link href="/staff/workshops" className="button btn-blue">詳細はコチラ</Link>
                    </div>
                    <form onSubmit={onSessionSubmit} style={{display:'grid',gap:12,textAlign:'left'}}>
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
                        <button className="button btn-blue" type="submit" disabled={isSavingSession}>{isSavingSession ? '保存中...' : '資料を追加'}</button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="carousel-dots" style={{marginTop:12}}>
                  {sessions.map((item, index) => (
                    <button key={item.id} type="button" className="carousel-dot" aria-label={`${item.title}を表示`} aria-pressed={index===sessionIdx} onClick={() => setSessionIdx(index)} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{marginTop:12,display:'grid',gap:16,maxWidth:760,marginLeft:'auto',marginRight:'auto'}}>
                <div style={{textAlign:'center',color:'#666'}}>資料がありません</div>
                <form onSubmit={onSessionSubmit} style={{display:'grid',gap:12}}>
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
                    <button className="button btn-blue" type="submit" disabled={isSavingSession}>{isSavingSession ? '保存中...' : '資料を追加'}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div className="panel" style={{marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
              <div>
                <h3 style={{margin:0,fontSize:18}}>LOGIN HISTORY</h3>
                <p style={{margin:'8px 0 0',fontSize:14,color:'#555'}}>学生・教職員のログイン履歴を確認できます。</p>
              </div>
              <Link href="/staff/login-history" className="button outline">ログイン履歴</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
