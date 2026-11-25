import { filterTracks, getStationLogoSvg, resolveAssetUrl, slugify } from './catalog.js';
import { bindCoverImage, resolveTrackCover } from './covers.js';
import { getTrackStatusInfo, resolveTrackAudioSource } from './audio-sources.js';
import { getPodcastLocalizedContent, getStationLocalizedContent, t } from './i18n/index.js';

function createPlayIconSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
}

function createPauseIconSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
}

function createLoadingSpinnerSvg() {
  return `<svg class="play-btn__spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-opacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" stroke-linecap="round"/></svg>`;
}

function createUnavailableIconSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`;
}

export function renderStationHeader(station, els) {
  if (els.heroEl) {
    els.heroEl.style.setProperty('--station-accent', station.accent || '#ff4fa3');
    els.heroEl.style.setProperty('--station-secondary', station.secondaryAccent || '#3b82f6');
  }

  const localized = getStationLocalizedContent(station);

  if (station.backdrop) {
    els.heroImg.hidden = false;
    els.heroImg.src = resolveAssetUrl(station.backdrop);
    els.heroImg.alt = t('stations.artworkAlt', { name: station.name });
  } else {
    els.heroImg.hidden = true;
    els.heroImg.removeAttribute('src');
    els.heroImg.alt = '';
  }

  const logoTypeClass =
    station.logoType === 'artwork'
      ? ' station-profile__logo--artwork'
      : station.logo
        ? ' station-profile__logo--logo'
        : '';
  const surfaceClass =
    station.logo && station.logoSurface === 'light' ? ' station-profile__logo--light' : '';

  els.logo.className = `station-profile__logo${logoTypeClass}${surfaceClass}`;
  els.logo.innerHTML = '';

  if (station.logo) {
    const logoImg = document.createElement('img');
    logoImg.className = 'station-profile__logo-img';
    logoImg.src = resolveAssetUrl(station.logo);
    logoImg.alt =
      station.logoType === 'artwork'
        ? t('stations.artworkAlt', { name: station.name })
        : t('stations.logoAlt', { name: station.name });
    logoImg.decoding = 'async';
    logoImg.addEventListener(
      'error',
      () => {
        els.logo.className = 'station-profile__logo';
        els.logo.innerHTML = getStationLogoSvg(station, 'detail');
      },
      { once: true }
    );
    els.logo.appendChild(logoImg);
  } else {
    els.logo.innerHTML = getStationLogoSvg(station, 'detail');
  }

  els.meta.textContent = localized.genre;
  els.title.textContent = station.name;
  els.hosts.textContent = localized.hosts
    ? t('stations.hostedBy', { hosts: localized.hosts })
    : t('stations.hostsUnannounced');
  els.description.textContent = localized.description;
}

export function createTrackCardElement({
  track,
  station,
  index,
  showStation = false,
  playerState,
  onToggleTrack,
  onSelectStation,
  onSelectArtist,
}) {
  const source = resolveTrackAudioSource(track);
  const isActive = playerState?.trackId === track.id;
  const isLoading = isActive && Boolean(playerState.isLoading);
  const isPlaying = isActive && Boolean(playerState.isPlaying);
  const coverInfo = resolveTrackCover(track, station?.accent || '#ff4fa3');
  const statusInfo = getTrackStatusInfo(source, playerState, track.id);

  const card = document.createElement('article');
  card.className = `spotify-card${isActive ? ' is-playing' : ''}${isLoading ? ' is-loading' : ''}`;
  card.dataset.trackId = track.id;
  card.style.setProperty('--stagger', String(Math.min(index, 18)));

  const blurBg = document.createElement('img');
  blurBg.className = 'spotify-card__blur-bg';
  blurBg.alt = '';
  blurBg.setAttribute('aria-hidden', 'true');
  bindCoverImage(blurBg, {
    primarySrc: coverInfo.src,
    fallbackSrc: coverInfo.fallbackSrc,
  });

  const scrim = document.createElement('div');
  scrim.className = 'spotify-card__scrim';
  scrim.setAttribute('aria-hidden', 'true');

  const coverWrap = document.createElement('div');
  coverWrap.className = 'spotify-card__cover-wrap';

  const coverImg = document.createElement('img');
  coverImg.className = 'spotify-card__cover';
  coverImg.alt = t('track.coverAlt', { title: track.title, artist: track.artist });
  coverImg.width = 68;
  coverImg.height = 68;
  bindCoverImage(coverImg, {
    primarySrc: coverInfo.src,
    fallbackSrc: coverInfo.fallbackSrc,
    blurBgEl: blurBg,
  });
  coverWrap.appendChild(coverImg);

  const content = document.createElement('div');
  content.className = 'spotify-card__content';

  const titleEl = document.createElement('h3');
  titleEl.className = 'spotify-card__title';
  titleEl.textContent = track.version ? `${track.title} (${track.version})` : track.title;
  titleEl.title = titleEl.textContent;

  const artistRow = document.createElement('p');
  artistRow.className = 'spotify-card__artist';

  if (onSelectArtist) {
    const artistLink = document.createElement('button');
    artistLink.type = 'button';
    artistLink.className = 'spotify-card__inline-link';
    artistLink.textContent = track.artist;
    artistLink.title = t('track.viewArtistTooltip', { artist: track.artist });
    artistLink.addEventListener('click', () => {
      onSelectArtist(slugify(track.artist), track.artist);
    });
    artistRow.appendChild(artistLink);
  } else {
    const artistSpan = document.createElement('span');
    artistSpan.textContent = track.artist;
    artistRow.appendChild(artistSpan);
  }

  if (track.year) {
    const yearSep = document.createElement('span');
    yearSep.className = 'spotify-card__year';
    yearSep.textContent = ` · ${track.year}`;
    artistRow.appendChild(yearSep);
  }

  const metaRow = document.createElement('div');
  metaRow.className = 'spotify-card__meta-row';

  if (showStation && station) {
    if (onSelectStation) {
      const stationLink = document.createElement('button');
      stationLink.type = 'button';
      stationLink.className = 'spotify-card__station-link';
      stationLink.textContent = station.name;
      stationLink.addEventListener('click', () => {
        onSelectStation(station.id);
      });
      metaRow.appendChild(stationLink);
    } else {
      const stSpan = document.createElement('span');
      stSpan.className = 'spotify-card__station-label';
      stSpan.textContent = station.name;
      metaRow.appendChild(stSpan);
    }
  } else {
    const numSpan = document.createElement('span');
    numSpan.className = 'spotify-card__num tabular-nums';
    numSpan.textContent = `#${String(track.number).padStart(2, '0')}`;
    metaRow.appendChild(numSpan);
  }

  const sep = document.createElement('span');
  sep.setAttribute('aria-hidden', 'true');
  sep.textContent = '·';

  const availSpan = document.createElement('span');
  if (statusInfo.variant === 'playing') {
    availSpan.className = 'spotify-card__availability--playing';
  } else if (statusInfo.variant === 'loading') {
    availSpan.className = 'spotify-card__availability--loading';
  } else if (statusInfo.variant === 'error') {
    availSpan.className = 'spotify-card__availability--error';
  } else if (statusInfo.variant === 'ready') {
    availSpan.className = 'spotify-card__availability--ready';
  }
  availSpan.textContent = statusInfo.text;
  availSpan.title = statusInfo.text;

  metaRow.append(sep, availSpan);
  content.append(titleEl, artistRow, metaRow);

  const controls = document.createElement('div');
  controls.className = 'spotify-card__controls';

  if (isPlaying) {
    const eq = document.createElement('div');
    eq.className = 'eq-bars';
    eq.setAttribute('aria-hidden', 'true');
    eq.innerHTML = '<span></span><span></span><span></span>';
    controls.appendChild(eq);
  }

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = `play-btn${isLoading ? ' is-loading' : ''}`;

  if (!source.playable) {
    playBtn.disabled = true;
    playBtn.setAttribute('aria-disabled', 'true');
    playBtn.setAttribute('aria-label', t('track.unavailableAria', { title: track.title }));
    playBtn.title = t('track.unavailableTooltip');
    playBtn.innerHTML = createUnavailableIconSvg();
  } else {
    playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    if (isLoading) {
      playBtn.setAttribute('aria-label', t('track.loadingAria', { title: track.title }));
      playBtn.innerHTML = createLoadingSpinnerSvg();
    } else {
      playBtn.setAttribute(
        'aria-label',
        isPlaying
          ? t('track.pauseAria', { title: track.title })
          : t('track.playAria', { title: track.title })
      );
      playBtn.innerHTML = isPlaying ? createPauseIconSvg() : createPlayIconSvg();
    }
    playBtn.addEventListener('click', () => {
      onToggleTrack(track, station);
    });
  }

  controls.appendChild(playBtn);
  card.append(blurBg, scrim, coverWrap, content, controls);
  return card;
}

export function renderTracksList({
  station,
  query = '',
  gridEl,
  emptyEl,
  emptyTitleEl,
  emptyTextEl,
  countEl,
  playerState,
  onToggleTrack,
  onSelectArtist,
}) {
  const filtered = filterTracks(station.tracks, query);
  const total = station.tracks.length;

  if (total === 0) {
    countEl.textContent = t('stationDetail.countZero');
  } else if (filtered.length === total) {
    countEl.textContent =
      total === 1
        ? t('stationDetail.countSingular')
        : t('stationDetail.countPlural', { count: total });
  } else {
    countEl.textContent = t('stationDetail.countFiltered', { shown: filtered.length, total });
  }

  gridEl.innerHTML = '';

  if (filtered.length === 0) {
    gridEl.hidden = true;
    emptyEl.hidden = false;
    emptyTitleEl.textContent = t('stationDetail.emptyTitle');
    emptyTextEl.textContent = t('stationDetail.emptyText');
    return;
  }

  gridEl.hidden = false;
  emptyEl.hidden = true;

  const fragment = document.createDocumentFragment();
  filtered.forEach((track, index) => {
    fragment.appendChild(
      createTrackCardElement({
        track,
        station,
        index,
        showStation: false,
        playerState,
        onToggleTrack,
        onSelectArtist,
      })
    );
  });

  gridEl.appendChild(fragment);
}

export function renderAllSongsGrid({
  entries,
  totalCount,
  visibleLimit,
  gridEl,
  emptyEl,
  countEl,
  loadMoreWrapEl,
  loadMoreBtnEl,
  playerState,
  onToggleTrack,
  onSelectStation,
  onSelectArtist,
}) {
  gridEl.innerHTML = '';

  const shownCount = Math.min(entries.length, visibleLimit);

  if (countEl) {
    if (entries.length === 0) {
      countEl.textContent = t('songs.countZero');
    } else if (entries.length === totalCount) {
      countEl.textContent = t('songs.countTotal', { shown: shownCount, total: totalCount });
    } else {
      countEl.textContent = t('songs.countFiltered', { shown: shownCount, total: entries.length });
    }
  }

  if (entries.length === 0) {
    gridEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    if (loadMoreWrapEl) loadMoreWrapEl.hidden = true;
    return;
  }

  gridEl.hidden = false;
  if (emptyEl) emptyEl.hidden = true;

  const slice = entries.slice(0, visibleLimit);
  const fragment = document.createDocumentFragment();
  slice.forEach((entry, index) => {
    fragment.appendChild(
      createTrackCardElement({
        track: entry.track,
        station: entry.station,
        index,
        showStation: true,
        playerState,
        onToggleTrack,
        onSelectStation,
        onSelectArtist,
      })
    );
  });
  gridEl.appendChild(fragment);

  if (loadMoreWrapEl && loadMoreBtnEl) {
    const remaining = entries.length - slice.length;
    loadMoreWrapEl.hidden = remaining <= 0;
    if (remaining > 0) {
      loadMoreBtnEl.textContent = t('songs.loadMore', {
        count: Math.min(60, remaining),
        remaining,
      });
    }
  }
}

export function renderPodcastDetail({
  station,
  containerEl,
  playerState,
  onPlayPodcastBroadcast,
}) {
  const podcast = getPodcastLocalizedContent(station);
  if (!podcast || !containerEl) return;

  const virtualTrackId = `${station.id}-broadcast`;
  const isActive = playerState?.trackId === virtualTrackId;
  const isLoading = isActive && Boolean(playerState.isLoading);
  const isPlaying = isActive && Boolean(playerState.isPlaying);

  const playLabel = isLoading
    ? t('podcast.loadingBroadcast')
    : isPlaying
      ? t('podcast.pauseBroadcast')
      : t('podcast.playFullBroadcast');

  const hostsHtml = (podcast.hosts || [])
    .map(
      (h) => `
      <div class="podcast-host-item">
        <strong class="podcast-host-item__name">${h.name}</strong>
        <span class="podcast-host-item__role">${h.role}</span>
      </div>`
    )
    .join('');

  const segmentsHtml = (podcast.segments || [])
    .map(
      (seg) => `
      <article class="podcast-segment-card">
        <p class="podcast-segment-card__host">${seg.host}</p>
        <h3 class="podcast-segment-card__title">${seg.title}</h3>
        <p class="podcast-segment-card__desc">${seg.description}</p>
      </article>`
    )
    .join('');

  const topicsHtml = (podcast.topics || [])
    .map((topic) => `<li class="podcast-topic-item">${topic}</li>`)
    .join('');

  const partsHtml = (podcast.broadcastParts || [])
    .map(
      (part) => `
      <div class="podcast-part-item">
        <span class="podcast-part-item__time tabular-nums">${part.timestamp}</span>
        <span class="podcast-part-item__label">${part.label}</span>
      </div>`
    )
    .join('');

  containerEl.innerHTML = `
    <div class="podcast-overview">
      <div class="podcast-overview__main">
        <p class="hero__kicker">${podcast.format}</p>
        <h2 class="section-heading">${podcast.programName}</h2>
        <p class="podcast-overview__style">${podcast.style}</p>
      </div>
      <div class="podcast-overview__actions">
        <button type="button" class="btn-primary" id="podcast-play-btn">
          ${playLabel}
        </button>
        <a
          href="${podcast.videoUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary"
        >
          ${t('podcast.sourceVideo', { channel: podcast.sourceChannel })}
        </a>
      </div>
    </div>

    <div class="podcast-meta-grid">
      <section class="podcast-panel" aria-labelledby="podcast-hosts-heading">
        <h3 id="podcast-hosts-heading" class="podcast-panel__heading">${t('podcast.hostsHeading')}</h3>
        <div class="podcast-hosts-list">
          ${hostsHtml}
        </div>
      </section>

      <section class="podcast-panel" aria-labelledby="podcast-topics-heading">
        <h3 id="podcast-topics-heading" class="podcast-panel__heading">${t('podcast.themesHeading')}</h3>
        <ul class="podcast-topics-list">
          ${topicsHtml}
        </ul>
      </section>
    </div>

    <section class="podcast-segments-section" aria-labelledby="podcast-segments-heading">
      <div class="podcast-section-header">
        <h2 id="podcast-segments-heading" class="section-heading">${t('podcast.segmentsHeading')}</h2>
        <span class="catalog-count tabular-nums">${t('podcast.documentedPrograms', { count: podcast.segments.length })}</span>
      </div>
      <div class="podcast-segments-grid">
        ${segmentsHtml}
      </div>
    </section>

    <section class="podcast-parts-section" aria-labelledby="podcast-parts-heading">
      <div class="podcast-section-header">
        <h2 id="podcast-parts-heading" class="section-heading">${t('podcast.partsHeading')}</h2>
        <span class="catalog-count tabular-nums">${t('podcast.partsMeta', { count: podcast.broadcastParts.length, title: podcast.videoTitle })}</span>
      </div>
      <div class="podcast-parts-grid">
        ${partsHtml}
      </div>
    </section>
  `;

  const playBtn = containerEl.querySelector('#podcast-play-btn');
  if (playBtn && onPlayPodcastBroadcast) {
    playBtn.addEventListener('click', () => {
      onPlayPodcastBroadcast(station);
    });
  }
}
