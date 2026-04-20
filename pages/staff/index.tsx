import Link from 'next/link'

export default function StaffIndex(){
  // mock upload handler
  const upload = async (e:any) =>{
    e.preventDefault()
    alert('アップロード（モック）')
  }

  return (
    <div>
      <div className="student-top">
        <div className="header">
          <h2>STAFF PAGE</h2>
          <Link href="/" className="button logout">トップへ</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>REPORTS</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>学生ページと同様に、見学報告書と面接報告書を確認できます。</p>

            <div className="report-grid">
              <Link href="/staff/reports?type=visit" className="report-card">
                <div className="card-row">
                  <div className="card-icon accent-1">
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/><path d="M9 11h6"/></g></svg>
                  </div>
                  <div>
                    <h4>見学報告書</h4>
                    <p>治療院の雰囲気や見学時の感想を、職員ページからも確認できます。</p>
                  </div>
                </div>
              </Link>

              <Link href="/staff/reports?type=interview" className="report-card">
                <div className="card-row">
                  <div className="card-icon accent-2">
                    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="2.2"/><path d="M6 20c1.5-2 4-3 6-3s4.5 1 6 3"/><path d="M17 11h4v4"/></g></svg>
                  </div>
                  <div>
                    <h4>面接報告書</h4>
                    <p>面接や試験内容に関する報告書を、学生ページと同じ見た目で確認できます。</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="panel">
            <h3 style={{textAlign:'center',fontSize:22}}>データアップロード</h3>
            <p style={{color:'#666',marginTop:8,textAlign:'center',maxWidth:680,marginLeft:'auto',marginRight:'auto'}}>職員向けの報告書データ取り込み機能です。現在はモック動作です。</p>

            <form onSubmit={upload} style={{maxWidth:560,margin:'18px auto 0'}}>
              <input type="file" />
              <div style={{marginTop:12,textAlign:'center'}}><button className="button">アップロード</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
