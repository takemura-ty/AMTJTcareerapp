export type Report = {
  id: string
  company: string
  subCompany?: string
  region: string
  city?: string
  type: 'visit' | 'interview'
  date: string
  major: 'shinkyu' | 'judo'
  updatedAt?: string
  supervisorImpression?: string
  staffImpression?: string
  clinicImpression?: string
  otherNotes?: string
  interviewWish?: string
  advice?: string
  interviewerCount?: string
  interviewer?: string
  examContents?: string
  questionsAsked?: string
  writtenPracticalExam?: string
  result?: string
  resultNotification?: string
}

export type Workshop = {
  id: string
  title: string
  date: string
  pdfUrl?: string
  fileName?: string
  updatedAt?: string
}

export const workshops: Workshop[] = []
