import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Report } from '../../lib/data'
import { useRequireAuth } from '../../lib/auth'
import ReportBrowser from '../../components/ReportBrowser'

export default function StaffReports(){
  const [reports, setReports] = useState<Report[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ total: number; inserted: number; skipped: number; errors: string[] } | null>(null)
  const router = useRouter()
  useRequireAuth(router, 'staff')

  const { type } = router.query

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(setReports)
  }, [])

  async function uploadExcel(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const form = e.currentTarget
    const fileInput = form.elements.namedItem('report-file') as HTMLInputElement | null
    const file = fileInput?.files?.[0]
    if (!file) {
      alert('アップロードする Excel または CSV ファイルを選択してください。')
      return
    }

    if (reportType !== 'visit') {
      alert('報告書の種別を確認できません。')
      return
    }

    setIsUploading(true)
    setUploadResult(null)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'x-report-type': reportType
        },
        body: file
      })
      const responseText = await response.text()
      let data: { error?: string; total?: number; inserted?: number; skipped?: number; errors?: string[] } = {}
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        data = {}
      }
      if (!response.ok) {
        throw new Error(data.error || `アップロードに失敗しました（HTTP ${response.status}）。`)
      }

      const updatedReports = await fetch('/api/reports').then((result) => result.json())
      setReports(updatedReports)
      form.reset()
      setUploadResult({
        total: data.total || 0,
        inserted: data.inserted || 0,
        skipped: data.skipped || 0,
        errors: data.errors || []
      })
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : '報告書一覧を更新できませんでした。')
    } finally {
      setIsUploading(false)
    }
  }

  const reportType = Array.isArray(type) ? type[0] : type
  const isInterviewPage = reportType === 'interview'
  const title = isInterviewPage ? '面接報告書' : reportType === 'visit' ? '見学報告書' : '見学・面接報告書一覧'
  const introText = isInterviewPage
    ? '職員向けに、面接報告書を治療院ごとの一覧と折りたたみ形式で確認できます'
    : '職員向けに、見学報告書を治療院ごとの一覧と折りたたみ形式で確認できます'

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>{title}</h2>
          <Link href="/staff" className="button logout">戻る</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <style jsx global>{`
            .card { background: var(--card); }
            .button.btn-blue { background: var(--hinata-blue) !important; color:#fff !important }
          `}</style>

          <div style={{textAlign:'center'}}>
            <h2 style={{marginTop:0}}>EXAM REPORTS</h2>
            <p style={{color:'#8b8b8b'}}>{introText}</p>
          </div>

          {reportType === 'visit' && <div style={{maxWidth:960,margin:'18px auto 0',padding:'18px 20px',border:'1px dashed #cfd8df',borderRadius:12,background:'#f8fbfd'}}>
            <h3 style={{margin:'0 0 8px',fontSize:20,textAlign:'center'}}>Excel 資料アップロード</h3>
            <p style={{margin:'0 0 14px',color:'#666',textAlign:'center'}}>見学報告書の Excel ファイルをアップロードして一覧へ追加できます。</p>
            <form onSubmit={uploadExcel} style={{display:'flex',gap:12,alignItems:'center',justifyContent:'center',flexWrap:'wrap'}}>
              <input name="report-file" type="file" accept=".xlsx,.xls" disabled={isUploading} style={{maxWidth:360}} />
              <button className="button btn-blue" type="submit" disabled={isUploading}>{isUploading ? 'アップロード中...' : 'Excel をアップロード'}</button>
            </form>
            {uploadResult && <div role="status" style={{marginTop:14,textAlign:'center',color:'#285a37'}}>
              <strong>アップロード完了</strong><br />
              全{uploadResult.total}件 / 新規登録：{uploadResult.inserted}件 / 重複スキップ：{uploadResult.skipped}件 / エラー：{uploadResult.errors.length}件
              {uploadResult.errors.map((message) => <div key={message} style={{color:'#a33',marginTop:4}}>{message}</div>)}
            </div>}
          </div>}

          <ReportBrowser reports={reports} reportType={reportType} detailPath="/staff/report-detail" />
        </div>
      </div>
    </div>
  )
}