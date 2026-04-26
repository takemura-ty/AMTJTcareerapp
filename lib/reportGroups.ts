import type { Report } from './data'

export const PREFECTURES = [
  '大阪', '兵庫', '奈良', '和歌山', '京都', '滋賀', '三重',
  '東京', '神奈川', '埼玉', '千葉', '茨城', '栃木', '群馬',
  '北海道',
  '青森', '岩手', '宮城', '秋田', '山形', '福島',
  '愛知', '岐阜', '静岡', '富山', '石川', '福井', '山梨', '長野', '新潟',
  '鳥取', '島根', '岡山', '広島', '山口',
  '徳島', '香川', '愛媛', '高知',
  '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'
]

export const CITY_SPLIT_PREFECTURES = new Set(['大阪', '兵庫'])

export function formatPrefecture(name: string) {
  if (name === '北海道') return name
  if (name === '東京') return '東京都'
  if (name === '大阪' || name === '京都') return `${name}府`
  return `${name}県`
}

export function formatMajor(major: Report['major']) {
  return major === 'shinkyu' ? '鍼灸師学科' : '柔道整復師学科'
}

export function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((left, right) => right.date.localeCompare(left.date))
}

export function getClinicUpdatedAt(reports: Report[]) {
  return reports
    .map(report => report.updatedAt || report.date)
    .sort((left, right) => right.localeCompare(left))[0]
}

export function getClinicKey(report: Pick<Report, 'region' | 'city' | 'company'>) {
  return `${report.region}::${report.city || ''}::${report.company}`
}

export function groupByClinic(reports: Report[]) {
  const groups = new Map<string, Report[]>()

  for (const report of sortByDateDesc(reports)) {
    const key = getClinicKey(report)
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

export type ClinicGroup = ReturnType<typeof groupByClinic>[number]