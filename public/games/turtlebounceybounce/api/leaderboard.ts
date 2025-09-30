import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Environment variables used (Upstash x Vercel KV):
// KV_REST_API_URL, KV_REST_API_TOKEN

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Leaderboard API called, method:', req.method);
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env as any;
  
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.error('Missing env vars:', { 
      hasUrl: !!KV_REST_API_URL, 
      hasToken: !!KV_REST_API_TOKEN 
    });
    return res.status(500).json({ error: 'KV env vars missing' });
  }

  const redis = Redis.fromEnv();
  const key = 'bob-turtle-leaderboard';

  try {
    if (req.method === 'POST') {
      console.log('POST request body:', req.body);
      const { name, height } = req.body || {};
      console.log('Extracted name:', name, 'height:', height);
      
      if (!name || typeof height !== 'number') {
        console.error('Invalid payload - name:', name, 'height:', height, 'typeof height:', typeof height);
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const entry = { name, height, timestamp: Date.now() };
      console.log('Creating entry:', entry);
      
      try {
        const result = await redis.zadd(key, { score: height, member: JSON.stringify(entry) });
        console.log('Redis zadd result:', result);
        
        // Optionally trim to top 200 periodically (best-effort)
        try { 
          const trimResult = await redis.zremrangebyrank(key, 0, -201);
          console.log('Trim result:', trimResult);
        } catch (trimError) {
          console.error('Trim error (non-fatal):', trimError);
        }
        
        return res.status(200).json({ ok: true });
      } catch (redisError) {
        console.error('Redis POST error:', redisError);
        throw redisError;
      }
    }

    // GET top scores
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    console.log('Fetching leaderboard with limit:', limit);
    
    try {
      const arr = await redis.zrange(key, 0, limit - 1, { rev: true });
      console.log('Redis returned:', arr);
      
      const entries: any[] = [];
      for (const item of arr) {
        try { 
          const parsed = JSON.parse(item as string);
          entries.push(parsed);
          console.log('Parsed entry:', parsed);
        } catch (parseError) {
          console.error('Failed to parse entry:', item, parseError);
        }
      }
      console.log('Final entries:', entries);
      return res.status(200).json(entries);
    } catch (redisError) {
      console.error('Redis error:', redisError);
      throw redisError;
    }
    
    // If we get here, unsupported method
    console.error('Unsupported method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (e) {
    console.error('Leaderboard API error:', e);
    return res.status(500).json({ error: 'Server error', details: (e as Error).message });
  }
}


