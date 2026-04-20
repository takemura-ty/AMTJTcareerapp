import { useEffect, useState } from 'react'
import Link from 'next/link'
import { reports } from '../../lib/data'

export default function StaffIndex(){
  const [list,setList] = useState(reports)

  // mock upload handler
  const upload = async (e:any) =>{
    e.preventDefault()
    alert('アップロード（モック）')
  }

  return (
    <div className="container">
      <div className="header">
        <h2>職員ページ</h2>
        <Link href="/" className="button outline">トップへ</Link>
      </div>

      <div className="card">
        <h3>データアップロード</h3>
        <form onSubmit={upload}>
          <input type="file" />
          <div style={{marginTop:8}}><button className="button">アップロード</button></div>
        </form>

        <h3 style={{marginTop:16}}>報告書一覧（検索・共有）</h3>
        <ul>
          {list.map(r=> (
            <li key={r.id}>{r.company} — {r.region} — <a className="button" href={`/student/reports?shareId=${r.id}`}>共有</a></li>
          ))}
        </ul>
      </div>
    </div>
  )
}
