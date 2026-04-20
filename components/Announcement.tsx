import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Workshop } from '../lib/data'

type Ann = {
  id: string
  title: string
  date?: string
  desc?: string
  thumb?: string
  pdfUrl?: string
}

export default function Announcement(){
  const [workshops,setWorkshops] = useState<Workshop[]>([])
  const [anns,setAnns] = useState<Ann[]>([])

  useEffect(()=>{
    fetch('/api/workshops').then(r=>r.json()).then(setWorkshops)
    try{
      const raw = localStorage.getItem('announcements')
      if(raw) setAnns(JSON.parse(raw))
    }catch(e){}
  },[])

  const items: Ann[] = [...(anns||[]), ...(workshops.map(w=>({ id:w.id, title:w.title, date:w.date, desc: undefined, pdfUrl: w.pdfUrl })))]

  if(items.length===0) return null

  return (
    <div className="announcement">
      <h2 style={{textAlign:'center',marginTop:0}}>EXAM REPORTS</h2>
      <p style={{textAlign:'center',color:'#8b8b8b',marginTop:4}}>先輩たちの受験結果報告を閲覧できます</p>

      <div className="announcement-list">
        {items.map((it,idx)=> {
          const isVisit = /見学|見学報告/i.test(it.title)
          const isInterview = /面接|面接報告/i.test(it.title)
          const cls = idx%2===0 ? 'accent-red' : 'accent-gray'
          return (
            <div key={it.id} className={`announcement-card ${cls}`}>
              {it.thumb ? (
                  <div className="announcement-thumb" style={{backgroundImage:`url(${it.thumb})`}} />
                ) : (
                  <div className="announcement-icon-box">
                    {isVisit ? (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12c2-5 8-6 10-6s8 1 10 6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 11c1.5 0 2.5-1.2 3.5-2" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18 11c-1.5 0-2.5-1.2-3.5-2" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="7" cy="12" r="1.6" fill="#fff" opacity="0.2" />
                        <circle cx="17" cy="12" r="1.6" fill="#fff" opacity="0.2" />
                      </svg>
                    ) : isInterview ? (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7a2 2 0 1 1 4 0v1h4v5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 14c0-1.1-1-2-2-2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M20 14c0-1.1 1-2 2-2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M3 20h18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#fff" strokeWidth="1.2"/>
                        <path d="M7 8h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M7 12h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                )}

              <div className="announcement-body">
                <h3>{it.title}</h3>
                {it.desc && <p className="muted">{it.desc}</p>}
                {it.pdfUrl && <a href={it.pdfUrl} className="announce-link">詳細を見る →</a>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
