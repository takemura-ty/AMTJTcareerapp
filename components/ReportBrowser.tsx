import { useMemo, useState } from 'react'
import type { Report } from '../lib/data'

type ReportBrowserProps = {
  reports: Report[]
  reportType?: string
}

const PREFECTURES = [
  '大阪', '兵庫', '奈良', '和歌山', '京都', '滋賀', '三重',
  '東京', '神奈川', '埼玉', '千葉', '茨城', '栃木', '群馬',
  '北海道',
  '青森', '岩手', '宮城', '秋田', '山形', '福島',
  '愛知', '岐阜', '静岡', '富山', '石川', '福井', '山梨', '長野', '新潟',
  '鳥取', '島根', '岡山', '広島', '山口',
  '徳島', '香川', '愛媛', '高知',
  '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'
]

const CITY_SPLIT_PREFECTURES = new Set(['大阪', '兵庫'])

function formatPrefecture(name: string) {
  if (name === '北海道') return name
  if (name === '東京') return '東京都'
  if (name === '大阪' || name === '京都') return `${name}府`
  return `${name}県`
}

function formatMajor(major: Report['major']) {
  return major === 'shinkyu' ? '鍼灸師学科' : '柔道整復師学科'
}

function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((left, right) => right.date.localeCompare(left.date))
}

function getClinicUpdatedAt(reports: Report[]) {
  return reports
    .map(report => report.updatedAt || report.date)
    .sort((left, right) => right.localeCompare(left))[0]
}

function groupByClinic(reports: Report[]) {
  const groups = new Map<string, Report[]>()

  for (const report of sortByDateDesc(reports)) {
    const key = `${report.region}::${report.city || ''}::${report.company}`
    const current = groups.get(key) || []
    current.push(report)
    groups.set(key, current)
  }

  return [...groups.entries()]
    .map(([key, clinicReports]) => ({
      key,
      company: clinicReports[0].company,
      region: clinicReports[0].region,
      city: clinicReports[0].city,
      updatedAt: getClinicUpdatedAt(clinicReports),
      reports: clinicReports
    }))
    .sort((left, right) => {
      const updatedCompare = right.updatedAt.localeCompare(left.updatedAt)
      if (updatedCompare !== 0) return updatedCompare
      return left.company.localeCompare(right.company, 'ja')
    })
}

type ClinicGroup = ReturnType<typeof groupByClinic>[number]

export default function ReportBrowser({ reports, reportType }: ReportBrowserProps) {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedClinicKey, setSelectedClinicKey] = useState('')

  const filteredReports = useMemo(() => {
    const nextReports = reports
      .filter(report => (reportType ? report.type === reportType : true))
      .filter(report => (selectedRegion ? report.region === selectedRegion : true))

    return sortByDateDesc(nextReports)
  }, [reportType, reports, selectedRegion])

  const clinicGroups = useMemo(() => groupByClinic(filteredReports), [filteredReports])

  const groupedByPrefecture = useMemo(() => {
    const byPrefecture = new Map<string, ClinicGroup[]>()

    for (const group of clinicGroups) {
      const current = byPrefecture.get(group.region) || []
      current.push(group)
      byPrefecture.set(group.region, current)
    }

    return PREFECTURES
      .concat([...byPrefecture.keys()].filter(key => !PREFECTURES.includes(key)))
      .filter(prefecture => (byPrefecture.get(prefecture) || []).length > 0)
      .map(prefecture => ({
        prefecture,
        groups: (byPrefecture.get(prefecture) || []).sort((left, right) => {
          const updatedCompare = right.updatedAt.localeCompare(left.updatedAt)
          if (updatedCompare !== 0) return updatedCompare
          return left.company.localeCompare(right.company, 'ja')
        })
      }))
  }, [clinicGroups])

  const selectedClinic = clinicGroups.find(group => group.key === selectedClinicKey) || null

  return (
    <>
      <style jsx>{`
        .report-browser {
          margin-top: 20px;
        }

        .toolbar {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .region-select {
          max-width: 260px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d7e0e7;
          background: #fff;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        .clinic-list,
        .clinic-detail {
          background: #fff;
          border: 1px solid #e7edf2;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(7, 22, 28, 0.05);
        }

        .section-title {
          margin: 0 0 14px;
          font-size: 18px;
        }

        .prefecture-block + .prefecture-block {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #edf2f6;
        }

        .prefecture-name,
        .city-name {
          margin: 0 0 10px;
          font-weight: 700;
        }

        .city-name {
          font-size: 14px;
          color: #3f5563;
          margin-top: 10px;
        }

        .clinic-button {
          width: 100%;
          text-align: left;
          border: 1px solid #d9e3eb;
          background: #f8fbfd;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
        }

        .clinic-button + .clinic-button {
          margin-top: 10px;
        }

        .clinic-button.active {
          border-color: var(--hinata-blue);
          background: #eef8fd;
          transform: translateY(-1px);
        }

        .clinic-name {
          display: block;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .meta {
          display: block;
          color: #56646f;
          font-size: 13px;
          line-height: 1.6;
        }

        .empty {
          color: #667784;
          text-align: center;
          padding: 24px 12px;
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
          border: 1px solid #d9e3eb;
          background: #fff;
          border-radius: 999px;
          padding: 9px 14px;
          cursor: pointer;
          color: #27404f;
        }

        .report-entries {
          display: grid;
          gap: 12px;
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 4px;
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

        .summary-label {
          color: #56646f;
          font-size: 13px;
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

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .report-entries {
            max-height: none;
          }
        }
      `}</style>

      <div className="report-browser">
        <div className="toolbar">
          <select className="region-select" value={selectedRegion} onChange={event => setSelectedRegion(event.target.value)}>
            <option value="">すべての都道府県</option>
            {PREFECTURES.map(prefecture => (
              <option key={prefecture} value={prefecture}>{formatPrefecture(prefecture)}</option>
            ))}
          </select>
        </div>

        <div className="layout">
          <section className="clinic-list">
            <h3 className="section-title">治療院一覧</h3>
            {groupedByPrefecture.length === 0 ? (
              <div className="empty">該当する報告書がありません</div>
            ) : (
              groupedByPrefecture.map(({ prefecture, groups }) => {
                if (CITY_SPLIT_PREFECTURES.has(prefecture)) {
                  const groupedByCity = new Map<string, ClinicGroup[]>()
                  for (const group of groups) {
                    const city = group.city || '市区町村未設定'
                    const current = groupedByCity.get(city) || []
                    current.push(group)
                    groupedByCity.set(city, current)
                  }

                  return (
                    <div key={prefecture} className="prefecture-block">
                      <h4 className="prefecture-name">{formatPrefecture(prefecture)}</h4>
                      {[...groupedByCity.entries()].sort((left, right) => left[0].localeCompare(right[0], 'ja')).map(([city, cityGroups]) => (
                        <div key={city}>
                          <div className="city-name">{city}</div>
                          {cityGroups.map(group => (
                            <button
                              key={group.key}
                              type="button"
                              className={`clinic-button${selectedClinicKey === group.key ? ' active' : ''}`}
                              onClick={() => setSelectedClinicKey(group.key)}
                            >
                              <span className="clinic-name">{group.company}</span>
                              <span className="meta">最終更新日: {group.updatedAt}</span>
                              <span className="meta">報告書: {group.reports.length}件</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )
                }

                return (
                  <div key={prefecture} className="prefecture-block">
                    <h4 className="prefecture-name">{formatPrefecture(prefecture)}</h4>
                    {groups.map(group => (
                      <button
                        key={group.key}
                        type="button"
                        className={`clinic-button${selectedClinicKey === group.key ? ' active' : ''}`}
                        onClick={() => setSelectedClinicKey(group.key)}
                      >
                        <span className="clinic-name">{group.company}</span>
                        {group.city ? <span className="meta">{group.city}</span> : null}
                        <span className="meta">最終更新日: {group.updatedAt}</span>
                        <span className="meta">報告書: {group.reports.length}件</span>
                      </button>
                    ))}
                  </div>
                )
              })
            )}
          </section>

          <section className="clinic-detail">
            {!selectedClinic ? (
              <div className="empty">左の治療院ボタンを押すと、その治療院の報告書一覧が表示されます。</div>
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
                  <button type="button" className="back-button" onClick={() => setSelectedClinicKey('')}>一覧に戻る</button>
                </div>

                <div className="report-entries">
                  {selectedClinic.reports.map((report, index) => (
                    <details key={report.id} className="report-entry" open={index === 0}>
                      <summary>
                        <div className="summary-row">
                          <div className="summary-main">
                            <span className="summary-chip">見学日付: {report.date}</span>
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
          </section>
        </div>
      </div>
    </>
  )
}