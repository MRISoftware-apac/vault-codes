import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const used = new Set()
  const pool = []

  function unique3() {
    let c
    do { c = String(randInt(100, 999)) } while (used.has(c))
    used.add(c)
    return c
  }

  pool.push({ code: unique3(), limit: 1,  used: 0, tier: 'ultra'   })
  pool.push({ code: unique3(), limit: 15, used: 0, tier: 'limited' })

  for (let i = 0; i < 18; i++) {
    pool.push({ code: unique3(), limit: randInt(100, 500), used: 0, tier: 'standard' })
  }

  pool.sort(() => Math.random() - 0.5)

  await redis.set('code_pool', pool)

  return res.status(200).json({ ok: true, total: pool.length, codes: pool })
}
