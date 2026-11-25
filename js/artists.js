import { getTrackCoverSrc } from './catalog.js';
import { bindCoverImage } from './covers.js';
import { createTrackCardElement } from './music.js';
import { t } from './i18n/index.js';

export function renderArtistsGrid({
  artists,
  totalCount,
  visibleLimit,
  gridEl,
  emptyEl,
  countEl,
  loadMoreWrapEl,
  loadMoreBtnEl,
  onSelectArtist,
}) {
  gridEl.innerHTML = '';

  const shownCount = Math.min(artists.length, visibleLimit);

  if (countEl) {
    if (artists.length === 0) {
      countEl.textContent = t('artists.countZero');
    } else if (artists.length === totalCount) {
      countEl.textContent = t('artists.countTotal', { shown: shownCount, total: totalCount });
    } else {
      countEl.textContent = t('artists.countFiltered', { shown: shownCount, total: artists.length });
    }
  }

  if (artists.length === 0) {
    gridEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    if (loadMoreWrapEl) loadMoreWrapEl.hidden = true;
    return;
  }

  gridEl.hidden = false;
  if (emptyEl) emptyEl.hidden = true;

  const slice = artists.slice(0, visibleLimit);
  const fragment = document.createDocumentFragment();

  slice.forEach((artist, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'artist-card';
    card.dataset.artistSlug = artist.slug;
    card.style.setProperty('--stagger', String(Math.min(index, 16)));
    card.setAttribute('aria-label', t('artists.openAria', { name: artist.name }));

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'artist-card__avatar-wrap';

    const avatar = document.createElement('img');
    avatar.className = 'artist-card__avatar';
    avatar.alt = t('artists.artworkAlt', { name: artist.name });
    avatar.width = 64;
    avatar.height = 64;

    const fallbackSvg = getTrackCoverSrc(
      { id: artist.slug, title: artist.name, artist: artist.name, cover: null },
      artist.stationAccent || '#ff4fa3'
    );
    bindCoverImage(avatar, {
      primarySrc: artist.cover || fallbackSvg,
      fallbackSrc: fallbackSvg,
    });
    avatarWrap.appendChild(avatar);

    const body = document.createElement('div');
    body.className = 'artist-card__body';

    const nameEl = document.createElement('h3');
    nameEl.className = 'artist-card__name';
    nameEl.textContent = artist.name;
    nameEl.title = artist.name;

    const statsEl = document.createElement('p');
    statsEl.className = 'artist-card__stats tabular-nums';
    const songLabel =
      artist.trackCount === 1
        ? t('artists.songSingular')
        : t('artists.songPlural', { count: artist.trackCount });
    const stationCountLabel =
      artist.stationNames.length === 1
        ? t('artists.stationSingular')
        : t('artists.stationPlural', { count: artist.stationNames.length });
    statsEl.textContent = `${songLabel} · ${stationCountLabel}`;

    const stationsEl = document.createElement('p');
    stationsEl.className = 'artist-card__stations';
    stationsEl.textContent = artist.stationNames.join(' · ');
    stationsEl.title = artist.stationNames.join(' · ');

    body.append(nameEl, statsEl, stationsEl);

    const arrow = document.createElement('span');
    arrow.className = 'artist-card__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

    card.append(avatarWrap, body, arrow);
    card.addEventListener('click', () => {
      onSelectArtist(artist.slug, artist.name);
    });
    fragment.appendChild(card);
  });

  gridEl.appendChild(fragment);

  if (loadMoreWrapEl && loadMoreBtnEl) {
    const remaining = artists.length - slice.length;
    loadMoreWrapEl.hidden = remaining <= 0;
    if (remaining > 0) {
      loadMoreBtnEl.textContent = t('artists.loadMore', {
        count: Math.min(60, remaining),
        remaining,
      });
    }
  }
}

export function renderArtistDetail({
  artist,
  headerEls,
  tracksGridEl,
  playerState,
  onToggleTrack,
  onSelectStation,
}) {
  if (!artist) return;

  const fallbackSvg = getTrackCoverSrc(
    { id: artist.slug, title: artist.name, artist: artist.name, cover: null },
    artist.stationAccent || '#ff4fa3'
  );
  bindCoverImage(headerEls.avatar, {
    primarySrc: artist.cover || fallbackSvg,
    fallbackSrc: fallbackSvg,
  });
  headerEls.avatar.alt = t('artists.artworkAlt', { name: artist.name });

  headerEls.title.textContent = artist.name;
  const songLabel =
    artist.trackCount === 1
      ? t('artists.catalogedSongSingular')
      : t('artists.catalogedSongPlural', { count: artist.trackCount });
  const stLabel =
    artist.stationNames.length === 1
      ? t('artists.radioStationSingular')
      : t('artists.radioStationPlural', { count: artist.stationNames.length });
  headerEls.meta.textContent = t('artists.detailMeta', {
    songLabel,
    stationLabel: stLabel,
  });

  headerEls.stationsList.innerHTML = '';
  const stationPairs = artist.stationIds.map((id, i) => ({
    id,
    name: artist.stationNames[i],
  }));
  stationPairs.forEach((st) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'station-jump-btn';
    btn.textContent = st.name;
    btn.addEventListener('click', () => {
      onSelectStation(st.id);
    });
    headerEls.stationsList.appendChild(btn);
  });

  tracksGridEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  artist.tracks.forEach((entry, index) => {
    fragment.appendChild(
      createTrackCardElement({
        track: entry.track,
        station: entry.station,
        index,
        showStation: true,
        playerState,
        onToggleTrack,
        onSelectStation,
        onSelectArtist: null,
      })
    );
  });
  tracksGridEl.appendChild(fragment);
}
