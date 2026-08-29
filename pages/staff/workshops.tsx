import { FormEvent, Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DocumentPreview from '../../components/DocumentPreview'
import { InformationSession, isImageAsset } from '../../lib/informationSessions'
import { useRequireAuth } from '../../lib/auth'

export default function StaffWorkshops(){
  const router = useRouter()
  useRequireAuth(router, 'staff')
  const [items,setItems] = useState<InformationSession[]>([])
  const [idx,setIdx] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  useEffect(()=>{
    fetch('/api/workshops')
      .then(r=>r.json())
      .then(setItems)
  },[])

  useEffect(()=>{
    if(items.length<=1 || editingId) return
    const t = setInterval(()=>{
      setIdx(i=> (i+1) % items.length)
    },4000)
    return ()=>clearInterval(t)
  },[items, editingId])

  async function removeWorkshop(id: string) {
    if (!window.confirm('この資料を削除しますか？')) return

    const response = await fetch(`/api/workshops?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.ok) {
      alert('資料の削除に失敗しました。')
      return
    }

    setItems((currentItems) => {
      const remainingItems = currentItems.filter((item) => item.id !== id)
      setIdx((currentIdx) => Math.min(currentIdx, Math.max(remainingItems.length - 1, 0)))
      return remainingItems
    })
  }

  function startEditing(workshop: InformationSession) {
    setIdx(items.findIndex((item) => item.id === workshop.id))
    setEditingId(workshop.id)
    setEditTitle(workshop.title)
    setEditDate(workshop.date)
  }

  async function saveWorkshop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingId || !editTitle || !editDate) return

    setIsSavingEdit(true)
    try {
      const response = await fetch(`/api/workshops?id=${encodeURIComponent(editingId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, date: editDate })
      })
      if (!response.ok) throw new Error('Failed to update workshop')

      const updated = await response.json()
      setItems((currentItems) => currentItems.map((item) => item.id === updated.id ? updated : item))
      setEditingId(null)
    } catch (error) {
      console.error(error)
      alert('資料の修正に失敗しました。')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const now = new Date().toISOString().slice(0,10)
  const upcoming = items.filter(i=>i.date >= now).sort((a,b)=>a.date.localeCompare(b.date))
  const past = items.filter(i=>i.date < now).sort((a,b)=>b.date.localeCompare(a.date))

  const current = items[idx]

  return (
    <div className="container">
      <div className="header">
        <h2>INFORMATION SESSION</h2>
        <Link href="/staff" className="button navigation-button">戻る</Link>
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
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <a className="button btn-blue" href={current.pdfUrl||'#'} target="_blank" rel="noreferrer">資料を開く</a>
                <button type="button" className="button btn-acu" onClick={() => startEditing(current)}>修正</button>
                <button type="button" className="button danger" onClick={() => removeWorkshop(current.id)}>削除</button>
              </div>
            </div>
            <div style={{marginTop:8}}>
              {items.map((it,i)=> (
                <span key={it.id} style={{display:'inline-block',width:10,height:10,borderRadius:10,background:i===idx? '#111':'#ddd',margin:6}} />
              ))}
            </div>
          </div>
        )}

        {editingId && <WorkshopEditForm />}

        <h3 className="workshop-list-title">開催予定</h3>
        <div className="workshop-list staff-workshop-list">
          {upcoming.map(u=> (
            <Fragment key={u.id}>
              <article className="workshop-item">
                <div>
                  <strong>{u.title}</strong>
                  <span>{u.date} 開催</span>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {u.pdfUrl && <a className="button btn-blue" href={u.pdfUrl} target="_blank" rel="noreferrer">資料を開く</a>}
                  <button type="button" className="button btn-acu" onClick={() => startEditing(u)}>修正</button>
                  <button type="button" className="button danger" onClick={() => removeWorkshop(u.id)}>削除</button>
                </div>
              </article>
            </Fragment>
          ))}
        </div>

        <h3 className="workshop-list-title">過去開催</h3>
        <div className="workshop-list staff-workshop-list">
          {past.map(u=> (
            <Fragment key={u.id}>
              <article className="workshop-item">
                <div>
                  <strong>{u.title}</strong>
                  <span>{u.date} 開催</span>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {u.pdfUrl && <a className="button btn-blue" href={u.pdfUrl} target="_blank" rel="noreferrer">資料を開く</a>}
                  <button type="button" className="button btn-acu" onClick={() => startEditing(u)}>修正</button>
                  <button type="button" className="button danger" onClick={() => removeWorkshop(u.id)}>削除</button>
                </div>
              </article>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )

  function WorkshopEditForm() {
    return (
      <form className="workshop-edit-form" onSubmit={saveWorkshop}>
        <label>
          タイトル
          <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} required />
        </label>
        <label>
          開催日
          <input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} required />
        </label>
        <div className="workshop-edit-actions">
          <button type="submit" className="button btn-acu" disabled={isSavingEdit}>{isSavingEdit ? '保存中...' : '保存'}</button>
          <button type="button" className="button outline" onClick={() => setEditingId(null)}>キャンセル</button>
        </div>
      </form>
    )
  }
}