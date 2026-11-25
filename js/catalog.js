/**
 * Pure catalog, artist indexing, routing, formatting, and artwork helpers for GTA VI fm.
 * Zero DOM dependencies so all logic can be unit-tested with node:test.
 */

import { getPodcastLocalizedContent, getStationLocalizedContent } from './i18n/index.js';

const ALBUM_PALETTES = [
  ['#ff4fa3', '#0a0a0e', '#d4d4dc'],
  ['#db2777', '#0c0c12', '#f4f4f8'],
  ['#ff7ab8', '#0e0e14', '#a1a1aa'],
  ['#a1a1aa', '#09090d', '#ff4fa3'],
  ['#71717a', '#0a0a0e', '#ff7ab8'],
  ['#e11d74', '#08080c', '#e4e4ec'],
  ['#52525b', '#0a0a0e', '#ff4fa3'],
  ['#ff4fa3', '#111116', '#ffffff'],
];

const ATOMIC_ARTISTS = [
  'Earth, Wind & Fire',
  'Tom Petty & The Heartbreakers',
  'Tom Petty and the Heartbreakers',
  'Huey Lewis and the News',
  'Huey Lewis & The News',
  'Gloria Estefan & Miami Sound Machine',
  'Bruce Hornsby and the Range',
  'Lee Perry & The Upsetters',
  'Echo & the Bunnymen',
  'Orchestral Manoeuvres in the Dark',
  'Gilles Peterson\'s Havana Cultura Band',
  'El Gran Combo de Puerto Rico',
  'King Gizzard & the Lizard Wizard',
  'King Gizzard & The Lizard Wizard',
  'Flotsam and Jetsam',
  'Ashford & Simpson',
  'Captain & Tennille',
  'Hall & Oates',
  'Tony! Toni! Toné!',
  'Tube & Berger',
  'Above & Beyond',
  'Bob Marley & The Wailers',
  'Tegan and Sara',
  'Sly & The Family Stone',
  'Kool & The Gang',
  'Tyler, The Creator',
  'A Boogie wit da Hoodie',
  'Guns N\' Roses',
  'Florence + The Machine',
  'Portugal. The Man',
  'Of Monsters and Men',
  'Luis Antonio Diaz y Su Sol Banda',
  'Hansel y Raúl',
  'Sam Price Trio',
  'Pat Thomas & Ebo Taylor',
  'Cajmere',
  'LuuDaDeejay',
];

const ATOMIC_PLACEHOLDERS = ATOMIC_ARTISTS.map((name, idx) => ({
  name,
  token: `__ATOMIC_ARTIST_${idx}__`,
  lower: name.toLowerCase(),
}));

const CANONICAL_ARTIST_NAMES = new Map([
  ['charli xcx', 'Charli xcx'],
  ['ca7riel', 'CA7RIEL'],
  ['jennie', 'JENNIE'],
  ['lisa', 'LISA'],
  ['rosalia', 'Rosalía'],
  ['sexyy redd', 'Sexyy Red'],
  ['sexyy red', 'Sexyy Red'],
  ['tool', 'TOOL'],
  ['fejao', 'Fejão'],
  ['real dimez', 'Real Dimez'],
  ['the heartbreakers', 'Tom Petty & The Heartbreakers'],
  ['dâm-funk', 'DāM-FunK'],
  ['dam-funk', 'DāM-FunK'],
  ['dj steve j', 'DJ Stevie J'],
  ['dj stevie j', 'DJ Stevie J'],
  ['pawsa', 'PAWSA'],
  ['kettama', 'KETTAMA'],
  ['anotr', 'ANOTR'],
  ['sg lewis', 'SG Lewis'],
  ['fred again..', 'Fred again..'],
  ['bob moses', 'Bob Moses'],
  ['robyn', 'Robyn'],
  ['tove lo', 'Tove Lo'],
  ['bad bunny', 'Bad Bunny'],
  ['domi', 'DOMi & JD BECK'],
  ['jd beck', 'DOMi & JD BECK'],
]);

export function hashString(input) {
  let h = 2166136261;
  const str = String(input || '');
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/') && !url.startsWith('//')) {
    return `.${url}`;
  }
  return url;
}

/**
 * Splits a track artist string into clean individual artist/group credits
 * without breaking canonical band names like "Earth, Wind & Fire".
 */
export function extractArtists(artistString) {
  let working = String(artistString || '').trim();
  if (!working) return [];

  for (const entry of ATOMIC_PLACEHOLDERS) {
    const escaped = entry.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    working = working.replace(new RegExp(escaped, 'gi'), entry.token);
  }

  // Strip surrounding parentheses around "feat." credits so they split cleanly
  working = working.replace(/\(([^)]*(?:feat\.?|ft\.?|featuring|with)[^)]*)\)/gi, ', $1');

  const parts = working
    .split(/\s*(?:,|&|\/|\bx\b|\bfeat\b\.?|\bft\b\.?|\bfeaturing\b|\band\b|\bwith\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const result = [];
  const seen = new Set();

  for (let part of parts) {
    part = part.replace(/^[,().\s]+|[,()\s]+$/g, '').trim();
    if (!part) continue;

    for (const entry of ATOMIC_PLACEHOLDERS) {
      if (part.includes(entry.token)) {
        part = part.replace(entry.token, entry.name);
      }
    }

    const canon = CANONICAL_ARTIST_NAMES.get(normalizeText(part)) || part;
    const key = normalizeText(canon);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(canon);
  }

  return result;
}

export function filterStations(stations, { category = 'all', query = '' } = {}) {
  const q = normalizeText(query);
  return stations.filter((station) => {
    if (category === 'podcast') {
      if (!station.podcast) return false;
    } else if (category !== 'all' && station.category !== category) {
      return false;
    }

    if (!q) {
      return true;
    }

    const locStation = getStationLocalizedContent(station);
    const locPodcast = station.podcast ? getPodcastLocalizedContent(station) : null;

    const podcastText = locPodcast
      ? [
          locPodcast.programName,
          locPodcast.format,
          locPodcast.style,
          ...(locPodcast.hosts || []).map((h) => `${h.name} ${h.role || ''}`),
          ...(locPodcast.topics || []),
          ...(locPodcast.segments || []).map((seg) => `${seg.title} ${seg.host || ''} ${seg.description || ''}`),
        ]
      : [];

    const haystack = [
      station.name,
      station.genre,
      locStation.genre,
      station.hosts,
      locStation.hosts,
      station.description,
      locStation.description,
      ...podcastText,
      ...station.tracks.map((t) => `${t.title} ${t.artist} ${t.version || ''}`),
    ]
      .map(normalizeText)
      .join(' ');
    return haystack.includes(q);
  });
}

export function filterTracks(tracks, query = '') {
  const q = normalizeText(query);
  if (!q) {
    return tracks;
  }
  return tracks.filter((track) => {
    const text = normalizeText(`${track.title} ${track.artist} ${track.version || ''} ${track.year || ''}`);
    return text.includes(q);
  });
}

/**
 * Flattens all music tracks across stations into a unified searchable song catalog.
 */
export function buildAllSongsIndex(stations) {
  const entries = [];
  for (const station of stations) {
    if (!Array.isArray(station.tracks) || station.tracks.length === 0) continue;
    for (const track of station.tracks) {
      entries.push({
        track,
        station,
        stationId: station.id,
        stationName: station.name,
        stationAccent: station.accent || '#ff4fa3',
      });
    }
  }
  return entries;
}

export function filterAllSongs(songEntries, { query = '', stationId = 'all' } = {}) {
  const q = normalizeText(query);
  return songEntries.filter((entry) => {
    if (stationId !== 'all' && entry.stationId !== stationId) {
      return false;
    }
    if (!q) return true;
    const locStation = entry.station ? getStationLocalizedContent(entry.station) : null;
    const text = normalizeText(
      `${entry.track.title} ${entry.track.artist} ${entry.track.version || ''} ${entry.track.year || ''} ${entry.stationName} ${entry.station?.genre || ''} ${locStation?.genre || ''}`
    );
    return text.includes(q);
  });
}

/**
 * Aggregates every artist across the entire catalog with their tracks & stations.
 */
export function buildArtistsIndex(stations) {
  const map = new Map();

  for (const station of stations) {
    if (!Array.isArray(station.tracks) || station.tracks.length === 0) continue;

    for (const track of station.tracks) {
      const artists = extractArtists(track.artist);
      for (const artistName of artists) {
        const key = normalizeText(artistName);
        if (!key) continue;

        if (!map.has(key)) {
          map.set(key, {
            slug: slugify(artistName),
            name: artistName,
            tracks: [],
            stationIds: [],
            stationNames: [],
            cover: null,
            stationAccent: station.accent || '#ff4fa3',
            _seenTrackKeys: new Set(),
            _seenStationIds: new Set(),
          });
        }

        const bucket = map.get(key);
        const trackInstanceKey = `${station.id}::${track.id}`;
        if (!bucket._seenTrackKeys.has(trackInstanceKey)) {
          bucket._seenTrackKeys.add(trackInstanceKey);
          bucket.tracks.push({
            track,
            station,
            stationId: station.id,
            stationName: station.name,
            stationAccent: station.accent || '#ff4fa3',
          });
        }

        if (!bucket._seenStationIds.has(station.id)) {
          bucket._seenStationIds.add(station.id);
          bucket.stationIds.push(station.id);
          bucket.stationNames.push(station.name);
        }

        if (!bucket.cover && track.cover) {
          bucket.cover = track.cover;
          bucket.stationAccent = station.accent || bucket.stationAccent;
        }
      }
    }
  }

  return Array.from(map.values())
    .map(({ _seenTrackKeys, _seenStationIds, ...clean }) => ({
      ...clean,
      trackCount: clean.tracks.length,
    }))
    .sort((a, b) => b.trackCount - a.trackCount || a.name.localeCompare(b.name));
}

export function filterArtists(artists, { query = '', stationId = 'all' } = {}) {
  const q = normalizeText(query);
  return artists.filter((artist) => {
    if (stationId !== 'all' && !artist.stationIds.includes(stationId)) {
      return false;
    }
    if (!q) return true;
    const text = normalizeText(
      `${artist.name} ${artist.stationNames.join(' ')} ${artist.tracks.map((t) => `${t.track.title} ${t.track.version || ''}`).join(' ')}`
    );
    return text.includes(q);
  });
}

export function computeCatalogStats(stations) {
  const stationCount = stations.filter((s) => s.category !== 'soundtrack' && !s.podcast).length;
  const podcastCount = stations.filter((s) => Boolean(s.podcast)).length;
  const collectionCount = stations.filter((s) => s.category === 'soundtrack').length;
  const totalTracks = stations.reduce((sum, s) => sum + s.tracks.length, 0);
  const playableTracks = stations.reduce(
    (sum, s) =>
      sum + s.tracks.filter((t) => Boolean(t.audio || t.spotifyPreviewUrl || t.youtubeId)).length,
    0
  );
  const artistCount = buildArtistsIndex(stations).length;
  return {
    totalEntries: stations.length,
    stationCount,
    podcastCount,
    collectionCount,
    totalTracks,
    playableTracks,
    artistCount,
  };
}

export function parseRouteHash(hash) {
  const cleaned = String(hash || '').replace(/^#/, '').trim();
  if (!cleaned || cleaned === 'home' || cleaned === 'songs') {
    return { view: 'songs', stationId: null, artistSlug: null };
  }
  if (cleaned === 'stations') {
    return { view: 'stations', stationId: null, artistSlug: null };
  }
  if (cleaned === 'artists') {
    return { view: 'artists', stationId: null, artistSlug: null };
  }
  if (cleaned.startsWith('station/')) {
    const id = decodeURIComponent(cleaned.slice('station/'.length)).trim();
    if (id) {
      return { view: 'station', stationId: id, artistSlug: null };
    }
  }
  if (cleaned.startsWith('artist/')) {
    const slug = decodeURIComponent(cleaned.slice('artist/'.length)).trim();
    if (slug) {
      return { view: 'artist', stationId: null, artistSlug: slug };
    }
  }
  return { view: 'songs', stationId: null, artistSlug: null };
}

export function buildStationHash(stationId) {
  return `#station/${encodeURIComponent(stationId)}`;
}

export function buildArtistHash(artistSlug) {
  return `#artist/${encodeURIComponent(artistSlug)}`;
}

export function getAdjacentStationIds(stations, currentId) {
  const idx = stations.findIndex((s) => s.id === currentId);
  if (idx === -1 || stations.length === 0) {
    return { prevId: null, nextId: null };
  }
  const prevIdx = (idx - 1 + stations.length) % stations.length;
  const nextIdx = (idx + 1) % stations.length;
  return {
    prevId: stations[prevIdx].id,
    nextId: stations[nextIdx].id,
  };
}

/**
 * Generates a deterministic local SVG album cover data URI for tracks without a
 * dedicated cover URL.
 */
export function getTrackCoverSrc(track, stationAccent = '#ff4d8d') {
  if (track.cover) {
    return track.cover;
  }
  const seed = hashString(`${track.id}-${track.title}-${track.artist}`);
  const palette = ALBUM_PALETTES[seed % ALBUM_PALETTES.length];
  const primary = stationAccent || palette[0];
  const bg = palette[1];
  const secondary = palette[2];
  const angle = (seed % 4) * 45 + 25;
  const cx = 36 + (seed % 48);
  const cy = 32 + ((seed >> 4) % 48);
  const initials = String(track.artist || track.title || 'VI')
    .replace(/[^A-Za-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || 'VI';

  const variant = seed % 4;
  let motif = '';
  if (variant === 0) {
    motif = `<circle cx="${cx}" cy="${cy}" r="54" fill="${secondary}" fill-opacity="0.26"/>
      <circle cx="80" cy="80" r="56" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5"/>
      <circle cx="80" cy="80" r="18" fill="#0c0d1b" fill-opacity="0.48" stroke="#ffffff" stroke-opacity="0.32" stroke-width="1.5"/>`;
  } else if (variant === 1) {
    motif = `<rect x="0" y="96" width="160" height="64" fill="#0c0d1b" fill-opacity="0.36"/>
      <line x1="16" y1="78" x2="144" y2="78" stroke="#ffffff" stroke-opacity="0.32" stroke-width="2"/>
      <line x1="16" y1="86" x2="112" y2="86" stroke="${secondary}" stroke-opacity="0.55" stroke-width="2"/>
      <circle cx="118" cy="42" r="24" fill="${secondary}" fill-opacity="0.35"/>`;
  } else if (variant === 2) {
    motif = `<polygon points="0,160 160,40 160,160" fill="#0c0d1b" fill-opacity="0.35"/>
      <polygon points="24,24 94,24 59,88" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="2"/>
      <circle cx="114" cy="112" r="20" fill="${primary}" fill-opacity="0.45"/>`;
  } else {
    motif = `<rect x="20" y="20" width="54" height="54" rx="8" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="84" y="20" width="56" height="54" rx="27" fill="${secondary}" fill-opacity="0.3"/>
      <rect x="20" y="84" width="120" height="22" rx="4" fill="#0c0d1b" fill-opacity="0.34"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="65%" stop-color="${primary}" stop-opacity="0.88"/>
        <stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" fill="url(#g)"/>
    ${motif}
    <text x="16" y="142" fill="#ffffff" fill-opacity="0.92" font-family="Oswald, sans-serif" font-size="22" font-weight="700" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an inline SVG emblem tailored to each station's genre & identity.
 */
export function getStationLogoSvg(station, scope = 'card') {
  const accent = station.accent || '#ff4fa3';
  const secondary = station.secondaryAccent || '#d4d4dc';
  const emblem = station.emblem || 'wave';
  const gradId = `lg-${scope}-${station.id}`;

  const icons = {
    bolt: `<path d="M27 6L12 25h10l-3 15 17-20H26l1-14z" fill="url(#${gradId})"/>`,
    heart: `<path d="M24 39s-13-8.4-13-17.8C11 15.6 15.2 12 20 12c2.9 0 4 1.6 4 1.6S25.1 12 28 12c4.8 0 9 3.6 9 9.2C37 30.6 24 39 24 39z" fill="none" stroke="url(#${gradId})" stroke-width="2.6" stroke-linejoin="round"/><path d="M12 23h7l2.5-4.5 3.5 9 2.5-4.5H36" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    skull: `<path d="M11 32V16l7-7 6 5 6-5 7 7v16l-6 5H17l-6-5z" fill="none" stroke="url(#${gradId})" stroke-width="2.5"/><path d="M17 20l4 4m6-4l-4 4m-3 7h8" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>`,
    guitar: `<path d="M9 12h7l8 18 8-18h7L27 38h-6L9 12z" fill="url(#${gradId})"/><circle cx="24" cy="14" r="3" fill="#ffffff"/>`,
    palm: `<path d="M24 39V22m0 0c-4-7-11-9-16-6 4 0 8 2 11 5m5 1c4-7 11-9 16-6-4 0-8 2-11 5m-5-1c-1-6-5-11-10-12m10 12c1-6 5-11 10-12" stroke="url(#${gradId})" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="39" x2="38" y2="39" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" stroke-linecap="round"/>`,
    sun: `<circle cx="24" cy="24" r="9" fill="url(#${gradId})"/><path d="M8 31h32M12 36h24M24 7v4M24 37v0M9 17l3 2M39 17l-3 2" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>`,
    crown: `<path d="M9 34l3-16 8 7 4-11 4 11 8-7 3 16H9z" fill="none" stroke="url(#${gradId})" stroke-width="2.5" stroke-linejoin="round"/><line x1="10" y1="38" x2="38" y2="38" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>`,
    vinyl: `<circle cx="24" cy="24" r="15" fill="none" stroke="url(#${gradId})" stroke-width="2.6"/><circle cx="24" cy="24" r="9" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="1.5"/><circle cx="24" cy="24" r="3.2" fill="#ffffff"/>`,
    globe: `<circle cx="24" cy="24" r="14" fill="none" stroke="url(#${gradId})" stroke-width="2.4"/><ellipse cx="24" cy="24" rx="6.5" ry="14" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.6"/><line x1="10" y1="24" x2="38" y2="24" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.6"/>`,
    prism: `<polygon points="24,9 39,36 9,36" fill="none" stroke="url(#${gradId})" stroke-width="2.5" stroke-linejoin="round"/><line x1="6" y1="25" x2="18" y2="23" stroke="#ffffff" stroke-width="2"/><line x1="29" y1="22" x2="42" y2="18" stroke="${accent}" stroke-width="2"/><line x1="30" y1="26" x2="42" y2="28" stroke="${secondary}" stroke-width="2"/>`,
    classical: `<path d="M14 36V15l20-4v21" fill="none" stroke="url(#${gradId})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="36" r="3.5" fill="#ffffff"/><circle cx="31.5" cy="32" r="3.5" fill="url(#${gradId})"/>`,
    vault: `<rect x="10" y="10" width="28" height="28" rx="6" fill="none" stroke="url(#${gradId})" stroke-width="2.4"/><circle cx="24" cy="24" r="6.5" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M24 17.5v3M24 27.5v3M17.5 24h3M27.5 24h3" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`,
    mic: `<rect x="19" y="9" width="10" height="17" rx="5" fill="none" stroke="url(#${gradId})" stroke-width="2.5"/><path d="M13 22a11 11 0 0 0 22 0M24 33v6M18 39h12" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>`,
    flame: `<path d="M25 8c2 5 7 8 7 15a8 8 0 1 1-16 0c0-3.5 1.7-6.8 4-9 0 3 2 4.5 3.5 4.5 0-4 1-7.5 1.5-10.5z" fill="none" stroke="url(#${gradId})" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 27c1.6 0 3 1.3 3 3a3 3 0 1 1-6 0c0-1.7 1.4-3 3-3z" fill="#ffffff"/>`,
    tape: `<rect x="8" y="13" width="32" height="22" rx="4" fill="none" stroke="url(#${gradId})" stroke-width="2.4"/><circle cx="17" cy="24" r="3.5" fill="#ffffff"/><circle cx="31" cy="24" r="3.5" fill="url(#${gradId})"/><path d="M17 20.5h14" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.6"/>`,
    wave: `<path d="M7 24c3-7 6-7 9 0s6 7 9 0 6-7 9 0 5 6 7 0" fill="none" stroke="url(#${gradId})" stroke-width="2.8" stroke-linecap="round"/>`,
    vi: `<path d="M11 13l7.5 22h3.2L29 13h-4.2l-4.7 14.8L15.4 13H11zm21.5 0H37v22h-4.5V13z" fill="url(#${gradId})"/>`,
  };

  return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="${gradId}" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop stop-color="${accent}"/>
        <stop offset="1" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    ${icons[emblem] || icons.wave}
  </svg>`;
}
