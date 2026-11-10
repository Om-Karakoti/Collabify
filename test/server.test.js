const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCreator, validateAccount, validateProfileLinks, validateAvatar } = require('../server');

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

test('normalizes account email and enforces password length', () => {
  const account = validateAccount({ email: '  Creator@Example.com ', password: 'a-secure-password-2026' });
  assert.deepEqual(account, { email: 'creator@example.com', password: 'a-secure-password-2026' });
  assert.match(validateAccount({ email: 'not-an-email', password: 'a-secure-password-2026' }).error, /email/i);
  assert.match(validateAccount({ email: 'creator@example.com', password: 'short' }).error, /12 and 128/i);
  assert.match(validateAccount(null).error, /account and creator profile/i);
});

test('validates creator profile links and blocks unsafe URL schemes', () => {
  assert.deepEqual(validateProfileLinks([
    { label: 'GitHub', url: 'https://github.com/alex' },
    { label: 'Portfolio', url: 'https://example.com/work' }
  ]), {
    links: [
      { label: 'GitHub', url: 'https://github.com/alex' },
      { label: 'Portfolio', url: 'https://example.com/work' }
    ]
  });
  assert.deepEqual(validateProfileLinks([{ label: '', url: '' }]), { links: [] });
  assert.match(validateProfileLinks([{ label: 'Bad link', url: 'javascript:alert(1)' }]).error, /http or https/i);
  assert.match(validateProfileLinks(Array.from({ length: 11 }, (_, index) => ({
    label: `Link ${index}`, url: `https://example.com/${index}`
  }))).error, /no more than 10/i);
});

test('validates optional profile images and their actual file signatures', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const valid = validateAvatar(`data:image/png;base64,${png.toString('base64')}`);
  assert.equal(valid.provided, true);
  assert.equal(valid.mimeType, 'image/png');
  assert.deepEqual(valid.image, png);
  assert.deepEqual(validateAvatar(undefined), { provided: false });
  assert.deepEqual(validateAvatar(null), { provided: true, image: null, mimeType: null });
  assert.match(validateAvatar(`data:image/jpeg;base64,${png.toString('base64')}`).error, /valid JPEG, PNG, or WebP/i);
  const oversized = Buffer.alloc(2 * 1024 * 1024 + 1);
  assert.match(validateAvatar(`data:image/png;base64,${oversized.toString('base64')}`).error, /smaller than 2 MB/i);
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
