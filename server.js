const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { readFileSync } = require('node:fs');
const { readFile } = require('node:fs/promises');
const { Pool } = require('pg');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_BYTES = 3 * 1024 * 1024;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const PAGE_SIZE_DEFAULT = 24;
const PAGE_SIZE_MAX = 100;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = 'collabify_session';
const SCRYPT = promisify(crypto.scrypt);
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
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 15000);
let databaseReady = false;
let databaseInitialization = null;
let databaseRetryTimer = null;

function resolveSslConfig() {
  let mode = (process.env.PGSSLMODE || '').toLowerCase();
  if (!mode && process.env.DATABASE_URL) {
    try {
      mode = (new URL(process.env.DATABASE_URL).searchParams.get('sslmode') || '').toLowerCase();
    } catch {
      // An invalid connection string is reported by the pool when it connects.
    }
  }
  if (!mode || ['disable', 'allow', 'prefer'].includes(mode)) return undefined;
  const ca = process.env.PGSSLROOTCERT ? readFileSync(process.env.PGSSLROOTCERT, 'utf8') : undefined;
  return {
    rejectUnauthorized: mode === 'verify-ca' || mode === 'verify-full',
    ...(ca ? { ca } : {})
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: resolveSslConfig()
});

pool.on('error', error => {
  databaseLastError = error;
  console.error('Unexpected PostgreSQL pool error:', error);
});

function scheduleDatabaseRetry() {
  if (databaseRetryTimer) return;
  databaseRetryTimer = setTimeout(() => {
    databaseRetryTimer = null;
    initializeDatabase().catch(() => {});
  }, DB_RETRY_MS);
  databaseRetryTimer.unref();
}

async function initializeDatabase() {
  if (databaseReady) return true;
  if (databaseInitialization) return databaseInitialization;
  databaseInitialization = (async () => {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set. Add it in your hosting provider secrets or local .env file.');
      }
      const schema = await readFile(path.join(ROOT, 'db', 'schema.sql'), 'utf8');
      await pool.query(schema);
      databaseReady = true;
      databaseLastError = null;
      console.log('PostgreSQL schema is ready.');
      return true;
    } catch (error) {
      databaseLastError = error;
      console.error(`PostgreSQL is unavailable (${error.message}). Serving the app UI and retrying every ${DB_RETRY_MS / 1000}s.`);
      scheduleDatabaseRetry();
      return false;
    } finally {
      databaseInitialization = null;
    }
  })();
  return databaseInitialization;
}

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

function clientAddress(request) {
  const forwarded = request.headers['fly-client-ip'] || request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return request.socket.remoteAddress || 'unknown';
}

function applyRateLimit(request, response) {
  const now = Date.now();
  const key = clientAddress(request);
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

function validateProfileLinks(links) {
  if (links === undefined) return { links: [] };
  if (!Array.isArray(links) || links.length > 10) {
    return { error: 'Add no more than 10 profile links.' };
  }
  const normalized = [];
  for (const link of links) {
    if (!link || typeof link !== 'object' || Array.isArray(link)) {
      return { error: 'Each profile link needs a label and a valid URL.' };
    }
    const label = typeof link.label === 'string' ? link.label.trim() : '';
    const value = typeof link.url === 'string' ? link.url.trim() : '';
    if (!label && !value) continue;
    if (!label || label.length > 30 || value.length > 500) {
      return { error: 'Each profile link needs a label (up to 30 characters) and a valid URL.' };
    }
    let url;
    try {
      url = new URL(value);
    } catch {
      return { error: `Enter a valid URL for ${label}.` };
    }
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
      return { error: `Enter a valid http or https URL for ${label}.` };
    }
    normalized.push({ label, url: url.toString() });
  }
  return { links: normalized };
}

function validateAvatar(dataUrl) {
  if (dataUrl === undefined) return { provided: false };
  if (dataUrl === null || dataUrl === '') return { provided: true, image: null, mimeType: null };
  if (typeof dataUrl !== 'string') return { error: 'Choose a JPEG, PNG, or WebP profile image.' };
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/);
  if (!match) return { error: 'Choose a JPEG, PNG, or WebP profile image.' };
  const image = Buffer.from(match[2], 'base64');
  if (!image.length || image.length > MAX_AVATAR_BYTES || image.toString('base64') !== match[2]) {
    return { error: 'Profile images must be smaller than 2 MB.' };
  }
  const mimeType = match[1];
  const isPng = mimeType === 'image/png'
    && image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = mimeType === 'image/jpeg'
    && image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  const isWebp = mimeType === 'image/webp'
    && image.length >= 12 && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
  if (!isPng && !isJpeg && !isWebp) {
    return { error: 'The selected file is not a valid JPEG, PNG, or WebP image.' };
  }
  return { provided: true, image, mimeType };
}

function validateAccount(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'An account and creator profile are required.' };
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: 'Enter a valid email address.' };
  }
  if (password.length < 12 || password.length > 128) {
    return { error: 'Password must be between 12 and 128 characters.' };
  }
  return { email, password };
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await SCRYPT(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

async function verifyPassword(password, encoded) {
  const [algorithm, saltValue, hashValue] = encoded.split('$');
  if (algorithm !== 'scrypt' || !saltValue || !hashValue) return false;
  const expected = Buffer.from(hashValue, 'base64url');
  const actual = await SCRYPT(password, Buffer.from(saltValue, 'base64url'), expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getSessionToken(request) {
  const cookies = request.headers.cookie || '';
  const value = cookies.split(';').map(cookie => cookie.trim()).find(cookie => cookie.startsWith(`${SESSION_COOKIE}=`));
  return value ? value.slice(SESSION_COOKIE.length + 1) : '';
}

function setSessionCookie(response, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

async function getAuthenticatedCreator(request) {
  const token = getSessionToken(request);
  if (!token) return null;
  const result = await pool.query(
    `SELECT a.id AS account_id, a.email, c.id, c.name, c.handle, c.niche,
            c.audience_size AS audience, c.followers, c.content_style AS style, c.bio,
            c.profile_links AS "profileLinks",
            (c.avatar_image IS NOT NULL) AS "hasAvatar",
            TRUE AS messageable,
            COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), ARRAY[]::TEXT[]) AS platforms
       FROM account_sessions s
       JOIN creator_accounts a ON a.id = s.account_id
       JOIN creators c ON c.account_id = a.id
       LEFT JOIN creator_platforms cp ON cp.creator_id = c.id
       LEFT JOIN platforms p ON p.slug = cp.platform_slug AND p.is_active = TRUE
      WHERE s.token_hash = $1 AND s.expires_at > NOW()
      GROUP BY a.id, c.id`,
    [hashSessionToken(token)]
  );
  return result.rows[0] || null;
}

async function createSession(accountId, response) {
  const token = crypto.randomBytes(32).toString('base64url');
  await pool.query('DELETE FROM account_sessions WHERE expires_at <= NOW()');
  await pool.query(
    'INSERT INTO account_sessions (token_hash, account_id, expires_at) VALUES ($1, $2, NOW() + $3::INTERVAL)',
    [hashSessionToken(token), accountId, `${SESSION_TTL_MS} milliseconds`]
  );
  setSessionCookie(response, token);
}

async function registerAccount(body, response) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { status: 400, body: { error: 'An account and creator profile are required.' } };
  }
  const account = validateAccount(body);
  if (account.error) return { status: 400, body: { error: account.error } };
  const validation = validateCreator(body);
  if (validation.error) return { status: 400, body: { error: validation.error } };
  validation.links = validateProfileLinks(body.profileLinks);
  if (validation.links.error) return { status: 400, body: { error: validation.links.error } };
  const passwordHash = await hashPassword(account.password);
  const creator = validation.creator;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const accountResult = await client.query(
      'INSERT INTO creator_accounts (email, password_hash) VALUES ($1, $2) RETURNING id',
      [account.email, passwordHash]
    );
    const accountId = accountResult.rows[0].id;
    const creatorResult = await client.query(
      `INSERT INTO creators (name, handle, niche, audience_size, followers, content_style, bio, account_id, profile_links)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, handle, niche, audience_size AS audience, followers,
                 content_style AS style, bio, profile_links AS "profileLinks", created_at`,
      [creator.name, creator.handle, creator.niche, creator.audience, creator.followers, creator.style, creator.bio, accountId, JSON.stringify(validation.links?.links || [])]
    );
    const savedCreator = creatorResult.rows[0];
    await client.query('UPDATE creator_accounts SET creator_id = $1 WHERE id = $2', [savedCreator.id, accountId]);
    for (const platform of creator.platforms) {
      await client.query(
        'INSERT INTO creator_platforms (creator_id, platform_slug) VALUES ($1, $2)',
        [savedCreator.id, platform]
      );
    }
    await client.query('COMMIT');
    await createSession(accountId, response);
    return { status: 201, body: { creator: {
      ...savedCreator,
      email: account.email,
      messageable: true,
      profileLinks: validation.links.links,
      avatarUrl: '',
      platforms: creator.platforms.map(slug => ({
        instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', twitch: 'Twitch', podcast: 'Podcast', linkedin: 'LinkedIn'
      })[slug])
    } } };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505' && error.constraint?.includes('email')) {
      return { status: 409, body: { error: 'An account with that email already exists.' } };
    }
    if (error.code === '23505') return { status: 409, body: { error: 'That creator handle is already registered.' } };
    if (error.code === '23503') return { status: 400, body: { error: 'One or more selected platforms are unavailable.' } };
    throw error;
  } finally {
    client.release();
  }
}

async function signIn(body, response) {
  const email = body && typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body && typeof body.password === 'string' ? body.password : '';
  if (!email || !password || password.length > 128) return { status: 400, body: { error: 'Enter your email and password.' } };
  const result = await pool.query(
    'SELECT id, password_hash FROM creator_accounts WHERE email = $1',
    [email]
  );
  if (!result.rows[0] || !await verifyPassword(password, result.rows[0].password_hash)) {
    return { status: 401, body: { error: 'Email or password is incorrect.' } };
  }
  await createSession(result.rows[0].id, response);
  const creator = await pool.query(
    `SELECT c.id, c.name, c.handle, c.niche, c.audience_size AS audience,
            c.followers, c.content_style AS style, c.bio, a.email,
            c.profile_links AS "profileLinks",
            (c.avatar_image IS NOT NULL) AS "hasAvatar",
            TRUE AS messageable,
            COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), ARRAY[]::TEXT[]) AS platforms
       FROM creators c
       JOIN creator_accounts a ON a.id = c.account_id
       LEFT JOIN creator_platforms cp ON cp.creator_id = c.id
       LEFT JOIN platforms p ON p.slug = cp.platform_slug AND p.is_active = TRUE
      WHERE a.id = $1
      GROUP BY c.id, a.email`,
    [result.rows[0].id]
  );
  return { status: 200, body: { creator: creator.rows[0] } };
}

async function updateCreatorProfile(creator, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { status: 400, body: { error: 'A creator profile must be a JSON object.' } };
  }
  const platforms = Array.isArray(body?.platforms) && body.platforms.length
    ? body.platforms
    : (creator.platforms || []).map(platform => platform.toLowerCase());
  const validation = validateCreator({ ...body, platforms });
  if (validation.error) return { status: 400, body: { error: validation.error } };
  const links = validateProfileLinks(body.profileLinks);
  if (links.error) return { status: 400, body: { error: links.error } };
  const avatar = validateAvatar(body.avatarDataUrl);
  if (avatar.error) return { status: 400, body: { error: avatar.error } };
  const profile = validation.creator;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await client.query(
      `UPDATE creators
          SET name = $1, handle = $2, niche = $3, audience_size = $4,
              followers = $5, content_style = $6, bio = $7, profile_links = $8::jsonb,
              avatar_image = CASE WHEN $9 THEN $10::bytea ELSE avatar_image END,
              avatar_mime_type = CASE WHEN $9 THEN $11::text ELSE avatar_mime_type END
        WHERE id = $12
        RETURNING id, name, handle, niche, audience_size AS audience, followers,
                  content_style AS style, bio, profile_links AS "profileLinks",
                  (avatar_image IS NOT NULL) AS "hasAvatar"`,
      [profile.name, profile.handle, profile.niche, profile.audience, profile.followers, profile.style,
        profile.bio, JSON.stringify(links.links), avatar.provided, avatar.image, avatar.mimeType, creator.id]
    );
    if (!updated.rowCount) {
      await client.query('ROLLBACK');
      return { status: 404, body: { error: 'Your creator profile could not be found.' } };
    }
    await client.query('DELETE FROM creator_platforms WHERE creator_id = $1', [creator.id]);
    for (const platform of profile.platforms) {
      await client.query('INSERT INTO creator_platforms (creator_id, platform_slug) VALUES ($1, $2)', [creator.id, platform]);
    }
    await client.query('COMMIT');
    return { status: 200, body: { creator: {
      ...updated.rows[0],
      account_id: creator.account_id,
      email: creator.email,
      messageable: true,
      avatarUrl: updated.rows[0].hasAvatar ? `/api/creators/${creator.id}/avatar` : '',
      platforms: profile.platforms.map(slug => ({
        instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', twitch: 'Twitch', podcast: 'Podcast', linkedin: 'LinkedIn'
      })[slug])
    } } };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return { status: 409, body: { error: 'That creator handle is already in use.' } };
    if (error.code === '23503') return { status: 400, body: { error: 'One or more selected platforms are unavailable.' } };
    throw error;
  } finally {
    client.release();
  }
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
            c.profile_links AS "profileLinks",
            (c.avatar_image IS NOT NULL) AS "hasAvatar",
            (c.account_id IS NOT NULL) AS messageable,
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

async function recordIntroduction(body, creator) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { status: 400, body: { error: 'An introduction request must be a JSON object.' } };
  }
  const recipientId = typeof body.recipientCreatorId === 'string' ? body.recipientCreatorId : '';
  const requestKey = typeof body.requestKey === 'string' ? body.requestKey : '';
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(recipientId) || !uuidPattern.test(requestKey)) {
    return { status: 400, body: { error: 'A valid recipient and request ID are required.' } };
  }
  if (recipientId === creator.id) return { status: 400, body: { error: 'You cannot record an introduction to yourself.' } };
  const result = await pool.query(
    `INSERT INTO collaboration_introductions (sender_creator_id, recipient_creator_id, request_key)
     SELECT $1, c.id, $3 FROM creators c WHERE c.id = $2 AND c.account_id IS NOT NULL
     ON CONFLICT (request_key) DO NOTHING
     RETURNING id`,
    [creator.id, recipientId, requestKey]
  );
  if (result.rowCount === 0) {
    const recipient = await pool.query('SELECT 1 FROM creators WHERE id = $1 AND account_id IS NOT NULL', [recipientId]);
    if (!recipient.rowCount) return { status: 404, body: { error: 'Creator not found.' } };
    const existing = await pool.query('SELECT id FROM collaboration_introductions WHERE request_key = $1', [requestKey]);
    return { status: 200, body: { recorded: true, id: existing.rows[0].id, duplicate: true } };
  }
  return { status: 201, body: { recorded: true, id: result.rows[0].id, duplicate: false } };
}

function validUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getSavedCreators(creator) {
  const result = await pool.query(
    `SELECT c.id, c.name, c.handle, c.niche, c.audience_size AS audience,
            c.followers, c.content_style AS style, c.bio,
            c.profile_links AS "profileLinks",
            (c.avatar_image IS NOT NULL) AS "hasAvatar",
            (c.account_id IS NOT NULL) AS messageable,
            COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), ARRAY[]::TEXT[]) AS platforms
       FROM saved_creators s
       JOIN creators c ON c.id = s.creator_id
       LEFT JOIN creator_platforms cp ON cp.creator_id = c.id
       LEFT JOIN platforms p ON p.slug = cp.platform_slug AND p.is_active = TRUE
      WHERE s.account_id = $1
      GROUP BY c.id
      ORDER BY MAX(s.created_at) DESC`,
    [creator.account_id]
  );
  return { status: 200, body: { creators: result.rows } };
}

async function saveCreator(creator, creatorId) {
  if (!validUuid(creatorId)) return { status: 400, body: { error: 'A valid creator ID is required.' } };
  if (creator.id === creatorId) return { status: 400, body: { error: 'You cannot save your own profile.' } };
  const result = await pool.query(
    `INSERT INTO saved_creators (account_id, creator_id)
     SELECT $1, c.id FROM creators c WHERE c.id = $2
     ON CONFLICT (account_id, creator_id) DO NOTHING
     RETURNING creator_id`,
    [creator.account_id, creatorId]
  );
  if (!result.rowCount) {
    const exists = await pool.query('SELECT 1 FROM creators WHERE id = $1', [creatorId]);
    if (!exists.rowCount) return { status: 404, body: { error: 'Creator not found.' } };
  }
  return { status: 200, body: { saved: true, creatorId } };
}

async function unsaveCreator(creator, creatorId) {
  if (!validUuid(creatorId)) return { status: 400, body: { error: 'A valid creator ID is required.' } };
  await pool.query('DELETE FROM saved_creators WHERE account_id = $1 AND creator_id = $2', [creator.account_id, creatorId]);
  return { status: 200, body: { saved: false, creatorId } };
}

async function getConversations(creator) {
  const result = await pool.query(
    `SELECT cv.id, other.id AS creator_id, other.name, other.handle, other.niche,
            latest.body AS last_message, latest.created_at AS last_message_at,
            COALESCE(unread.total, 0)::INTEGER AS unread_count
       FROM conversations cv
       JOIN creators other ON other.id = CASE WHEN cv.creator_a_id = $1 THEN cv.creator_b_id ELSE cv.creator_a_id END
       LEFT JOIN LATERAL (
         SELECT body, created_at FROM conversation_messages
          WHERE conversation_id = cv.id ORDER BY created_at DESC, id DESC LIMIT 1
       ) latest ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS total FROM conversation_messages
          WHERE conversation_id = cv.id AND sender_creator_id <> $1 AND read_at IS NULL
       ) unread ON TRUE
      WHERE cv.creator_a_id = $1 OR cv.creator_b_id = $1
      ORDER BY COALESCE(latest.created_at, cv.updated_at) DESC`,
    [creator.id]
  );
  return { status: 200, body: { conversations: result.rows } };
}

async function startConversation(creator, body) {
  const recipientId = body && body.recipientCreatorId;
  const message = body && typeof body.message === 'string' ? body.message.trim() : '';
  if (!validUuid(recipientId) || !message || message.length > 2000) {
    return { status: 400, body: { error: 'Choose a creator and enter a message of 1–2000 characters.' } };
  }
  if (recipientId === creator.id) return { status: 400, body: { error: 'You cannot message your own profile.' } };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const recipient = await client.query(
      'SELECT id FROM creators WHERE id = $1 AND account_id IS NOT NULL',
      [recipientId]
    );
    if (!recipient.rowCount) {
      await client.query('ROLLBACK');
      return { status: 404, body: { error: 'That creator does not have an active Collabify account.' } };
    }
    const conversation = await client.query(
      `INSERT INTO conversations (creator_a_id, creator_b_id)
       VALUES (LEAST($1::uuid, $2::uuid), GREATEST($1::uuid, $2::uuid))
       ON CONFLICT (creator_a_id, creator_b_id)
       DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [creator.id, recipientId]
    );
    const conversationId = conversation.rows[0].id;
    await client.query(
      'INSERT INTO conversation_messages (conversation_id, sender_creator_id, body) VALUES ($1, $2, $3)',
      [conversationId, creator.id, message]
    );
    await client.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
    await client.query('COMMIT');
    return { status: 201, body: { conversationId } };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getConversationMessages(creator, conversationId) {
  if (!validUuid(conversationId)) return { status: 400, body: { error: 'A valid conversation ID is required.' } };
  const membership = await pool.query(
    `SELECT id FROM conversations
      WHERE id = $1 AND (creator_a_id = $2 OR creator_b_id = $2)`,
    [conversationId, creator.id]
  );
  if (!membership.rowCount) return { status: 404, body: { error: 'Conversation not found.' } };
  const messages = await pool.query(
    `SELECT id, sender_creator_id AS "senderCreatorId", body, created_at AS "createdAt"
       FROM (
         SELECT id, sender_creator_id, body, created_at
           FROM conversation_messages WHERE conversation_id = $1
           ORDER BY created_at DESC, id DESC LIMIT 100
       ) recent
      ORDER BY created_at, id`,
    [conversationId]
  );
  await pool.query(
    'UPDATE conversation_messages SET read_at = NOW() WHERE conversation_id = $1 AND sender_creator_id <> $2 AND read_at IS NULL',
    [conversationId, creator.id]
  );
  return { status: 200, body: { messages: messages.rows } };
}

async function sendConversationMessage(creator, conversationId, body) {
  const message = body && typeof body.message === 'string' ? body.message.trim() : '';
  if (!validUuid(conversationId) || !message || message.length > 2000) {
    return { status: 400, body: { error: 'Enter a message of 1–2000 characters.' } };
  }
  const result = await pool.query(
    `INSERT INTO conversation_messages (conversation_id, sender_creator_id, body)
     SELECT cv.id, $2, $3 FROM conversations cv
      WHERE cv.id = $1 AND (cv.creator_a_id = $2 OR cv.creator_b_id = $2)
     RETURNING id, sender_creator_id AS "senderCreatorId", body, created_at AS "createdAt"`,
    [conversationId, creator.id, message]
  );
  if (!result.rowCount) return { status: 404, body: { error: 'Conversation not found.' } };
  await pool.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
  return { status: 201, body: { message: result.rows[0] } };
}

async function serveCreatorAvatar(url, response) {
  const match = url.pathname.match(/^\/api\/creators\/([^/]+)\/avatar$/);
  if (!match || !validUuid(match[1])) return false;
  const result = await pool.query(
    'SELECT avatar_image, avatar_mime_type FROM creators WHERE id = $1 AND avatar_image IS NOT NULL',
    [match[1]]
  );
  if (!result.rowCount) {
    response.writeHead(404, { 'Cache-Control': 'no-store' });
    response.end();
    return true;
  }
  response.writeHead(200, {
    'Content-Type': result.rows[0].avatar_mime_type,
    'Content-Length': result.rows[0].avatar_image.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(result.rows[0].avatar_image);
  return true;
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, {
      status: databaseReady ? 'ok' : 'degraded',
      database: databaseReady ? 'ready' : 'unavailable'
    });
    return;
  }
  if (!databaseReady) {
    response.setHeader('Retry-After', String(Math.max(1, Math.round(DB_RETRY_MS / 1000))));
    sendJson(response, 503, {
      error: 'Collabify is still connecting to its database. The app will be ready shortly; please retry in a few seconds.',
      database: 'unavailable'
    });
    return;
  }
  if (request.method === 'GET' && url.pathname.startsWith('/api/creators/') && url.pathname.endsWith('/avatar')) {
    if (await serveCreatorAvatar(url, response)) return;
  }
  if (request.method === 'POST' && ['/api/auth/register', '/api/auth/login'].includes(url.pathname)) {
    if (applyRateLimit(request, response)) return;
    if (!request.headers['content-type']?.toLowerCase().includes('application/json')) {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' });
      return;
    }
    const body = await readJsonBody(request);
    const result = url.pathname.endsWith('/register')
      ? await registerAccount(body, response)
      : await signIn(body, response);
    sendJson(response, result.status, result.body);
    return;
  }
  if (url.pathname === '/api/profile' && (request.method === 'GET' || request.method === 'PUT')) {
    const creator = await getAuthenticatedCreator(request);
    if (!creator) {
      sendJson(response, 401, { error: 'Sign in to view or edit your creator profile.' });
      return;
    }
    if (request.method === 'GET') {
      const { account_id, ...profile } = creator;
      sendJson(response, 200, { creator: profile });
      return;
    }
    if (applyRateLimit(request, response)) return;
    if (!request.headers['content-type']?.toLowerCase().includes('application/json')) {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' });
      return;
    }
    const body = await readJsonBody(request);
    const result = await updateCreatorProfile(creator, body);
    sendJson(response, result.status, result.body);
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/auth/me') {
    const creator = await getAuthenticatedCreator(request);
    if (!creator) {
      sendJson(response, 200, { creator: null });
      return;
    }
    const { account_id, ...profile } = creator;
    sendJson(response, 200, { creator: profile });
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    const token = getSessionToken(request);
    if (token) await pool.query('DELETE FROM account_sessions WHERE token_hash = $1', [hashSessionToken(token)]);
    clearSessionCookie(response);
    sendJson(response, 200, { signedOut: true });
    return;
  }
  if (url.pathname === '/api/saved' || url.pathname.startsWith('/api/saved/')) {
    if (request.method !== 'GET' && applyRateLimit(request, response)) return;
    const creator = await getAuthenticatedCreator(request);
    if (!creator) {
      sendJson(response, 401, { error: 'Sign in to manage your saved creators.' });
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/saved') {
      const result = await getSavedCreators(creator);
      sendJson(response, result.status, result.body);
      return;
    }
    if (request.method === 'POST' && url.pathname === '/api/saved') {
      const body = await readJsonBody(request);
      const result = await saveCreator(creator, body.creatorId);
      sendJson(response, result.status, result.body);
      return;
    }
    if (request.method === 'DELETE' && url.pathname.startsWith('/api/saved/')) {
      const result = await unsaveCreator(creator, decodeURIComponent(url.pathname.slice('/api/saved/'.length)));
      sendJson(response, result.status, result.body);
      return;
    }
  }
  if (url.pathname === '/api/conversations' || url.pathname.startsWith('/api/conversations/')) {
    if (request.method !== 'GET' && applyRateLimit(request, response)) return;
    const creator = await getAuthenticatedCreator(request);
    if (!creator) {
      sendJson(response, 401, { error: 'Sign in to use Collabify messages.' });
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/conversations') {
      const result = await getConversations(creator);
      sendJson(response, result.status, result.body);
      return;
    }
    if (request.method === 'POST' && url.pathname === '/api/conversations') {
      const body = await readJsonBody(request);
      const result = await startConversation(creator, body);
      sendJson(response, result.status, result.body);
      return;
    }
    const match = url.pathname.match(/^\/api\/conversations\/([^/]+)\/messages$/);
    if (match && request.method === 'GET') {
      const result = await getConversationMessages(creator, match[1]);
      sendJson(response, result.status, result.body);
      return;
    }
    if (match && request.method === 'POST') {
      const body = await readJsonBody(request);
      const result = await sendConversationMessage(creator, match[1], body);
      sendJson(response, result.status, result.body);
      return;
    }
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
  if (request.method === 'POST' && url.pathname === '/api/collaborations') {
    if (applyRateLimit(request, response)) return;
    const creator = await getAuthenticatedCreator(request);
    if (!creator) {
      sendJson(response, 401, { error: 'Sign in to record an introduction.' });
      return;
    }
    if (!request.headers['content-type']?.toLowerCase().includes('application/json')) {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' });
      return;
    }
    const body = await readJsonBody(request);
    const result = await recordIntroduction(body, creator);
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

function start() {
  server.on('error', error => {
    console.error('Could not start the Collabify web server:', error.message);
    process.exit(1);
  });
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Collabify is running at http://0.0.0.0:${PORT}`);
    initializeDatabase().catch(error => console.error('Could not initialize PostgreSQL:', error.message));
  });
}

async function shutdown(signal) {
  console.log(`${signal} received; closing Collabify.`);
  if (databaseRetryTimer) clearTimeout(databaseRetryTimer);
  server.close(async () => {
    try {
      await pool.end();
    } finally {
      process.exit(0);
    }
  });
}

if (require.main === module) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  start();
}

module.exports = { validateCreator, validateAccount, validateProfileLinks, validateAvatar, audiences, niches, styles, platformSlugs };
