import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Submit(){
  const [title,setTitle] = useState('')
  const [desc,setDesc] = useState('')
  const [file,setFile] = useState<File|null>(null)
  const router = useRouter()

  const onFile = (e:any)=>{
    const f = e.target.files && e.target.files[0]
    if(f) setFile(f)
  }

  const onSubmit = async (e:any)=>{
    e.preventDefault()
    // store in localStorage announcements
    const id = 'a'+Date.now()
    let thumb = undefined
    if(file){
      thumb = URL.createObjectURL(file)
    }
    const ann = { id, title, desc, thumb, date: new Date().toISOString().slice(0,10) }
    try{
      const raw = localStorage.getItem('announcements')
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift(ann)
      localStorage.setItem('announcements', JSON.stringify(arr))
    }catch(e){ }
    router.push('/student/reports')
  }

  return (
    <div className="container">
      <div className="header">
        <h2>報告書提出</h2>
        <Link href="/student" className="button outline">戻る</Link>
      </div>

      <div className="card">
        <h3>案内（勉強会・教材）をアップロード</h3>
        <form onSubmit={onSubmit} style={{display:'grid',gap:8}}>
          <label>タイトル<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例：勉強会案内" /></label>
          <label>説明<textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="詳細を入力できます（任意）" /></label>
          <label>画像 / PDF（サムネイルとして表示されます）<input type="file" accept="image/*,.pdf" onChange={onFile} /></label>
          <div style={{display:'flex',gap:8}}>
            <button className="button" type="submit">アップロード</button>
            <Link href="/student">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
