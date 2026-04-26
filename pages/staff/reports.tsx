import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Report } from '../../lib/data'
import { useRequireAuth } from '../../lib/auth'
import ReportBrowser from '../../components/ReportBrowser'

export default function StaffReports(){
  const [reports, setReports] = useState<Report[]>([])
  const router = useRouter()
  useRequireAuth(router, 'staff')

  const { type } = router.query

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(setReports)
  }, [])

  function uploadExcel(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const reportLabel = reportType === 'interview' ? '面接報告書' : '見学報告書'
    alert(`${reportLabel} 用の Excel アップロード（モック）`)
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

          <div style={{maxWidth:960,margin:'18px auto 0',padding:'18px 20px',border:'1px dashed #cfd8df',borderRadius:12,background:'#f8fbfd'}}>
            <h3 style={{margin:'0 0 8px',fontSize:20,textAlign:'center'}}>Excel 資料アップロード</h3>
            <p style={{margin:'0 0 14px',color:'#666',textAlign:'center'}}>{title} の一覧更新用ファイルをアップロードできます。現在はモック動作です。</p>
            <form onSubmit={uploadExcel} style={{display:'flex',gap:12,alignItems:'center',justifyContent:'center',flexWrap:'wrap'}}>
              <input type="file" accept=".xlsx,.xls,.csv" style={{maxWidth:360}} />
              <button className="button btn-blue" type="submit">Excel をアップロード</button>
            </form>
          </div>

          <ReportBrowser reports={reports} reportType={reportType} detailPath="/staff/report-detail" />
        </div>
      </div>
    </div>
  )
}