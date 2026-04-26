import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { Report } from '../../lib/data'
import ReportDetailView from '../../components/ReportDetailView'

export default function StudentReportDetail() {
  const [reports, setReports] = useState<Report[]>([])
  const router = useRouter()
  const { type, clinic } = router.query

  useEffect(() => {
    fetch('/api/reports').then(response => response.json()).then(setReports)
  }, [])

  const reportType = Array.isArray(type) ? type[0] : type
  const clinicKey = Array.isArray(clinic) ? clinic[0] : clinic
  const title = reportType === 'visit' ? '見学報告書' : reportType === 'interview' ? '面接報告書' : '見学・面接報告書'
  const backHref = reportType ? `/student/reports?type=${reportType}` : '/student/reports'

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
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>EXAM REPORTS</h2>
            <p style={{ color: '#8b8b8b' }}>治療院ごとの報告書詳細を確認できます</p>
          </div>

          <ReportDetailView reports={reports} reportType={reportType} clinicKey={clinicKey} backHref={backHref} />
        </div>
      </div>
    </div>
  )
}