import Link from 'next/link'
import type { Report } from '../lib/data'
import { formatMajor, formatPrefecture, groupByClinic } from '../lib/reportGroups'

type ReportDetailViewProps = {
  reports: Report[]
  reportType?: string
  clinicKey?: string
  backHref: string
}

function getDateLabel(type: Report['type']) {
  return type === 'interview' ? '面接日' : '見学日'
}

export default function ReportDetailView({ reports, reportType, clinicKey, backHref }: ReportDetailViewProps) {
  const filteredReports = reports.filter(report => (reportType ? report.type === reportType : true))
  const selectedClinic = groupByClinic(filteredReports).find(group => group.key === clinicKey) || null

  return (
    <>
      <style jsx>{`
        .clinic-detail {
          margin-top: 20px;
          background: #fff;
          border: 1px solid #e7edf2;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 8px 24px rgba(7, 22, 28, 0.05);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .detail-header h3 {
          margin: 0 0 6px;
          font-size: 24px;
        }

        .detail-subtitle {
          color: #56646f;
          line-height: 1.6;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          border: 1px solid #d9e3eb;
          background: #fff;
          border-radius: 999px;
          padding: 9px 14px;
          color: #27404f;
          text-decoration: none;
        }

        .empty {
          color: #667784;
          text-align: center;
          padding: 32px 12px;
        }

        .report-entries {
          display: grid;
          gap: 12px;
        }

        .report-entry {
          border: 1px solid #e4ebf0;
          border-radius: 14px;
          background: #fafcfd;
          overflow: hidden;
        }

        .report-entry summary {
          list-style: none;
          cursor: pointer;
          padding: 16px 18px;
        }

        .report-entry summary::-webkit-details-marker {
          display: none;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .summary-main {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .summary-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          background: #e8f5fb;
          color: #0b5f86;
          padding: 6px 10px;
          font-size: 13px;
          font-weight: 700;
        }

        .summary-arrow {
          color: #6f8290;
          font-size: 13px;
        }

        .entry-body {
          border-top: 1px solid #e4ebf0;
          padding: 18px;
          display: grid;
          gap: 14px;
        }

        .field h4 {
          margin: 0 0 6px;
          font-size: 14px;
          color: #314754;
        }

        .field p {
          margin: 0;
          white-space: pre-wrap;
          line-height: 1.8;
          color: #111;
        }
      `}</style>

      <div className="clinic-detail">
        {!selectedClinic ? (
          <div className="empty">
            報告書が見つかりませんでした。<br />
            <Link href={backHref} className="back-button" style={{ marginTop: 16 }}>一覧に戻る</Link>
          </div>
        ) : (
          <>
            <div className="detail-header">
              <div>
                <h3>{selectedClinic.company}</h3>
                <div className="detail-subtitle">
                  {formatPrefecture(selectedClinic.region)}
                  {selectedClinic.city ? ` / ${selectedClinic.city}` : ''}
                  <br />
                  最終更新日: {selectedClinic.updatedAt}
                </div>
              </div>
              <Link href={backHref} className="back-button">一覧に戻る</Link>
            </div>

            <div className="report-entries">
              {selectedClinic.reports.map((report, index) => (
                <details key={report.id} className="report-entry" open={index === 0}>
                  <summary>
                    <div className="summary-row">
                      <div className="summary-main">
                        <span className="summary-chip">{getDateLabel(report.type)}: {report.date}</span>
                        <span className="summary-chip">{formatMajor(report.major)}</span>
                      </div>
                      <span className="summary-arrow">詳細を開く</span>
                    </div>
                  </summary>
                  <div className="entry-body">
                    <div className="field">
                      <h4>院長先生や見学担当者の方の印象</h4>
                      <p>{report.supervisorImpression || '記載なし'}</p>
                    </div>
                    <div className="field">
                      <h4>スタッフの印象</h4>
                      <p>{report.staffImpression || '記載なし'}</p>
                    </div>
                    <div className="field">
                      <h4>院全体の印象</h4>
                      <p>{report.clinicImpression || '記載なし'}</p>
                    </div>
                    <div className="field">
                      <h4>その他（印象に残ったことなど）</h4>
                      <p>{report.otherNotes || '記載なし'}</p>
                    </div>
                    <div className="field">
                      <h4>面接希望（３年生のみ）（１.２年生は希望者のみ）</h4>
                      <p>{report.interviewWish || '記載なし'}</p>
                    </div>
                    <div className="field">
                      <h4>今後見学を希望する後輩へのアドバイス</h4>
                      <p>{report.advice || '記載なし'}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}