import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const OPEN_HOUR = 8
const CLOSE_HOUR = 13
const CLOSE_MINUTES = 30

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const now = new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Brisbane'
  })
  const nowDate = new Date(now)
  const totalMins = nowDate.getHours() * 60 + nowDate.getMinutes()
  const openMins = OPEN_HOUR * 60
  const closeMins = CLOSE_HOUR * 60 + CLOSE_MINUTES

  if (totalMins < openMins || totalMins >= closeMins) {
    return res.status(403).json({ error: 'outside_window' })
  }

  const pool = await redis.get('code_pool') || []
  const available = pool.find(c => c.used < c.limit)

  if (!available) {
    return res.status(410).json({ error: 'no_codes_available' })
  }

  available.used += 1
  await redis.set('code_pool', pool)

  return res.status(200).json({ code: available.code })
}
