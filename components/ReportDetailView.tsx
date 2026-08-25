import Link from 'next/link'
import { useState } from 'react'
import type { Report } from '../lib/data'
import { formatMajor, formatPrefecture, groupByClinic } from '../lib/reportGroups'

type ReportEdit = Partial<Pick<Report,
  'company' | 'region' | 'city' | 'supervisorImpression' | 'staffImpression' |
  'clinicImpression' | 'otherNotes' | 'interviewWish' | 'advice'
>>

type ReportDetailViewProps = {
  reports: Report[]
  reportType?: string
  clinicKey?: string
  backHref: string
  onUpdate?: (ids: string[], update: ReportEdit) => Promise<void>
}

type ReportField = Exclude<keyof ReportEdit, 'company' | 'region' | 'city'>

const reportFields: { key: ReportField; label: string }[] = [
  { key: 'supervisorImpression', label: '院長先生や見学担当者の方の印象' },
  { key: 'staffImpression', label: 'スタッフの印象' },
  { key: 'clinicImpression', label: '院全体の印象' },
  { key: 'otherNotes', label: 'その他（印象に残ったことなど）' },
  { key: 'interviewWish', label: '面接希望（３年生のみ）（１.２年生は希望者のみ）' },
  { key: 'advice', label: '今後見学を希望する後輩へのアドバイス' }
]

function getDateLabel(type: Report['type']) {
  return type === 'interview' ? '面接日' : '見学日'
}

function formatUpdatedDate(value?: string) {
  return value ? value.slice(0, 10) : '未設定'
}

export default function ReportDetailView({ reports, reportType, clinicKey, backHref, onUpdate }: ReportDetailViewProps) {
  const filteredReports = reports.filter(report => (reportType ? report.type === reportType : true))
  const selectedClinic = groupByClinic(filteredReports).find(group => group.key === clinicKey) || null
  const [isEditingClinic, setIsEditingClinic] = useState(false)
  const [clinicDraft, setClinicDraft] = useState({ company: '', region: '', city: '' })
  const [editingField, setEditingField] = useState<{ reportId: string; field: ReportField; value: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function startClinicEdit() {
    if (!selectedClinic) return
    setClinicDraft({
      company: selectedClinic.company,
      region: selectedClinic.region,
      city: selectedClinic.city || ''
    })
    setIsEditingClinic(true)
  }

  async function saveClinic() {
    if (!selectedClinic || !onUpdate) return
    setIsSaving(true)
    try {
      await onUpdate(selectedClinic.reports.map(report => report.id), clinicDraft)
      setIsEditingClinic(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : '治療院情報を更新できませんでした。')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveReportField() {
    if (!editingField || !onUpdate) return
    setIsSaving(true)
    try {
      await onUpdate([editingField.reportId], { [editingField.field]: editingField.value })
      setEditingField(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : '報告書を更新できませんでした。')
    } finally {
      setIsSaving(false)
    }
  }

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

        .editable-title,
        .field-heading {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .editable-title h3,
        .field-heading h4 {
          margin: 0;
        }

        .edit-button {
          border: 0;
          background: transparent;
          color: #2d6f91;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 2px 4px;
        }

        .edit-button:hover {
          color: #124d6b;
        }

        .edit-form {
          display: grid;
          gap: 10px;
          min-width: min(100%, 360px);
        }

        .edit-form label {
          display: grid;
          gap: 4px;
          color: #3f5563;
          font-size: 13px;
          font-weight: 700;
        }

        .edit-form input,
        .field textarea {
          width: 100%;
          border: 1px solid #c6d4dd;
          border-radius: 8px;
          box-sizing: border-box;
          font: inherit;
          padding: 9px 10px;
        }

        .field textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.7;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
        }

        .save-button,
        .cancel-button {
          border: 1px solid #c6d4dd;
          border-radius: 8px;
          cursor: pointer;
          padding: 8px 12px;
        }

        .save-button {
          background: var(--hinata-blue);
          border-color: var(--hinata-blue);
          color: #fff;
        }

        .cancel-button {
          background: #fff;
          color: #27404f;
        }

        .detail-subtitle {
          color: #56646f;
          line-height: 1.6;
        }

        .location-row {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .location-pin {
          width: 18px;
          height: 18px;
          color: var(--hinata-blue);
          flex: 0 0 18px;
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
                {isEditingClinic ? (
                  <div className="edit-form">
                    <label>治療院名<input value={clinicDraft.company} onChange={event => setClinicDraft({ ...clinicDraft, company: event.target.value })} /></label>
                    <label>都道府県<input value={clinicDraft.region} onChange={event => setClinicDraft({ ...clinicDraft, region: event.target.value })} /></label>
                    <label>市町村<input value={clinicDraft.city} onChange={event => setClinicDraft({ ...clinicDraft, city: event.target.value })} /></label>
                    <div className="edit-actions">
                      <button type="button" className="save-button" onClick={saveClinic} disabled={isSaving}>保存</button>
                      <button type="button" className="cancel-button" onClick={() => setIsEditingClinic(false)} disabled={isSaving}>キャンセル</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="editable-title">
                      <h3>{selectedClinic.company}</h3>
                      {onUpdate ? <button type="button" className="edit-button" onClick={startClinicEdit} aria-label="治療院情報を編集">&#9998;</button> : null}
                    </div>
                    <div className="detail-subtitle">
                      <span className="location-row">
                        <svg className="location-pin" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M12 22s-6.5-6.12-6.5-11.34C5.5 6.15 8.41 3 12 3s6.5 3.15 6.5 7.66C18.5 15.88 12 22 12 22Zm0-10.16a2.77 2.77 0 1 0 0-5.54 2.77 2.77 0 0 0 0 5.54Z" />
                        </svg>
                        <span>
                          {formatPrefecture(selectedClinic.region)}
                          {selectedClinic.city ? ` / ${selectedClinic.city}` : ''}
                        </span>
                      </span>
                      <br />
                      最終更新日: {formatUpdatedDate(selectedClinic.updatedAt)}
                    </div>
                  </>
                )}
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
                    {reportFields.map(field => {
                      const isEditingField = editingField?.reportId === report.id && editingField.field === field.key
                      return (
                        <div key={field.key} className="field">
                          <div className="field-heading">
                            <h4>{field.label}</h4>
                            {onUpdate ? <button type="button" className="edit-button" onClick={() => setEditingField({ reportId: report.id, field: field.key, value: report[field.key] || '' })} aria-label={`${field.label}を編集`}>&#9998;</button> : null}
                          </div>
                          {isEditingField ? (
                            <>
                              <textarea value={editingField.value} onChange={event => setEditingField({ ...editingField, value: event.target.value })} />
                              <div className="edit-actions">
                                <button type="button" className="save-button" onClick={saveReportField} disabled={isSaving}>保存</button>
                                <button type="button" className="cancel-button" onClick={() => setEditingField(null)} disabled={isSaving}>キャンセル</button>
                              </div>
                            </>
                          ) : <p>{report[field.key] || '記載なし'}</p>}
                        </div>
                      )
                    })}
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