import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { Report } from '../../lib/data'
import { useRequireAuth } from '../../lib/auth'
import ReportDetailView from '../../components/ReportDetailView'
import { getClinicKey } from '../../lib/reportGroups'
import { authenticatedFetch } from '../../lib/apiClient'

export default function StaffReportDetail() {
  const [reports, setReports] = useState<Report[]>([])
  const router = useRouter()
  useRequireAuth(router, 'staff')

  const { type, clinic } = router.query

  useEffect(() => {
    authenticatedFetch('/api/reports').then(response => response.json()).then(setReports)
  }, [])

  async function updateReports(ids: string[], update: Record<string, string>) {
    const response = await authenticatedFetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, update })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || '報告書を更新できませんでした。')
    }

    const updatedReports = await authenticatedFetch('/api/reports').then(result => result.json())
    setReports(updatedReports)
    if (update.company !== undefined || update.region !== undefined || update.city !== undefined) {
      router.replace({
        pathname: '/staff/report-detail',
        query: {
          type: reportType,
          clinic: getClinicKey({
            company: update.company || reports.find(report => report.id === ids[0])?.company || '',
            region: update.region || reports.find(report => report.id === ids[0])?.region || '',
            city: update.city === undefined ? reports.find(report => report.id === ids[0])?.city : update.city
          })
        }
      })
    }
  }

  async function deleteReport(id: string) {
    const response = await authenticatedFetch('/api/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || '報告書を削除できませんでした。')
    }

    const updatedReports = await authenticatedFetch('/api/reports').then(result => result.json())
    setReports(updatedReports)
  }

  const reportType = Array.isArray(type) ? type[0] : type
  const clinicKey = Array.isArray(clinic) ? clinic[0] : clinic
  const title = reportType === 'visit' ? '見学報告書' : reportType === 'interview' ? '面接報告書' : '見学・面接報告書'
  const backHref = reportType ? `/staff/reports?type=${reportType}` : '/staff/reports'

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>{title}</h2>
          <Link href="/staff" className="button logout">ホームに戻る</Link>
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

          <ReportDetailView reports={reports} reportType={reportType} clinicKey={clinicKey} backHref={backHref} onUpdate={updateReports} onDelete={deleteReport} />
        </div>
      </div>
    </div>
  )
}