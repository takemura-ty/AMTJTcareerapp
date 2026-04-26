import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Report } from '../../lib/data'
import Link from 'next/link'
import ReportBrowser from '../../components/ReportBrowser'

export default function Reports(){
  const [reports,setReports] = useState<Report[]>([])
  const router = useRouter()

  const { type } = router.query

  useEffect(()=>{
    fetch('/api/reports').then(r=>r.json()).then(setReports)
  },[])

  const reportType = Array.isArray(type) ? type[0] : type
  const isInterviewPage = reportType === 'interview'
  const title = reportType === 'visit' ? '見学報告書' : reportType === 'interview' ? '面接報告書' : '見学・面接報告書一覧'
  const introText = isInterviewPage
    ? '先輩たちの面接報告を、見やすい一覧と折りたたみ形式で確認できます'
    : '先輩たちの見学報告を、治療院ごとの一覧と折りたたみ形式で確認できます'

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>{title}</h2>
          <Link href="/student" className="button logout">戻る</Link>
        </div>
      </div>

      <div className="container">
      <div className="card">
        <style jsx global>{`
          .card { background: var(--card); }
        `}</style>
        <div style={{textAlign:'center'}}>
          <h2 style={{marginTop:0}}>EXAM REPORTS</h2>
          <p style={{color:'#8b8b8b'}}>{introText}</p>
        </div>

        <ReportBrowser reports={reports} reportType={reportType} />
      </div>
    </div>
  </div>
  )
}
