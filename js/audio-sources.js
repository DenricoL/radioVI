/**
 * Gerenciador estruturado de fontes de áudio por faixa.
 * Prioridade transparente:
 * 1. Áudio direto (`track.audio`) ou prévia oficial do Spotify (`preview_url` em cache/faixa).
 * 2. YouTube IFrame Player API (`override.youtubeId` ou `track.youtubeId`), preservando origem (`official` vs `community`).
 * 3. Indisponível (`none` — nunca inventa áudio fictício).
 *
 * Permite atualizar ou substituir o vídeo do YouTube de qualquer faixa de forma isolada
 * e persistente via `localStorage` sem alterar os metadados originais do catálogo.
 */

import { getCachedSpotifyMatch } from './spotify.js';
import { t } from './i18n/index.js';

const SOURCE_OVERRIDES_KEY = 'leonida_fm_source_overrides_v1';

export function extractYouTubeId(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const candidate = url.pathname.split('/').filter(Boolean)[0] || '';
      return /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[A-Za-z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length >= 2 && (segments[0] === 'embed' || segments[0] === 'shorts' || segments[0] === 'v')) {
        return /^[A-Za-z0-9_-]{11}$/.test(segments[1]) ? segments[1] : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYouTubeWatchUrl(youtubeId) {
  const id = extractYouTubeId(youtubeId);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

function readOverridesStore() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SOURCE_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeOverridesStore(map) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SOURCE_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function getTrackSourceOverride(trackId) {
  if (!trackId) return null;
  const store = readOverridesStore();
  const entry = store[trackId];
  return entry && typeof entry === 'object' ? entry : null;
}

export function updateTrackYouTubeSource(trackId, youtubeIdOrUrl, sourceOrigin = 'community') {
  const youtubeId = extractYouTubeId(youtubeIdOrUrl);
  if (!trackId || !youtubeId) return null;
  const origin = sourceOrigin === 'official' ? 'official' : 'community';
  const entry = {
    youtubeId,
    youtubeUrl: buildYouTubeWatchUrl(youtubeId),
    sourceOrigin: origin,
    updatedAt: Date.now(),
  };
  const store = readOverridesStore();
  store[trackId] = entry;
  writeOverridesStore(store);
  return entry;
}

export function clearTrackSourceOverride(trackId) {
  if (!trackId) return;
  const store = readOverridesStore();
  if (trackId in store) {
    delete store[trackId];
    writeOverridesStore(store);
  }
}

export function resolveTrackAudioSource(track, spotifyEntry = null, overrideEntry = undefined) {
  if (!track) {
    return {
      type: 'none',
      origin: 'none',
      playbackStatus: 'unavailable',
      url: null,
      youtubeId: null,
      youtubeUrl: null,
      labelKey: 'audio.sourceUnavailable',
      label: t('audio.sourceUnavailable'),
      playable: false,
    };
  }

  if (track.audio) {
    return {
      type: 'audio',
      origin: 'local',
      playbackStatus: 'available',
      url: track.audio,
      youtubeId: null,
      youtubeUrl: null,
      labelKey: 'audio.sourceLocal',
      label: t('audio.sourceLocal'),
      playable: true,
    };
  }

  const cached = spotifyEntry || (track.id ? getCachedSpotifyMatch(track.id) : null);
  const previewUrl = track.spotifyPreviewUrl || cached?.previewUrl || null;
  if (previewUrl) {
    return {
      type: 'audio',
      origin: 'spotify',
      playbackStatus: 'available',
      url: previewUrl,
      youtubeId: null,
      youtubeUrl: null,
      labelKey: 'audio.sourceSpotify',
      label: t('audio.sourceSpotify'),
      playable: true,
    };
  }

  const override =
    overrideEntry === undefined ? (track.id ? getTrackSourceOverride(track.id) : null) : overrideEntry;
  const youtubeId = override?.youtubeId || track.youtubeId || null;

  if (youtubeId) {
    const origin =
      override?.sourceOrigin ||
      track.sourceOrigin ||
      'official';
    const isCommunity = origin === 'community';
    const labelKey = isCommunity ? 'audio.sourceYoutubeAlternative' : 'audio.sourceYoutubeOfficial';
    return {
      type: 'youtube',
      origin: isCommunity ? 'community' : 'official',
      playbackStatus: 'available',
      url: null,
      youtubeId,
      youtubeUrl: override?.youtubeUrl || track.youtubeUrl || buildYouTubeWatchUrl(youtubeId),
      labelKey,
      label: t(labelKey),
      playable: true,
    };
  }

  return {
    type: 'none',
    origin: 'none',
    playbackStatus: 'unavailable',
    url: null,
    youtubeId: null,
    youtubeUrl: null,
    labelKey: 'audio.sourceUnavailable',
    label: t('audio.sourceUnavailable'),
    playable: false,
  };
}

export function getTrackStatusInfo(source, playerState, trackId) {
  const isActive = playerState?.trackId === trackId;

  if (isActive && playerState.isLoading) {
    return {
      variant: 'loading',
      text: t('audio.statusLoading'),
    };
  }

  if (isActive && (playerState.errorKey || playerState.errorMessage)) {
    return {
      variant: 'error',
      text: playerState.errorKey ? t(playerState.errorKey) : playerState.errorMessage,
    };
  }

  if (isActive && playerState.isPlaying) {
    if (playerState.sourceType === 'youtube') {
      return {
        variant: 'playing',
        text:
          playerState.sourceOrigin === 'community'
            ? t('audio.statusPlayingAlt')
            : t('audio.statusPlayingYoutube'),
      };
    }
    return {
      variant: 'playing',
      text: t('audio.statusNowPlaying'),
    };
  }

  if (isActive) {
    return {
      variant: 'ready',
      text: t('audio.statusPaused'),
    };
  }

  if (source.playable) {
    return {
      variant: 'ready',
      text: source.labelKey ? t(source.labelKey) : source.label,
    };
  }

  return {
    variant: 'unavailable',
    text: t('audio.sourceUnavailable'),
  };
}
