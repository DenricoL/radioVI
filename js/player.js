import { formatTime } from './catalog.js';
import { resolveTrackCover } from './covers.js';
import { resolveTrackAudioSource } from './audio-sources.js';
import { YouTubeEmbedDriver } from './youtube.js';
import { t } from './i18n/index.js';

/**
 * Pure state machine helper for multi-source track playback transitions (unit-testable).
 */
export function computeNextPlayerState(state, track, station, resolvedSource = null) {
  const source = resolvedSource || resolveTrackAudioSource(track);
  if (!track || !source.playable) {
    return { action: 'unavailable', state };
  }

  if (state.trackId === track.id && !state.errorMessage) {
    if (state.isLoading) {
      return {
        action: 'pause',
        state: { ...state, isPlaying: false, isLoading: false },
      };
    }
    return {
      action: state.isPlaying ? 'pause' : 'resume',
      state: {
        ...state,
        isPlaying: !state.isPlaying,
        isLoading: false,
      },
    };
  }

  const coverInfo = resolveTrackCover(track, station ? station.accent : '#ff4fa3');

  return {
    action: 'load-and-play',
    source,
    state: {
      trackId: track.id,
      stationId: station ? station.id : state.stationId,
      stationName: station ? station.name : state.stationName,
      title: track.title,
      artist: track.artist,
      cover: coverInfo.src,
      coverFallback: coverInfo.fallbackSrc,
      sourceType: source.type,
      sourceOrigin: source.origin || 'none',
      sourceLabelKey: source.labelKey || null,
      sourceLabel: source.label,
      audioSrc: source.url || null,
      youtubeId: source.youtubeId || null,
      isPlaying: false,
      isLoading: true,
      errorKey: null,
      errorMessage: null,
      currentTime: 0,
      duration: 0,
    },
  };
}

export class AudioPlayerController {
  constructor({ onStateChange } = {}) {
    this.audio = typeof Audio !== 'undefined' ? new Audio() : null;
    this.ytDriver = null;
    this.onStateChange = onStateChange || (() => {});
    this.state = {
      trackId: null,
      stationId: null,
      stationName: '',
      title: '',
      artist: '',
      cover: '',
      coverFallback: '',
      sourceType: null,
      sourceOrigin: 'none',
      sourceLabelKey: null,
      sourceLabel: '',
      audioSrc: null,
      youtubeId: null,
      isPlaying: false,
      isLoading: false,
      errorKey: null,
      errorMessage: null,
      currentTime: 0,
      duration: 0,
    };
    this.barEls = null;
    this.bindAudioEvents();
  }

  bindBarElements(els) {
    this.barEls = els;
    if (!els) return;

    if (els.cover) {
      els.cover.addEventListener('error', () => {
        if (this.state.coverFallback && els.cover.src !== this.state.coverFallback) {
          els.cover.src = this.state.coverFallback;
        }
      });
    }

    if (els.ytMount) {
      this.ytDriver = new YouTubeEmbedDriver({
        mountEl: els.ytMount,
        onStateChange: ({ isPlaying, isLoading, ended }) => {
          if (this.state.sourceType !== 'youtube') return;
          this.state.isPlaying = Boolean(isPlaying);
          this.state.isLoading = Boolean(isLoading);
          if (ended) {
            this.state.isPlaying = false;
            this.state.isLoading = false;
            this.state.currentTime = 0;
          }
          if (isPlaying) {
            this.state.errorKey = null;
            this.state.errorMessage = null;
          }
          this.syncBar();
          this.onStateChange(this.getState());
        },
        onProgress: ({ currentTime, duration }) => {
          if (this.state.sourceType !== 'youtube') return;
          this.state.currentTime = currentTime;
          this.state.duration = duration;
          this.syncProgressValues(currentTime, duration);
        },
        onError: (keyOrMessage) => {
          if (this.state.sourceType !== 'youtube') return;
          this.state.isPlaying = false;
          this.state.isLoading = false;
          if (typeof keyOrMessage === 'string' && keyOrMessage.startsWith('audio.')) {
            this.state.errorKey = keyOrMessage;
            this.state.errorMessage = t(keyOrMessage);
          } else {
            this.state.errorKey = null;
            this.state.errorMessage = keyOrMessage;
          }
          this.syncBar();
          this.onStateChange(this.getState());
        },
      });
    }

    els.toggleBtn.addEventListener('click', () => {
      this.toggleCurrent();
    });

    els.closeBtn.addEventListener('click', () => {
      this.stopAndClose();
    });

    els.seekInput.addEventListener('input', (event) => {
      const ratio = Number(event.target.value) / 100;
      if (this.state.sourceType === 'youtube' && this.ytDriver) {
        const dur = this.ytDriver.getDuration() || this.state.duration;
        if (dur > 0) {
          this.ytDriver.seekTo(ratio * dur);
        }
        return;
      }

      if (!this.audio || !Number.isFinite(this.audio.duration) || this.audio.duration <= 0) {
        return;
      }
      this.audio.currentTime = ratio * this.audio.duration;
    });
  }

  bindAudioEvents() {
    if (!this.audio) return;

    this.audio.addEventListener('loadstart', () => {
      if (this.state.sourceType !== 'audio') return;
      this.state.isLoading = true;
      this.syncBar();
      this.onStateChange(this.getState());
    });

    this.audio.addEventListener('playing', () => {
      if (this.state.sourceType !== 'audio') return;
      this.state.isPlaying = true;
      this.state.isLoading = false;
      this.state.errorKey = null;
      this.state.errorMessage = null;
      this.syncBar();
      this.onStateChange(this.getState());
    });

    this.audio.addEventListener('play', () => {
      if (this.state.sourceType !== 'audio') return;
      this.state.isPlaying = true;
      this.state.errorKey = null;
      this.state.errorMessage = null;
      this.syncBar();
      this.onStateChange(this.getState());
    });

    this.audio.addEventListener('pause', () => {
      if (this.state.sourceType !== 'audio') return;
      this.state.isPlaying = false;
      this.state.isLoading = false;
      this.syncBar();
      this.onStateChange(this.getState());
    });

    this.audio.addEventListener('ended', () => {
      if (this.state.sourceType !== 'audio') return;
      this.state.isPlaying = false;
      this.state.isLoading = false;
      this.state.currentTime = 0;
      this.syncProgressValues(0, this.state.duration);
      this.syncBar();
      this.onStateChange(this.getState());
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.state.sourceType !== 'audio') return;
      const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
      const current = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
      this.state.currentTime = current;
      this.state.duration = duration;
      this.syncProgressValues(current, duration);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.state.sourceType !== 'audio') return;
      const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
      const current = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
      this.state.duration = duration;
      this.syncProgressValues(current, duration);
    });

    this.audio.addEventListener('error', () => {
      if (this.state.sourceType !== 'audio') return;
      this.state.isPlaying = false;
      this.state.isLoading = false;
      this.state.errorKey = 'audio.errorFileUnavailable';
      this.state.errorMessage = t('audio.errorFileUnavailable');
      this.syncBar();
      this.onStateChange(this.getState());
    });
  }

  getState() {
    return { ...this.state };
  }

  stopAllEngines() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    if (this.ytDriver) {
      this.ytDriver.stop();
    }
  }

  async toggleTrack(track, station) {
    const decision = computeNextPlayerState(this.state, track, station);
    if (decision.action === 'unavailable') {
      return false;
    }

    if (decision.action === 'pause') {
      if (this.state.sourceType === 'youtube') {
        this.ytDriver?.pause();
        this.state.isPlaying = false;
        this.state.isLoading = false;
        this.syncBar();
        this.onStateChange(this.getState());
      } else {
        this.audio?.pause();
      }
      return true;
    }

    if (decision.action === 'resume') {
      if (this.state.sourceType === 'youtube') {
        this.state.isLoading = true;
        this.syncBar();
        this.onStateChange(this.getState());
        this.ytDriver?.play();
      } else {
        try {
          await this.audio?.play();
        } catch {
          this.state.isPlaying = false;
          this.state.isLoading = false;
          this.state.errorKey = 'audio.errorResumeFailed';
          this.state.errorMessage = t('audio.errorResumeFailed');
          this.syncBar();
          this.onStateChange(this.getState());
        }
      }
      return true;
    }

    // Stop any previous playback engine before starting the newly selected track
    this.stopAllEngines();

    this.state = decision.state;
    this.syncProgressValues(0, 0);
    this.syncBar();
    this.onStateChange(this.getState());

    if (decision.source.type === 'youtube') {
      if (!this.ytDriver) {
        this.state.isLoading = false;
        this.state.errorKey = 'audio.errorYtNotReady';
        this.state.errorMessage = t('audio.errorYtNotReady');
        this.syncBar();
        this.onStateChange(this.getState());
        return false;
      }
      await this.ytDriver.loadAndPlay(decision.source.youtubeId);
      return true;
    }

    if (this.audio && decision.source.url) {
      this.audio.src = decision.source.url;
      this.audio.load();
      try {
        await this.audio.play();
      } catch {
        this.state.isPlaying = false;
        this.state.isLoading = false;
        this.state.errorKey = 'audio.errorStreamFailed';
        this.state.errorMessage = t('audio.errorStreamFailed');
        this.syncBar();
        this.onStateChange(this.getState());
      }
    }
    return true;
  }

  async toggleCurrent() {
    if (!this.state.trackId) return;

    if (this.state.sourceType === 'youtube' && this.ytDriver) {
      if (this.state.isPlaying) {
        this.ytDriver.pause();
        this.state.isPlaying = false;
        this.state.isLoading = false;
        this.syncBar();
        this.onStateChange(this.getState());
      } else {
        this.state.isLoading = true;
        this.syncBar();
        this.onStateChange(this.getState());
        this.ytDriver.play();
      }
      return;
    }

    if (!this.audio) return;
    if (this.state.isPlaying) {
      this.audio.pause();
    } else {
      try {
        await this.audio.play();
      } catch {
        this.state.isPlaying = false;
        this.state.isLoading = false;
        this.syncBar();
        this.onStateChange(this.getState());
      }
    }
  }

  stopAndClose() {
    this.stopAllEngines();
    this.state = {
      trackId: null,
      stationId: null,
      stationName: '',
      title: '',
      artist: '',
      cover: '',
      coverFallback: '',
      sourceType: null,
      sourceOrigin: 'none',
      sourceLabelKey: null,
      sourceLabel: '',
      audioSrc: null,
      youtubeId: null,
      isPlaying: false,
      isLoading: false,
      errorKey: null,
      errorMessage: null,
      currentTime: 0,
      duration: 0,
    };
    this.syncProgressValues(0, 0);
    this.syncBar();
    this.onStateChange(this.getState());
  }

  syncProgressValues(current, duration) {
    if (!this.barEls) return;
    this.barEls.currentTime.textContent = formatTime(current);
    this.barEls.duration.textContent = formatTime(duration);
    this.barEls.seekInput.value = duration > 0 ? String(Math.round((current / duration) * 100)) : '0';
  }

  syncBar() {
    if (!this.barEls) return;
    const hasTrack = Boolean(this.state.trackId);
    this.barEls.bar.hidden = !hasTrack;
    if (!hasTrack) {
      if (this.barEls.ytSlot) {
        this.barEls.ytSlot.hidden = true;
      }
      return;
    }

    if (this.barEls.ytSlot) {
      this.barEls.ytSlot.hidden = this.state.sourceType !== 'youtube';
    }

    this.barEls.cover.src = this.state.cover;
    this.barEls.cover.alt = t('player.coverAlt', { title: this.state.title });
    this.barEls.title.textContent = this.state.title;

    const resolvedSourceLabel = this.state.sourceLabelKey
      ? t(this.state.sourceLabelKey)
      : this.state.sourceLabel;

    if (this.state.errorKey || this.state.errorMessage) {
      this.barEls.artist.textContent = this.state.errorKey
        ? t(this.state.errorKey)
        : this.state.errorMessage;
    } else if (this.state.isLoading) {
      this.barEls.artist.textContent = t('player.loadingMeta', {
        artist: this.state.artist,
        source: resolvedSourceLabel,
      });
    } else {
      this.barEls.artist.textContent = t('player.readyMeta', {
        artist: this.state.artist,
        station: this.state.stationName,
        source: resolvedSourceLabel,
      });
    }

    this.barEls.toggleBtn.classList.toggle('is-loading', Boolean(this.state.isLoading));
    if (this.barEls.spinnerIcon) {
      this.barEls.spinnerIcon.toggleAttribute('hidden', !this.state.isLoading);
    }
    this.barEls.playIcon.toggleAttribute('hidden', Boolean(this.state.isLoading || this.state.isPlaying));
    this.barEls.pauseIcon.toggleAttribute('hidden', Boolean(this.state.isLoading || !this.state.isPlaying));

    this.barEls.toggleBtn.setAttribute(
      'aria-label',
      this.state.isLoading
        ? t('player.loadingTitleAria', { title: this.state.title })
        : this.state.isPlaying
          ? t('player.pauseTitleAria', { title: this.state.title })
          : t('player.playTitleAria', { title: this.state.title })
    );
  }
}
