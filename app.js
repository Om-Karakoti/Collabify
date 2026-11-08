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
const SAVED_STORAGE_KEY = 'collabify-saved-v1';
const VIEWER_STORAGE_KEY = 'collabify-viewer-v1';
const INTRODUCTIONS_STORAGE_KEY = 'collabify-introductions-v1';
const PAGE_SIZE = 24;
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
let viewerCreator = loadViewer();
const ownCreatorIds = new Set(viewerCreator && viewerCreator.id ? [viewerCreator.id] : []);
let serverCreatorTotal = 0;
let serverOffset = 0;
let stats = null;
let activeContact = null;
let requestSequence = 0;
let statsErrorShown = false;
let serverError = false;
let saved = new Set(loadSaved());
let loggedIntroductions = new Set(loadLoggedIntroductions());
let toastTimer;

function loadViewer() {
  try {
    const stored = JSON.parse(localStorage.getItem(VIEWER_STORAGE_KEY) || 'null');
    return stored && typeof stored.id === 'string' && typeof stored.name === 'string' ? stored : null;
  } catch (error) {
    console.error('Could not load the saved Collabify profile.', error);
    return null;
  }
}

function loadSaved() {
  try {
    const stored = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(id => typeof id === 'string') : [];
  } catch (error) {
    console.error('Could not load saved Collabify creators.', error);
    return [];
  }
}

function loadLoggedIntroductions() {
  try {
    const stored = JSON.parse(localStorage.getItem(INTRODUCTIONS_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? new Set(stored.filter(id => typeof id === 'string')) : new Set();
  } catch (error) {
    console.error('Could not load the saved introduction history.', error);
    return new Set();
  }
}

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
  const platforms = creator.platforms.map(platform => platformIcon(platform)).join('');
  const tags = [creator.niche, creator.style].filter(Boolean).map(tag => `<span class="creator-tag">${escapeHtml(tag)}</span>`).join('');
  return `<article class="creator-card" style="animation-delay:${Math.min(index * 35, 245)}ms">
    <div class="creator-top">
      <span class="creator-avatar" style="background:linear-gradient(140deg,${escapeHtml(colors[0])},${escapeHtml(colors[1])})">${initial}</span>
      <div class="creator-identity"><div class="creator-name-line"><span class="creator-name">${escapeHtml(creator.name)}</span><span class="verified" aria-label="Creator profile">✦</span></div><span class="creator-handle">${escapeHtml(creator.handle)}</span></div>
      <button class="save-button ${saved.has(id) ? 'saved' : ''}" data-save="${escapeHtml(id)}" type="button" aria-label="${saved.has(id) ? 'Remove from saved creators' : 'Save creator'}" aria-pressed="${saved.has(id)}">${saved.has(id) ? '♥' : '♡'}</button>
    </div>
    <div class="match-label"><span>✦</span> ${getMatchScore(creator)}% match</div>
    <p class="creator-bio">${escapeHtml(creator.bio)}</p>
    <div class="creator-tags">${tags}</div>
    <div class="creator-footer"><div class="creator-stats"><span class="creator-followers">${formatNumber(creator.followers)} <span style="font:400 8px 'DM Sans',sans-serif;color:#99938d">followers</span></span><span class="creator-platform-label">${creator.platforms.length} ${creator.platforms.length === 1 ? 'platform' : 'platforms'}</span></div><div class="creator-platforms" aria-label="${creator.platforms.map(escapeHtml).join(', ')}">${platforms}</div><button class="contact-button" data-contact="${escapeHtml(id)}" type="button">Say hello ↗</button></div>
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
      ...creator,
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
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  formError.textContent = '';
  window.setTimeout(() => creatorForm.elements.name.focus(), 50);
}

function closeRegistration() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

function openContact(id) {
  const creator = creators.find(item => (item.id || `sample-${starterCreators.indexOf(item)}`) === id);
  if (!creator) {
    showToast('This creator profile is no longer available.');
    return;
  }
  const firstName = creator.name.trim().split(/\s+/)[0];
  activeContact = creator.id ? { creator, requestKey: crypto.randomUUID() } : null;
  const myNiche = viewerCreator && viewerCreator.niche ? viewerCreator.niche.toLowerCase() : 'creative';
  const myPlatforms = viewerCreator && viewerCreator.platforms.length
    ? ` on ${viewerCreator.platforms.join(' and ')}`
    : '';
  document.getElementById('contact-name').textContent = creator.name;
  document.getElementById('contact-handle').textContent = creator.handle;
  document.getElementById('contact-description').textContent = `Reach out to ${firstName} and start a conversation about making something together.`;
  document.getElementById('contact-platforms').innerHTML = creator.platforms
    .map(platform => `<span class="contact-platform-pill">${platformIcon(platform)}${escapeHtml(platform)}</span>`).join('');
  document.getElementById('contact-message').value = `Hi ${firstName}! I love your ${creator.niche.toLowerCase()} content. I'm a ${myNiche} creator${myPlatforms}, and I’d love to explore a collab together. Would you be interested?`;
  const logButton = document.getElementById('log-intro');
  logButton.disabled = !activeContact || loggedIntroductions.has(creator.id);
  logButton.textContent = loggedIntroductions.has(creator.id)
    ? 'Introduction already recorded'
    : activeContact ? 'I sent this intro' : 'Demo profile — not recordable';
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

fillSelect(nicheFilter, NICHES, 'All niches');
fillSelect(styleFilter, STYLES, 'Any style');
fillSelect(document.getElementById('form-niche'), NICHES, 'Choose your niche');
fillSelect(document.getElementById('form-style'), STYLES, 'Choose your style');
document.getElementById('form-platforms').innerHTML = PLATFORM_INFO.map(platform =>
  `<label class="platform-checkbox">${platformIcon(platform.id)}<span>${platform.id}</span><input type="checkbox" name="platforms" value="${platform.id}" /></label>`
).join('');

render();
renderStats();
fetchDirectory();
refreshStats();
window.setInterval(() => {
  if (document.visibilityState === 'visible') refreshStats();
}, 15000);
window.setInterval(() => {
  if (document.visibilityState === 'visible') fetchDirectory();
}, 30000);

document.addEventListener('click', event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const platformButton = target.closest('[data-platform]');
  if (platformButton) {
    setPlatform(platformButton.getAttribute('data-platform') || '');
    return;
  }
  const saveButton = target.closest('[data-save]');
  if (saveButton) {
    const id = saveButton.getAttribute('data-save');
    if (saved.has(id)) saved.delete(id);
    else saved.add(id);
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify([...saved]));
    } catch (error) {
      console.error('Could not save your Collabify creators.', error);
      showToast('Could not save this creator on your device.');
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
document.getElementById('top-avatar').addEventListener('click', openRegistration);
document.getElementById('profile-button').addEventListener('click', openRegistration);
document.getElementById('tip-register').addEventListener('click', openRegistration);
document.getElementById('modal-close').addEventListener('click', closeRegistration);
modal.addEventListener('click', event => {
  if (event.target === modal) closeRegistration();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modal.hidden) closeRegistration();
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
  button.disabled = true;
  try {
    const response = await fetch('/api/collaborations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientCreatorId: activeContact.creator.id,
        requestKey: activeContact.requestKey
      })
    });
    const result = await readApiResponse(response);
    loggedIntroductions.add(activeContact.creator.id);
    try {
      localStorage.setItem(INTRODUCTIONS_STORAGE_KEY, JSON.stringify([...loggedIntroductions]));
    } catch (error) {
      console.error('Could not save your introduction history.', error);
    }
    button.textContent = 'Introduction recorded';
    showToast('Introduction recorded. Thanks for telling us!');
    await refreshStats();
  } catch (error) {
    console.error('Could not record the collaboration introduction.', error);
    button.disabled = false;
    showToast(error.message || 'Could not record this introduction.');
  }
});
document.getElementById('mobile-menu').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('explore-button').addEventListener('click', () => {
  document.getElementById('matches').scrollIntoView({ behavior: 'smooth' });
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
    niche: String(formData.get('niche') || ''),
    audience,
    style: String(formData.get('style') || ''),
    platforms: platforms.map(platform => platform.toLowerCase()),
    bio: String(formData.get('bio') || '').trim(),
  };
  const submitButton = creatorForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  fetch('/api/creators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creatorInput)
  }).then(async response => {
    const result = await readApiResponse(response);
    const creator = { ...result.creator, colors: ['#d57f5d', '#efb895'] };
    creators.push(creator);
    viewerCreator = creator;
    ownCreatorIds.add(creator.id);
    try {
      localStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(creator));
    } catch (error) {
      console.error('Could not save the active creator profile on this device.', error);
      showToast('Your profile was registered; this browser could not remember your active profile.');
    }
    closeRegistration();
    creatorForm.reset();
    resetFilters();
    showToast('You’re in! Your creator profile is in the community directory.');
    await Promise.all([refreshStats(), fetchDirectory()]);
  }).catch(error => {
    console.error('Could not register your Collabify profile.', error);
    formError.textContent = error.message || 'The server could not save your profile. Please try again.';
  }).finally(() => {
    submitButton.disabled = false;
  });
});
