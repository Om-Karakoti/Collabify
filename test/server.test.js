const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCreator } = require('../server');

const validProfile = {
  name: 'Alex Rivera',
  handle: 'alex.rivera',
  niche: 'Beauty',
  audience: 'micro',
  style: 'Storytelling',
  platforms: ['Instagram', 'YouTube'],
  bio: 'Beauty creator looking for thoughtful collaborations.'
};

test('validates and normalizes a creator profile for PostgreSQL', () => {
  const result = validateCreator(validProfile);

  assert.equal(result.error, undefined);
  assert.equal(result.creator.handle, '@alex.rivera');
  assert.equal(result.creator.followers, 30000);
  assert.deepEqual(result.creator.platforms, ['instagram', 'youtube']);
});

test('requires a supported platform and at least one selected platform', () => {
  assert.match(validateCreator({ ...validProfile, platforms: [] }).error, /at least one supported platform/i);
  assert.match(validateCreator({ ...validProfile, platforms: ['NotAPlatform'] }).error, /at least one supported platform/i);
});

test('rejects invalid audience, niche, style, and handle values', () => {
  assert.match(validateCreator(null).error, /JSON object/i);
  assert.match(validateCreator({ ...validProfile, audience: 'huge' }).error, /audience range/i);
  assert.match(validateCreator({ ...validProfile, niche: 'Other' }).error, /niche/i);
  assert.match(validateCreator({ ...validProfile, style: 'Unknown' }).error, /content style/i);
  assert.match(validateCreator({ ...validProfile, handle: '@alex rivera' }).error, /handle/i);
});

test('trims profile text and deduplicates selected platforms', () => {
  const result = validateCreator({
    ...validProfile,
    name: ' Alex Rivera ',
    platforms: ['Instagram', 'Instagram']
  });

  assert.equal(result.creator.name, 'Alex Rivera');
  assert.deepEqual(result.creator.platforms, ['instagram']);
});

test('enforces database field length boundaries before issuing SQL', () => {
  assert.match(validateCreator({ ...validProfile, name: 'a'.repeat(41) }).error, /name/i);
  assert.match(validateCreator({ ...validProfile, bio: 'a'.repeat(141) }).error, /introduction/i);
});
