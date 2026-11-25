/**
 * Controlador oficial da YouTube IFrame Player API (`https://www.youtube.com/iframe_api`).
 * Carrega o script sob demanda e mantém o player visível dentro da barra de reprodução
 * para respeitar as políticas de incorporação da plataforma.
 */

import { t } from './i18n/index.js';

let ytApiPromise = null;

export function loadYouTubeIframeApi() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('DOM unavailable'));
  }

  if (window.YT && typeof window.YT.Player === 'function') {
    return Promise.resolve(window.YT);
  }

  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    const timeoutId = window.setTimeout(() => {
      reject(new Error('audio.errorYtApiTimeout'));
    }, 15_000);

    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeoutId);
      if (typeof previousCallback === 'function') {
        try {
          previousCallback();
        } catch {
          // Ignore errors from external callbacks
        }
      }
      resolve(window.YT);
    };

    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeoutId);
        ytApiPromise = null;
        reject(new Error('audio.errorYtApiLoadFailed'));
      };
      document.head.appendChild(script);
    }
  });

  return ytApiPromise;
}

export function mapYouTubeErrorKey(code) {
  switch (Number(code)) {
    case 101:
    case 150:
      return 'audio.errorYtEmbedDisabled';
    case 100:
      return 'audio.errorYtNotFound';
    case 2:
    case 5:
      return 'audio.errorYtInit';
    default:
      return 'audio.errorYtUnavailable';
  }
}

export function mapYouTubeErrorMessage(code) {
  return t(mapYouTubeErrorKey(code));
}

export class YouTubeEmbedDriver {
  constructor({ mountEl, onStateChange, onProgress, onError } = {}) {
    this.mountEl = mountEl;
    this.onStateChange = onStateChange || (() => {});
    this.onProgress = onProgress || (() => {});
    this.onError = onError || (() => {});
    this.player = null;
    this.isReady = false;
    this.pendingVideoId = null;
    this.currentVideoId = null;
    this.progressTimer = null;
  }

  setMountElement(mountEl) {
    this.mountEl = mountEl;
  }

  startProgressPolling() {
    this.stopProgressPolling();
    this.progressTimer = window.setInterval(() => {
      if (!this.player || typeof this.player.getCurrentTime !== 'function') return;
      const currentTime = Number(this.player.getCurrentTime()) || 0;
      const duration = Number(this.player.getDuration()) || 0;
      this.onProgress({ currentTime, duration });
    }, 300);
  }

  stopProgressPolling() {
    if (this.progressTimer !== null) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  async loadAndPlay(videoId) {
    if (!this.mountEl) {
      this.onError('audio.errorYtContainerMissing');
      return;
    }

    this.pendingVideoId = videoId;
    this.currentVideoId = videoId;

    let YT;
    try {
      YT = await loadYouTubeIframeApi();
    } catch (error) {
      this.onError(error.message || 'audio.errorYtApiLoadFailed');
      return;
    }

    // Abort if another track superseded while loading
    if (this.pendingVideoId !== videoId) return;

    if (!this.player) {
      this.isReady = false;
      this.mountEl.innerHTML = '';
      const targetDiv = document.createElement('div');
      this.mountEl.appendChild(targetDiv);

      this.player = new YT.Player(targetDiv, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            this.isReady = true;
            if (this.pendingVideoId && this.pendingVideoId !== videoId) {
              event.target.loadVideoById(this.pendingVideoId);
            } else {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            const state = event.data;
            const PlayerState = window.YT?.PlayerState || {};

            if (state === PlayerState.PLAYING) {
              this.startProgressPolling();
              const duration = Number(this.player?.getDuration?.()) || 0;
              const currentTime = Number(this.player?.getCurrentTime?.()) || 0;
              this.onStateChange({ isPlaying: true, isLoading: false, ended: false });
              this.onProgress({ currentTime, duration });
            } else if (state === PlayerState.BUFFERING) {
              this.onStateChange({ isPlaying: false, isLoading: true, ended: false });
            } else if (state === PlayerState.PAUSED) {
              this.stopProgressPolling();
              this.onStateChange({ isPlaying: false, isLoading: false, ended: false });
            } else if (state === PlayerState.ENDED) {
              this.stopProgressPolling();
              this.onStateChange({ isPlaying: false, isLoading: false, ended: true });
            }
          },
          onError: (event) => {
            this.stopProgressPolling();
            this.onError(mapYouTubeErrorKey(event.data));
          },
        },
      });
      return;
    }

    if (this.isReady && typeof this.player.loadVideoById === 'function') {
      this.player.loadVideoById(videoId);
    }
  }

  play() {
    if (this.player && this.isReady && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  pause() {
    this.stopProgressPolling();
    if (this.player && this.isReady && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
    }
  }

  stop() {
    this.pendingVideoId = null;
    this.currentVideoId = null;
    this.stopProgressPolling();
    if (this.player && this.isReady && typeof this.player.stopVideo === 'function') {
      try {
        this.player.stopVideo();
      } catch {
        // Ignore stop errors if iframe was detached
      }
    }
  }

  seekTo(seconds) {
    if (this.player && this.isReady && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
    }
  }

  getDuration() {
    if (this.player && this.isReady && typeof this.player.getDuration === 'function') {
      return Number(this.player.getDuration()) || 0;
    }
    return 0;
  }
}
