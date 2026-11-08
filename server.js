const http = require('node:http');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { readFile } = require('node:fs/promises');
const { Pool } = require('pg');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_BYTES = 16 * 1024;
const PAGE_SIZE_DEFAULT = 24;
const PAGE_SIZE_MAX = 100;
const niches = new Set(['Beauty', 'Food', 'Fitness', 'Lifestyle', 'Travel', 'Fashion', 'Tech', 'Gaming', 'Wellness', 'Education']);
const styles = new Set(['Cinematic', 'Educational', 'Funny & casual', 'Storytelling', 'Minimalist', 'High-energy', 'Behind the scenes', 'Reviews & unboxings']);
const audiences = {
  nano: [1000, 9999],
  micro: [10000, 49999],
  mid: [50000, 249999],
  large: [250000, 10000000]
};
const platformSlugs = new Set(['instagram', 'youtube', 'tiktok', 'twitch', 'podcast', 'linkedin']);
const staticFiles = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/api-client.js': ['api-client.js', 'text/javascript; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8']
};
const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.PGSSLMODE === 'require' ? {
    rejectUnauthorized: true,
    ...(process.env.PGSSLROOTCERT ? { ca: readFileSync(process.env.PGSSLROOTCERT, 'utf8') } : {})
  } : undefined
});

pool.on('error', error => console.error('Unexpected PostgreSQL pool error:', error));

function sendJson(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(value));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body is too large.'), { status: 413 }));
        return;
      }
      if (size === 0) {
        reject(Object.assign(new Error('A JSON request body is required.'), { status: 400 }));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Request body must contain valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function applyRateLimit(request, response) {
  const now = Date.now();
  const key = request.socket.remoteAddress || 'unknown';
  const current = rateLimits.get(key);
  if (!current || current.expiresAt <= now) {
    if (rateLimits.size >= 10000) {
      for (const [address, entry] of rateLimits) {
        if (entry.expiresAt <= now) rateLimits.delete(address);
      }
      if (rateLimits.size >= 10000) {
        sendJson(response, 429, { error: 'The service is busy. Please try again later.' });
        return true;
      }
    }
    rateLimits.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    response.setHeader('Retry-After', String(Math.ceil((current.expiresAt - now) / 1000)));
    sendJson(response, 429, { error: 'Too many requests. Please try again later.' });
    return true;
  }
  current.count += 1;
  return false;
}

function validateCreator(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'A creator profile must be a JSON object.' };
  }
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const handleInput = typeof body.handle === 'string' ? body.handle.trim() : '';
  const handle = handleInput.startsWith('@') ? handleInput : `@${handleInput}`;
  const niche = body.niche;
  const audience = body.audience;
  const style = body.style;
  const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
  const platforms = Array.isArray(body.platforms) ? [...new Set(body.platforms)] : [];

  if (!name || name.length > 40) return { error: 'Name must be between 1 and 40 characters.' };
  if (!/^@[A-Za-z0-9._]{2,40}$/.test(handle)) return { error: 'Enter a valid creator handle.' };
  if (!niches.has(niche)) return { error: 'Choose a supported creator niche.' };
  if (!Object.hasOwn(audiences, audience)) return { error: 'Choose a supported audience range.' };
  if (!styles.has(style)) return { error: 'Choose a supported content style.' };
  if (!bio || bio.length > 140) return { error: 'Your introduction must be between 1 and 140 characters.' };
  if (platforms.length === 0 || platforms.some(platform => typeof platform !== 'string' || !platformSlugs.has(platform.toLowerCase()))) {
    return { error: 'Select at least one supported platform.' };
  }

  const [minFollowers, maxFollowers] = audiences[audience];
  return {
    creator: {
      name, handle, niche, audience, followers: Math.round((minFollowers + maxFollowers) / 2),
      style, bio, platforms: platforms.map(platform => platform.toLowerCase())
    }
  };
}

function addFilter(filters, values, expression, value) {
  values.push(value);
  filters.push(expression.replace('?', `$${values.length}`));
}

async function getCreators(url) {
  const limitValue = Number(url.searchParams.get('limit') || PAGE_SIZE_DEFAULT);
  const offsetValue = Number(url.searchParams.get('offset') || 0);
  const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, PAGE_SIZE_MAX) : PAGE_SIZE_DEFAULT;
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? Math.min(offsetValue, 1000000000) : 0;
  const filters = [];
  const values = [];
  const platform = url.searchParams.get('platform');
  const niche = url.searchParams.get('niche');
  const audience = url.searchParams.get('audience');
  const style = url.searchParams.get('style');
  const search = (url.searchParams.get('search') || '').trim().slice(0, 100);

  if (platform) {
    if (!platformSlugs.has(platform.toLowerCase())) return { status: 400, body: { error: 'Unsupported platform filter.' } };
    addFilter(filters, values, 'EXISTS (SELECT 1 FROM creator_platforms fp WHERE fp.creator_id = c.id AND fp.platform_slug = ?)', platform.toLowerCase());
  }
  if (niche) {
    if (!niches.has(niche)) return { status: 400, body: { error: 'Unsupported niche filter.' } };
    addFilter(filters, values, 'c.niche = ?', niche);
  }
  if (audience) {
    if (!Object.hasOwn(audiences, audience)) return { status: 400, body: { error: 'Unsupported audience filter.' } };
    addFilter(filters, values, 'c.audience_size = ?', audience);
  }
  if (style) {
    if (!styles.has(style)) return { status: 400, body: { error: 'Unsupported content style filter.' } };
    addFilter(filters, values, 'c.content_style = ?', style);
  }
  if (search) {
    values.push(`%${search}%`);
    const parameter = `$${values.length}`;
    filters.push(`(c.name || ' ' || c.handle || ' ' || c.niche || ' ' || c.content_style || ' ' || c.bio) ILIKE ${parameter}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const totalResult = await pool.query(
    `SELECT COUNT(*)::INTEGER AS total FROM creators c ${where}`,
    values
  );
  const pageValues = [...values, limit, offset];
  const creatorsResult = await pool.query(
    `SELECT c.id, c.name, c.handle, c.niche, c.audience_size AS audience,
            c.followers, c.content_style AS style, c.bio,
            COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), ARRAY[]::TEXT[]) AS platforms
       FROM creators c
       LEFT JOIN creator_platforms cp ON cp.creator_id = c.id
       LEFT JOIN platforms p ON p.slug = cp.platform_slug AND p.is_active = TRUE
       ${where}
      GROUP BY c.id
      ORDER BY c.created_at DESC, c.id
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    pageValues
  );
  return { status: 200, body: { creators: creatorsResult.rows, total: totalResult.rows[0].total, limit, offset } };
}

async function createCreator(body) {
  const validation = validateCreator(body);
  if (validation.error) return { status: 400, body: { error: validation.error } };
  const creator = validation.creator;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO creators (name, handle, niche, audience_size, followers, content_style, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, handle, niche, audience_size AS audience, followers,
                 content_style AS style, bio, created_at`,
      [creator.name, creator.handle, creator.niche, creator.audience, creator.followers, creator.style, creator.bio]
    );
    const savedCreator = result.rows[0];
    for (const platform of creator.platforms) {
      await client.query(
        'INSERT INTO creator_platforms (creator_id, platform_slug) VALUES ($1, $2)',
        [savedCreator.id, platform]
      );
    }
    await client.query('COMMIT');
    return { status: 201, body: { creator: { ...savedCreator, platforms: creator.platforms.map(slug => ({
      instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', twitch: 'Twitch', podcast: 'Podcast', linkedin: 'LinkedIn'
    })[slug]) } } };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return { status: 409, body: { error: 'That creator handle is already registered.' } };
    if (error.code === '23503') return { status: 400, body: { error: 'One or more selected platforms are unavailable.' } };
    throw error;
  } finally {
    client.release();
  }
}

async function recordIntroduction(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { status: 400, body: { error: 'An introduction request must be a JSON object.' } };
  }
  const recipientId = typeof body.recipientCreatorId === 'string' ? body.recipientCreatorId : '';
  const requestKey = typeof body.requestKey === 'string' ? body.requestKey : '';
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(recipientId) || !uuidPattern.test(requestKey)) {
    return { status: 400, body: { error: 'A valid recipient and request ID are required.' } };
  }
  const result = await pool.query(
    `INSERT INTO collaboration_introductions (recipient_creator_id, request_key)
     VALUES ($1, $2)
     ON CONFLICT (request_key) DO NOTHING
     RETURNING id`,
    [recipientId, requestKey]
  );
  if (result.rowCount === 0) {
    const existing = await pool.query('SELECT id FROM collaboration_introductions WHERE request_key = $1', [requestKey]);
    return { status: 200, body: { recorded: true, id: existing.rows[0].id, duplicate: true } };
  }
  return { status: 201, body: { recorded: true, id: result.rows[0].id, duplicate: false } };
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    await pool.query('SELECT 1');
    sendJson(response, 200, { status: 'ok' });
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/stats') {
    const result = await pool.query(
      `SELECT community_stats.creator_count AS creators,
              community_stats.introduction_count AS introductions,
              (SELECT COUNT(*) FROM platforms WHERE is_active = TRUE)::INTEGER AS platforms,
              COALESCE((
                SELECT json_object_agg(p.slug, p.creator_count)
                  FROM platforms p
                 WHERE p.is_active = TRUE
              ), '{}'::JSON) AS platform_totals
         FROM community_stats
        WHERE id = 1`
    );
    sendJson(response, 200, result.rows[0]);
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/creators') {
    const result = await getCreators(url);
    sendJson(response, result.status, result.body);
    return;
  }
  if (request.method === 'POST' && (url.pathname === '/api/creators' || url.pathname === '/api/collaborations')) {
    if (applyRateLimit(request, response)) return;
    if (!request.headers['content-type']?.toLowerCase().includes('application/json')) {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' });
      return;
    }
    const body = await readJsonBody(request);
    const result = url.pathname === '/api/creators' ? await createCreator(body) : await recordIntroduction(body);
    sendJson(response, result.status, result.body);
    return;
  }
  sendJson(response, 404, { error: 'API route not found.' });
}

async function serveStatic(url, response) {
  const file = staticFiles[url.pathname];
  if (!file) return false;
  try {
    const content = await readFile(path.join(ROOT, file[0]));
    response.writeHead(200, {
      'Content-Type': file[1],
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    response.end(content);
  } catch (error) {
    console.error('Could not serve the application file:', error);
    response.writeHead(500);
    response.end('Could not load the application.');
  }
  return true;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }
    if (!await serveStatic(url, response)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found.');
    }
  } catch (error) {
    if (response.headersSent || response.destroyed) return;
    if (error.status) {
      sendJson(response, error.status, { error: error.message });
      return;
    }
    if (error.code && error.code.startsWith('23')) {
      sendJson(response, 400, { error: 'The submitted data does not satisfy the database requirements.' });
      return;
    }
    console.error('Request failed:', error);
    sendJson(response, 503, { error: 'The Collabify service is temporarily unavailable.' });
  }
});

async function start() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Copy .env.example to .env and configure PostgreSQL.');
  const schema = await readFile(path.join(ROOT, 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  server.listen(PORT, () => console.log(`Collabify is running at http://localhost:${PORT}`));
}

async function shutdown(signal) {
  console.log(`${signal} received; closing Collabify.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

if (require.main === module) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  start().catch(async error => {
    console.error('Could not start Collabify:', error.message);
    await pool.end();
    process.exitCode = 1;
  });
}

module.exports = { validateCreator, audiences, niches, styles, platformSlugs };
