/**
 * English (EN) translation dictionary for GTA VI fm.
 * Serves as the default fallback language and covers all UI copy, accessibility labels,
 * player states, station genres/descriptions, and podcast editorial summaries.
 */

export const en = {
  locale: 'en',
  numberLocale: 'en-US',
  languageName: 'English',
  languageShort: 'EN',

  meta: {
    titleDefault: 'GTA VI fm — Grand Theft Auto VI Music, Radio & Artist Explorer',
    titleStations: 'Stations & Podcasts — GTA VI fm',
    titleArtists: 'Artists — GTA VI fm',
    titleDetail: '{name} — GTA VI fm',
    description:
      'Search and explore every Grand Theft Auto VI song, radio station, artist, podcast program, and official soundtrack with album covers and in-browser playback.',
  },

  common: {
    skipToContent: 'Skip to main content',
    close: 'Close',
    clear: 'Clear',
    loading: 'Loading...',
    previous: 'Previous',
    next: 'Next',
    explore: 'Explore',
    openPodcast: 'Open Podcast',
    languageLabel: 'Language',
    englishOption: 'English',
    portugueseOption: 'Português (Brasil)',
    switchLanguageAria: 'Switch language to {language}',
  },

  nav: {
    brandAria: 'gta6radio',
    primaryAria: 'Primary navigation',
    songs: 'Songs',
    stations: 'Stations',
    artists: 'Artists',
    randomStation: 'Random Station',
    randomStationTooltip: 'Jump to a random radio station or podcast',
  },

  explorer: {
    shellAria: 'Search and filter catalog',
    summaryAria: 'Catalog summary',
    metricStations: 'Stations',
    metricPodcasts: 'Podcasts',
    metricSongs: 'Songs',
    metricArtists: 'Artists',
    searchLabel: 'Search songs, artists, or radio stations',
    searchPlaceholder: 'Search songs, artists, or radio stations...',
    clearSearchAria: 'Clear search',
    stationFilterLabel: 'Filter by radio station',
    allStationsOption: 'All Stations',
    allStationsWithCount: 'All Stations ({count} songs)',
    stationCategoryAria: 'Filter stations by category',
    categoryAll: 'All',
    categoryMusic: 'Music',
    categoryPodcasts: 'Podcasts',
    categorySoundtrack: 'Album & Score',
  },

  songs: {
    viewAria: 'Songs catalog',
    loading: 'Loading songs...',
    countZero: '0 matching songs',
    countTotal: 'Showing {shown} of {total} cataloged songs',
    countFiltered: 'Showing {shown} of {total} matching songs',
    loadMore: 'Show {count} more songs ({remaining} remaining)',
    emptyTitle: 'No results found',
    emptyText: 'Try another song title, artist name, or reset the station filter.',
    emptyReset: 'Reset Search & Filters',
  },

  stations: {
    viewAria: 'Radio stations and podcasts',
    loading: 'Loading stations...',
    countTotal: '{count} cataloged stations, podcasts & collections',
    countFiltered: 'Showing {shown} of {total} stations, podcasts & collections',
    emptyTitle: 'No results found',
    emptyText:
      'We couldn’t find any radio stations, podcasts, or songs matching your current filters.',
    emptyReset: 'Show All Stations',
    openAria: 'Open {name}',
    artworkAlt: '{name} official artwork',
    logoAlt: '{name} official logo',
    hostedBy: 'Hosted by: {hosts}',
    hostsUnannounced: 'Hosts unannounced',
    noTracksListed: 'No tracks listed',
    trackSingular: '1 track',
    trackPlural: '{count} tracks',
    podcastSummaryWithParts: 'Podcast · {segments} segments · {parts} parts',
    podcastSummary: 'Podcast · {segments} segments',
  },

  artists: {
    viewAria: 'Artists directory',
    loading: 'Loading artists...',
    countZero: '0 matching artists',
    countTotal: 'Showing {shown} of {total} artists',
    countFiltered: 'Showing {shown} of {total} matching artists',
    loadMore: 'Show {count} more artists ({remaining} remaining)',
    emptyTitle: 'No results found',
    emptyText:
      'We couldn’t find any artists matching your current search or station filter.',
    emptyReset: 'Show All Artists',
    openAria: 'Open artist {name}',
    artworkAlt: '{name} artwork',
    songSingular: '1 song',
    songPlural: '{count} songs',
    stationSingular: '1 station',
    stationPlural: '{count} stations',
    backToArtists: 'Back to Artists',
    featuredStationsAria: 'Featured stations',
    detailHeading: 'Songs in GTA VI',
    detailMeta: '{songLabel} · Featured across {stationLabel}',
    catalogedSongSingular: '1 cataloged song',
    catalogedSongPlural: '{count} cataloged songs',
    radioStationSingular: '1 radio station',
    radioStationPlural: '{count} radio stations',
  },

  stationDetail: {
    backToStations: 'Back to Stations',
    previousStationAria: 'Previous station',
    nextStationAria: 'Next station',
    tracklistHeading: 'Tracklist',
    filterTracksLabel: 'Filter tracks on this station',
    filterTracksPlaceholder: 'Filter track or artist...',
    countZero: '0 cataloged tracks',
    countSingular: '1 cataloged track',
    countPlural: '{count} cataloged tracks',
    countFiltered: 'Showing {shown} of {total} tracks',
    emptyTitle: 'No results found',
    emptyText: 'Clear the search box to view all tracks on this station.',
  },

  track: {
    coverAlt: 'Album cover for {title} — {artist}',
    viewArtistTooltip: 'View songs by {artist}',
    unavailableAria: 'Audio unavailable for {title}',
    unavailableTooltip: 'No verified audio preview or YouTube stream available for this track',
    loadingAria: 'Loading {title}',
    pauseAria: 'Pause {title}',
    playAria: 'Play {title}',
  },

  podcast: {
    playFullBroadcast: 'Play Full Broadcast',
    pauseBroadcast: 'Pause Broadcast',
    loadingBroadcast: 'Loading Full Broadcast...',
    sourceVideo: 'Source Video ({channel})',
    hostsHeading: 'Hosts & Cast',
    themesHeading: 'Recurring Themes',
    segmentsHeading: 'Shows & Segments',
    documentedPrograms: '{count} documented programs',
    partsHeading: 'Source Broadcast Index',
    partsMeta: '{count} broadcast parts · {title}',
  },

  player: {
    barAria: 'Audio player',
    pausePlaybackAria: 'Pause playback',
    seekAria: 'Track progress',
    closeAria: 'Close player',
    coverAlt: 'Album cover for {title}',
    loadingMeta: '{artist} · Loading ({source})...',
    readyMeta: '{artist} · {station} · {source}',
    loadingTitleAria: 'Loading {title}',
    pauseTitleAria: 'Pause {title}',
    playTitleAria: 'Play {title}',
  },

  audio: {
    sourceLocal: 'Local audio',
    sourceSpotify: 'Spotify preview',
    sourceYoutubeOfficial: 'YouTube · Official',
    sourceYoutubeAlternative: 'YouTube · Alternative',
    sourceUnavailable: 'Audio unavailable',
    statusLoading: 'Loading audio...',
    statusPlayingAlt: 'Playing (alternative upload)',
    statusPlayingYoutube: 'Playing via YouTube',
    statusNowPlaying: 'Now playing',
    statusPaused: 'Paused',
    errorFileUnavailable: 'Audio file or preview unavailable.',
    errorResumeFailed: 'Unable to resume audio.',
    errorYtNotReady: 'YouTube player not initialized.',
    errorStreamFailed: 'Failed to load audio stream.',
    errorYtContainerMissing: 'YouTube player container not found.',
    errorYtApiTimeout: 'Timed out loading YouTube API.',
    errorYtApiLoadFailed: 'Failed to load YouTube player.',
    errorYtEmbedDisabled: 'Embedding disabled on YouTube',
    errorYtNotFound: 'YouTube video not found',
    errorYtInit: 'YouTube playback initialization error',
    errorYtUnavailable: 'Unavailable on YouTube in this browser',
  },

  footer: {
    linksAria: 'Developer links',
    githubAria: 'GitHub — denricol (opens in a new tab)',
    githubTooltip: 'GitHub — denricol',
    websiteAria: 'Personal website (opens in a new tab)',
    websiteTooltip: 'Personal Website',
  },

  catalog: {
    stations: {
      'flash-fm': {
        genre: 'Pop · Dance · Current Hits',
        hosts: 'Robyn & Alex Consani',
        description:
          'Vice City flagship pop station returning to Leonida, blending global pop anthems, synth-pop, and dancefloor favorites.',
      },
      'vice-city-fm': {
        genre: 'Pop · New Wave · 80s',
        hosts: null,
        description:
          'Retro station devoted to sophisticated 1980s pop, synth-pop, and new wave classics that shaped Vice City’s signature sound.',
      },
      'emotion-98-3': {
        genre: 'Pop · Soft Rock · Power Ballads',
        hosts: 'Doug Stanhope (Doug Van Dyke)',
        description:
          'Classic station of dramatic ballads, soft rock, and heartfelt hits built for sunset coastal drives across Leonida.',
      },
      vcrr: {
        genre: 'Hip Hop · Trap · Modern Rap',
        hosts: null,
        description:
          'Dedicated to contemporary rap, Florida trap, and standout releases from Vice City’s urban music scene.',
      },
      'dirty-south-classics': {
        genre: 'Southern Hip Hop · Crunk · 90s/00s',
        hosts: 'Trick Daddy & Trina',
        description:
          'Essential Southern rap, crunk, and Miami bass anthems from the 1990s and 2000s, hosted by two Miami icons.',
      },
      'cocoteo-fm': {
        genre: 'Reggaeton · Dembow · Bachata · Merengue',
        hosts: 'El Martillo & La Gata',
        description:
          'Hosted by El Martillo & La Gata, bringing together contemporary Latin urban reggaeton, dembow, bachata, and merengue.',
      },
      'radio-la-ola': {
        genre: 'Salsa · Tropical · Latin Classics',
        hosts: 'Emilio & Gloria Estefan',
        description:
          'Classic salsa, Cuban descarga, and tropical rhythms celebrating Vice City’s vibrant Latin musical heritage.',
      },
      'v-rock': {
        genre: 'Hard Rock · Classic Rock',
        hosts: 'Lindsey Buckingham (The Buck) & Michael McDonald (Skipper McD)',
        description:
          'The return of Vice City’s legendary rock station, packed with arena guitars, 70s and 80s hard rock, and iconic hosts.',
      },
      'the-chamber-106-6': {
        genre: 'Heavy Metal · Thrash · Metal',
        hosts: 'Kerry King (DJ Kerry) & Tom Araya (DJ Tom)',
        description:
          'Heavy frequency dedicated to thrash, heavy metal, and timeless metal anthems hosted by Slayer members.',
      },
      'honey-fm': {
        genre: 'R&B · Soul · Slow Jams',
        hosts: 'Chilli & T-Boz (TLC), featuring Craig Robinson',
        description:
          'Curated 1990s and 2000s R&B, neo-soul, and romantic slow jams hosted by members of TLC.',
      },
      'afrobank-fm': {
        genre: 'Afrobeats · Amapiano · African Music',
        hosts: 'Burna Boy (Burna) & Palms Trax (Palmsy)',
        description:
          'From classic highlife to amapiano, 3-step, and modern afrofusion, connecting the African sonic diaspora to Leonida nights.',
      },
      'back-country-radio': {
        genre: 'Country · Outlaw Country · Southern Roots',
        hosts: 'Morgan Wallen (MW), Lana Del Rey (Delta Dawne) & Jeremy Dufrene',
        description:
          'The soundtrack for Leonida’s rural highways, Grassrivers, and Port Gellhorn, rooted in traditional country and Southern stories.',
      },
      'stockyard-fm': {
        genre: 'Indie Dance · Electro Pop',
        hosts: 'The Dare (Harrison) & PinkPantheress (Victoria)',
        description:
          'Forward-leaning curation of indie dance, electroclash, and alternative club electronics for late-night floors.',
      },
      'circoloco-records-radio': {
        genre: 'House · Tech-House · Club',
        hosts: 'Seth Troxler (DJ Seth) & Antonio Carbonaro (DJ Antonio)',
        description:
          'Partnership with CircoLoco Records delivering underground house, tech-house, and peak-hour club sets.',
      },
      'worldwide-fm': {
        genre: 'House · Jazz · Worldbeat · Eclectic',
        hosts: 'Gilles Peterson',
        description:
          'Eclectic broadcast curated by Gilles Peterson, uniting jazz-funk, global beats, UK electronics, and Brazilian rhythms.',
      },
      'kaleidoscope-fm': {
        genre: 'Dance · International Covers',
        hosts: null,
        description:
          'Distinctive frequency dedicated to stylized international covers and bold cross-language reinterpretations of pop and dance hits.',
      },
      'radio-on-u': {
        genre: 'Reggae · Dub · Lovers Rock',
        hosts: 'Adrian Sherwood',
        description:
          'Roots reggae, lovers rock, and experimental dub transmissions curated by acclaimed British producer Adrian Sherwood.',
      },
      'gloriana-blues-radio': {
        genre: 'Classic Blues · Electric Blues',
        hosts: 'Buddy Guy (DJ Buddy) & Keith Richards (DJ Keith)',
        description:
          'Historic Delta and Chicago acoustic and electric blues selections presented by Buddy Guy and Keith Richards.',
      },
      'leonida-jazz-radio': {
        genre: 'Jazz Fusion · Instrumental',
        hosts: null,
        description:
          'Focused on 1970s jazz fusion, instrumental virtuosity, and contemporary jazz collaborations.',
      },
      'symphony-fm': {
        genre: 'Classical · Orchestral',
        hosts: 'Yuja Wang (as Yuja)',
        description:
          'Symphonic masterworks, piano concertos, and orchestral repertoire featuring Sibelius, Mahler, Debussy, Prokofiev, and Handel.',
      },
      'the-vault-radio': {
        genre: 'Electronic · Rave · Continuous Mix',
        hosts: 'DJ Pretzel',
        description:
          'Unlockable underground electronic, house, and techno station unlocked by scanning a hidden poster inside The Vault nightclub in Vice City. Features 24 deep club cuts curated by DJ Pretzel.',
      },
      'thrillbilly-mud-club-radio': {
        genre: 'Nu-Metal, Thrash & Dirty South Rock',
        hosts: 'Localized Broadcast (Frogswater)',
        description:
          'Proximity-based localized radio broadcast heard around the Thrillbilly Mud Club off-road park in Frogswater, blending heavy nu-metal, thrash classics, and Dirty South anthems.',
      },
      'the-sniper-of-la-perle': {
        genre: 'Haitian Rap, Kompa & Florida Hip-Hop',
        hosts: 'Kodak Black & Michaël Brun',
        description:
          'Unlockable 22-track Haitian & Florida hip-hop mixtape hosted by Kodak Black and presented by Michaël Brun, unlocked via the WAiNK poster scanner in La Perle and Crosstown.',
      },
      'the-wipe': {
        genre: 'Podcast · Comedy & Satirical Talk',
        hosts: 'Anitta (Dr. Nita), John Leguizamo & Janelle James',
        description:
          'Satirical talk radio and on-demand podcast network across Leonida, anchored by Ask Dr. Nita, El Otro Lado, and She Got Assets.',
      },
      wktt: {
        genre: 'Podcast · Political & Sports Satire',
        hosts: 'Jason Sudeikis (Richard Bastion), Stavros Halkias & Sasheer Zamata',
        description:
          'Return of GTA IV’s infamous talk station, broadcasting alternating full-length shows from The Richard Bastion Show and Hit the Bricks.',
      },
      'gta-6-the-album': {
        genre: 'Official Album · 34 Original Tracks',
        hosts: 'Rockstar Games & Atlantic Records',
        description:
          'Official 34-track compilation of original songs created for the world of Grand Theft Auto VI in partnership with Atlantic Records.',
      },
      'gta-6-original-score': {
        genre: 'Original Score · Electronic',
        hosts: 'Justice (Gaspard Augé & Xavier de Rosnay)',
        description:
          'Dynamic, cinematic original score composed by French electronic duo Justice for missions and key narrative moments.',
      },
      'various-unassigned': {
        genre: 'Trailers & Previews · Additional Tracks',
        hosts: null,
        description:
          'Tracks featured in official Grand Theft Auto VI trailers and previews not tied to a single FM dial frequency.',
      },
    },
    podcasts: {
      'the-wipe': {
        format: 'Satirical Talk Radio & On-Demand Podcast',
        style:
          'Unhinged late-night call-in advice, bilingual Leonida cultural satire, parody wellness/finance grifts, and absurd in-universe commercials.',
        partPrefix: 'Part',
        hosts: [
          { name: 'Anitta', role: 'Dr. Nita (Ask Dr. Nita)' },
          { name: 'John Leguizamo', role: 'Enrique "El Enigma" Romero (El Otro Lado)' },
          { name: 'Janelle James', role: 'Tish (She Got Assets)' },
        ],
        topics: [
          'Toxic exes & chaotic Vice City relationship advice',
          'Bilingual Leonida culture & street folklore',
          'Influencer financial scams & wellness grifting',
          'Satirical local commercials (Leonida Lottery, Street Trash 3D Zombifier)',
        ],
        segments: {
          'wipe-ask-dr-nita': {
            host: 'Anitta (as Dr. Nita)',
            description:
              'Chaotic, unapologetically unqualified relationship and "healing" advice show featuring absurd caller confessions and outrageous prescriptions.',
          },
          'wipe-x-marks-the-spot': {
            host: 'Anitta (as Dr. Nita)',
            description:
              'Recurring confrontation segment where Dr. Nita brings her chaotic exes on air—such as a former stripper named Bobby—to rehash burned houses and Vice City hookup landmarks.',
          },
          'wipe-el-otro-lado': {
            host: 'John Leguizamo (as Enrique "El Enigma" Romero)',
            description:
              'Bilingual talk segment diving into the surreal side of Leonida society, urban legends, and unfiltered listener call-ins.',
          },
          'wipe-she-got-assets': {
            host: 'Janelle James (as Tish)',
            description:
              'Sharp satire of online wealth gurus, questionable hustle culture, bad investments, and luxury consumer obsession.',
          },
        },
      },
      wktt: {
        format: 'Conservative Satire Talk Radio & Call-In Shows',
        style:
          'Bombastic right-wing shock-jock monologues, loud drive-time sports-radio outrage, adversarial guest interviews, and unhinged callers.',
        partPrefix: 'Part',
        hosts: [
          { name: 'Jason Sudeikis', role: 'Richard Bastion (The Richard Bastion Show)' },
          { name: 'Stavros Halkias', role: 'Dominic "The Brick" Brizzolato (Hit the Bricks)' },
          { name: 'Sasheer Zamata', role: 'Marie (Hit the Bricks co-host / contributor)' },
        ],
        topics: [
          'Over-the-top political outrage & "anti-woke" media parody',
          'Manosphere radio & survivalist caller rants',
          'Leonida sports scandals & toxic talk-radio debates',
          'Satirical insurance, police union, and consumer culture ads',
        ],
        segments: {
          'wktt-richard-bastion': {
            host: 'Jason Sudeikis (as Richard Bastion)',
            description:
              'Reprising his role from GTA IV, Bastion delivers fiery, hyper-partisan tirades against modern technology, pop culture, and perceived conspiracies while fielding erratic callers and guests.',
          },
          'wktt-hit-the-bricks': {
            host: 'Stavros Halkias (as Dominic "The Brick" Brizzolato) & Sasheer Zamata (as Marie)',
            description:
              'High-volume Vice City sports and culture-war drive-time hour mocking reactionary sports punditry, athlete controversies, and bizarre listener call-ins.',
          },
          'wktt-commercials': {
            host: 'WKTT Broadcast Ensemble',
            description:
              'Alternating between flagship shows, WKTT airs biting parody ads skewering predatory insurance, hyper-militarized policing, and corporate excess.',
          },
        },
      },
    },
  },
};
