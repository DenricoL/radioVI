/**
 * Brazilian Portuguese (PT-BR) translation dictionary for GTA VI fm.
 * Keeps official song titles, artist names, station names, album titles, and podcast
 * program titles unchanged while translating all UI copy, controls, errors,
 * station descriptions, and podcast editorial summaries.
 */

export const ptBR = {
  locale: 'pt-BR',
  numberLocale: 'pt-BR',
  languageName: 'Português (Brasil)',
  languageShort: 'PT-BR',

  meta: {
    titleDefault: 'GTA VI fm — Explorador de Músicas, Rádios e Artistas de Grand Theft Auto VI',
    titleStations: 'Rádios e Podcasts — GTA VI fm',
    titleArtists: 'Artistas — GTA VI fm',
    titleDetail: '{name} — GTA VI fm',
    description:
      'Pesquise e explore todas as músicas, estações de rádio, artistas, podcasts e trilhas oficiais de Grand Theft Auto VI com capas de álbuns e reprodução no navegador.',
  },

  common: {
    skipToContent: 'Pular para o conteúdo principal',
    close: 'Fechar',
    clear: 'Limpar',
    loading: 'Carregando...',
    previous: 'Anterior',
    next: 'Próxima',
    explore: 'Explorar',
    openPodcast: 'Abrir Podcast',
    languageLabel: 'Idioma',
    englishOption: 'English',
    portugueseOption: 'Português (Brasil)',
    switchLanguageAria: 'Alterar idioma para {language}',
  },

  nav: {
    brandAria: 'gta6radio',
    primaryAria: 'Navegação principal',
    songs: 'Músicas',
    stations: 'Rádios',
    artists: 'Artistas',
    randomStation: 'Rádio Aleatória',
    randomStationTooltip: 'Ir para uma estação de rádio ou podcast aleatório',
  },

  explorer: {
    shellAria: 'Pesquisar e filtrar catálogo',
    summaryAria: 'Resumo do catálogo',
    metricStations: 'Rádios',
    metricPodcasts: 'Podcasts',
    metricSongs: 'Músicas',
    metricArtists: 'Artistas',
    searchLabel: 'Pesquisar músicas, artistas ou rádios',
    searchPlaceholder: 'Pesquisar músicas, artistas ou rádios...',
    clearSearchAria: 'Limpar pesquisa',
    stationFilterLabel: 'Filtrar por estação de rádio',
    allStationsOption: 'Todas as rádios',
    allStationsWithCount: 'Todas as rádios ({count} músicas)',
    stationCategoryAria: 'Filtrar rádios por categoria',
    categoryAll: 'Todas',
    categoryMusic: 'Música',
    categoryPodcasts: 'Podcasts',
    categorySoundtrack: 'Álbum e Trilha',
  },

  songs: {
    viewAria: 'Catálogo de músicas',
    loading: 'Carregando músicas...',
    countZero: '0 músicas encontradas',
    countTotal: 'Exibindo {shown} de {total} músicas catalogadas',
    countFiltered: 'Exibindo {shown} de {total} músicas correspondentes',
    loadMore: 'Mostrar mais {count} músicas ({remaining} restantes)',
    emptyTitle: 'Nenhum resultado encontrado',
    emptyText: 'Tente outro título de música, nome de artista ou redefina o filtro de rádio.',
    emptyReset: 'Redefinir busca e filtros',
  },

  stations: {
    viewAria: 'Estações de rádio e podcasts',
    loading: 'Carregando rádios...',
    countTotal: '{count} rádios, podcasts e coleções catalogados',
    countFiltered: 'Exibindo {shown} de {total} rádios, podcasts e coleções',
    emptyTitle: 'Nenhum resultado encontrado',
    emptyText:
      'Não encontramos nenhuma rádio, podcast ou música correspondente aos filtros atuais.',
    emptyReset: 'Mostrar todas as rádios',
    openAria: 'Abrir {name}',
    artworkAlt: 'Arte oficial de {name}',
    logoAlt: 'Logotipo oficial de {name}',
    hostedBy: 'Apresentação: {hosts}',
    hostsUnannounced: 'Apresentadores não anunciados',
    noTracksListed: 'Nenhuma faixa listada',
    trackSingular: '1 faixa',
    trackPlural: '{count} faixas',
    podcastSummaryWithParts: 'Podcast · {segments} quadros · {parts} partes',
    podcastSummary: 'Podcast · {segments} quadros',
  },

  artists: {
    viewAria: 'Diretório de artistas',
    loading: 'Carregando artistas...',
    countZero: '0 artistas encontrados',
    countTotal: 'Exibindo {shown} de {total} artistas',
    countFiltered: 'Exibindo {shown} de {total} artistas correspondentes',
    loadMore: 'Mostrar mais {count} artistas ({remaining} restantes)',
    emptyTitle: 'Nenhum resultado encontrado',
    emptyText:
      'Não encontramos nenhum artista correspondente à busca ou ao filtro de rádio atual.',
    emptyReset: 'Mostrar todos os artistas',
    openAria: 'Abrir artista {name}',
    artworkAlt: 'Arte de {name}',
    songSingular: '1 música',
    songPlural: '{count} músicas',
    stationSingular: '1 rádio',
    stationPlural: '{count} rádios',
    backToArtists: 'Voltar para Artistas',
    featuredStationsAria: 'Rádios em destaque',
    detailHeading: 'Músicas em GTA VI',
    detailMeta: '{songLabel} · Presente em {stationLabel}',
    catalogedSongSingular: '1 música catalogada',
    catalogedSongPlural: '{count} músicas catalogadas',
    radioStationSingular: '1 estação de rádio',
    radioStationPlural: '{count} estações de rádio',
  },

  stationDetail: {
    backToStations: 'Voltar para Rádios',
    previousStationAria: 'Rádio anterior',
    nextStationAria: 'Próxima rádio',
    tracklistHeading: 'Lista de músicas',
    filterTracksLabel: 'Filtrar faixas nesta rádio',
    filterTracksPlaceholder: 'Filtrar faixa ou artista...',
    countZero: '0 faixas catalogadas',
    countSingular: '1 faixa catalogada',
    countPlural: '{count} faixas catalogadas',
    countFiltered: 'Exibindo {shown} de {total} faixas',
    emptyTitle: 'Nenhum resultado encontrado',
    emptyText: 'Limpe o campo de busca para visualizar todas as faixas desta rádio.',
  },

  track: {
    coverAlt: 'Capa do álbum de {title} — {artist}',
    viewArtistTooltip: 'Ver músicas de {artist}',
    unavailableAria: 'Áudio indisponível para {title}',
    unavailableTooltip: 'Nenhuma prévia de áudio verificada ou transmissão no YouTube disponível para esta faixa',
    loadingAria: 'Carregando {title}',
    pauseAria: 'Pausar {title}',
    playAria: 'Reproduzir {title}',
  },

  podcast: {
    playFullBroadcast: 'Reproduzir transmissão completa',
    pauseBroadcast: 'Pausar transmissão',
    loadingBroadcast: 'Carregando transmissão completa...',
    sourceVideo: 'Vídeo original ({channel})',
    hostsHeading: 'Apresentadores e Elenco',
    themesHeading: 'Temas Recorrentes',
    segmentsHeading: 'Programas e Quadros',
    documentedPrograms: '{count} programas documentados',
    partsHeading: 'Índice da Transmissão Original',
    partsMeta: '{count} partes da transmissão · {title}',
  },

  player: {
    barAria: 'Player de áudio',
    pausePlaybackAria: 'Pausar reprodução',
    seekAria: 'Progresso da faixa',
    closeAria: 'Fechar player',
    coverAlt: 'Capa do álbum de {title}',
    loadingMeta: '{artist} · Carregando ({source})...',
    readyMeta: '{artist} · {station} · {source}',
    loadingTitleAria: 'Carregando {title}',
    pauseTitleAria: 'Pausar {title}',
    playTitleAria: 'Reproduzir {title}',
  },

  audio: {
    sourceLocal: 'Áudio local',
    sourceSpotify: 'Prévia do Spotify',
    sourceYoutubeOfficial: 'YouTube · Oficial',
    sourceYoutubeAlternative: 'YouTube · Alternativo',
    sourceUnavailable: 'Áudio indisponível',
    statusLoading: 'Carregando áudio...',
    statusPlayingAlt: 'Tocando (envio alternativo)',
    statusPlayingYoutube: 'Tocando via YouTube',
    statusNowPlaying: 'Tocando agora',
    statusPaused: 'Pausado',
    errorFileUnavailable: 'Arquivo de áudio ou prévia indisponível.',
    errorResumeFailed: 'Não foi possível retomar o áudio.',
    errorYtNotReady: 'Player do YouTube não inicializado.',
    errorStreamFailed: 'Falha ao carregar o stream de áudio.',
    errorYtContainerMissing: 'Contêiner do player do YouTube não encontrado.',
    errorYtApiTimeout: 'Tempo esgotado ao carregar a API do YouTube.',
    errorYtApiLoadFailed: 'Falha ao carregar o player do YouTube.',
    errorYtEmbedDisabled: 'Incorporação desativada no YouTube',
    errorYtNotFound: 'Vídeo do YouTube não encontrado',
    errorYtInit: 'Erro ao inicializar reprodução do YouTube',
    errorYtUnavailable: 'Indisponível no YouTube neste navegador',
  },

  footer: {
    linksAria: 'Links do desenvolvedor',
    githubAria: 'GitHub — denricol (abre em uma nova aba)',
    githubTooltip: 'GitHub — denricol',
    websiteAria: 'Site pessoal (abre em uma nova aba)',
    websiteTooltip: 'Site Pessoal',
  },

  catalog: {
    stations: {
      'flash-fm': {
        genre: 'Pop · Dance · Sucessos Atuais',
        hosts: 'Robyn & Alex Consani',
        description:
          'A principal estação pop de Vice City retorna a Leonida, misturando hinos do pop mundial, synth-pop e sucessos das pistas.',
      },
      'vice-city-fm': {
        genre: 'Pop · New Wave · Anos 80',
        hosts: null,
        description:
          'Estação retrô dedicada ao pop sofisticado dos anos 1980, synth-pop e clássicos da new wave que moldaram a identidade sonora de Vice City.',
      },
      'emotion-98-3': {
        genre: 'Pop · Soft Rock · Baladas',
        hosts: 'Doug Stanhope (Doug Van Dyke)',
        description:
          'Estação clássica de baladas dramáticas, soft rock e sucessos apaixonados feitos para dirigir pela costa de Leonida ao pôr do sol.',
      },
      vcrr: {
        genre: 'Hip Hop · Trap · Rap Moderno',
        hosts: null,
        description:
          'Dedicada ao rap contemporâneo, ao trap da Flórida e aos principais lançamentos da cena urbana de Vice City.',
      },
      'dirty-south-classics': {
        genre: 'Hip Hop Sulista · Crunk · Anos 90/2000',
        hosts: 'Trick Daddy & Trina',
        description:
          'Clássicos essenciais do rap sulista, crunk e Miami bass dos anos 1990 e 2000, apresentados por dois ícones de Miami.',
      },
      'cocoteo-fm': {
        genre: 'Reggaeton · Dembow · Bachata · Merengue',
        hosts: 'El Martillo & La Gata',
        description:
          'Apresentada por El Martillo & La Gata, reunindo o melhor do reggaeton urbano latino contemporâneo, dembow, bachata e merengue.',
      },
      'radio-la-ola': {
        genre: 'Salsa · Tropical · Clássicos Latinos',
        hosts: 'Emilio & Gloria Estefan',
        description:
          'Salsa clássica, descarga cubana e ritmos tropicais celebrando a vibrante herança musical latina de Vice City.',
      },
      'v-rock': {
        genre: 'Hard Rock · Rock Clássico',
        hosts: 'Lindsey Buckingham (The Buck) & Michael McDonald (Skipper McD)',
        description:
          'O retorno da lendária rádio de rock de Vice City, repleta de guitarras de arena, hard rock dos anos 70 e 80 e apresentadores icônicos.',
      },
      'the-chamber-106-6': {
        genre: 'Heavy Metal · Thrash · Metal',
        hosts: 'Kerry King (DJ Kerry) & Tom Araya (DJ Tom)',
        description:
          'Frequência pesada dedicada ao thrash, heavy metal e hinos eternos do metal, apresentada por integrantes do Slayer.',
      },
      'honey-fm': {
        genre: 'R&B · Soul · Slow Jams',
        hosts: 'Chilli & T-Boz (TLC), com participação de Craig Robinson',
        description:
          'Seleção de R&B dos anos 1990 e 2000, neo-soul e slow jams românticas apresentada pelas integrantes do TLC.',
      },
      'afrobank-fm': {
        genre: 'Afrobeats · Amapiano · Música Africana',
        hosts: 'Burna Boy (Burna) & Palms Trax (Palmsy)',
        description:
          'Do highlife clássico ao amapiano, 3-step e afrofusion moderno, conectando a diáspora sonora africana às noites de Leonida.',
      },
      'back-country-radio': {
        genre: 'Country · Outlaw Country · Raízes Sulistas',
        hosts: 'Morgan Wallen (MW), Lana Del Rey (Delta Dawne) & Jeremy Dufrene',
        description:
          'A trilha sonora das rodovias rurais de Leonida, de Grassrivers e de Port Gellhorn, com raízes no country tradicional e nas histórias do Sul.',
      },
      'stockyard-fm': {
        genre: 'Indie Dance · Electro Pop',
        hosts: 'The Dare (Harrison) & PinkPantheress (Victoria)',
        description:
          'Curadoria vanguardista de indie dance, electroclash e música eletrônica alternativa para as madrugadas nas pistas.',
      },
      'circoloco-records-radio': {
        genre: 'House · Tech-House · Club',
        hosts: 'Seth Troxler (DJ Seth) & Antonio Carbonaro (DJ Antonio)',
        description:
          'Parceria com a CircoLoco Records trazendo house underground, tech-house e sets para o auge das festas.',
      },
      'worldwide-fm': {
        genre: 'House · Jazz · Worldbeat · Eclética',
        hosts: 'Gilles Peterson',
        description:
          'Transmissão eclética comandada por Gilles Peterson, unindo jazz-funk, batidas globais, eletrônica britânica e ritmos brasileiros.',
      },
      'kaleidoscope-fm': {
        genre: 'Dance · Covers Internacionais',
        hosts: null,
        description:
          'Frequência distinta dedicada a covers internacionais estilizados e releituras ousadas em vários idiomas de sucessos pop e dance.',
      },
      'radio-on-u': {
        genre: 'Reggae · Dub · Lovers Rock',
        hosts: 'Adrian Sherwood',
        description:
          'Transmissões de reggae roots, lovers rock e dub experimental com curadoria do renomado produtor britânico Adrian Sherwood.',
      },
      'gloriana-blues-radio': {
        genre: 'Blues Clássico · Blues Elétrico',
        hosts: 'Buddy Guy (DJ Buddy) & Keith Richards (DJ Keith)',
        description:
          'Seleções históricas de blues acústico e elétrico do Delta e de Chicago apresentadas por Buddy Guy e Keith Richards.',
      },
      'leonida-jazz-radio': {
        genre: 'Jazz Fusion · Instrumental',
        hosts: null,
        description:
          'Focada no jazz fusion dos anos 1970, virtuosismo instrumental e colaborações contemporâneas do jazz.',
      },
      'symphony-fm': {
        genre: 'Música Clássica · Orquestral',
        hosts: 'Yuja Wang (como Yuja)',
        description:
          'Obras-primas sinfônicas, concertos para piano e repertório orquestral com Sibelius, Mahler, Debussy, Prokofiev e Handel.',
      },
      'the-vault-radio': {
        genre: 'Eletrônica · Rave · Mix Contínuo',
        hosts: 'DJ Pretzel',
        description:
          'Estação underground de música eletrônica, house e techno desbloqueada ao escanear um pôster oculto dentro da boate The Vault em Vice City. Traz 24 faixas de pista selecionadas por DJ Pretzel.',
      },
      'thrillbilly-mud-club-radio': {
        genre: 'Nu-Metal, Thrash & Dirty South Rock',
        hosts: 'Transmissão local (Frogswater)',
        description:
          'Transmissão de rádio local por proximidade ouvida nos arredores do parque off-road Thrillbilly Mud Club em Frogswater, misturando nu-metal pesado, clássicos do thrash e hinos do Dirty South.',
      },
      'the-sniper-of-la-perle': {
        genre: 'Rap Haitiano, Kompa & Hip-Hop da Flórida',
        hosts: 'Kodak Black & Michaël Brun',
        description:
          'Mixtape desbloqueável de 22 faixas de hip-hop haitiano e da Flórida apresentada por Kodak Black e Michaël Brun, liberada pelo scanner de pôsteres WAiNK em La Perle e Crosstown.',
      },
      'the-wipe': {
        genre: 'Podcast · Comédia e Talk Show Satírico',
        hosts: 'Anitta (Dr. Nita), John Leguizamo & Janelle James',
        description:
          'Rede de talk radio satírica e podcast sob demanda por toda Leonida, liderada pelos quadros Ask Dr. Nita, El Otro Lado e She Got Assets.',
      },
      wktt: {
        genre: 'Podcast · Sátira Política e Esportiva',
        hosts: 'Jason Sudeikis (Richard Bastion), Stavros Halkias & Sasheer Zamata',
        description:
          'O retorno da infame rádio de debates de GTA IV, alternando programas completos de The Richard Bastion Show e Hit the Bricks.',
      },
      'gta-6-the-album': {
        genre: 'Álbum Oficial · 34 Faixas Originais',
        hosts: 'Rockstar Games & Atlantic Records',
        description:
          'Coletânea oficial com 34 músicas originais criadas para o universo de Grand Theft Auto VI em parceria com a Atlantic Records.',
      },
      'gta-6-original-score': {
        genre: 'Trilha Sonora Original · Eletrônica',
        hosts: 'Justice (Gaspard Augé & Xavier de Rosnay)',
        description:
          'Trilha sonora original dinâmica e cinematográfica composta pela dupla eletrônica francesa Justice para missões e momentos-chave da história.',
      },
      'various-unassigned': {
        genre: 'Trailers e Prévias · Faixas Adicionais',
        hosts: null,
        description:
          'Faixas apresentadas nos trailers e prévias oficiais de Grand Theft Auto VI que não pertencem a uma única frequência FM.',
      },
    },
    podcasts: {
      'the-wipe': {
        format: 'Talk Radio Satírico e Podcast Sob Demanda',
        style:
          'Conselhos caóticos de madrugada com participação de ouvintes, sátira cultural bilíngue de Leonida, paródias de gurus financeiros e comerciais absurdos do universo do jogo.',
        partPrefix: 'Parte',
        hosts: [
          { name: 'Anitta', role: 'Dr. Nita (Ask Dr. Nita)' },
          { name: 'John Leguizamo', role: 'Enrique "El Enigma" Romero (El Otro Lado)' },
          { name: 'Janelle James', role: 'Tish (She Got Assets)' },
        ],
        topics: [
          'Ex-namorados tóxicos e conselhos caóticos de relacionamento em Vice City',
          'Cultura bilíngue de Leonida e folclore urbano',
          'Golpes financeiros de influenciadores e picaretagem de bem-estar',
          'Comerciais locais satíricos (Leonida Lottery, Street Trash 3D Zombifier)',
        ],
        segments: {
          'wipe-ask-dr-nita': {
            host: 'Anitta (como Dr. Nita)',
            description:
              'Programa caótico de conselhos amorosos e "cura" sem nenhuma qualificação, com confissões absurdas de ouvintes e recomendações ultrajantes.',
          },
          'wipe-x-marks-the-spot': {
            host: 'Anitta (como Dr. Nita)',
            description:
              'Quadro recorrente de confronto em que Dr. Nita leva seus ex-namorados caóticos ao ar — como Bobby, um ex-stripper — para relembrar casas incendiadas e pontos de encontro em Vice City.',
          },
          'wipe-el-otro-lado': {
            host: 'John Leguizamo (como Enrique "El Enigma" Romero)',
            description:
              'Quadro bilíngue que mergulha no lado surreal da sociedade de Leonida, lendas urbanas e ligações sem filtro dos ouvintes.',
          },
          'wipe-she-got-assets': {
            host: 'Janelle James (como Tish)',
            description:
              'Sátira afiada sobre gurus financeiros da internet, cultura duvidosa da correria, investimentos furados e obsessão por consumo de luxo.',
          },
        },
      },
      wktt: {
        format: 'Talk Radio Conservador Satírico e Programas de Debate',
        style:
          'Monólogos bombásticos de radialistas ultraconservadores, debates esportivos estridentes no horário de pico, entrevistas hostis e ouvintes fora de controle.',
        partPrefix: 'Parte',
        hosts: [
          { name: 'Jason Sudeikis', role: 'Richard Bastion (The Richard Bastion Show)' },
          { name: 'Stavros Halkias', role: 'Dominic "The Brick" Brizzolato (Hit the Bricks)' },
          { name: 'Sasheer Zamata', role: 'Marie (coapresentadora / comentarista de Hit the Bricks)' },
        ],
        topics: [
          'Indignação política exagerada e paródia da mídia "anti-woke"',
          'Rádio da manosfera e desabafos de ouvintes sobrevivencialistas',
          'Escândalos esportivos de Leonida e debates tóxicos no rádio',
          'Anúncios satíricos de seguradoras, sindicato policial e cultura de consumo',
        ],
        segments: {
          'wktt-richard-bastion': {
            host: 'Jason Sudeikis (como Richard Bastion)',
            description:
              'Retomando seu papel de GTA IV, Bastion faz discursos inflamados e hiperpartidários contra a tecnologia moderna, a cultura pop e supostas conspirações enquanto atende ouvintes e convidados erráticos.',
          },
          'wktt-hit-the-bricks': {
            host: 'Stavros Halkias (como Dominic "The Brick" Brizzolato) & Sasheer Zamata (como Marie)',
            description:
              'Programa esportivo e de guerra cultural em alto volume no trânsito de Vice City, satirizando comentaristas reacionários, polêmicas de atletas e ligações bizarras.',
          },
          'wktt-commercials': {
            host: 'Elenco da WKTT',
            description:
              'Alternando entre os programas principais, a WKTT exibe comerciais paródicos mordazes que criticam seguradoras predatórias, policiamento hipermilitarizado e excessos corporativos.',
          },
        },
      },
    },
  },
};
