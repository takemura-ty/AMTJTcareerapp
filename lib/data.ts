export type Report = {
  id: string
  company: string
  subCompany?: string
  region: string
  type: 'visit' | 'interview'
  date: string
  major: 'shinkyu' | 'judo'
}

export const reports: Report[] = [
  { id: 'r1', company: '田中治療院', subCompany: '田中グループ', region: '東京', type: 'visit', date: '2026-04-10', major: 'shinkyu' },
  { id: 'r2', company: '鈴木整骨院', region: '大阪', type: 'interview', date: '2026-03-28', major: 'judo' },
  { id: 'r3', company: 'みらい治療院', subCompany: 'みらいグループ', region: '東京', type: 'visit', date: '2026-04-20', major: 'judo' },
  { id: 'r4', company: 'さくら治療院', region: '北海道', type: 'interview', date: '2026-02-12', major: 'shinkyu' }
]

export type Workshop = {
  id: string
  title: string
  date: string
  pdfUrl?: string
  fileName?: string
  updatedAt?: string
}

export const workshops: Workshop[] = [
  { id: 'w1', title: '治療技術セミナー', date: '2026-05-10', pdfUrl: '/pdfs/seminar1.pdf' },
  { id: 'w2', title: '就職対策講座', date: '2026-03-15', pdfUrl: '/pdfs/seminar2.pdf' },
  { id: 'w3', title: '最新治療事例', date: '2026-06-01', pdfUrl: '/pdfs/seminar3.pdf' }
]
