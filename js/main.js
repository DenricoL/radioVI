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
  getAdjacentStationIds,
  normalizeText,
  parseRouteHash,
  slugify,
} from './catalog.js';
import { AudioPlayerController } from './player.js';
import { renderStationsGrid } from './stations.js';
import {
  renderAllSongsGrid,
  renderPodcastDetail,
  renderStationHeader,
  renderTracksList,
} from './music.js';
import { renderArtistDetail, renderArtistsGrid } from './artists.js';
import { enrichStationTracksWithSpotify } from './covers.js';
import { handleSpotifyPkceCallback } from './spotify.js';
import {
  formatNumber,
  initI18n,
  setLocale,
  subscribeLocaleChange,
  t,
} from './i18n/index.js';

const PAGE_BATCH_SIZE = 60;

const ALL_SONGS_INDEX = buildAllSongsIndex(STATIONS);
const ALL_ARTISTS_INDEX = buildArtistsIndex(STATIONS);

const appState = {
  activeView: 'songs',
  searchQuery: '',
  stationFilter: 'all',
  stationCategory: 'all',
  trackQuery: '',
  activeStationId: null,
  activeArtistSlug: null,
  songsLimit: PAGE_BATCH_SIZE,
  artistsLimit: PAGE_BATCH_SIZE,
};

const dom = {
  explorerShell: document.getElementById('explorer-shell'),
  summaryMetrics: document.getElementById('catalog-summary-metrics'),
  globalSearchInput: document.getElementById('global-search-input'),
  globalClearBtn: document.getElementById('global-clear-btn'),
  stationFilterWrap: document.getElementById('station-filter-wrap'),
  stationFilterSelect: document.getElementById('station-filter-select'),
  stationCategoryTabs: document.getElementById('station-category-tabs'),
  stationCatBtns: Array.from(document.querySelectorAll('[data-station-cat]')),

  songsView: document.getElementById('songs-view'),
  songsResultsCount: document.getElementById('songs-results-count'),
  songsGrid: document.getElementById('songs-grid'),
  songsLoadMoreWrap: document.getElementById('songs-load-more-wrap'),
  songsLoadMoreBtn: document.getElementById('songs-load-more-btn'),
  songsEmpty: document.getElementById('songs-empty'),
  songsResetBtn: document.getElementById('songs-reset-btn'),

  stationsView: document.getElementById('stations-view'),
  stationResultsCount: document.getElementById('station-results-count'),
  stationsGrid: document.getElementById('stations-grid'),
  stationsEmpty: document.getElementById('stations-empty'),
  stationsResetBtn: document.getElementById('stations-reset-btn'),

  artistsView: document.getElementById('artists-view'),
  artistsResultsCount: document.getElementById('artists-results-count'),
  artistsGrid: document.getElementById('artists-grid'),
  artistsLoadMoreWrap: document.getElementById('artists-load-more-wrap'),
  artistsLoadMoreBtn: document.getElementById('artists-load-more-btn'),
  artistsEmpty: document.getElementById('artists-empty'),
  artistsResetBtn: document.getElementById('artists-reset-btn'),

  artistDetailView: document.getElementById('artist-detail-view'),
  backToArtistsBtn: document.getElementById('back-to-artists-btn'),
  artistHeaderEls: {
    avatar: document.getElementById('artist-detail-avatar'),
    meta: document.getElementById('artist-detail-meta'),
    title: document.getElementById('artist-detail-title'),
    stationsList: document.getElementById('artist-detail-stations'),
  },
  artistTracksGrid: document.getElementById('artist-tracks-grid'),

  detailView: document.getElementById('station-detail-view'),
  navViewLinks: Array.from(document.querySelectorAll('[data-nav-view]')),
  langOptionBtns: Array.from(document.querySelectorAll('[data-lang-option]')),
  brandHomeLink: document.getElementById('brand-home-link'),
  randomStationBtn: document.getElementById('random-station-btn'),
  backToStationsBtn: document.getElementById('back-to-stations-btn'),
  prevStationBtn: document.getElementById('prev-station-btn'),
  nextStationBtn: document.getElementById('next-station-btn'),
  stationTracksSection: document.getElementById('station-tracks-section'),
  podcastDetailSection: document.getElementById('podcast-detail-section'),
  trackSearchInput: document.getElementById('track-search-input'),
  tracksGrid: document.getElementById('tracks-grid'),
  tracksEmpty: document.getElementById('tracks-empty'),
  tracksEmptyTitle: document.getElementById('tracks-empty-title'),
  tracksEmptyText: document.getElementById('tracks-empty-text'),
  stationTrackCount: document.getElementById('station-track-count'),
  stationHeroEls: {
    heroEl: document.getElementById('station-hero'),
    heroImg: document.getElementById('station-hero-img'),
    logo: document.getElementById('station-detail-logo'),
    meta: document.getElementById('station-detail-meta'),
    title: document.getElementById('station-detail-title'),
    hosts: document.getElementById('station-detail-hosts'),
    description: document.getElementById('station-detail-description'),
  },

  playerBarEls: {
    bar: document.getElementById('audio-player-bar'),
    cover: document.getElementById('player-cover'),
    title: document.getElementById('player-title'),
    artist: document.getElementById('player-artist'),
    toggleBtn: document.getElementById('player-toggle-btn'),
    playIcon: document.getElementById('player-icon-play'),
    pauseIcon: document.getElementById('player-icon-pause'),
    spinnerIcon: document.getElementById('player-icon-spinner'),
    currentTime: document.getElementById('player-current-time'),
    duration: document.getElementById('player-duration'),
    seekInput: document.getElementById('player-seek'),
    ytSlot: document.getElementById('player-yt-slot'),
    ytMount: document.getElementById('player-yt-mount'),
    closeBtn: document.getElementById('player-close-btn'),
  },
};

const player = new AudioPlayerController({
  onStateChange: () => {
    refreshActivePlaybackUi();
  },
});

player.bindBarElements(dom.playerBarEls);

function refreshActivePlaybackUi() {
  if (appState.activeView === 'songs') {
    renderSongsView();
  } else if (appState.activeView === 'artist' && appState.activeArtistSlug) {
    const artist = findArtistBySlug(appState.activeArtistSlug);
    if (artist) {
      renderArtistView(artist);
    }
  } else if (appState.activeView === 'station' && appState.activeStationId) {
    const station = STATIONS.find((s) => s.id === appState.activeStationId);
    if (station) {
      if (station.podcast) {
        renderPodcastDetail({
          station,
          containerEl: dom.podcastDetailSection,
          playerState: player.getState(),
          onPlayPodcastBroadcast: playPodcastBroadcast,
        });
      } else {
        renderActiveTracklist(station);
      }
    }
  }
}

function playPodcastBroadcast(station) {
  if (!station?.podcast?.videoId) return;
  const virtualTrack = {
    id: `${station.id}-broadcast`,
    number: 1,
    title: station.podcast.videoTitle || `${station.name} Full Broadcast`,
    artist: station.hosts || station.name,
    cover: station.logo || null,
    youtubeId: station.podcast.videoId,
    youtubeUrl: station.podcast.videoUrl,
    spotifyPreviewUrl: null,
    audio: null,
    sourceOrigin: 'official',
    playbackStatus: 'available',
  };
  player.toggleTrack(virtualTrack, station);
}

function findArtistBySlug(slug, fallbackName = null) {
  const exact = ALL_ARTISTS_INDEX.find((a) => a.slug === slug);
  if (exact) return exact;
  if (fallbackName) {
    const extracted = extractArtists(fallbackName);
    for (const candidate of extracted) {
      const candidateSlug = slugify(candidate);
      const hit = ALL_ARTISTS_INDEX.find(
        (a) => a.slug === candidateSlug || normalizeText(a.name) === normalizeText(candidate)
      );
      if (hit) return hit;
    }
  }
  return (
    ALL_ARTISTS_INDEX.find(
      (a) => a.slug.length >= 3 && (slug.startsWith(`${a.slug}-`) || slug.includes(a.slug))
    ) || null
  );
}

function populateStationFilterSelect() {
  if (!dom.stationFilterSelect) return;
  const previousValue = dom.stationFilterSelect.value || appState.stationFilter || 'all';
  const musicStations = STATIONS.filter((s) => !s.podcast && s.tracks.length > 0);
  const options = [
    `<option value="all">${t('explorer.allStationsWithCount', { count: ALL_SONGS_INDEX.length })}</option>`,
  ];
  for (const st of musicStations) {
    options.push(`<option value="${st.id}">${st.name} (${formatNumber(st.tracks.length)})</option>`);
  }
  dom.stationFilterSelect.innerHTML = options.join('');
  dom.stationFilterSelect.value = previousValue;
}

function renderSummaryMetrics() {
  const stats = computeCatalogStats(STATIONS);
  dom.summaryMetrics.innerHTML = `
    <span class="explorer-metric"><strong>${formatNumber(stats.stationCount)}</strong> ${t('explorer.metricStations')}</span>
    <span class="hero__metric-sep" aria-hidden="true">·</span>
    <span class="explorer-metric"><strong>${formatNumber(stats.podcastCount)}</strong> ${t('explorer.metricPodcasts')}</span>
    <span class="hero__metric-sep" aria-hidden="true">·</span>
    <span class="explorer-metric"><strong>${formatNumber(stats.totalTracks)}</strong> ${t('explorer.metricSongs')}</span>
    <span class="hero__metric-sep" aria-hidden="true">·</span>
    <span class="explorer-metric"><strong>${formatNumber(stats.artistCount)}</strong> ${t('explorer.metricArtists')}</span>
  `;
}

function renderSongsView() {
  const filtered = filterAllSongs(ALL_SONGS_INDEX, {
    query: appState.searchQuery,
    stationId: appState.stationFilter,
  });

  renderAllSongsGrid({
    entries: filtered,
    totalCount: ALL_SONGS_INDEX.length,
    visibleLimit: appState.songsLimit,
    gridEl: dom.songsGrid,
    emptyEl: dom.songsEmpty,
    countEl: dom.songsResultsCount,
    loadMoreWrapEl: dom.songsLoadMoreWrap,
    loadMoreBtnEl: dom.songsLoadMoreBtn,
    playerState: player.getState(),
    onToggleTrack: (track, station) => {
      player.toggleTrack(track, station);
    },
    onSelectStation: (stationId) => {
      navigateToStation(stationId);
    },
    onSelectArtist: (slug, rawName) => {
      const resolved = findArtistBySlug(slug, rawName);
      navigateToArtist(resolved ? resolved.slug : slug);
    },
  });
}

function renderStationsView() {
  const filtered = filterStations(STATIONS, {
    category: appState.stationCategory,
    query: appState.searchQuery,
  });

  renderStationsGrid({
    gridEl: dom.stationsGrid,
    emptyEl: dom.stationsEmpty,
    countEl: dom.stationResultsCount,
    stations: filtered,
    totalCount: STATIONS.length,
    onSelectStation: (stationId) => {
      navigateToStation(stationId);
    },
  });
}

function renderArtistsView() {
  const filtered = filterArtists(ALL_ARTISTS_INDEX, {
    query: appState.searchQuery,
    stationId: appState.stationFilter,
  });

  renderArtistsGrid({
    artists: filtered,
    totalCount: ALL_ARTISTS_INDEX.length,
    visibleLimit: appState.artistsLimit,
    gridEl: dom.artistsGrid,
    emptyEl: dom.artistsEmpty,
    countEl: dom.artistsResultsCount,
    loadMoreWrapEl: dom.artistsLoadMoreWrap,
    loadMoreBtnEl: dom.artistsLoadMoreBtn,
    onSelectArtist: (slug) => {
      navigateToArtist(slug);
    },
  });
}

function renderArtistView(artist) {
  renderArtistDetail({
    artist,
    headerEls: dom.artistHeaderEls,
    tracksGridEl: dom.artistTracksGrid,
    playerState: player.getState(),
    onToggleTrack: (track, station) => {
      player.toggleTrack(track, station);
    },
    onSelectStation: (stationId) => {
      navigateToStation(stationId);
    },
  });
}

function renderActiveTracklist(station) {
  renderTracksList({
    station,
    query: appState.trackQuery,
    gridEl: dom.tracksGrid,
    emptyEl: dom.tracksEmpty,
    emptyTitleEl: dom.tracksEmptyTitle,
    emptyTextEl: dom.tracksEmptyText,
    countEl: dom.stationTrackCount,
    playerState: player.getState(),
    onToggleTrack: (track, currentStation) => {
      player.toggleTrack(track, currentStation);
    },
    onSelectArtist: (slug, rawName) => {
      const resolved = findArtistBySlug(slug, rawName);
      navigateToArtist(resolved ? resolved.slug : slug);
    },
  });
}

function updateExplorerControlsVisibility(viewName) {
  const isExplorer = viewName === 'songs' || viewName === 'stations' || viewName === 'artists';
  dom.explorerShell.hidden = !isExplorer;

  if (!isExplorer) return;

  dom.globalClearBtn.hidden = appState.searchQuery.trim().length === 0;
  dom.stationFilterWrap.hidden = viewName === 'stations';
  dom.stationCategoryTabs.hidden = viewName !== 'stations';
}

function updateNavActiveState(viewName) {
  const navKey =
    viewName === 'station'
      ? 'stations'
      : viewName === 'artist'
        ? 'artists'
        : viewName;

  dom.navViewLinks.forEach((link) => {
    const active = link.dataset.navView === navKey;
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function activateViewElement(targetEl) {
  [
    dom.songsView,
    dom.stationsView,
    dom.artistsView,
    dom.artistDetailView,
    dom.detailView,
  ].forEach((viewEl) => {
    if (!viewEl) return;
    const isTarget = viewEl === targetEl;
    viewEl.hidden = !isTarget;
    if (isTarget) {
      viewEl.classList.remove('view--entering');
      void viewEl.offsetWidth;
      viewEl.classList.add('view--entering');
    }
  });
}

function showSongsView({ scroll = false } = {}) {
  appState.activeView = 'songs';
  appState.activeStationId = null;
  appState.activeArtistSlug = null;
  updateExplorerControlsVisibility('songs');
  updateNavActiveState('songs');
  renderSongsView();
  activateViewElement(dom.songsView);
  document.title = t('meta.titleDefault');
  if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
}

function showStationsView({ scroll = false } = {}) {
  appState.activeView = 'stations';
  appState.activeStationId = null;
  appState.activeArtistSlug = null;
  updateExplorerControlsVisibility('stations');
  updateNavActiveState('stations');
  renderStationsView();
  activateViewElement(dom.stationsView);
  document.title = t('meta.titleStations');
  if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
}

function showArtistsView({ scroll = false } = {}) {
  appState.activeView = 'artists';
  appState.activeStationId = null;
  appState.activeArtistSlug = null;
  updateExplorerControlsVisibility('artists');
  updateNavActiveState('artists');
  renderArtistsView();
  activateViewElement(dom.artistsView);
  document.title = t('meta.titleArtists');
  if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
}

function showArtistDetail(slug) {
  const artist = findArtistBySlug(slug);
  if (!artist) {
    showArtistsView({ scroll: true });
    return;
  }
  appState.activeView = 'artist';
  appState.activeArtistSlug = artist.slug;
  appState.activeStationId = null;
  updateExplorerControlsVisibility('artist');
  updateNavActiveState('artist');
  renderArtistView(artist);
  activateViewElement(dom.artistDetailView);
  document.title = t('meta.titleDetail', { name: artist.name });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function showStationDetail(stationId) {
  const station = STATIONS.find((s) => s.id === stationId);
  if (!station) {
    showStationsView({ scroll: true });
    return;
  }

  appState.activeView = 'station';
  appState.activeStationId = station.id;
  appState.activeArtistSlug = null;
  appState.trackQuery = '';
  dom.trackSearchInput.value = '';

  updateExplorerControlsVisibility('station');
  updateNavActiveState('station');
  renderStationHeader(station, dom.stationHeroEls);

  if (station.podcast) {
    dom.stationTracksSection.hidden = true;
    dom.podcastDetailSection.hidden = false;
    renderPodcastDetail({
      station,
      containerEl: dom.podcastDetailSection,
      playerState: player.getState(),
      onPlayPodcastBroadcast: playPodcastBroadcast,
    });
  } else {
    dom.podcastDetailSection.hidden = true;
    dom.stationTracksSection.hidden = false;
    renderActiveTracklist(station);
    enrichStationTracksWithSpotify(station, {
      onTrackUpdated: () => {
        if (appState.activeStationId === station.id) {
          renderActiveTracklist(station);
        }
      },
    });
  }

  activateViewElement(dom.detailView);
  document.title = t('meta.titleDetail', { name: station.name });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function navigateToSongs({ scroll = true } = {}) {
  if (window.location.hash !== '#songs') {
    window.location.hash = '#songs';
  } else {
    showSongsView({ scroll });
  }
}

function navigateToStations({ scroll = true } = {}) {
  if (window.location.hash !== '#stations') {
    window.location.hash = '#stations';
  } else {
    showStationsView({ scroll });
  }
}

function navigateToArtists({ scroll = true } = {}) {
  if (window.location.hash !== '#artists') {
    window.location.hash = '#artists';
  } else {
    showArtistsView({ scroll });
  }
}

function navigateToStation(stationId) {
  const targetHash = buildStationHash(stationId);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    showStationDetail(stationId);
  }
}

function navigateToArtist(artistSlug) {
  const targetHash = buildArtistHash(artistSlug);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    showArtistDetail(artistSlug);
  }
}

function syncRouteFromHash() {
  const route = parseRouteHash(window.location.hash);
  if (route.view === 'station' && route.stationId) {
    showStationDetail(route.stationId);
  } else if (route.view === 'artist' && route.artistSlug) {
    showArtistDetail(route.artistSlug);
  } else if (route.view === 'stations') {
    showStationsView({ scroll: true });
  } else if (route.view === 'artists') {
    showArtistsView({ scroll: true });
  } else {
    showSongsView({ scroll: false });
  }
}

function renderActiveExplorerView() {
  dom.globalClearBtn.hidden = appState.searchQuery.trim().length === 0;
  if (appState.activeView === 'stations') {
    renderStationsView();
  } else if (appState.activeView === 'artists') {
    renderArtistsView();
  } else {
    renderSongsView();
  }
}

function setStationCategory(category) {
  appState.stationCategory = category;
  dom.stationCatBtns.forEach((btn) => {
    const isMatch = btn.dataset.stationCat === category;
    btn.classList.toggle('is-active', isMatch);
    btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
  });
  renderStationsView();
}

function resetSearchAndFilters() {
  appState.searchQuery = '';
  appState.stationFilter = 'all';
  appState.songsLimit = PAGE_BATCH_SIZE;
  appState.artistsLimit = PAGE_BATCH_SIZE;
  dom.globalSearchInput.value = '';
  dom.stationFilterSelect.value = 'all';
  setStationCategory('all');
  renderActiveExplorerView();
}

function bindEvents() {
  dom.globalSearchInput.addEventListener('input', (event) => {
    appState.searchQuery = event.target.value;
    appState.songsLimit = PAGE_BATCH_SIZE;
    appState.artistsLimit = PAGE_BATCH_SIZE;
    renderActiveExplorerView();
  });

  dom.globalClearBtn.addEventListener('click', () => {
    appState.searchQuery = '';
    appState.songsLimit = PAGE_BATCH_SIZE;
    appState.artistsLimit = PAGE_BATCH_SIZE;
    dom.globalSearchInput.value = '';
    dom.globalSearchInput.focus();
    renderActiveExplorerView();
  });

  dom.stationFilterSelect.addEventListener('change', (event) => {
    appState.stationFilter = event.target.value || 'all';
    appState.songsLimit = PAGE_BATCH_SIZE;
    appState.artistsLimit = PAGE_BATCH_SIZE;
    renderActiveExplorerView();
  });

  dom.stationCatBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setStationCategory(btn.dataset.stationCat || 'all');
    });
  });

  dom.navViewLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetView = link.dataset.navView;
      if (targetView === 'stations') navigateToStations({ scroll: true });
      else if (targetView === 'artists') navigateToArtists({ scroll: true });
      else navigateToSongs({ scroll: true });
    });
  });

  dom.brandHomeLink.addEventListener('click', (event) => {
    event.preventDefault();
    navigateToSongs({ scroll: true });
  });

  dom.songsLoadMoreBtn.addEventListener('click', () => {
    appState.songsLimit += PAGE_BATCH_SIZE;
    renderSongsView();
  });

  dom.artistsLoadMoreBtn.addEventListener('click', () => {
    appState.artistsLimit += PAGE_BATCH_SIZE;
    renderArtistsView();
  });

  dom.songsResetBtn.addEventListener('click', resetSearchAndFilters);
  dom.stationsResetBtn.addEventListener('click', resetSearchAndFilters);
  dom.artistsResetBtn.addEventListener('click', resetSearchAndFilters);

  dom.randomStationBtn.addEventListener('click', () => {
    const candidates = STATIONS.filter((s) => s.id !== appState.activeStationId);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || STATIONS[0];
    if (chosen) {
      navigateToStation(chosen.id);
    }
  });

  dom.backToStationsBtn.addEventListener('click', () => {
    navigateToStations({ scroll: true });
  });

  dom.backToArtistsBtn.addEventListener('click', () => {
    navigateToArtists({ scroll: true });
  });

  dom.prevStationBtn.addEventListener('click', () => {
    if (!appState.activeStationId) return;
    const { prevId } = getAdjacentStationIds(STATIONS, appState.activeStationId);
    if (prevId) navigateToStation(prevId);
  });

  dom.nextStationBtn.addEventListener('click', () => {
    if (!appState.activeStationId) return;
    const { nextId } = getAdjacentStationIds(STATIONS, appState.activeStationId);
    if (nextId) navigateToStation(nextId);
  });

  dom.trackSearchInput.addEventListener('input', (event) => {
    appState.trackQuery = event.target.value;
    const station = STATIONS.find((s) => s.id === appState.activeStationId);
    if (station && !station.podcast) {
      renderActiveTracklist(station);
    }
  });

  dom.langOptionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetLang = btn.dataset.langOption;
      if (targetLang) {
        setLocale(targetLang, { persist: true });
      }
    });
  });

  window.addEventListener('hashchange', syncRouteFromHash);
}

function refreshAllLocalizedContent() {
  populateStationFilterSelect();
  renderSummaryMetrics();
  player.syncBar();

  if (appState.activeView === 'station' && appState.activeStationId) {
    const station = STATIONS.find((s) => s.id === appState.activeStationId);
    if (station) {
      renderStationHeader(station, dom.stationHeroEls);
      document.title = t('meta.titleDetail', { name: station.name });
      if (station.podcast) {
        renderPodcastDetail({
          station,
          containerEl: dom.podcastDetailSection,
          playerState: player.getState(),
          onPlayPodcastBroadcast: playPodcastBroadcast,
        });
      } else {
        renderActiveTracklist(station);
      }
    }
  } else if (appState.activeView === 'artist' && appState.activeArtistSlug) {
    const artist = findArtistBySlug(appState.activeArtistSlug);
    if (artist) {
      renderArtistView(artist);
      document.title = t('meta.titleDetail', { name: artist.name });
    }
  } else if (appState.activeView === 'stations') {
    renderStationsView();
    document.title = t('meta.titleStations');
  } else if (appState.activeView === 'artists') {
    renderArtistsView();
    document.title = t('meta.titleArtists');
  } else {
    renderSongsView();
    document.title = t('meta.titleDefault');
  }
}

async function init() {
  initI18n();
  subscribeLocaleChange(() => {
    refreshAllLocalizedContent();
  });
  await handleSpotifyPkceCallback();
  populateStationFilterSelect();
  renderSummaryMetrics();
  bindEvents();
  syncRouteFromHash();
}

init();
