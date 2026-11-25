import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { STATIONS } from './data.js';
import {
  buildAllSongsIndex,
  buildArtistHash,
  buildArtistsIndex,
  buildStationHash,
  computeCatalogStats,
  extractArtists,
  filterAllSongs,
  filterArtists,
  filterStations,
  filterTracks,
  formatTime,
  getAdjacentStationIds,
  getTrackCoverSrc,
  parseRouteHash,
  resolveAssetUrl,
} from './catalog.js';
import { resolveTrackCover } from './covers.js';
import {
  buildYouTubeWatchUrl,
  extractYouTubeId,
  resolveTrackAudioSource,
} from './audio-sources.js';
import { scoreSpotifyTrackMatch } from './spotify.js';
import { computeNextPlayerState } from './player.js';
import {
  LANGUAGE_STORAGE_KEY,
  detectDeviceLocale,
  getPodcastLocalizedContent,
  getStationLocalizedContent,
  normalizeLocaleTag,
  resolveInitialLocale,
  saveLocalePreference,
  setLocale,
  t,
} from './i18n/index.js';
import { en } from './i18n/en.js';
import { ptBR } from './i18n/pt-BR.js';

test('HTML and catalog exclude AI background images, landing page, and Tier List Maker', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  assert.equal(html.includes('/assets/images/stations/'), false, 'index.html must not reference AI background images');
  assert.equal(html.includes('./assets/aistudio/image_1173f189.png'), true, 'index.html must use image_1173f189.png as main icon');
  assert.equal(
    fs.existsSync(path.resolve(process.cwd(), 'public/assets/aistudio/image_1173f189.png')),
    true,
    'public/assets/aistudio/image_1173f189.png must exist on disk'
  );
  assert.equal(html.includes('<span class="brand__text">gta6radio</span>'), true);
  assert.equal(
    fs.existsSync(path.resolve(process.cwd(), 'public/assets/fonts/pricedown-bl.woff')),
    true,
    'public/assets/fonts/pricedown-bl.woff must exist on disk'
  );
  assert.equal(html.includes('id="explorer-heading"'), false, 'index.html must not contain explorer heading');
  assert.equal(html.includes('Vice City Radio Explorer'), false, 'index.html must not contain Vice City Radio Explorer title');
  assert.equal(html.includes('data-scope-tab'), false, 'index.html must not contain duplicate scope tabs');
  assert.equal(html.includes('made by Denricol'), true);
  assert.equal(html.includes('https://github.com/denricol'), true);
  assert.equal(html.includes('https://dodo-desk.vercel.app/'), true);
  assert.equal(html.includes('<html lang="en">'), true);
  assert.equal(html.includes('id="home-view"'), false, 'index.html must not contain #home-view landing page');
  assert.equal(html.includes('id="tier-list-view"'), false, 'index.html must not contain Tier List Maker');
  assert.equal(html.includes('id="songs-view"'), true);
  assert.equal(html.includes('id="stations-view"'), true);
  assert.equal(html.includes('id="artists-view"'), true);
  assert.equal(html.includes('id="podcast-detail-section"'), true);

  for (const station of STATIONS) {
    if (station.id === 'gta-6-the-album') {
      assert.equal(station.backdrop, '/assets/aistudio/gta6thealbum_41bd075c.webp');
    } else if (station.id === 'gta-6-original-score') {
      assert.equal(station.backdrop, '/assets/aistudio/JusticeOriginalScore_b1448cb1.webp');
    } else {
      assert.equal(station.backdrop, null, `${station.id} must not use AI-generated backdrop`);
    }
  }
});

test('all official station logos, soundtrack artworks, and SVG fallbacks are uniquely and accurately assigned', () => {
  assert.equal(STATIONS.length, 28);

  const expectedLogoMap = new Map([
    ['flash-fm', '/assets/aistudio/Flash_4015c349.webp'],
    ['vice-city-fm', '/assets/aistudio/ViceCity_81713771.webp'],
    ['emotion-98-3', '/assets/aistudio/Emotion_3235c2ec.webp'],
    ['vcrr', '/assets/aistudio/vcrr_6fc4d5bf.jpg'],
    ['dirty-south-classics', '/assets/aistudio/DirtySouthClassics_437af1e6.webp'],
    ['cocoteo-fm', '/assets/aistudio/Cocotea_d0df1f00.webp'],
    ['radio-la-ola', '/assets/aistudio/laola_2adc6b01.png'],
    ['v-rock', '/assets/aistudio/VRockwebp_f4709930.webp'],
    ['the-chamber-106-6', '/assets/aistudio/TheChamber_99791007.webp'],
    ['honey-fm', '/assets/aistudio/honey_9bc3dc3d.jpeg'],
    ['afrobank-fm', '/assets/aistudio/Afrobank_a952a42b.webp'],
    ['back-country-radio', '/assets/aistudio/BlackCountry_4c52a42b.webp'],
    ['stockyard-fm', '/assets/aistudio/Stockyard_aca43ed6.webp'],
    ['circoloco-records-radio', '/assets/stations/circoloco.svg'],
    ['worldwide-fm', '/assets/aistudio/Worldwide_fbfe311a.webp'],
    ['radio-on-u', '/assets/aistudio/OnU_282ad49d.webp'],
    ['leonida-jazz-radio', '/assets/aistudio/f7b0bcc3cd7354f9_9148a1be.png'],
    ['thrillbilly-mud-club-radio', '/assets/aistudio/thrillibilly_c982a3d7.jpg'],
    ['the-sniper-of-la-perle', '/assets/aistudio/kodakblack_f39fdfbc.jpg'],
    ['the-wipe', '/assets/aistudio/thewipe_a20bb5c4.jpg'],
    ['wktt', '/assets/stations/wktt.png'],
    ['gta-6-the-album', '/assets/aistudio/gta6thealbum_41bd075c.webp'],
    ['gta-6-original-score', '/assets/aistudio/JusticeOriginalScore_b1448cb1.webp'],
  ]);

  const seenLogoFiles = new Set();
  const seenFallbackEmblems = new Set();

  for (const station of STATIONS) {
    if (expectedLogoMap.has(station.id)) {
      const expectedLogo = expectedLogoMap.get(station.id);
      assert.equal(station.logo, expectedLogo, `${station.id} must use ${expectedLogo}`);
      assert.equal(seenLogoFiles.has(station.logo), false, `Duplicate logo path: ${station.logo}`);
      seenLogoFiles.add(station.logo);

      const diskPath = path.resolve(process.cwd(), 'public', station.logo.replace(/^\//, ''));
      assert.equal(fs.existsSync(diskPath), true, `Missing asset on disk: ${diskPath}`);

      if (station.id === 'gta-6-the-album' || station.id === 'gta-6-original-score') {
        assert.equal(station.logoType, 'artwork');
        assert.equal(station.backdrop, expectedLogo);
      } else {
        assert.equal(station.logoType, 'logo');
      }
    } else {
      assert.equal(station.logo || null, null);
      assert.equal(
        seenFallbackEmblems.has(station.emblem),
        false,
        `Duplicate fallback emblem "${station.emblem}" on ${station.id}`
      );
      seenFallbackEmblems.add(station.emblem);
    }
  }

  assert.equal(seenLogoFiles.size, expectedLogoMap.size);
});

test('expanded catalog removes confirmation status, eliminates Track placeholders, and ships 850+ verified tracks', () => {
  assert.equal(STATIONS.length, 28);
  assert.ok(STATIONS.some((s) => s.id === 'thrillbilly-mud-club-radio'));
  assert.ok(STATIONS.some((s) => s.id === 'the-sniper-of-la-perle'));

  const coverSet = new Set();
  let totalTracks = 0;
  let tracksWithCover = 0;
  let tracksWithYouTube = 0;

  for (const station of STATIONS) {
    assert.ok(station.id && station.name && station.description);
    assert.equal('confirmation' in station, false, `${station.name} should not have confirmation status`);
    assert.ok(Array.isArray(station.tracks));

    for (const track of station.tracks) {
      totalTracks += 1;
      assert.ok(track.id && track.title && track.artist);
      assert.equal(/^Track\s+\d+$/i.test(track.title), false, `Placeholder title found: ${track.id}`);
      assert.ok(
        ['official', 'community', 'spotify', 'local', 'none'].includes(track.sourceOrigin),
        `Missing/invalid sourceOrigin on ${track.id}`
      );
      assert.ok(
        ['available', 'unavailable'].includes(track.playbackStatus),
        `Missing/invalid playbackStatus on ${track.id}`
      );
      if (track.cover) {
        tracksWithCover += 1;
        coverSet.add(track.cover);
      }
      if (track.youtubeId) {
        tracksWithYouTube += 1;
        assert.equal(track.playbackStatus, 'available');
        assert.equal(track.youtubeUrl, `https://www.youtube.com/watch?v=${track.youtubeId}`);
      } else {
        assert.equal(track.youtubeUrl, null);
      }
    }
  }

  assert.ok(totalTracks >= 850, `Expected >= 850 tracks, got ${totalTracks}`);
  assert.ok(tracksWithCover >= 700, `Expected >= 700 individual track covers, got ${tracksWithCover}`);
  assert.ok(coverSet.size >= 400, `Expected >= 400 distinct cover URLs, got ${coverSet.size}`);
  assert.ok(tracksWithYouTube >= 800, `Expected >= 800 playable YouTube IDs, got ${tracksWithYouTube}`);
});

test('The Wipe and WKTT ship structured podcast metadata with hosts, segments, and @gta6-radiostation broadcast parts', () => {
  const theWipe = STATIONS.find((s) => s.id === 'the-wipe');
  assert.ok(theWipe && theWipe.podcast);
  assert.equal(theWipe.tracks.length, 0);
  assert.equal(theWipe.podcast.videoId, 'ur_PsGA1D4U');
  assert.ok(theWipe.podcast.hosts.length >= 3);
  assert.equal(theWipe.podcast.segments.length, 4);
  assert.equal(theWipe.podcast.broadcastParts.length, 28);

  const wktt = STATIONS.find((s) => s.id === 'wktt');
  assert.ok(wktt && wktt.podcast);
  assert.equal(wktt.tracks.length, 0);
  assert.equal(wktt.podcast.videoId, 'Yo0JCZsmN4E');
  assert.equal(wktt.podcast.hosts.length, 3);
  assert.equal(wktt.podcast.segments.length, 3);
  assert.equal(wktt.podcast.broadcastParts.length, 18);
});

test('computeCatalogStats counts stations, podcasts, collections, tracks, artists, and playable sources accurately', () => {
  const stats = computeCatalogStats(STATIONS);
  assert.equal(stats.totalEntries, 28);
  assert.equal(stats.podcastCount, 2);
  assert.equal(stats.totalTracks, 892);
  assert.ok(stats.artistCount >= 400);
  assert.ok(stats.playableTracks >= 800);
});

test('extractArtists preserves atomic band names while splitting featured and collaborative credits cleanly', () => {
  assert.deepEqual(extractArtists('Earth, Wind & Fire'), ['Earth, Wind & Fire']);
  assert.deepEqual(extractArtists('Tom Petty & The Heartbreakers'), ['Tom Petty & The Heartbreakers']);
  assert.deepEqual(extractArtists('Calvin Harris ft. Pharrell Williams, Katy Perry & Big Sean'), [
    'Calvin Harris',
    'Pharrell Williams',
    'Katy Perry',
    'Big Sean',
  ]);
  assert.deepEqual(extractArtists('Rosalia & Travis Scott'), ['Rosalía', 'Travis Scott']);
});

test('songs index, artists index, and station filtering work accurately across the expanded catalog', () => {
  const allSongs = buildAllSongsIndex(STATIONS);
  assert.equal(allSongs.length, 892);

  const houdini = filterAllSongs(allSongs, { query: 'Houdini' });
  assert.ok(houdini.some((entry) => entry.stationId === 'flash-fm' && entry.track.artist === 'Dua Lipa'));

  const flashOnly = filterAllSongs(allSongs, { stationId: 'flash-fm' });
  assert.ok(flashOnly.length >= 40);
  assert.equal(flashOnly.every((entry) => entry.stationId === 'flash-fm'), true);

  const artists = buildArtistsIndex(STATIONS);
  assert.ok(artists.length >= 400);
  const dua = filterArtists(artists, { query: 'Dua Lipa' });
  assert.ok(dua.some((a) => a.name === 'Dua Lipa' && a.trackCount >= 1));

  const podcasts = filterStations(STATIONS, { category: 'podcast' });
  assert.equal(podcasts.length, 2);
  assert.deepEqual(podcasts.map((p) => p.id).sort(), ['the-wipe', 'wktt']);

  const podcastBySegment = filterStations(STATIONS, { query: 'Ask Dr. Nita' });
  assert.ok(podcastBySegment.some((s) => s.id === 'the-wipe'));

  const byHost = filterStations(STATIONS, { query: 'Robyn' });
  assert.ok(byHost.some((s) => s.id === 'flash-fm'));

  const byTrack = filterStations(STATIONS, { query: 'Raining Blood' });
  assert.ok(byTrack.some((s) => s.id === 'the-chamber-106-6'));
});

test('filterTracks filters inside a station cleanly with accent-insensitive matching', () => {
  const flash = STATIONS.find((s) => s.id === 'flash-fm');
  assert.ok(flash);
  const res = filterTracks(flash.tracks, 'Dua Lipa');
  assert.ok(res.length >= 1);
  assert.ok(res.some((t) => t.title === 'Houdini'));
});

test('hash routing launches directly into Songs and resolves Stations, Artists, Station Detail, and Artist Detail', () => {
  assert.deepEqual(parseRouteHash(''), { view: 'songs', stationId: null, artistSlug: null });
  assert.deepEqual(parseRouteHash('#home'), { view: 'songs', stationId: null, artistSlug: null });
  assert.deepEqual(parseRouteHash('#songs'), { view: 'songs', stationId: null, artistSlug: null });
  assert.deepEqual(parseRouteHash('#tier-list'), { view: 'songs', stationId: null, artistSlug: null });
  assert.deepEqual(parseRouteHash('#stations'), { view: 'stations', stationId: null, artistSlug: null });
  assert.deepEqual(parseRouteHash('#artists'), { view: 'artists', stationId: null, artistSlug: null });

  const stationHash = buildStationHash('the-wipe');
  assert.equal(stationHash, '#station/the-wipe');
  assert.deepEqual(parseRouteHash(stationHash), {
    view: 'station',
    stationId: 'the-wipe',
    artistSlug: null,
  });

  const artistHash = buildArtistHash('dua-lipa');
  assert.equal(artistHash, '#artist/dua-lipa');
  assert.deepEqual(parseRouteHash(artistHash), {
    view: 'artist',
    stationId: null,
    artistSlug: 'dua-lipa',
  });
});

test('getAdjacentStationIds wraps around smoothly', () => {
  const { prevId, nextId } = getAdjacentStationIds(STATIONS, STATIONS[0].id);
  assert.equal(prevId, STATIONS[STATIONS.length - 1].id);
  assert.equal(nextId, STATIONS[1].id);
});

test('extractYouTubeId and buildYouTubeWatchUrl normalize IDs and full URLs cleanly', () => {
  assert.equal(extractYouTubeId('xjoBP7SDgaY'), 'xjoBP7SDgaY');
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=xjoBP7SDgaY&t=10s'), 'xjoBP7SDgaY');
  assert.equal(extractYouTubeId('https://youtu.be/xjoBP7SDgaY'), 'xjoBP7SDgaY');
  assert.equal(extractYouTubeId('not-a-valid-url'), null);
  assert.equal(buildYouTubeWatchUrl('xjoBP7SDgaY'), 'https://www.youtube.com/watch?v=xjoBP7SDgaY');
});

test('resolveTrackAudioSource handles official vs community YouTube sources, overrides, Spotify previews, and unavailable tracks', () => {
  const spotifyTrack = {
    id: 't-sp',
    title: 'Houdini',
    artist: 'Dua Lipa',
    audio: null,
    spotifyPreviewUrl: 'https://p.scdn.co/mp3-preview/sample',
    youtubeId: 'suAR1PYFNYA',
  };
  const spSource = resolveTrackAudioSource(spotifyTrack, null, null);
  assert.equal(spSource.type, 'audio');
  assert.equal(spSource.origin, 'spotify');
  assert.equal(spSource.playable, true);

  const ytOfficial = resolveTrackAudioSource(
    {
      id: 't-yt',
      title: 'Good Ones',
      artist: 'Charli xcx',
      audio: null,
      spotifyPreviewUrl: null,
      youtubeId: 'kjAuUXdSFaM',
      sourceOrigin: 'official',
    },
    null,
    null
  );
  assert.equal(ytOfficial.type, 'youtube');
  assert.equal(ytOfficial.origin, 'official');
  assert.equal(ytOfficial.label, 'YouTube · Official');
  assert.equal(ytOfficial.youtubeId, 'kjAuUXdSFaM');
  assert.equal(ytOfficial.playable, true);

  const ytCommunity = resolveTrackAudioSource(
    {
      id: 't-alt',
      title: 'Lost',
      artist: 'Frank Ocean',
      audio: null,
      spotifyPreviewUrl: null,
      youtubeId: 'xjoBP7SDgaY',
      sourceOrigin: 'community',
    },
    null,
    null
  );
  assert.equal(ytCommunity.type, 'youtube');
  assert.equal(ytCommunity.origin, 'community');
  assert.equal(ytCommunity.label, 'YouTube · Alternative');

  const ytOverridden = resolveTrackAudioSource(
    {
      id: 't-alt',
      title: 'Lost',
      artist: 'Frank Ocean',
      audio: null,
      spotifyPreviewUrl: null,
      youtubeId: 'xjoBP7SDgaY',
      sourceOrigin: 'community',
    },
    null,
    {
      youtubeId: 'AbC123dEfGh',
      youtubeUrl: 'https://www.youtube.com/watch?v=AbC123dEfGh',
      sourceOrigin: 'community',
    }
  );
  assert.equal(ytOverridden.youtubeId, 'AbC123dEfGh');
  assert.equal(ytOverridden.youtubeUrl, 'https://www.youtube.com/watch?v=AbC123dEfGh');

  const noneSource = resolveTrackAudioSource(
    {
      id: 't-none',
      title: 'Unreleased',
      artist: 'Unknown',
      audio: null,
      spotifyPreviewUrl: null,
      youtubeId: null,
    },
    null,
    null
  );
  assert.equal(noneSource.type, 'none');
  assert.equal(noneSource.origin, 'none');
  assert.equal(noneSource.playable, false);
});

test('resolveTrackCover prioritizes cached Spotify cover, official album cover, YouTube thumb, and SVG fallback', () => {
  const albumCover = resolveTrackCover({
    id: 'a',
    title: 'Song A',
    artist: 'Artist A',
    cover: 'https://cdn-images.dzcdn.net/images/cover/abc/500x500-000000-80-0-0.jpg',
    youtubeId: 'xyz',
  });
  assert.equal(albumCover.source, 'album');
  assert.ok(albumCover.src.includes('dzcdn.net'));
  assert.ok(albumCover.fallbackSrc.startsWith('data:image/svg+xml'));

  const spotifyCached = resolveTrackCover(
    { id: 'a', title: 'Song A', artist: 'Artist A', cover: 'https://example.com/old.jpg' },
    '#ff4fa3',
    { coverUrl: 'https://i.scdn.co/image/spotify-hi-res' }
  );
  assert.equal(spotifyCached.source, 'spotify');
  assert.equal(spotifyCached.src, 'https://i.scdn.co/image/spotify-hi-res');

  const ytCover = resolveTrackCover({ id: 'b', title: 'Song B', artist: 'Artist B', cover: null, youtubeId: 'joMjcNtxuTU' });
  assert.equal(ytCover.source, 'youtube-thumb');
  assert.equal(ytCover.src, 'https://i.ytimg.com/vi/joMjcNtxuTU/hqdefault.jpg');

  const svgCover = resolveTrackCover({ id: 'c', title: 'Song C', artist: 'Artist C', cover: null, youtubeId: null });
  assert.equal(svgCover.source, 'svg-fallback');
  assert.ok(svgCover.src.startsWith('data:image/svg+xml'));
});

test('scoreSpotifyTrackMatch validates exact title and artist matches strictly', () => {
  const scoreHit = scoreSpotifyTrackMatch(
    { title: 'Good Ones', artist: 'Charli xcx' },
    { name: 'Good Ones', artists: [{ name: 'Charli xcx' }], preview_url: null }
  );
  assert.ok(scoreHit >= 90);

  const scoreMismatch = scoreSpotifyTrackMatch(
    { title: 'Good Ones', artist: 'Charli xcx' },
    { name: 'Good Ones', artists: [{ name: 'Wrong Artist' }], preview_url: null }
  );
  assert.equal(scoreMismatch, -1);
});

test('computeNextPlayerState blocks unavailable tracks, sets loading state, and switches active tracks cleanly', () => {
  const idle = {
    trackId: null,
    stationId: null,
    stationName: '',
    title: '',
    artist: '',
    cover: '',
    coverFallback: '',
    sourceType: null,
    sourceOrigin: 'none',
    sourceLabel: '',
    audioSrc: null,
    youtubeId: null,
    isPlaying: false,
    isLoading: false,
    errorMessage: null,
    currentTime: 0,
    duration: 0,
  };

  const unavailable = computeNextPlayerState(
    idle,
    { id: 't1', title: 'No Source', artist: 'Artist', audio: null, youtubeId: null },
    { id: 'flash-fm', name: 'Flash FM', accent: '#ff4fa3' }
  );
  assert.equal(unavailable.action, 'unavailable');

  const playYt = computeNextPlayerState(
    idle,
    { id: 't1', title: 'Good Ones', artist: 'Charli xcx', audio: null, youtubeId: 'kjAuUXdSFaM' },
    { id: 'flash-fm', name: 'Flash FM', accent: '#ff4fa3' }
  );
  assert.equal(playYt.action, 'load-and-play');
  assert.equal(playYt.state.trackId, 't1');
  assert.equal(playYt.state.sourceType, 'youtube');
  assert.equal(playYt.state.isLoading, true);

  const playingState = { ...playYt.state, isLoading: false, isPlaying: true };
  const pause1 = computeNextPlayerState(
    playingState,
    { id: 't1', title: 'Good Ones', artist: 'Charli xcx', audio: null, youtubeId: 'kjAuUXdSFaM' },
    { id: 'flash-fm', name: 'Flash FM', accent: '#ff4fa3' }
  );
  assert.equal(pause1.action, 'pause');
  assert.equal(pause1.state.isPlaying, false);

  const play2 = computeNextPlayerState(
    playingState,
    { id: 't2', title: 'Sample 2', artist: 'Artist 2', audio: '/assets/audio/sample2.mp3', youtubeId: null },
    { id: 'v-rock', name: 'V-Rock', accent: '#ef4444' }
  );
  assert.equal(play2.action, 'load-and-play');
  assert.equal(play2.state.trackId, 't2');
  assert.equal(play2.state.sourceType, 'audio');
});

test('formatTime, resolveAssetUrl, and deterministic SVG fallback work cleanly', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(75), '1:15');
  assert.equal(resolveAssetUrl('/assets/aistudio/Flash_4015c349.webp'), './assets/aistudio/Flash_4015c349.webp');
  assert.equal(resolveAssetUrl('https://cdn.example.com/cover.jpg'), 'https://cdn.example.com/cover.jpg');
  const cover = getTrackCoverSrc({ id: 'x', title: 'Test', artist: 'Artist', cover: null });
  assert.ok(cover.startsWith('data:image/svg+xml'));
});

test('i18n detects device locale accurately including pt-PT -> pt-BR and unsupported -> en fallback', () => {
  assert.equal(normalizeLocaleTag('pt-BR'), 'pt-BR');
  assert.equal(normalizeLocaleTag('pt-PT'), 'pt-BR');
  assert.equal(normalizeLocaleTag('pt'), 'pt-BR');
  assert.equal(normalizeLocaleTag('en-US'), 'en');
  assert.equal(normalizeLocaleTag('en-GB'), 'en');
  assert.equal(normalizeLocaleTag('es-ES'), null);
  assert.equal(normalizeLocaleTag('ja-JP'), null);

  assert.equal(detectDeviceLocale({ languages: ['pt-BR', 'en-US'], language: 'en-US' }), 'pt-BR');
  assert.equal(detectDeviceLocale({ languages: ['pt-PT', 'en'], language: 'pt-PT' }), 'pt-BR');
  assert.equal(detectDeviceLocale({ languages: ['fr-FR', 'es-MX'], language: 'fr-FR' }), 'en');
  assert.equal(detectDeviceLocale({ languages: ['es-ES', 'pt-PT'], language: 'es-ES' }), 'pt-BR');
  assert.equal(detectDeviceLocale({ languages: [], language: 'en-GB' }), 'en');
});

test('i18n preference priority respects saved manual choice over browser locale and updates automatically when unsaved', () => {
  const createMemoryStorage = (initial = {}) => {
    const map = new Map(Object.entries(initial));
    return {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
    };
  };

  // Unsaved manual choice -> follows device language dynamically across visits
  const emptyStorage = createMemoryStorage();
  assert.equal(
    resolveInitialLocale({ storage: emptyStorage, navigator: { languages: ['pt-BR'], language: 'pt-BR' } }),
    'pt-BR'
  );
  assert.equal(
    resolveInitialLocale({ storage: emptyStorage, navigator: { languages: ['en-US'], language: 'en-US' } }),
    'en'
  );

  // Manual choice saved -> overrides device language
  const manualEn = createMemoryStorage();
  saveLocalePreference('en', manualEn);
  assert.equal(manualEn.getItem(LANGUAGE_STORAGE_KEY), 'en');
  assert.equal(
    resolveInitialLocale({ storage: manualEn, navigator: { languages: ['pt-BR'], language: 'pt-BR' } }),
    'en'
  );

  const manualPt = createMemoryStorage();
  saveLocalePreference('pt-BR', manualPt);
  assert.equal(
    resolveInitialLocale({ storage: manualPt, navigator: { languages: ['en-US'], language: 'en-US' } }),
    'pt-BR'
  );
});

test('EN and PT-BR dictionaries have full key parity and cover all 28 stations and both podcasts', () => {
  const collectKeys = (obj, prefix = '') => {
    const keys = [];
    for (const [k, v] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys.push(...collectKeys(v, full));
      } else {
        keys.push(full);
      }
    }
    return keys;
  };

  const enKeys = collectKeys(en).sort();
  const ptKeys = collectKeys(ptBR).sort();
  assert.deepEqual(ptKeys, enKeys, 'EN and PT-BR dictionaries must have identical key structures');

  for (const station of STATIONS) {
    assert.ok(en.catalog.stations[station.id], `Missing EN translation for station ${station.id}`);
    assert.ok(ptBR.catalog.stations[station.id], `Missing PT-BR translation for station ${station.id}`);
    assert.ok(ptBR.catalog.stations[station.id].description.length > 10);
  }

  for (const podcastId of ['the-wipe', 'wktt']) {
    const st = STATIONS.find((s) => s.id === podcastId);
    const ptPodcast = getPodcastLocalizedContent(st, 'pt-BR');
    assert.equal(ptPodcast.programName, st.podcast.programName, 'Podcast official program name must remain unchanged');
    assert.equal(ptPodcast.broadcastParts[0].label, 'Parte 1');
    assert.notEqual(ptPodcast.format, st.podcast.format);
  }
});

test('setLocale switches UI copy and station descriptions immediately while keeping official names untouched', () => {
  const previous = 'en';
  try {
    setLocale('pt-BR', { persist: false, applyDom: false });
    assert.equal(t('nav.songs'), 'Músicas');
    assert.equal(t('nav.stations'), 'Rádios');
    assert.equal(t('nav.artists'), 'Artistas');
    assert.equal(t('songs.emptyTitle'), 'Nenhum resultado encontrado');

    const flash = STATIONS.find((s) => s.id === 'flash-fm');
    const ptFlash = getStationLocalizedContent(flash);
    assert.ok(ptFlash.description.includes('Leonida'));
    assert.equal(flash.name, 'Flash FM');
    assert.ok(filterStations(STATIONS, { query: 'Sátira Política' }).some((s) => s.id === 'wktt'));

    setLocale('en', { persist: false, applyDom: false });
    assert.equal(t('nav.songs'), 'Songs');
    assert.equal(t('nav.stations'), 'Stations');
  } finally {
    setLocale(previous, { persist: false, applyDom: false });
  }
});
