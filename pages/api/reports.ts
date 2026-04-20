import type { NextApiRequest, NextApiResponse } from 'next'
import { getReports } from '../../lib/repositories'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const reports = await getReports()
  res.status(200).json(reports)
}
