import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Report } from '../../lib/data'
import Link from 'next/link'
import ReportBrowser from '../../components/ReportBrowser'
import { authenticatedFetch } from '../../lib/apiClient'
import { useRequireAuth } from '../../lib/auth'

export default function Reports(){
  const [reports,setReports] = useState<Report[]>([])
  const router = useRouter()
  useRequireAuth(router, 'student')

  const { type } = router.query

  useEffect(()=>{
    authenticatedFetch('/api/reports').then(r=>r.json()).then(setReports)
  },[])

  const reportType = Array.isArray(type) ? type[0] : type
  const isInterviewPage = reportType === 'interview'
  const title = reportType === 'visit' ? '見学報告書' : reportType === 'interview' ? '面接報告書' : '見学・面接報告書一覧'
  const introText = isInterviewPage
    ? '先輩たちの面接報告を、見やすい一覧と折りたたみ形式で確認できます'
    : '先輩たちの見学報告を、治療院ごとの一覧と折りたたみ形式で確認できます'

  return (
    <div className="student-reports-page">
      <div className="student-top">
        <div className="header">
          <h2>{title}</h2>
          <Link href="/student" className="button logout">ホームに戻る</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <style jsx global>{`
            .student-reports-page {
              min-height: 100%;
              background:
                radial-gradient(ellipse 34% 10% at 8% 18%, rgba(255, 255, 255, 0.88) 0 22%, transparent 43%),
                radial-gradient(ellipse 42% 13% at 22% 22%, rgba(255, 255, 255, 0.76) 0 19%, transparent 42%),
                radial-gradient(ellipse 38% 12% at 83% 10%, rgba(255, 255, 255, 0.85) 0 20%, transparent 43%),
                radial-gradient(ellipse 48% 14% at 76% 15%, rgba(255, 255, 255, 0.68) 0 18%, transparent 40%),
                linear-gradient(180deg, #72d4f4 0%, #bdeeff 46%, #e7f8ff 100%);
              padding: 0 0 32px;
            }
            .student-reports-page .student-top {
              margin: 0 0 18px;
              padding: 16px;
              border-radius: 0;
            }
            .student-reports-page .student-top .header { max-width: 1120px; padding: 0 16px; }
            .student-reports-page .student-top .header h2 { font-size: 26px; }
            .student-reports-page .container { max-width: 1120px; margin: 0 auto; }
            .student-reports-page .card { background: transparent; padding: 0; box-shadow: none; }
            .student-reports-page .reports-overview,
            .student-reports-page .reports-browser-card {
              background: rgba(255, 255, 255, 0.96);
              padding: 28px;
              border-radius: 8px;
              box-shadow: 0 18px 48px rgba(7, 41, 89, 0.2);
            }
            .student-reports-page .reports-browser-card { margin-top: 24px; }
            .student-reports-page .report-page-title {
              margin: 0;
              color: #052f4f;
              font-size: 34px;
              font-weight: 800;
              letter-spacing: 3px;
              line-height: 1.1;
            }
            .student-reports-page .report-page-intro {
              max-width: 620px;
              margin: 14px auto 0;
              color: #46616f;
              font-size: 16px;
              font-weight: 600;
              line-height: 1.8;
            }
            @media (max-width: 640px) {
              .student-reports-page { padding: 0 0 20px; }
              .student-reports-page .student-top { padding: 12px 16px; margin-bottom: 8px; }
              .student-reports-page .student-top .header { padding: 0 4px; }
              .student-reports-page .student-top .header h2 { font-size: 20px; }
              .student-reports-page .reports-overview,
              .student-reports-page .reports-browser-card { padding: 16px; }
              .student-reports-page .reports-browser-card { margin-top: 16px; }
              .student-reports-page .report-page-title { font-size: 26px; letter-spacing: 2px; }
              .student-reports-page .report-page-intro { font-size: 14px; }
            }
          `}</style>

          <section className="reports-overview">
            <div style={{textAlign:'center'}}>
              <h2 className="report-page-title">EXAM REPORTS</h2>
              <p className="report-page-intro">{introText}</p>
            </div>
          </section>

          <section className="reports-browser-card">
            <ReportBrowser reports={reports} reportType={reportType} detailPath="/student/report-detail" showClinicListGridPaper />
          </section>
        </div>
      </div>
    </div>
  )
}
