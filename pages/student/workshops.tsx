import { useEffect, useState } from 'react'
import Link from 'next/link'
import DocumentPreview from '../../components/DocumentPreview'
import { InformationSession, isImageAsset } from '../../lib/informationSessions'

export default function Workshops(){
  const [items,setItems] = useState<InformationSession[]>([])
  const [idx,setIdx] = useState(0)

  useEffect(()=>{
    fetch('/api/workshops')
      .then(r=>r.json())
      .then(setItems)
  },[])

  useEffect(()=>{
    if(items.length<=1) return
    const t = setInterval(()=>{
      setIdx(i=> (i+1) % items.length)
    },4000)
    return ()=>clearInterval(t)
  },[items])

  const now = new Date().toISOString().slice(0,10)
  const upcoming = items.filter(i=>i.date >= now).sort((a,b)=>a.date.localeCompare(b.date))
  const past = items.filter(i=>i.date < now).sort((a,b)=>b.date.localeCompare(a.date))

  const current = items[idx]

  return (
    <div className="container">
      <div className="header">
        <h2>INFORMATION SESSION</h2>
        <Link href="/student" className="button outline">戻る</Link>
      </div>

      <div className="card">
        {current && (
          <div style={{display:'flex',gap:12,alignItems:'center',flexDirection:'column'}}>
            <div className="workshop-preview">
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
            <div className="workshop-summary">
              <div className="session-summary">
                <strong className="session-title">{current.title}</strong>
                <span className="session-date">{current.date} 開催</span>
              </div>
              <a className="button btn-blue" href={current.pdfUrl||'#'} target="_blank" rel="noreferrer">資料を開く</a>
            </div>
            <div style={{marginTop:8}}>
              {items.map((it,i)=> (
                <span key={it.id} style={{display:'inline-block',width:10,height:10,borderRadius:10,background:i===idx? '#111':'#ddd',margin:6}} />
              ))}
            </div>
          </div>
        )}

        <h3 className="workshop-list-title">開催予定</h3>
        <div className="workshop-list student-workshop-list">
          {upcoming.map(u=> (
            <article className="workshop-item" key={u.id}>
              <div>
                <strong>{u.title}</strong>
                <span>{u.date} 開催</span>
              </div>
              {u.pdfUrl && <a className="button btn-blue" href={u.pdfUrl} target="_blank" rel="noreferrer">資料を開く</a>}
            </article>
          ))}
        </div>

        <h3 className="workshop-list-title">過去開催</h3>
        <div className="workshop-list student-workshop-list">
          {past.map(u=> (
            <article className="workshop-item" key={u.id}>
              <div>
                <strong>{u.title}</strong>
                <span>{u.date} 開催</span>
              </div>
              {u.pdfUrl && <a className="button btn-blue" href={u.pdfUrl} target="_blank" rel="noreferrer">資料を開く</a>}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
