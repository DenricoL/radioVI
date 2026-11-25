import { getStationLogoSvg, resolveAssetUrl } from './catalog.js';
import { getStationLocalizedContent, t } from './i18n/index.js';

function formatTrackCountLabel(station) {
  if (station.podcast) {
    const segCount = station.podcast.segments?.length || 0;
    const partCount = station.podcast.broadcastParts?.length || 0;
    if (partCount > 0) {
      return t('stations.podcastSummaryWithParts', {
        segments: segCount,
        parts: partCount,
      });
    }
    return t('stations.podcastSummary', { segments: segCount });
  }
  const count = station.tracks.length;
  if (count === 0) {
    return t('stations.noTracksListed');
  }
  return count === 1
    ? t('stations.trackSingular')
    : t('stations.trackPlural', { count });
}

export function renderStationsGrid({ gridEl, emptyEl, countEl, stations, totalCount, onSelectStation }) {
  gridEl.innerHTML = '';

  if (countEl) {
    const totalText =
      stations.length === totalCount
        ? t('stations.countTotal', { count: stations.length })
        : t('stations.countFiltered', { shown: stations.length, total: totalCount });
    countEl.textContent = totalText;
  }

  if (stations.length === 0) {
    gridEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  gridEl.hidden = false;
  if (emptyEl) emptyEl.hidden = true;

  const fragment = document.createDocumentFragment();

  stations.forEach((station, index) => {
    const localized = getStationLocalizedContent(station);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'station-card';
    card.dataset.stationId = station.id;
    card.style.setProperty('--station-accent', station.accent || '#ff4fa3');
    card.style.setProperty('--stagger', String(Math.min(index, 14)));
    card.setAttribute('aria-label', t('stations.openAria', { name: station.name }));

    const glow = document.createElement('span');
    glow.className = 'station-card__glow';
    glow.setAttribute('aria-hidden', 'true');

    const top = document.createElement('div');
    top.className = 'station-card__top';

    const emblem = document.createElement('div');
    const logoTypeClass =
      station.logoType === 'artwork'
        ? ' station-card__emblem--artwork'
        : station.logo
          ? ' station-card__emblem--logo'
          : '';
    const surfaceClass =
      station.logo && station.logoSurface === 'light'
        ? ' station-card__emblem--light'
        : '';
    emblem.className = `station-card__emblem${logoTypeClass}${surfaceClass}`;

    if (station.logo) {
      const logoImg = document.createElement('img');
      logoImg.className = 'station-card__logo-img';
      logoImg.src = resolveAssetUrl(station.logo);
      logoImg.alt =
        station.logoType === 'artwork'
          ? t('stations.artworkAlt', { name: station.name })
          : t('stations.logoAlt', { name: station.name });
      logoImg.loading = 'lazy';
      logoImg.decoding = 'async';
      logoImg.addEventListener(
        'error',
        () => {
          emblem.className = 'station-card__emblem';
          emblem.innerHTML = getStationLogoSvg(station, 'card');
        },
        { once: true }
      );
      emblem.appendChild(logoImg);
    } else {
      emblem.innerHTML = getStationLogoSvg(station, 'card');
    }

    top.append(emblem);

    const body = document.createElement('div');
    body.className = 'station-card__body';

    const title = document.createElement('h3');
    title.className = 'station-card__name';
    title.textContent = station.name;

    const meta = document.createElement('p');
    meta.className = 'station-card__meta';
    meta.textContent = localized.genre;

    const hosts = document.createElement('p');
    hosts.className = 'station-card__hosts';
    hosts.textContent = localized.hosts
      ? t('stations.hostedBy', { hosts: localized.hosts })
      : t('stations.hostsUnannounced');

    body.append(title, meta, hosts);

    const footer = document.createElement('div');
    footer.className = 'station-card__footer';

    const count = document.createElement('span');
    count.className = 'station-card__count tabular-nums';
    count.textContent = formatTrackCountLabel(station);

    const cta = document.createElement('span');
    cta.className = 'station-card__cta';
    const ctaText = station.podcast ? t('common.openPodcast') : t('common.explore');
    cta.innerHTML = `<span>${ctaText}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

    footer.append(count, cta);
    card.append(glow, top, body, footer);

    card.addEventListener('click', () => {
      onSelectStation(station.id);
    });

    fragment.appendChild(card);
  });

  gridEl.appendChild(fragment);
}
