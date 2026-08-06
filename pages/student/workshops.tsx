import { useEffect, useState } from 'react'
import Link from 'next/link'
import DocumentPreview from '../../components/DocumentPreview'
import { InformationSession, isImageAsset } from '../../lib/informationSessions'

export default function Workshops(){
  const [items,setItems] = useState<InformationSession[]>([])
  const [idx,setIdx] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

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
          <div
            style={{display:'flex',gap:12,alignItems:'center',flexDirection:'column'}}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={(event) => {
              if (touchStartX === null) return
              const distance = touchStartX - event.changedTouches[0].clientX
              setTouchStartX(null)
              if (Math.abs(distance) < 50) return
              setIdx((currentIdx) => (currentIdx + (distance > 0 ? 1 : items.length - 1)) % items.length)
            }}
          >
            {current.pdfUrl ? (
              <a className="workshop-open-link workshop-preview" href={current.pdfUrl} target="_blank" rel="noreferrer" aria-label={`${current.title}の資料を開く`}>
                isImageAsset(current.pdfUrl) ? (
                  <img src={current.pdfUrl} alt={current.title} style={{width:'100%',height:'100%',objectFit:'contain',background:'#fff'}} />
                ) : (
                  <DocumentPreview src={current.pdfUrl} title={current.title} />
                )
              </a>
            ) : (
              <div className="workshop-preview">
                <div style={{padding:24}}><strong>{current.title}</strong></div>
              </div>
            )}
            <div className="workshop-summary">
              <div className="session-summary">
                <strong className="session-title">{current.title}</strong>
                <span className="session-date">{current.date} 開催</span>
              </div>
              <a className="button btn-blue" href={current.pdfUrl||'#'} target="_blank" rel="noreferrer">資料を開く</a>
            </div>
            <div className="carousel-dots" style={{marginTop:8}}>
              {items.map((it,i)=> (
                <button key={it.id} type="button" className="carousel-dot" aria-label={`${it.title}を表示`} aria-pressed={i===idx} onClick={() => setIdx(i)} />
              ))}
            </div>
          </div>
        )}

        <h3 className="workshop-list-title">開催予定</h3>
        <div className="workshop-list student-workshop-list">
          {upcoming.map(u=> (
            <article className="workshop-item" key={u.id}>
              <a className="workshop-item-link" href={u.pdfUrl} target="_blank" rel="noreferrer" aria-label={`${u.title}の資料を開く`}>
                <strong>{u.title}</strong>
                <span>{u.date} 開催</span>
              </a>
              {u.pdfUrl && <a className="button btn-blue" href={u.pdfUrl} target="_blank" rel="noreferrer">資料を開く</a>}
            </article>
          ))}
        </div>

        <h3 className="workshop-list-title">過去開催</h3>
        <div className="workshop-list student-workshop-list">
          {past.map(u=> (
            <article className="workshop-item" key={u.id}>
              <a className="workshop-item-link" href={u.pdfUrl} target="_blank" rel="noreferrer" aria-label={`${u.title}の資料を開く`}>
                <strong>{u.title}</strong>
                <span>{u.date} 開催</span>
              </a>
              {u.pdfUrl && <a className="button btn-blue" href={u.pdfUrl} target="_blank" rel="noreferrer">資料を開く</a>}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
