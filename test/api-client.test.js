const test = require('node:test');
const assert = require('node:assert/strict');
const { readApiResponse } = require('../api-client');

function response(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => body
  };
}

test('explains a non-JSON Forbidden response without exposing a JSON parse error', async () => {
  await assert.rejects(
    readApiResponse(response(403, 'Forbidden.')),
    error => {
      assert.match(error.message, /static preview/i);
      assert.match(error.message, /http:\/\/localhost:3000/);
      assert.doesNotMatch(error.message, /Unexpected token/);
      return true;
    }
  );
});

test('explains a plain Forbidden body even when the preview returns HTTP 200', async () => {
  await assert.rejects(
    readApiResponse(response(200, 'Forbidden.')),
    /API returned Forbidden/
  );
});

test('returns successful JSON API responses', async () => {
  assert.deepEqual(await readApiResponse(response(201, '{"creator":{"id":"creator-1"}}')), {
    creator: { id: 'creator-1' }
  });
});

test('surfaces JSON API errors without hiding their status message', async () => {
  await assert.rejects(
    readApiResponse(response(409, '{"error":"That creator handle is already registered."}')),
    /handle is already registered/
  );
});

test('reports unexpected non-JSON responses with their HTTP status', async () => {
  await assert.rejects(
    readApiResponse(response(502, '<html>Unavailable</html>')),
    /non-JSON response \(HTTP 502\)/
  );
});
