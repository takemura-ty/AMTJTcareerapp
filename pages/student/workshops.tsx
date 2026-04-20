import { useEffect, useState } from 'react'
import Link from 'next/link'
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
        <h2>勉強会案内</h2>
        <Link href="/student" className="button outline">戻る</Link>
      </div>

      <div className="card">
        {current && (
          <div style={{display:'flex',gap:12,alignItems:'center',flexDirection:'column'}}>
            <div style={{width:'100%',height:420,background:'#f3f3f3',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {current.pdfUrl ? (
                isImageAsset(current.pdfUrl) ? (
                  <img src={current.pdfUrl} alt={current.title} style={{width:'100%',height:'100%',objectFit:'contain',background:'#fff'}} />
                ) : (
                  <iframe src={current.pdfUrl} style={{width:'100%',height:'100%'}} />
                )
              ) : (
                <div style={{padding:24}}><strong>{current.title}</strong></div>
              )}
            </div>
            <div style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <strong>{current.title}</strong> <div style={{fontSize:12,color:'#666'}}>{current.date}</div>
              </div>
              <div>
                <a className="button" href={current.pdfUrl||'#'} target="_blank" rel="noreferrer">詳しくはこちら</a>
              </div>
            </div>
            <div style={{marginTop:8}}>
              {items.map((it,i)=> (
                <span key={it.id} style={{display:'inline-block',width:10,height:10,borderRadius:10,background:i===idx? '#111':'#ddd',margin:6}} />
              ))}
            </div>
          </div>
        )}

        <h3 style={{marginTop:16}}>開催予定</h3>
        <ul>
          {upcoming.map(u=> (
            <li key={u.id}><strong>{u.title}</strong> — {u.date} {u.pdfUrl && (<a href={u.pdfUrl} style={{marginLeft:8}}>PDF</a>)}</li>
          ))}
        </ul>

        <h3 style={{marginTop:16}}>過去開催</h3>
        <ul>
          {past.map(u=> (
            <li key={u.id}><strong>{u.title}</strong> — {u.date} {u.pdfUrl && (<a href={u.pdfUrl} style={{marginLeft:8}}>PDF</a>)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
