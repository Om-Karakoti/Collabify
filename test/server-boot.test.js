'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

test('serves the UI and a degraded health report without a database', async t => {
  const port = 3900 + Math.floor(Math.random() * 500);
  const child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), DATABASE_URL: '', NODE_ENV: 'test', DB_RETRY_MS: '60000' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });

  t.after(() => new Promise(resolve => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }
    child.once('exit', resolve);
    child.kill('SIGTERM');
    setTimeout(() => {
      child.kill('SIGKILL');
      resolve();
    }, 5000).unref();
  }));

  const deadline = Date.now() + 15000;
  while (!output.includes('Collabify is running') && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.match(output, /Collabify is running/, output);

  const base = `http://127.0.0.1:${port}`;
  const home = await fetch(`${base}/`, { signal: AbortSignal.timeout(5000) });
  assert.equal(home.status, 200);
  assert.match(await home.text(), /<title>Collabify/);

  const health = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(5000) });
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), {
    status: 'degraded',
    database: 'unavailable',
    reason: 'DATABASE_URL is not configured'
  });

  const creators = await fetch(`${base}/api/creators`, { signal: AbortSignal.timeout(5000) });
  assert.equal(creators.status, 503);
  assert.equal((await creators.json()).database, 'unavailable');
});
