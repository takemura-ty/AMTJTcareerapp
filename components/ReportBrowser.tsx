import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import type { Report } from '../lib/data'
import { CITY_SPLIT_PREFECTURES, type ClinicGroup, formatPrefecture, groupByClinic, PREFECTURES } from '../lib/reportGroups'

type ReportBrowserProps = {
  reports: Report[]
  reportType?: string
  detailPath: string
  showClinicListGridPaper?: boolean
}

function formatUpdatedDate(value?: string) {
  return value ? value.slice(0, 10) : '未設定'
}

export default function ReportBrowser({ reports, reportType, detailPath, showClinicListGridPaper = false }: ReportBrowserProps) {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [rankingSearchTerm, setRankingSearchTerm] = useState('')
  const router = useRouter()

  function openClinicDetail(clinicKey: string) {
    router.push({ pathname: detailPath, query: { type: reportType, clinic: clinicKey } })
  }

  const reportsForSelectedRegion = useMemo(() => (
    reports
      .filter(report => (reportType ? report.type === reportType : true))
      .filter(report => (selectedRegion ? report.region === selectedRegion : true))
      .sort((left, right) => right.date.localeCompare(left.date))
  ), [reportType, reports, selectedRegion])

  function filterBySearchTerm(sourceReports: Report[], value: string) {
    const normalizedSearchTerm = value.trim().toLocaleLowerCase('ja-JP')
    return sourceReports.filter(report => (
      !normalizedSearchTerm
      || report.company.toLocaleLowerCase('ja-JP').includes(normalizedSearchTerm)
      || report.city?.toLocaleLowerCase('ja-JP').includes(normalizedSearchTerm)
    ))
  }

  const filteredReports = useMemo(
    () => filterBySearchTerm(reportsForSelectedRegion, searchTerm),
    [reportsForSelectedRegion, searchTerm]
  )

  const rankingReports = useMemo(
    () => filterBySearchTerm(reportsForSelectedRegion, rankingSearchTerm),
    [rankingSearchTerm, reportsForSelectedRegion]
  )

  const clinicGroups = useMemo(() => groupByClinic(filteredReports), [filteredReports])
  const rankingClinicGroups = useMemo(() => groupByClinic(rankingReports), [rankingReports])

  const reportRanking = useMemo(() => (
    [...rankingClinicGroups]
      .sort((left, right) => {
        const reportCountCompare = right.reports.length - left.reports.length
        if (reportCountCompare !== 0) return reportCountCompare
        return left.company.localeCompare(right.company, 'ja')
      })
      .slice(0, 3)
  ), [rankingClinicGroups])

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
          width: min(260px, 100%);
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d7e0e7;
          background: #fff;
        }

        .search-input {
          width: min(320px, 100%);
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d7e0e7;
          background: #fff;
          box-sizing: border-box;
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

        .clinic-list.grid-paper {
          padding-right: 48px;
          padding-left: 48px;
          background-color: #fff;
          background-image:
            linear-gradient(#e9edf0 1px, transparent 1px),
            linear-gradient(90deg, #e9edf0 1px, transparent 1px);
          background-size: 16px 16px;
        }

        .ranking {
          background: #fff8e8;
          border: 1px solid #efd7a5;
          border-radius: 8px;
          padding: 16px 18px;
          margin-bottom: 20px;
        }

        .ranking-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .ranking-item {
          width: 100%;
          display: grid;
          text-align: left;
          gap: 4px;
          padding: 10px 12px;
          background: #fff;
          border: 1px solid #f0dfba;
          border-radius: 8px;
          color: inherit;
          cursor: pointer;
          font: inherit;
        }

        .ranking-item:hover {
          border-color: #c68a1b;
          background: #fffdf8;
        }

        .ranking-rank {
          color: #9a6500;
          font-weight: 700;
          font-size: 13px;
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

        .prefecture-name {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .prefecture-pin {
          width: 18px;
          height: 18px;
          color: var(--hinata-blue);
          flex: 0 0 18px;
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
          line-break: strict;
          overflow-wrap: break-word;
          word-break: normal;
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

          .updated-date {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .region-select,
          .search-input {
            width: 100%;
          }

          .ranking-list {
            grid-template-columns: 1fr;
          }

          .clinic-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .clinic-list.grid-paper {
            padding-right: 18px;
            padding-left: 18px;
          }
        }
      `}</style>

      <div className="report-browser">
        {reportRanking.length > 0 ? (
          <section className="ranking" aria-label="報告件数ランキング">
            <h3 className="section-title">報告件数ランキング</h3>
            <ol className="ranking-list">
              {reportRanking.map((group, index) => (
                <li key={group.key}>
                  <button type="button" className="ranking-item" onClick={() => openClinicDetail(group.key)}>
                    <span className="ranking-rank">{index + 1}位</span>
                    <strong>{group.company}</strong>
                    <span className="meta">{formatPrefecture(group.region)} {group.city || '市区町村未設定'} / {group.reports.length}件</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        <form className="toolbar" onSubmit={event => {
          event.preventDefault()
          setRankingSearchTerm(searchTerm)
        }}>
          <select className="region-select" value={selectedRegion} onChange={event => setSelectedRegion(event.target.value)}>
            <option value="">すべての都道府県</option>
            {PREFECTURES.map(prefecture => (
              <option key={prefecture} value={prefecture}>{formatPrefecture(prefecture)}</option>
            ))}
          </select>
          <input
            className="search-input"
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="治療院名・市町村名で検索"
            aria-label="治療院名・市町村名で検索"
          />
        </form>

        <div className="layout">
          <section className={`clinic-list${showClinicListGridPaper ? ' grid-paper' : ''}`}>
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
                      <h4 className="prefecture-name">
                        <svg className="prefecture-pin" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M12 22s-6.5-6.12-6.5-11.34C5.5 6.15 8.41 3 12 3s6.5 3.15 6.5 7.66C18.5 15.88 12 22 12 22Zm0-10.16a2.77 2.77 0 1 0 0-5.54 2.77 2.77 0 0 0 0 5.54Z" />
                        </svg>
                        {formatPrefecture(prefecture)}
                      </h4>
                      {[...groupedByCity.entries()].sort((left, right) => {
                        const leftReportCount = left[1].reduce((count, group) => count + group.reports.length, 0)
                        const rightReportCount = right[1].reduce((count, group) => count + group.reports.length, 0)
                        const reportCountCompare = rightReportCount - leftReportCount
                        if (reportCountCompare !== 0) return reportCountCompare
                        return left[0].localeCompare(right[0], 'ja')
                      }).map(([city, cityGroups]) => (
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
                                <span className="meta">最終更新日: <span className="updated-date">{formatUpdatedDate(group.updatedAt)}</span></span>
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
                    <h4 className="prefecture-name">
                      <svg className="prefecture-pin" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M12 22s-6.5-6.12-6.5-11.34C5.5 6.15 8.41 3 12 3s6.5 3.15 6.5 7.66C18.5 15.88 12 22 12 22Zm0-10.16a2.77 2.77 0 1 0 0-5.54 2.77 2.77 0 0 0 0 5.54Z" />
                      </svg>
                      {formatPrefecture(prefecture)}
                    </h4>
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
                          <span className="meta">最終更新日: <span className="updated-date">{formatUpdatedDate(group.updatedAt)}</span></span>
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