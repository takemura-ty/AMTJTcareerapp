import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Report } from '../../lib/data'

export default function StaffReports(){
  const [reports, setReports] = useState<Report[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const { type } = router.query

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(setReports)
  }, [])

  const allPrefectures = [
    '大阪', '兵庫', '奈良', '和歌山', '京都', '滋賀', '三重',
    '東京', '神奈川', '埼玉', '千葉', '茨城', '栃木', '群馬',
    '北海道',
    '青森', '岩手', '宮城', '秋田', '山形', '福島',
    '愛知', '岐阜', '静岡', '富山', '石川', '福井', '山梨', '長野', '新潟',
    '鳥取', '島根', '岡山', '広島', '山口',
    '徳島', '香川', '愛媛', '高知',
    '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'
  ]

  function formatPrefecture(name: string){
    if(name === '北海道') return name
    if(name === '東京') return '東京都'
    if(name === '大阪' || name === '京都') return `${name}府`
    return `${name}県`
  }

  function uploadExcel(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const reportLabel = reportType === 'interview' ? '面接報告書' : '見学報告書'
    alert(`${reportLabel} 用の Excel アップロード（モック）`)
  }

  const reportType = Array.isArray(type) ? type[0] : type
  const isInterviewPage = reportType === 'interview'
  const title = isInterviewPage ? '面接報告書' : reportType === 'visit' ? '見学報告書' : '見学・面接報告書一覧'
  const searchPlaceholder = isInterviewPage ? '企業名(部分一致可)' : '治療院名(部分一致可)'
  const primaryLabel = isInterviewPage ? '企業名' : '治療院名'
  const secondaryLabel = isInterviewPage ? '事業所名' : 'グループ名'
  const introText = isInterviewPage
    ? '職員向けに、面接報告書を確認しながら Excel 資料をアップロードできます'
    : '職員向けに、見学報告書を確認しながら Excel 資料をアップロードできます'

  const filtered = reports
    .filter(r => (reportType ? r.type === reportType : true))
    .filter(r => (selectedRegion ? r.region === selectedRegion : true))
    .filter(r => (searchQuery ? (r.company.includes(searchQuery) || (r.subCompany || '').includes(searchQuery)) : true))

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

          <div style={{display:'flex',gap:12,justifyContent:'center',alignItems:'center',marginTop:18,flexWrap:'wrap'}}>
            <div>
              <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} style={{padding:8,borderRadius:6}}>
                <option value="">すべての都道府県</option>
                {allPrefectures.map(p => <option key={p} value={p}>{formatPrefecture(p)}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input placeholder={searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{padding:8,borderRadius:6,width:360}} />
              <button className="button" onClick={() => undefined}>検索</button>
            </div>
          </div>

          <div style={{display:'flex',gap:20,justifyContent:'center',marginTop:18}}>
            <div style={{width:'100%',maxWidth:960}}>
              {(() => {
                if(filtered.length === 0) return <div style={{textAlign:'center',color:'#666'}}>該当する報告書がありません</div>

                const byPref: Record<string, typeof filtered> = {}
                filtered.forEach(it => {
                  const key = it.region || 'その他'
                  byPref[key] = byPref[key] || []
                  byPref[key].push(it)
                })

                const prefOrder = allPrefectures.concat(Object.keys(byPref).filter(k => !allPrefectures.includes(k)))

                return prefOrder.filter(p => byPref[p] && byPref[p].length > 0).map(pref => (
                  <div key={pref} style={{borderTop:'1px solid #eee',padding:'18px 0'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{fontSize:18,fontWeight:700}}>{formatPrefecture(pref)}</div>
                        <div style={{background:'#f0f0f0',padding:'4px 8px',borderRadius:6,color:'#666'}}>{byPref[pref].length}</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
                      {byPref[pref].map(r => (
                        <div key={r.id} style={{padding:'16px 18px',borderRadius:10,background:'#fafafa',border:'1px solid #ececec',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                          <div style={{flex:1}}>
                            <div style={{display:'grid',gap:10}}>
                              <div>
                                <div style={{fontSize:12,color:'#7a7a7a',marginBottom:4}}>{primaryLabel}</div>
                                <div style={{fontWeight:700,fontSize:16,lineHeight:1.5}}>{r.company}</div>
                              </div>
                              {r.subCompany ? (
                                <div>
                                  <div style={{fontSize:12,color:'#7a7a7a',marginBottom:4}}>{secondaryLabel}</div>
                                  <div style={{fontWeight:600,lineHeight:1.5}}>{r.subCompany}</div>
                                </div>
                              ) : null}
                              <div style={{display:'flex',gap:12,flexWrap:'wrap',color:'#666',fontSize:13}}>
                                <span>{r.date}</span>
                                <span>{r.major === 'shinkyu' ? '鍼灸師学科' : '柔道整復師学科'}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{color:'#bbb',fontSize:20,lineHeight:1}}>›</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}