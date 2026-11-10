const PLATFORM_INFO = [
  { id: 'Instagram', icon: '◎', className: 'instagram' },
  { id: 'YouTube', icon: '▶', className: 'youtube' },
  { id: 'TikTok', icon: '♪', className: 'tiktok' },
  { id: 'Twitch', icon: '▰', className: 'twitch' },
  { id: 'Podcast', icon: '◉', className: 'podcast' },
  { id: 'LinkedIn', icon: 'in', className: 'linkedin' }
];

const NICHES = ['Beauty', 'Food', 'Fitness', 'Lifestyle', 'Travel', 'Fashion', 'Tech', 'Gaming', 'Wellness', 'Education'];
const STYLES = ['Cinematic', 'Educational', 'Funny & casual', 'Storytelling', 'Minimalist', 'High-energy', 'Behind the scenes', 'Reviews & unboxings'];
const PAGE_SIZE = 24;
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;
const LOCAL_SAVED_KEY = 'collabify-local-saved-v1';
const audienceRanges = {
  nano: { min: 1000, max: 9999 },
  micro: { min: 10000, max: 49999 },
  mid: { min: 50000, max: 249999 },
  large: { min: 250000, max: 10000000 }
};

const starterCreators = [
  { name: 'Amara Johnson', handle: '@amaracreates', niche: 'Beauty', followers: 28400, audience: 'micro', style: 'Storytelling', platforms: ['Instagram', 'YouTube'], bio: 'Making beauty feel like you. Let’s create something real and radiant.', colors: ['#bf7b61', '#f1b08a'] },
  { name: 'Leo Park', handle: '@leocooksdaily', niche: 'Food', followers: 12600, audience: 'micro', style: 'Cinematic', platforms: ['TikTok', 'Instagram'], bio: 'Comfort food, little adventures, and the stories behind every recipe.', colors: ['#718b68', '#c4b585'] },
  { name: 'Sofia Martinez', handle: '@sofia.moves', niche: 'Fitness', followers: 68400, audience: 'mid', style: 'High-energy', platforms: ['YouTube', 'TikTok'], bio: 'Movement for real life. Join me for joyful, no-pressure workouts.', colors: ['#9a7591', '#d2a7b6'] },
  { name: 'Noah Williams', handle: '@noahafterhours', niche: 'Gaming', followers: 184000, audience: 'mid', style: 'Funny & casual', platforms: ['Twitch', 'YouTube'], bio: 'Co-op chaos, cozy streams, and games worth staying up for.', colors: ['#4e5869', '#8ca3be'] },
  { name: 'Priya Shah', handle: '@priyatravelnotes', niche: 'Travel', followers: 8100, audience: 'nano', style: 'Storytelling', platforms: ['Instagram', 'TikTok'], bio: 'Finding hidden corners and sharing the feeling of being somewhere new.', colors: ['#708c8c', '#9dc3bc'] },
  { name: 'Ethan Brooks', handle: '@ethanexplains', niche: 'Tech', followers: 312000, audience: 'large', style: 'Educational', platforms: ['YouTube', 'LinkedIn'], bio: 'Making everyday tech make sense. Curious minds welcome.', colors: ['#5b7189', '#a8bed0'] },
  { name: 'Mila Chen', handle: '@milastyleedit', niche: 'Fashion', followers: 45600, audience: 'micro', style: 'Minimalist', platforms: ['Instagram', 'YouTube'], bio: 'Thoughtful outfits, repeat wears, and a little bit of color.', colors: ['#b58978', '#d7bfac'] },
  { name: 'Jules Carter', handle: '@juleswellnessclub', niche: 'Wellness', followers: 21900, audience: 'micro', style: 'Behind the scenes', platforms: ['Podcast', 'Instagram'], bio: 'Small rituals for softer days. Honest conversations, always.', colors: ['#84927b', '#c4ceb0'] },
  { name: 'Kai Thompson', handle: '@kaimakesstuff', niche: 'Lifestyle', followers: 92500, audience: 'mid', style: 'Funny & casual', platforms: ['TikTok', 'Instagram'], bio: 'DIY projects that actually work and home life without the filter.', colors: ['#ad7f59', '#d3a56e'] },
  { name: 'Nina Patel', handle: '@ninabakesit', niche: 'Food', followers: 55300, audience: 'mid', style: 'Educational', platforms: ['YouTube', 'Instagram'], bio: 'Baking science for the curious home baker. Flour on everything.', colors: ['#be806c', '#e3b39c'] },
  { name: 'Andre Silva', handle: '@andreonfilm', niche: 'Travel', followers: 17600, audience: 'micro', style: 'Cinematic', platforms: ['YouTube', 'TikTok'], bio: 'Slow travel films from places that feel like a deep breath.', colors: ['#577d73', '#a1beb0'] },
  { name: 'Tessa Green', handle: '@tessatriesit', niche: 'Beauty', followers: 7450, audience: 'nano', style: 'Reviews & unboxings', platforms: ['TikTok', 'YouTube'], bio: 'Trying the viral stuff so you don’t have to. Honest reviews only.', colors: ['#ae7788', '#d6a8b7'] },
  { name: 'Marcus Reed', handle: '@marcusruns', niche: 'Fitness', followers: 141000, audience: 'mid', style: 'Storytelling', platforms: ['Instagram', 'Podcast'], bio: 'The long run, the hard days, and everything that keeps us moving.', colors: ['#647b68', '#a6b99b'] },
  { name: 'Olive Wright', handle: '@oliveandopen', niche: 'Lifestyle', followers: 34600, audience: 'micro', style: 'Behind the scenes', platforms: ['YouTube', 'Instagram'], bio: 'A slower, more intentional take on everyday life and home.', colors: ['#89745b', '#c5b493'] },
  { name: 'Benji Kim', handle: '@benjibuilds', niche: 'Tech', followers: 38700, audience: 'micro', style: 'Funny & casual', platforms: ['TikTok', 'LinkedIn'], bio: 'Building tiny apps, sharing big lessons, and laughing at my bugs.', colors: ['#5c8390', '#9dc2c5'] },
  { name: 'Ari Flores', handle: '@ariplaysit', niche: 'Gaming', followers: 9200, audience: 'nano', style: 'Educational', platforms: ['Twitch', 'TikTok'], bio: 'Beginner-friendly gaming guides and the occasional boss fight panic.', colors: ['#76618f', '#b6a2cd'] },
  { name: 'Layla Hassan', handle: '@laylaonrepeat', niche: 'Fashion', followers: 232000, audience: 'mid', style: 'Cinematic', platforms: ['YouTube', 'TikTok'], bio: 'Style stories, vintage finds, and getting dressed just for the joy of it.', colors: ['#aa746a', '#d3a394'] },
  { name: 'Sam Rivera', handle: '@samwellsaid', niche: 'Wellness', followers: 6700, audience: 'nano', style: 'Educational', platforms: ['Podcast', 'YouTube'], bio: 'Practical mental wellness, grounded in science and everyday life.', colors: ['#738d86', '#b1c9bf'] },
  { name: 'Cleo Bennett', handle: '@cleosunday', niche: 'Beauty', followers: 62000, audience: 'mid', style: 'Minimalist', platforms: ['Instagram', 'TikTok'], bio: 'Skin-first routines and low-effort looks that feel like you.', colors: ['#947964', '#c6a889'] },
  { name: 'Rory James', handle: '@roryroams', niche: 'Travel', followers: 27600, audience: 'micro', style: 'Funny & casual', platforms: ['TikTok', 'Instagram'], bio: 'Budget trips, missed trains, and the best snacks along the way.', colors: ['#678076', '#a7b6a0'] },
  { name: 'Dev Mehta', handle: '@devmakesitclear', niche: 'Education', followers: 198000, audience: 'mid', style: 'Educational', platforms: ['YouTube', 'LinkedIn'], bio: 'Complex ideas, made simple. Learning should feel like an adventure.', colors: ['#536d87', '#9fb0c3'] },
  { name: 'Ruby Cole', handle: '@rubytabletalk', niche: 'Food', followers: 4100, audience: 'nano', style: 'Behind the scenes', platforms: ['Instagram', 'Podcast'], bio: 'Family recipes, kitchen stories, and what we’re cooking this week.', colors: ['#a07860', '#d2a17b'] },
  { name: 'Theo Price', handle: '@theopaces', niche: 'Fitness', followers: 358000, audience: 'large', style: 'Minimalist', platforms: ['YouTube', 'Instagram'], bio: 'Simple strength training for busy people. Less noise, more progress.', colors: ['#657d74', '#a6b6a3'] },
  { name: 'Wren Okafor', handle: '@wrenreadsroom', niche: 'Education', followers: 15200, audience: 'micro', style: 'Storytelling', platforms: ['TikTok', 'Podcast'], bio: 'Ideas worth talking about, reading lists, and curious conversations.', colors: ['#866f8d', '#bea8ba'] }
];

const platformMap = Object.fromEntries(PLATFORM_INFO.map(platform => [platform.id, platform]));

function loadLocalSavedCreators() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter(creator => creator && typeof creator.id === 'string' && typeof creator.name === 'string')
      : [];
  } catch (error) {
    console.error('Could not load saved creators from this browser.', error);
    return [];
  }
}

const localSavedCreators = new Map(loadLocalSavedCreators().map(creator => [creator.id, creator]));
const grid = document.getElementById('creator-grid');
const searchInput = document.getElementById('search-input');
const nicheFilter = document.getElementById('niche-filter');
const audienceFilter = document.getElementById('audience-filter');
const styleFilter = document.getElementById('style-filter');
const modal = document.getElementById('register-modal');
const creatorForm = document.getElementById('creator-form');
const formError = document.getElementById('form-error');
let activePlatform = '';
let visibleCount = 9;
let creators = [...starterCreators];
let viewerCreator = null;
const ownCreatorIds = new Set();
let isAuthenticated = false;
let savedCreators = [];
let currentView = 'discover';
let activeConversation = null;
let conversations = [];
let pendingContactId = '';
let serverCreatorTotal = 0;
let serverOffset = 0;
let stats = null;
let activeContact = null;
let requestSequence = 0;
let statsErrorShown = false;
let serverError = false;
let saved = new Set(localSavedCreators.keys());
let toastTimer;

function platformIcon(platform, extraClass = '') {
  const info = platformMap[platform];
  if (!info) return '';
  return `<span class="platform-icon ${info.className} ${extraClass}" aria-hidden="true">${info.icon}</span>`;
}

const readApiResponse = window.CollabifyApi.readResponse;

function formatNumber(number) {
  if (number >= 1000000) return `${(number / 1000000).toFixed(number % 1000000 === 0 ? 0 : 1)}m`;
  if (number >= 10000) return `${Math.round(number / 1000)}k`;
  if (number >= 1000) return `${(number / 1000).toFixed(number % 1000 === 0 ? 0 : 1)}k`;
  return String(number);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function normalizeCreator(creator) {
  return {
    ...creator,
    avatarUrl: creator.hasAvatar ? `/api/creators/${encodeURIComponent(creator.id)}/avatar` : creator.avatarUrl || ''
  };
}

function renderAvatar(element, creator, className) {
  const initial = creator.name.trim().charAt(0).toUpperCase();
  element.className = className;
  element.textContent = '';
  if (creator.avatarUrl) {
    const image = document.createElement('img');
    image.src = creator.avatarUrl;
    image.alt = '';
    image.decoding = 'async';
    element.append(image);
  } else {
    element.textContent = initial;
  }
}

function updateProfileAvatarPreview(avatarUrl) {
  const preview = document.getElementById('profile-avatar-preview');
  renderAvatar(preview, { name: viewerCreator?.name || 'Your profile', avatarUrl }, 'profile-avatar-preview');
  document.getElementById('remove-profile-image').hidden = !avatarUrl;
}

function readProfileImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.');
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error('Profile images must be smaller than 2 MB.');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read the selected image.'));
        return;
      }
      resolve(reader.result);
    }, { once: true });
    reader.addEventListener('error', () => reject(new Error('Could not read the selected image.')), { once: true });
    reader.readAsDataURL(file);
  });
}

function getMatchScore(creator) {
  let score = viewerCreator ? 40 : 45;
  if (viewerCreator) {
    if (creator.niche === viewerCreator.niche) score += 18;
    if (creator.style === viewerCreator.style) score += 17;
    const ratio = Math.max(creator.followers, viewerCreator.followers) / Math.max(1, Math.min(creator.followers, viewerCreator.followers));
    score += Math.max(0, 18 - Math.min(18, Math.round(Math.log2(ratio) * 4)));
    const sharedPlatforms = creator.platforms.filter(platform => viewerCreator.platforms.includes(platform)).length;
    score += Math.min(sharedPlatforms * 5, 10);
  } else {
    if (nicheFilter.value && creator.niche === nicheFilter.value) score += 18;
    if (styleFilter.value && creator.style === styleFilter.value) score += 17;
    if (audienceFilter.value) score += 8;
    if (activePlatform) score += 12;
  }
  return Math.min(score, 99);
}

function getFilteredCreators() {
  const query = searchInput.value.trim().toLowerCase();
  return creators.filter(creator => {
    if (!creator.id) return false;
    const matchesSearch = !query || [creator.name, creator.handle, creator.niche, creator.style, creator.bio].join(' ').toLowerCase().includes(query);
    const matchesNiche = !nicheFilter.value || creator.niche === nicheFilter.value;
    const matchesStyle = !styleFilter.value || creator.style === styleFilter.value;
    const matchesPlatform = !activePlatform || creator.platforms.includes(activePlatform);
    const range = audienceFilter.value && audienceRanges[audienceFilter.value];
    const matchesAudience = !range || creator.followers >= range.min && creator.followers <= range.max;
    return creator !== viewerCreator && !ownCreatorIds.has(creator.id) && matchesSearch && matchesNiche && matchesStyle && matchesPlatform && matchesAudience;
  }).sort((a, b) => getMatchScore(b) - getMatchScore(a));
}

function getLocalCreators() {
  const query = searchInput.value.trim().toLowerCase();
  return starterCreators.filter(creator => {
    const matchesSearch = !query || [creator.name, creator.handle, creator.niche, creator.style, creator.bio].join(' ').toLowerCase().includes(query);
    const matchesNiche = !nicheFilter.value || creator.niche === nicheFilter.value;
    const matchesStyle = !styleFilter.value || creator.style === styleFilter.value;
    const matchesPlatform = !activePlatform || creator.platforms.includes(activePlatform);
    const range = audienceFilter.value && audienceRanges[audienceFilter.value];
    const matchesAudience = !range || creator.followers >= range.min && creator.followers <= range.max;
    return matchesSearch && matchesNiche && matchesStyle && matchesPlatform && matchesAudience;
  });
}

function renderCard(creator, index) {
  const id = creator.id || `sample-${starterCreators.indexOf(creator)}`;
  const colors = creator.colors || ['#9c766a', '#d4a38d'];
  const initial = escapeHtml(creator.name.trim().charAt(0).toUpperCase());
  const avatar = creator.avatarUrl
    ? `<img src="${escapeHtml(creator.avatarUrl)}" alt="" loading="lazy" decoding="async" />${initial}`
    : initial;
  const platforms = creator.platforms.map(platform => platformIcon(platform)).join('');
  const tags = [creator.niche, creator.style].filter(Boolean).map(tag => `<span class="creator-tag">${escapeHtml(tag)}</span>`).join('');
  const profileLinks = (creator.profileLinks || []).slice(0, 3).map(link =>
    `<a class="creator-profile-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} ↗</a>`
  ).join('');
  return `<article class="creator-card" style="animation-delay:${Math.min(index * 35, 245)}ms">
    <div class="creator-top">
      <span class="creator-avatar" style="background:linear-gradient(140deg,${escapeHtml(colors[0])},${escapeHtml(colors[1])})">${avatar}</span>
      <div class="creator-identity"><div class="creator-name-line"><span class="creator-name">${escapeHtml(creator.name)}</span><span class="verified" aria-label="Creator profile">✦</span></div><span class="creator-handle">${escapeHtml(creator.handle)}</span></div>
      <button class="save-button ${saved.has(id) ? 'saved' : ''}" data-save="${escapeHtml(id)}" type="button" aria-label="${saved.has(id) ? 'Remove from saved creators' : 'Save creator'}" aria-pressed="${saved.has(id)}">${saved.has(id) ? '♥' : '♡'}</button>
    </div>
    <div class="match-label"><span>✦</span> ${getMatchScore(creator)}% match</div>
    <p class="creator-bio">${escapeHtml(creator.bio)}</p>
    <div class="creator-tags">${tags}</div>
    ${profileLinks ? `<div class="creator-profile-links">${profileLinks}</div>` : ''}
    <div class="creator-footer"><div class="creator-stats"><span class="creator-followers">${formatNumber(creator.followers)} <span style="font:400 8px 'DM Sans',sans-serif;color:#99938d">followers</span></span><span class="creator-platform-label">${creator.platforms.length} ${creator.platforms.length === 1 ? 'platform' : 'platforms'}</span></div><div class="creator-platforms" aria-label="${creator.platforms.map(escapeHtml).join(', ')}">${platforms}</div><button class="contact-button" data-contact="${escapeHtml(id)}" type="button">${creator.messageable ? 'Message' : 'Say hello'} ↗</button></div>
  </article>`;
}

function render() {
  const filtered = [...getFilteredCreators(), ...getLocalCreators()].sort((a, b) => getMatchScore(b) - getMatchScore(a));
  const shown = filtered.slice(0, visibleCount);
  grid.innerHTML = shown.map(renderCard).join('');
  document.getElementById('empty-state').hidden = filtered.length !== 0;
  const total = serverCreatorTotal + getLocalCreators().length;
  document.getElementById('load-more').hidden = shown.length >= filtered.length && serverOffset >= serverCreatorTotal || total === 0;
  document.getElementById('result-total').textContent = total;
  document.getElementById('nav-count').textContent = total;
  document.getElementById('active-filter-count').textContent = [activePlatform, nicheFilter.value, audienceFilter.value, styleFilter.value, searchInput.value.trim()].filter(Boolean).length;
  document.getElementById('active-filter-count').hidden = ![activePlatform, nicheFilter.value, audienceFilter.value, styleFilter.value, searchInput.value.trim()].some(Boolean);
  document.getElementById('active-platforms').innerHTML = activePlatform
    ? `<span class="active-chip">${platformIcon(activePlatform)} ${escapeHtml(activePlatform)} creators <button type="button" data-clear-platform aria-label="Remove ${escapeHtml(activePlatform)} filter">×</button></span>`
    : '';
  renderPlatformFilters(total);
  renderSavedView();
  if (serverError && !document.getElementById('directory-error')) {
    grid.insertAdjacentHTML('beforebegin', '<p class="directory-error" id="directory-error">Could not load registered creators from the server. Check that Collabify is connected to PostgreSQL, then refresh.</p>');
  } else if (!serverError) {
    document.getElementById('directory-error')?.remove();
  }
}

function renderStats() {
  document.getElementById('stat-creators').textContent = stats ? Number(stats.creators).toLocaleString() : '—';
  document.getElementById('stat-collaborations').textContent = stats ? Number(stats.introductions).toLocaleString() : '—';
  document.getElementById('stat-platforms').textContent = stats ? Number(stats.platforms).toLocaleString() : '—';
}

function renderSavedView() {
  const prompt = document.getElementById('saved-signin');
  const savedGrid = document.getElementById('saved-grid');
  const empty = document.getElementById('saved-empty');
  prompt.hidden = isAuthenticated;
  const allSaved = [...savedCreators, ...localSavedCreators.values()]
    .filter((creator, index, list) => list.findIndex(item => item.id === creator.id) === index);
  savedGrid.hidden = allSaved.length === 0;
  empty.hidden = allSaved.length !== 0;
  savedGrid.innerHTML = allSaved.map(renderCard).join('');
}

function updateAuthUi() {
  const authButton = document.getElementById('auth-button');
  authButton.textContent = isAuthenticated ? 'Sign out' : 'Sign in';
  document.getElementById('sidebar-name').textContent = viewerCreator ? viewerCreator.name : 'Your profile';
  document.getElementById('sidebar-email').textContent = viewerCreator?.email || 'Sign in to your account';
  const avatarCreator = viewerCreator || { name: 'Your profile', avatarUrl: '' };
  renderAvatar(document.querySelector('.user-avatar'), avatarCreator, 'user-avatar');
  renderAvatar(document.getElementById('top-avatar'), avatarCreator, 'top-avatar');
  document.getElementById('messages-signin').hidden = isAuthenticated;
  document.getElementById('messages-layout').hidden = !isAuthenticated;
  const hasUnread = isAuthenticated && conversations.some(item => item.unread_count > 0);
  document.getElementById('message-dot').hidden = !hasUnread;
  document.getElementById('notification-dot').hidden = !hasUnread;
  renderSavedView();
  renderProfilePage();
}

function renderProfilePage() {
  const prompt = document.getElementById('profile-signin');
  const card = document.getElementById('profile-card');
  const editor = document.getElementById('profile-form');
  const editButton = document.getElementById('edit-profile-button');
  prompt.hidden = isAuthenticated;
  card.hidden = !isAuthenticated;
  editButton.hidden = !isAuthenticated || !editor.hidden;
  if (!isAuthenticated || !viewerCreator) return;

  renderAvatar(document.getElementById('profile-avatar'), viewerCreator, 'profile-avatar');
  document.getElementById('profile-name').textContent = viewerCreator.name;
  document.getElementById('profile-handle').textContent = viewerCreator.handle;
  document.getElementById('profile-email').textContent = viewerCreator.email;
  document.getElementById('profile-bio').textContent = viewerCreator.bio;
  const links = viewerCreator.profileLinks || [];
  const completed = [viewerCreator.name, viewerCreator.handle, viewerCreator.niche, viewerCreator.bio, viewerCreator.platforms?.length, links.length].filter(Boolean).length;
  document.getElementById('profile-completion').textContent = `${Math.round(completed / 6 * 100)}% complete`;
  document.getElementById('profile-facts').innerHTML = [
    `<span>${escapeHtml(viewerCreator.niche)}</span>`,
    `<span>${escapeHtml(viewerCreator.style)}</span>`,
    `<span>${formatNumber(viewerCreator.followers)} followers</span>`,
    ...(viewerCreator.platforms || []).map(platform => `<span>${platformIcon(platform)}${escapeHtml(platform)}</span>`)
  ].join('');
  document.getElementById('profile-links').innerHTML = links.map(link =>
    `<a class="profile-link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(link.label)}</strong><span>${escapeHtml(link.url.replace(/^https?:\/\//, ''))}</span><b aria-hidden="true">↗</b></a>`
  ).join('');
  document.getElementById('profile-no-links').hidden = links.length > 0;
}

const PROFILE_LINK_SUGGESTIONS = {
  Beauty: ['Portfolio', 'Instagram', 'TikTok', 'YouTube', 'Website'],
  Food: ['Recipe portfolio', 'Instagram', 'TikTok', 'YouTube', 'Website'],
  Fitness: ['Training portfolio', 'Instagram', 'YouTube', 'TikTok', 'Website'],
  Lifestyle: ['Portfolio', 'Instagram', 'TikTok', 'YouTube', 'Website'],
  Travel: ['Travel portfolio', 'Instagram', 'YouTube', 'TikTok', 'Website'],
  Fashion: ['Portfolio', 'Instagram', 'TikTok', 'YouTube', 'Website'],
  Tech: ['GitHub', 'Portfolio', 'LinkedIn', 'YouTube', 'Website'],
  Gaming: ['Twitch', 'YouTube', 'TikTok', 'Discord', 'Website'],
  Wellness: ['Practice website', 'Instagram', 'YouTube', 'Podcast', 'LinkedIn'],
  Education: ['Portfolio', 'GitHub', 'LinkedIn', 'YouTube', 'Website']
};

function renderProfileLinkSuggestions(niche) {
  const suggestions = PROFILE_LINK_SUGGESTIONS[niche] || ['Portfolio', 'GitHub', 'Website', 'LinkedIn'];
  document.getElementById('profile-link-suggestions').innerHTML =
    `<span>Suggested for ${escapeHtml(niche)}:</span> ` + suggestions.map(label =>
      `<button class="link-suggestion" type="button" data-link-label="${escapeHtml(label)}">＋ ${escapeHtml(label)}</button>`
    ).join('');
}

function renderProfileLinkFields(links = []) {
  const container = document.getElementById('profile-link-fields');
  container.innerHTML = links.map(link => `
    <div class="profile-link-row">
      <label>Link name<input class="profile-link-label" maxlength="30" value="${escapeHtml(link.label || '')}" placeholder="e.g. GitHub" /></label>
      <label>URL<input class="profile-link-url" type="url" maxlength="500" value="${escapeHtml(link.url || '')}" placeholder="https://example.com/your-work" /></label>
      <button class="remove-profile-link" type="button" aria-label="Remove profile link">×</button>
    </div>`).join('');
  document.getElementById('add-profile-link').disabled = links.length >= 10;
}

function openProfileEditor() {
  if (!isAuthenticated || !viewerCreator) return;
  const form = document.getElementById('profile-form');
  form.elements.name.value = viewerCreator.name;
  form.elements.handle.value = viewerCreator.handle;
  form.elements.niche.value = viewerCreator.niche;
  form.elements.audience.value = viewerCreator.audience;
  form.elements.style.value = viewerCreator.style;
  form.elements.bio.value = viewerCreator.bio;
  const avatarData = document.getElementById('profile-avatar-data');
  avatarData.value = '';
  avatarData.dataset.changed = 'false';
  document.getElementById('profile-image-file').value = '';
  renderAvatar(document.getElementById('profile-avatar-preview'), viewerCreator, 'profile-avatar-preview');
  document.getElementById('remove-profile-image').hidden = !viewerCreator.avatarUrl;
  for (const checkbox of form.querySelectorAll('input[name="platforms"]')) {
    checkbox.checked = viewerCreator.platforms.includes(checkbox.value.toLowerCase());
  }
  renderProfileLinkFields(viewerCreator.profileLinks || []);
  renderProfileLinkSuggestions(viewerCreator.niche);
  document.getElementById('profile-error').textContent = '';
  form.hidden = false;
  document.getElementById('profile-card').hidden = true;
  document.getElementById('edit-profile-button').hidden = true;
  form.elements.name.focus();
}

function saveLocalCreator(creator, id) {
  const savedCreator = { ...creator, id };
  const updated = new Map(localSavedCreators);
  updated.set(id, savedCreator);
  localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify([...updated.values()]));
  localSavedCreators.set(id, savedCreator);
  saved.add(id);
}

function removeLocalCreator(id) {
  const updated = new Map(localSavedCreators);
  updated.delete(id);
  localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify([...updated.values()]));
  localSavedCreators.delete(id);
  saved.delete(id);
}

function findCreator(id) {
  return creators.find(item => (item.id || `sample-${starterCreators.indexOf(item)}`) === id)
    || savedCreators.find(item => item.id === id)
    || localSavedCreators.get(id);
}

async function restoreSession() {
  try {
    const response = await fetch('/api/auth/me');
    const result = await readApiResponse(response);
    if (result.creator) await setAuthenticatedCreator(result.creator);
  } catch (error) {
    console.error('Could not restore the Collabify account session.', error);
    showToast('Could not check your sign-in status.');
  } finally {
    updateAuthUi();
  }
}

async function setAuthenticatedCreator(creator) {
  const savedResponse = await fetch('/api/saved');
  const result = await readApiResponse(savedResponse);
  isAuthenticated = true;
  viewerCreator = normalizeCreator(creator);
  ownCreatorIds.clear();
  ownCreatorIds.add(creator.id);
  savedCreators = result.creators.map(normalizeCreator);
  saved = new Set([...savedCreators.map(item => item.id), ...localSavedCreators.keys()]);
  updateAuthUi();
  render();
  if (currentView === 'messages') await refreshConversations();
}

function openView(view) {
  if (!['discover', 'saved', 'messages', 'profile'].includes(view)) return;
  currentView = view;
  for (const section of document.querySelectorAll('.workspace-view')) {
    section.hidden = section.id !== `view-${view}` && section.id !== view;
  }
  for (const link of document.querySelectorAll('.nav-link[data-view]')) {
    const selected = link.dataset.view === view;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  document.querySelector('.breadcrumb strong').textContent = view === 'saved' ? 'Saved creators' : view === 'messages' ? 'Messages' : view === 'profile' ? 'My profile' : 'Discover';
  document.getElementById('sidebar').classList.remove('open');
  if (view === 'messages' && isAuthenticated) refreshConversations();
  if (view === 'saved') renderSavedView();
  if (view === 'profile') renderProfilePage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function platformSlug(platform) {
  return platform.toLowerCase();
}

function renderPlatformFilters(total) {
  const platforms = PLATFORM_INFO.map(platform => {
    const count = starterCreators.filter(creator => creator.platforms.includes(platform.id)).length + Number(stats?.platform_totals?.[platformSlug(platform.id)] || 0);
    return `<button type="button" class="platform-filter ${activePlatform === platform.id ? 'selected' : ''}" data-platform="${platform.id}" aria-pressed="${activePlatform === platform.id}">${platformIcon(platform.id)}<span>${platform.id}</span><span class="platform-total">${count}</span></button>`;
  }).join('');
  document.getElementById('platform-list').innerHTML = platforms;
  document.getElementById('platform-tabs').innerHTML = `<button type="button" class="platform-tab ${!activePlatform ? 'selected' : ''}" data-platform="" aria-pressed="${!activePlatform}">All platforms <span class="tab-count">${total}</span></button>` +
    PLATFORM_INFO.map(platform => {
      const count = starterCreators.filter(creator => creator.platforms.includes(platform.id)).length + Number(stats?.platform_totals?.[platformSlug(platform.id)] || 0);
      return `<button type="button" class="platform-tab ${activePlatform === platform.id ? 'selected' : ''}" data-platform="${platform.id}" aria-pressed="${activePlatform === platform.id}">${platformIcon(platform.id)}${platform.id}<span class="tab-count">${count}</span></button>`;
    }).join('');
}

function fillSelect(select, options, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>` + options.map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
}

function setPlatform(platform) {
  activePlatform = platform;
  visibleCount = 9;
  render();
  fetchDirectory();
}

function resetFilters() {
  searchInput.value = '';
  nicheFilter.value = '';
  audienceFilter.value = '';
  styleFilter.value = '';
  setPlatform('');
}

function getDirectoryUrl(offset) {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset)
  });
  if (activePlatform) params.set('platform', platformSlug(activePlatform));
  if (nicheFilter.value) params.set('niche', nicheFilter.value);
  if (audienceFilter.value) params.set('audience', audienceFilter.value);
  if (styleFilter.value) params.set('style', styleFilter.value);
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  return `/api/creators?${params}`;
}

async function fetchDirectory(reset = true) {
  const sequence = ++requestSequence;
  const offset = reset ? 0 : serverOffset;
  if (reset) {
    serverOffset = 0;
    serverCreatorTotal = 0;
    creators = [...starterCreators];
  }
  serverError = false;
  render();
  try {
    const response = await fetch(getDirectoryUrl(offset));
    const result = await readApiResponse(response);
    if (sequence !== requestSequence) return;
    const incoming = Array.isArray(result.creators) ? result.creators.map(creator => ({
      ...normalizeCreator(creator),
      colors: ['#d57f5d', '#efb895']
    })) : [];
    creators = reset
      ? [...starterCreators, ...incoming]
      : [...creators, ...incoming.filter(creator => !creators.some(existing => existing.id === creator.id))];
    serverCreatorTotal = Number(result.total) || 0;
    serverOffset = offset + incoming.length;
    serverError = false;
  } catch (error) {
    if (sequence !== requestSequence) return;
    console.error('Could not load creators from Collabify.', error);
    serverError = true;
    if (!statsErrorShown) showToast('Could not connect to Collabify. Check the server and database.');
    statsErrorShown = true;
  }
  render();
}

async function refreshStats() {
  try {
    const response = await fetch('/api/stats');
    const result = await readApiResponse(response);
    stats = result;
    statsErrorShown = false;
    renderStats();
    renderPlatformFilters(serverCreatorTotal + getLocalCreators().length);
  } catch (error) {
    console.error('Could not refresh Collabify statistics.', error);
    stats = null;
    renderStats();
    renderPlatformFilters(serverCreatorTotal + getLocalCreators().length);
    if (!statsErrorShown) showToast('Live community statistics are unavailable.');
    statsErrorShown = true;
  }
}

function openRegistration() {
  if (isAuthenticated) {
    showToast('You’re already signed in to Collabify.');
    return;
  }
  document.getElementById('login-modal').hidden = true;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  formError.textContent = '';
  window.setTimeout(() => creatorForm.elements.name.focus(), 50);
}

function openLogin() {
  modal.hidden = true;
  document.getElementById('login-modal').hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('login-error').textContent = '';
  window.setTimeout(() => document.getElementById('login-form').elements.email.focus(), 50);
}

function closeRegistration() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

function openContact(id) {
  const creator = creators.find(item => (item.id || `sample-${starterCreators.indexOf(item)}`) === id)
    || savedCreators.find(item => item.id === id);
  if (!creator) {
    showToast('This creator profile is no longer available.');
    return;
  }
  const firstName = creator.name.trim().split(/\s+/)[0];
  activeContact = creator.messageable ? { creator } : null;
  const myNiche = viewerCreator && viewerCreator.niche ? viewerCreator.niche.toLowerCase() : 'creative';
  const myPlatforms = viewerCreator && viewerCreator.platforms.length
    ? ` on ${viewerCreator.platforms.join(' and ')}`
    : '';
  document.getElementById('contact-name').textContent = creator.name;
  document.getElementById('contact-handle').textContent = creator.handle;
  document.getElementById('contact-description').textContent = creator.messageable
    ? `Send ${firstName} a private Collabify message and start a conversation about making something together.`
    : 'This is a sample or legacy profile. In-app messages are available when both creators have Collabify accounts.';
  document.getElementById('contact-platforms').innerHTML = creator.platforms
    .map(platform => `<span class="contact-platform-pill">${platformIcon(platform)}${escapeHtml(platform)}</span>`).join('');
  document.getElementById('contact-message').value = `Hi ${firstName}! I love your ${creator.niche.toLowerCase()} content. I'm a ${myNiche} creator${myPlatforms}, and I’d love to explore a collab together. Would you be interested?`;
  const logButton = document.getElementById('log-intro');
  logButton.disabled = !activeContact;
  logButton.textContent = activeContact ? 'Send Collabify message' : 'Messaging unavailable for sample profile';
  document.getElementById('contact-footnote').textContent = activeContact
    ? 'Messages are private to the creators in this conversation.'
    : 'Sample creators are previews. Copy a note and contact them on their listed social platforms.';
  document.getElementById('contact-modal').hidden = false;
  document.body.style.overflow = 'hidden';
  window.setTimeout(() => document.getElementById('contact-message').focus(), 50);
}

function closeContact() {
  document.getElementById('contact-modal').hidden = true;
  document.body.style.overflow = '';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3000);
}

async function refreshConversations() {
  if (!isAuthenticated) return;
  try {
    const response = await fetch('/api/conversations');
    const result = await readApiResponse(response);
    conversations = result.conversations;
    renderConversationList();
    const hasUnread = conversations.some(item => item.unread_count > 0);
    document.getElementById('message-dot').hidden = !hasUnread;
    document.getElementById('notification-dot').hidden = !hasUnread;
    if (activeConversation) {
      activeConversation = conversations.find(item => item.id === activeConversation.id) || activeConversation;
    }
  } catch (error) {
    console.error('Could not load Collabify conversations.', error);
    showToast(error.message || 'Could not load your conversations.');
  }
}

function renderConversationList() {
  const list = document.getElementById('conversation-list');
  if (!conversations.length) {
    list.innerHTML = '<p class="conversation-empty">Your conversations will appear here.</p>';
    return;
  }
  list.innerHTML = conversations.map(conversation => `
    <button class="conversation-item ${activeConversation?.id === conversation.id ? 'selected' : ''}" type="button" data-conversation="${escapeHtml(conversation.id)}">
      <span class="conversation-avatar">${escapeHtml(conversation.name.trim().charAt(0).toUpperCase())}</span>
      <span class="conversation-copy"><strong>${escapeHtml(conversation.name)}</strong><small>${escapeHtml(conversation.last_message || 'Start a conversation')}</small></span>
      ${conversation.unread_count ? `<span class="unread-count">${conversation.unread_count}</span>` : ''}
    </button>`).join('');
}

async function openConversation(conversation) {
  activeConversation = conversation;
  document.getElementById('chat-empty').hidden = true;
  document.getElementById('chat-active').hidden = false;
  document.getElementById('chat-name').textContent = conversation.name;
  document.getElementById('chat-handle').textContent = conversation.handle;
  renderConversationList();
  await loadConversationMessages();
}

async function loadConversationMessages() {
  if (!activeConversation) return;
  try {
    const response = await fetch(`/api/conversations/${encodeURIComponent(activeConversation.id)}/messages`);
    const result = await readApiResponse(response);
    const timeline = document.getElementById('chat-messages');
    timeline.innerHTML = result.messages.map(message => `
      <div class="message-row ${message.senderCreatorId === viewerCreator.id ? 'mine' : ''}">
        <div class="message-bubble">${escapeHtml(message.body)}<time>${new Date(message.createdAt).toLocaleString()}</time></div>
      </div>`).join('');
    timeline.scrollTop = timeline.scrollHeight;
    await refreshConversations();
  } catch (error) {
    console.error('Could not load this Collabify conversation.', error);
    document.getElementById('chat-error').textContent = error.message || 'Could not load this conversation.';
  }
}

async function sendChatMessage(event) {
  event.preventDefault();
  if (!activeConversation) return;
  const input = document.getElementById('chat-input');
  const button = event.currentTarget.querySelector('button[type="submit"]');
  const errorElement = document.getElementById('chat-error');
  const message = input.value.trim();
  if (!message) return;
  errorElement.textContent = '';
  button.disabled = true;
  try {
    const response = await fetch(`/api/conversations/${encodeURIComponent(activeConversation.id)}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    await readApiResponse(response);
    input.value = '';
    await loadConversationMessages();
  } catch (error) {
    console.error('Could not send this Collabify message.', error);
    errorElement.textContent = error.message || 'Could not send this message.';
  } finally {
    button.disabled = false;
  }
}

fillSelect(nicheFilter, NICHES, 'All niches');
fillSelect(styleFilter, STYLES, 'Any style');
fillSelect(document.getElementById('form-niche'), NICHES, 'Choose your niche');
fillSelect(document.getElementById('form-style'), STYLES, 'Choose your style');
fillSelect(document.getElementById('profile-niche'), NICHES, 'Choose your niche');
fillSelect(document.getElementById('profile-style'), STYLES, 'Choose your style');
document.getElementById('form-platforms').innerHTML = PLATFORM_INFO.map(platform =>
  `<label class="platform-checkbox">${platformIcon(platform.id)}<span>${platform.id}</span><input type="checkbox" name="platforms" value="${platform.id}" /></label>`
).join('');
document.getElementById('profile-platforms').innerHTML = PLATFORM_INFO.map(platform =>
  `<label class="platform-checkbox">${platformIcon(platform.id)}<span>${platform.id}</span><input type="checkbox" name="platforms" value="${platform.id}" /></label>`
).join('');

render();
renderStats();
updateAuthUi();
fetchDirectory();
refreshStats();
restoreSession();
window.setInterval(() => {
  if (document.visibilityState === 'visible') refreshStats();
}, 15000);
window.setInterval(() => {
  if (document.visibilityState === 'visible') fetchDirectory();
}, 30000);
window.setInterval(() => {
  if (document.visibilityState === 'visible' && currentView === 'messages' && isAuthenticated) {
    refreshConversations();
    if (activeConversation) loadConversationMessages();
  }
}, 10000);

document.addEventListener('click', async event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const viewButton = target.closest('[data-view]');
  if (viewButton) {
    event.preventDefault();
    openView(viewButton.dataset.view);
    return;
  }
  if (target.closest('[data-open-auth]')) {
    openLogin();
    return;
  }
  if (target.closest('[data-open-register]')) {
    openRegistration();
    return;
  }
  const profileLinkSuggestion = target.closest('[data-link-label]');
  if (profileLinkSuggestion) {
    const rows = [...document.querySelectorAll('.profile-link-row')];
    if (rows.length >= 10) {
      showToast('A profile can have up to 10 links.');
      return;
    }
    const link = { label: profileLinkSuggestion.dataset.linkLabel, url: '' };
    renderProfileLinkFields([...rows.map(row => ({
      label: row.querySelector('.profile-link-label').value,
      url: row.querySelector('.profile-link-url').value
    })), link]);
    document.querySelector('.profile-link-row:last-child .profile-link-url').focus();
    return;
  }
  if (target.closest('.remove-profile-link')) {
    const rows = [...document.querySelectorAll('.profile-link-row')]
      .filter(row => row !== target.closest('.profile-link-row'))
      .map(row => ({
        label: row.querySelector('.profile-link-label').value,
        url: row.querySelector('.profile-link-url').value
      }));
    renderProfileLinkFields(rows);
    return;
  }
  const platformButton = target.closest('[data-platform]');
  if (platformButton) {
    setPlatform(platformButton.getAttribute('data-platform') || '');
    return;
  }
  const saveButton = target.closest('[data-save]');
  if (saveButton) {
    const id = saveButton.getAttribute('data-save');
    const creator = findCreator(id);
    if (!creator) {
      showToast('This creator is no longer available.');
      return;
    }
    try {
      if (!isAuthenticated || !creator.messageable) {
        if (saved.has(id)) removeLocalCreator(id);
        else saveLocalCreator(creator, id);
      } else if (localSavedCreators.has(id) && saved.has(id)) {
        const accountSaveExists = savedCreators.some(item => item.id === id);
        if (accountSaveExists) {
          const response = await fetch(`/api/saved/${encodeURIComponent(id)}`, { method: 'DELETE' });
          await readApiResponse(response);
          savedCreators = savedCreators.filter(item => item.id !== id);
        }
        removeLocalCreator(id);
      } else {
        const response = saved.has(id)
          ? await fetch(`/api/saved/${encodeURIComponent(id)}`, { method: 'DELETE' })
          : await fetch('/api/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creatorId: id })
          });
        await readApiResponse(response);
        if (saved.has(id)) {
          saved.delete(id);
          savedCreators = savedCreators.filter(item => item.id !== id);
        } else {
          saved.add(id);
          savedCreators.push(creator);
        }
      }
    } catch (error) {
      console.error('Could not update your saved creators.', error);
      showToast(error.message || 'Could not update your saved creators.');
    }
    render();
    return;
  }
  const contactButton = target.closest('[data-contact]');
  if (contactButton) {
    openContact(contactButton.getAttribute('data-contact'));
    return;
  }
  if (target.closest('[data-clear-platform]')) setPlatform('');
});

for (const input of [searchInput, nicheFilter, audienceFilter, styleFilter]) {
  input.addEventListener(input === searchInput ? 'input' : 'change', () => {
    visibleCount = 9;
    render();
    window.clearTimeout(input.searchTimer);
    input.searchTimer = window.setTimeout(() => fetchDirectory(), input === searchInput ? 250 : 0);
  });
}

document.getElementById('clear-platforms').addEventListener('click', () => setPlatform(''));
document.getElementById('reset-filters').addEventListener('click', resetFilters);
document.getElementById('empty-reset').addEventListener('click', resetFilters);
document.getElementById('load-more').addEventListener('click', () => {
  visibleCount += 9;
  const loaded = getFilteredCreators().length + getLocalCreators().length;
  if (visibleCount > loaded && serverOffset < serverCreatorTotal) fetchDirectory(false);
  else render();
});
document.getElementById('filters-toggle').addEventListener('click', event => {
  const button = event.currentTarget;
  const selected = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!selected));
  document.querySelector('.style-select').style.display = selected ? '' : 'flex';
  if (window.innerWidth <= 760) document.querySelector('.style-select').style.display = selected ? 'none' : 'flex';
});
document.getElementById('register-button').addEventListener('click', openRegistration);
document.getElementById('top-avatar').addEventListener('click', () => openView('profile'));
document.getElementById('profile-button').addEventListener('click', () => openView('profile'));
document.getElementById('tip-register').addEventListener('click', () => openView('profile'));
document.getElementById('notification-button').addEventListener('click', () => openView('messages'));
document.getElementById('edit-profile-button').addEventListener('click', openProfileEditor);
document.getElementById('cancel-profile-edit').addEventListener('click', () => {
  document.getElementById('profile-form').hidden = true;
  document.getElementById('profile-card').hidden = false;
  document.getElementById('edit-profile-button').hidden = false;
  document.getElementById('profile-error').textContent = '';
});
document.getElementById('add-profile-link').addEventListener('click', () => {
  const rows = [...document.querySelectorAll('.profile-link-row')];
  if (rows.length >= 10) return;
  renderProfileLinkFields([...rows.map(row => ({
    label: row.querySelector('.profile-link-label').value,
    url: row.querySelector('.profile-link-url').value
  })), { label: '', url: '' }]);
  document.querySelector('.profile-link-row:last-child .profile-link-label').focus();
});
document.getElementById('profile-niche').addEventListener('change', event => {
  renderProfileLinkSuggestions(event.currentTarget.value);
});
document.getElementById('profile-image-file').addEventListener('change', async event => {
  const file = event.currentTarget.files[0];
  if (!file) return;
  const errorElement = document.getElementById('profile-error');
  try {
    const dataUrl = await readProfileImage(file);
    const avatarData = document.getElementById('profile-avatar-data');
    avatarData.value = dataUrl;
    avatarData.dataset.changed = 'true';
    updateProfileAvatarPreview(dataUrl);
    errorElement.textContent = '';
  } catch (error) {
    event.currentTarget.value = '';
    errorElement.textContent = error.message;
  }
});
document.getElementById('remove-profile-image').addEventListener('click', () => {
  const avatarData = document.getElementById('profile-avatar-data');
  avatarData.value = '';
  avatarData.dataset.changed = 'true';
  document.getElementById('profile-image-file').value = '';
  updateProfileAvatarPreview('');
});
document.getElementById('auth-button').addEventListener('click', async () => {
  if (!isAuthenticated) {
    openLogin();
    return;
  }
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    await readApiResponse(response);
    isAuthenticated = false;
    viewerCreator = null;
    ownCreatorIds.clear();
    saved.clear();
    savedCreators = [];
    activeConversation = null;
    conversations = [];
    saved = new Set(localSavedCreators.keys());
    document.getElementById('saved-grid').innerHTML = '';
    document.getElementById('profile-form').hidden = true;
    document.getElementById('conversation-list').innerHTML = '';
    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('chat-active').hidden = true;
    document.getElementById('chat-empty').hidden = false;
    updateAuthUi();
    render();
    showToast('You’re signed out.');
  } catch (error) {
    console.error('Could not sign out of Collabify.', error);
    showToast(error.message || 'Could not sign out.');
  }
});
document.getElementById('modal-close').addEventListener('click', closeRegistration);
document.getElementById('show-login').addEventListener('click', openLogin);
document.getElementById('login-close').addEventListener('click', () => {
  document.getElementById('login-modal').hidden = true;
  document.body.style.overflow = '';
});
document.getElementById('show-register').addEventListener('click', () => {
  document.getElementById('login-modal').hidden = true;
  openRegistration();
});
modal.addEventListener('click', event => {
  if (event.target === modal) closeRegistration();
});
document.getElementById('login-modal').addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.hidden = true;
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modal.hidden) closeRegistration();
  if (event.key === 'Escape' && !document.getElementById('login-modal').hidden) {
    document.getElementById('login-modal').hidden = true;
    document.body.style.overflow = '';
  }
  if (event.key === 'Escape' && !document.getElementById('contact-modal').hidden) closeContact();
});
document.getElementById('contact-close').addEventListener('click', closeContact);
document.getElementById('contact-modal').addEventListener('click', event => {
  if (event.target === event.currentTarget) closeContact();
});
document.getElementById('copy-message').addEventListener('click', async () => {
  const message = document.getElementById('contact-message');
  message.focus();
  message.select();
  try {
    await navigator.clipboard.writeText(message.value);
    showToast('Your intro is copied and ready to send.');
  } catch (error) {
    console.error('Could not access the clipboard.', error);
    showToast('Your intro is selected. Press Ctrl+C to copy it.');
  }
});
document.getElementById('log-intro').addEventListener('click', async event => {
  const button = event.currentTarget;
  if (!activeContact || button.disabled) return;
  if (!isAuthenticated) {
    pendingContactId = activeContact.creator.id;
    closeContact();
    openLogin();
    return;
  }
  button.disabled = true;
  try {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientCreatorId: activeContact.creator.id,
        message: document.getElementById('contact-message').value
      })
    });
    const result = await readApiResponse(response);
    closeContact();
    openView('messages');
    await refreshConversations();
    const conversation = conversations.find(item => item.id === result.conversationId);
    if (conversation) await openConversation(conversation);
    showToast('Your message was sent.');
  } catch (error) {
    console.error('Could not start this Collabify conversation.', error);
    showToast(error.message || 'Could not send this message.');
  } finally {
    button.disabled = false;
  }
});
document.getElementById('mobile-menu').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('explore-button').addEventListener('click', () => {
  document.getElementById('matches').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('chat-form').addEventListener('submit', sendChatMessage);
document.getElementById('conversation-list').addEventListener('click', event => {
  const button = event.target.closest('[data-conversation]');
  if (!button) return;
  const conversation = conversations.find(item => item.id === button.dataset.conversation);
  if (conversation) openConversation(conversation);
});
document.getElementById('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const errorElement = document.getElementById('login-error');
  const button = form.querySelector('button[type="submit"]');
  errorElement.textContent = '';
  button.disabled = true;
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result = await readApiResponse(response);
    await setAuthenticatedCreator(result.creator);
    form.reset();
    document.getElementById('login-modal').hidden = true;
    document.body.style.overflow = '';
    showToast(`Welcome back, ${result.creator.name}.`);
    if (pendingContactId) {
      const contactId = pendingContactId;
      pendingContactId = '';
      openContact(contactId);
    }
  } catch (error) {
    console.error('Could not sign in to Collabify.', error);
    errorElement.textContent = error.message || 'Could not sign in.';
  } finally {
    button.disabled = false;
  }
});

document.getElementById('profile-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const errorElement = document.getElementById('profile-error');
  const button = form.querySelector('button[type="submit"]');
  const platforms = [...form.querySelectorAll('input[name="platforms"]:checked')]
    .map(input => input.value.toLowerCase());
  const profileLinks = [...form.querySelectorAll('.profile-link-row')].map(row => ({
    label: row.querySelector('.profile-link-label').value.trim(),
    url: row.querySelector('.profile-link-url').value.trim()
  })).filter(link => link.label || link.url);
  if (profileLinks.some(link => !link.label || !link.url)) {
    errorElement.textContent = 'Complete both the name and URL for each profile link, or remove the empty row.';
    return;
  }
  const selectedPlatforms = platforms.length
    ? platforms
    : (viewerCreator.platforms || []).map(platform => platform.toLowerCase());
  if (!selectedPlatforms.length) {
    errorElement.textContent = 'Choose a creator platform, or add a supported social account link.';
    return;
  }
  const profile = {
    name: form.elements.name.value.trim(),
    handle: form.elements.handle.value.trim(),
    niche: form.elements.niche.value,
    audience: form.elements.audience.value,
    style: form.elements.style.value,
    bio: form.elements.bio.value.trim(),
    platforms: selectedPlatforms,
    profileLinks
  };
  const avatarData = document.getElementById('profile-avatar-data');
  if (avatarData.dataset.changed === 'true') {
    profile.avatarDataUrl = avatarData.value || null;
  }
  errorElement.textContent = '';
  button.disabled = true;
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const result = await readApiResponse(response);
    viewerCreator = { ...normalizeCreator(result.creator), colors: viewerCreator.colors || ['#d57f5d', '#efb895'] };
    const creatorIndex = creators.findIndex(creator => creator.id === viewerCreator.id);
    if (creatorIndex >= 0) creators[creatorIndex] = viewerCreator;
    avatarData.dataset.changed = 'false';
    avatarData.value = '';
    document.getElementById('profile-image-file').value = '';
    document.getElementById('profile-form').hidden = true;
    document.getElementById('profile-card').hidden = false;
    document.getElementById('edit-profile-button').hidden = false;
    updateAuthUi();
    render();
    showToast('Your creator profile is updated.');
  } catch (error) {
    console.error('Could not update your creator profile.', error);
    errorElement.textContent = error.message || 'Could not save your profile.';
  } finally {
    button.disabled = false;
  }
});

creatorForm.addEventListener('submit', event => {
  event.preventDefault();
  formError.textContent = '';
  const formData = new FormData(creatorForm);
  const platforms = formData.getAll('platforms').map(String).filter(platform => platformMap[platform]);
  if (platforms.length === 0) {
    formError.textContent = 'Choose at least one platform so creators can find you.';
    return;
  }
  const name = String(formData.get('name') || '').trim();
  const handle = String(formData.get('handle') || '').trim();
  const audience = String(formData.get('audience') || '');
  const creatorInput = {
    name,
    handle: handle.startsWith('@') ? handle : `@${handle}`,
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || ''),
    niche: String(formData.get('niche') || ''),
    audience,
    style: String(formData.get('style') || ''),
    platforms: platforms.map(platform => platform.toLowerCase()),
    bio: String(formData.get('bio') || '').trim(),
  };
  const submitButton = creatorForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creatorInput)
  }).then(async response => {
    const result = await readApiResponse(response);
    const creator = { ...result.creator, colors: ['#d57f5d', '#efb895'], messageable: true };
    creators.push(creator);
    await setAuthenticatedCreator(creator);
    closeRegistration();
    creatorForm.reset();
    resetFilters();
    showToast('You’re in! Your account and creator profile are ready.');
    await Promise.all([refreshStats(), fetchDirectory()]);
  }).catch(error => {
    console.error('Could not register your Collabify profile.', error);
    formError.textContent = error.message || 'The server could not save your profile. Please try again.';
  }).finally(() => {
    submitButton.disabled = false;
  });
});
