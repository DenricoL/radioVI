/**
 * Resolução e cache local de capas individuais de álbuns/singles para cada faixa.
 * Prioridade:
 * 1. Capa de alta resolução obtida e cacheada via Spotify Web API (quando conectado).
 * 2. Capa oficial pré-indexada da faixa no catálogo (`track.cover`).
 * 3. Miniatura oficial do vídeo YouTube vinculado (`track.youtubeId`).
 * 4. Arte vetorial determinística por faixa/artista para evitar imagens quebradas.
 */

import { getTrackCoverSrc } from './catalog.js';
import { getCachedSpotifyMatch, isSpotifyConnected, searchSpotifyTrack } from './spotify.js';

export function resolveTrackCover(track, stationAccent = '#ff4fa3', spotifyEntry = null) {
  const cached = spotifyEntry || (track?.id ? getCachedSpotifyMatch(track.id) : null);
  if (cached?.coverUrl) {
    return {
      src: cached.coverUrl,
      fallbackSrc: getTrackFallbackCoverSrc(track, stationAccent),
      source: 'spotify',
    };
  }

  if (track?.cover) {
    return {
      src: track.cover,
      fallbackSrc: getTrackFallbackCoverSrc(track, stationAccent),
      source: track.cover.includes('i.ytimg.com') ? 'youtube-thumb' : 'album',
    };
  }

  if (track?.youtubeId) {
    return {
      src: `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`,
      fallbackSrc: getTrackFallbackCoverSrc(track, stationAccent),
      source: 'youtube-thumb',
    };
  }

  const fallback = getTrackFallbackCoverSrc(track, stationAccent);
  return {
    src: fallback,
    fallbackSrc: fallback,
    source: 'svg-fallback',
  };
}

export function getTrackFallbackCoverSrc(track, stationAccent = '#ff4fa3') {
  return getTrackCoverSrc({ ...track, cover: null }, stationAccent);
}

/**
 * Garante carregamento otimizado (`lazy`, `decoding=async`, `no-referrer`) e
 * fallback automático caso uma URL externa falhe ao carregar.
 */
export function bindCoverImage(imgEl, { primarySrc, fallbackSrc, blurBgEl = null }) {
  imgEl.loading = 'lazy';
  imgEl.decoding = 'async';
  imgEl.setAttribute('referrerpolicy', 'no-referrer');
  imgEl.src = primarySrc;

  if (primarySrc !== fallbackSrc) {
    imgEl.addEventListener(
      'error',
      () => {
        if (imgEl.dataset.fallbackApplied === 'true') return;
        imgEl.dataset.fallbackApplied = 'true';
        imgEl.src = fallbackSrc;
        if (blurBgEl) {
          blurBgEl.src = fallbackSrc;
        }
      },
      { once: true }
    );
  }
}

/**
 * Quando houver sessão Spotify PKCE ativa, enriquece de forma assíncrona
 * faixas ainda sem capa oficial (ou sem preview verificado), respeitando
 * o cache persistente para evitar consultas duplicadas.
 */
export async function enrichStationTracksWithSpotify(station, { onTrackUpdated } = {}) {
  if (!station || !Array.isArray(station.tracks) || !isSpotifyConnected()) {
    return;
  }

  const candidates = station.tracks.filter(
    (track) => !getCachedSpotifyMatch(track.id) && (!track.cover || track.cover.includes('i.ytimg.com'))
  );

  for (const track of candidates) {
    const entry = await searchSpotifyTrack(track);
    if (entry && (entry.coverUrl || entry.previewUrl) && onTrackUpdated) {
      onTrackUpdated(track, entry);
    }
  }
}
