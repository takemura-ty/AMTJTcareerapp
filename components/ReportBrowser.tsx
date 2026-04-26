import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import type { Report } from '../lib/data'
import { CITY_SPLIT_PREFECTURES, type ClinicGroup, formatPrefecture, groupByClinic, PREFECTURES } from '../lib/reportGroups'

type ReportBrowserProps = {
  reports: Report[]
  reportType?: string
  detailPath: string
}

export default function ReportBrowser({ reports, reportType, detailPath }: ReportBrowserProps) {
  const [selectedRegion, setSelectedRegion] = useState('')
  const router = useRouter()

  function openClinicDetail(clinicKey: string) {
    router.push({ pathname: detailPath, query: { type: reportType, clinic: clinicKey } })
  }

  const filteredReports = useMemo(() => {
    const nextReports = reports
      .filter(report => (reportType ? report.type === reportType : true))
      .filter(report => (selectedRegion ? report.region === selectedRegion : true))

    return nextReports.sort((left, right) => right.date.localeCompare(left.date))
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
          display: block;
        }

        .clinic-list {
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

        .clinic-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .clinic-button {
          width: 100%;
          display: block;
          text-align: left;
          border: 1px solid #d9e3eb;
          background: #f8fbfd;
          border-radius: 12px;
          padding: 14px;
          color: inherit;
          cursor: pointer;
          transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
          min-height: 132px;
          box-sizing: border-box;
        }

        .clinic-button:hover {
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

        @media (max-width: 900px) {
          .clinic-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .clinic-grid {
            grid-template-columns: 1fr;
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
                          <div className="clinic-grid">
                            {cityGroups.map(group => (
                              <button
                                key={group.key}
                                type="button"
                                className="clinic-button"
                                onClick={() => openClinicDetail(group.key)}
                              >
                                <span className="clinic-name">{group.company}</span>
                                <span className="meta">最終更新日: {group.updatedAt}</span>
                                <span className="meta">報告書: {group.reports.length}件</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }

                return (
                  <div key={prefecture} className="prefecture-block">
                    <h4 className="prefecture-name">{formatPrefecture(prefecture)}</h4>
                    <div className="clinic-grid">
                      {groups.map(group => (
                        <button
                          key={group.key}
                          type="button"
                          className="clinic-button"
                          onClick={() => openClinicDetail(group.key)}
                        >
                          <span className="clinic-name">{group.company}</span>
                          {group.city ? <span className="meta">{group.city}</span> : null}
                          <span className="meta">最終更新日: {group.updatedAt}</span>
                          <span className="meta">報告書: {group.reports.length}件</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </section>
        </div>
      </div>
    </>
  )
}