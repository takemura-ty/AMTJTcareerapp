export type JobHuntingTipKey = 'preparation' | 'interview'

export type JobHuntingTip = {
  key: JobHuntingTipKey
  title: string
  pdfUrl?: string
  fileName?: string
  updatedAt?: string
}

export const JOB_HUNTING_TIPS_STORAGE_KEY = 'amtjt_job_hunting_tips'

export const defaultJobHuntingTips: JobHuntingTip[] = [
  { key: 'preparation', title: '就職活動マニュアル～準備編～' },
  { key: 'interview', title: '就職活動マニュアル～面接編～' }
]

export function mergeJobHuntingTips(saved: Partial<JobHuntingTip>[] | null | undefined): JobHuntingTip[] {
  return defaultJobHuntingTips.map((tip) => {
    const match = saved?.find((item) => item.key === tip.key)
    return {
      ...tip,
      ...match
    }
  })
}