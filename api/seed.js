import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const used = new Set(['754', '839'])
  const pool = []

  function unique3() {
    let c
    do { c = String(randInt(100, 999)) } while (used.has(c))
    used.add(c)
    return c
  }

  // Your specific special codes
  pool.push({ code: '754', limit: 1,  used: 0, tier: 'ultra'   })
  pool.push({ code: '839', limit: 15, used: 0, tier: 'limited' })

  // 198 random codes excluding 754 and 839
  for (let i = 0; i < 198; i++) {
    pool.push({ code: unique3(), limit: 1, used: 0, tier: 'standard' })
  }

  // Shuffle so order is random
  pool.sort(() => Math.random() - 0.5)

  await redis.set('code_pool', pool)

  return res.status(200).json({ ok: true, total: pool.length, codes: pool })
}
