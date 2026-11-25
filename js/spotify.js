/**
 * Integração client-side com a Spotify Web API utilizando exclusivamente
 * Authorization Code Flow with PKCE (sem exposição de client_secret no frontend).
 *
 * Limitações documentadas da Spotify Web API:
 * - O endpoint /v1/search exige token OAuth válido; em apps puramente estáticos
 *   sem backend, o fluxo Client Credentials não deve ser usado no navegador
 *   porque exporia o `client_secret`.
 * - Desde o final de 2024, o campo `preview_url` foi descontinuado/restringido
 *   para a maioria dos aplicativos na API padrão do Spotify, frequentemente
 *   retornando `null`. Por isso o catálogo verifica `preview_url` quando existe
 *   sessão PKCE conectada e recorre ao YouTube IFrame Player API como fallback.
 */

import { normalizeText } from './catalog.js';

const SPOTIFY_TOKEN_KEY = 'leonida_fm_spotify_token_v1';
const SPOTIFY_VERIFIER_KEY = 'leonida_fm_spotify_pkce_verifier_v1';
const SPOTIFY_STATE_KEY = 'leonida_fm_spotify_pkce_state_v1';
const SPOTIFY_CACHE_KEY = 'leonida_fm_spotify_cache_v1';

function getStorage() {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getSpotifyClientId() {
  if (typeof window !== 'undefined' && window.LEONIDA_SPOTIFY_CONFIG?.clientId) {
    return String(window.LEONIDA_SPOTIFY_CONFIG.clientId).trim();
  }
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="spotify-client-id"]');
    const content = meta?.getAttribute('content')?.trim();
    if (content) return content;
  }
  return '';
}

export function readSpotifyTrackCache() {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(SPOTIFY_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeSpotifyTrackCache(cache) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SPOTIFY_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function getCachedSpotifyMatch(trackId) {
  const cache = readSpotifyTrackCache();
  return cache[trackId] || null;
}

export function getSpotifyAccessToken() {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SPOTIFY_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.accessToken || (parsed.expiresAt && Date.now() >= parsed.expiresAt)) {
      return null;
    }
    return parsed.accessToken;
  } catch {
    return null;
  }
}

export function isSpotifyConnected() {
  return Boolean(getSpotifyAccessToken());
}

function base64UrlEncode(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomPkceString(length = 64) {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes).slice(0, length);
}

async function createCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

export async function beginSpotifyPkceLogin() {
  const clientId = getSpotifyClientId();
  if (!clientId || typeof window === 'undefined' || !window.crypto?.subtle) {
    return false;
  }

  const verifier = randomPkceString(64);
  const state = randomPkceString(24);
  const challenge = await createCodeChallenge(verifier);
  const redirectUri = `${window.location.origin}${window.location.pathname}`;

  const storage = getStorage();
  storage?.setItem(SPOTIFY_VERIFIER_KEY, verifier);
  storage?.setItem(SPOTIFY_STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    redirect_uri: redirectUri,
    state,
  });

  window.location.assign(`https://accounts.spotify.com/authorize?${params.toString()}`);
  return true;
}

export async function handleSpotifyPkceCallback() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const clientId = getSpotifyClientId();
  const storage = getStorage();

  if (!code || !clientId || !storage) return false;

  const expectedState = storage.getItem(SPOTIFY_STATE_KEY);
  const verifier = storage.getItem(SPOTIFY_VERIFIER_KEY);
  if (!verifier || (expectedState && state !== expectedState)) {
    return false;
  }

  const redirectUri = `${window.location.origin}${window.location.pathname}`;
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) return false;

    const data = await response.json();
    if (!data.access_token) return false;

    storage.setItem(
      SPOTIFY_TOKEN_KEY,
      JSON.stringify({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || null,
        expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 - 30_000,
      })
    );
    storage.removeItem(SPOTIFY_VERIFIER_KEY);
    storage.removeItem(SPOTIFY_STATE_KEY);

    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
    return true;
  } catch {
    return false;
  }
}

function cleanTrackSegment(value) {
  return normalizeText(value)
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .replace(/\b(feat|ft|featuring|remaster(?:ed)?|radio edit|version)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreSpotifyTrackMatch(track, item) {
  if (!item || !item.name) return -1;
  const targetTitle = cleanTrackSegment(track.title);
  const candidateTitle = cleanTrackSegment(item.name);
  if (!targetTitle || !candidateTitle) return -1;

  let score = 0;
  if (candidateTitle === targetTitle) {
    score += 60;
  } else if (candidateTitle.includes(targetTitle) || targetTitle.includes(candidateTitle)) {
    score += 38;
  } else {
    return -1;
  }

  const targetArtist = cleanTrackSegment(String(track.artist || '').split(/[,&]| ft\.?| feat\.?/i)[0]);
  const candidateArtists = (item.artists || []).map((a) => cleanTrackSegment(a.name));
  const artistMatched = candidateArtists.some(
    (name) => name === targetArtist || (targetArtist && (name.includes(targetArtist) || targetArtist.includes(name)))
  );

  if (!artistMatched) return -1;
  score += 40;
  if (item.preview_url) score += 5;
  return score;
}

export async function searchSpotifyTrack(track, { fetchImpl = fetch } = {}) {
  const existing = getCachedSpotifyMatch(track.id);
  if (existing && Date.now() - (existing.cachedAt || 0) < 7 * 24 * 60 * 60 * 1000) {
    return existing;
  }

  const token = getSpotifyAccessToken();
  if (!token) return null;

  const primaryArtist = String(track.artist || '').split(/[,&]| ft\.?| feat\.?/i)[0].trim();
  const query = `track:"${track.title}" artist:"${primaryArtist}"`;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

  try {
    const response = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;

    const payload = await response.json();
    const items = payload?.tracks?.items || [];
    let best = null;
    let bestScore = -1;

    for (const item of items) {
      const score = scoreSpotifyTrackMatch(track, item);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    if (!best) {
      const miss = {
        spotifyTrackId: null,
        coverUrl: null,
        previewUrl: null,
        matchedTitle: null,
        matchedArtist: null,
        cachedAt: Date.now(),
      };
      const cache = readSpotifyTrackCache();
      cache[track.id] = miss;
      writeSpotifyTrackCache(cache);
      return miss;
    }

    const images = best.album?.images || [];
    const hiRes = images.find((img) => img.width >= 300 && img.width <= 640) || images[0] || null;
    const entry = {
      spotifyTrackId: best.id,
      coverUrl: hiRes?.url || null,
      previewUrl: best.preview_url || null,
      albumName: best.album?.name || null,
      matchedTitle: best.name,
      matchedArtist: best.artists?.[0]?.name || primaryArtist,
      cachedAt: Date.now(),
    };

    const cache = readSpotifyTrackCache();
    cache[track.id] = entry;
    writeSpotifyTrackCache(cache);
    return entry;
  } catch {
    return null;
  }
}
