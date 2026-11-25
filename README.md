# GTA VI fm — Grand Theft Auto VI Radio Catalog & Tier List

Interactive web application built exclusively with **HTML5, CSS3, and Vanilla ES Modules JavaScript** to browse every Grand Theft Auto VI radio station, host lineup, official soundtrack collection, individual album cover, in-browser track playback, and custom **Tier List Maker**.

## Project Structure

```text
.
├── index.html
├── css/
│   ├── style.css          # Minimalist black, punctual pink, white/gray palette and CSS/SVG backdrop
│   ├── components.css     # Station cards, Spotify-style track cards, Tier List Maker, Player bar
│   └── responsive.css     # Laptop, tablet, and smartphone breakpoints
├── js/
│   ├── main.js            # Hash routing (Home, Radio Stations, Tier List Maker, Station Detail)
│   ├── data.js            # 26 catalog entries (23 radio stations + 3 soundtrack collections, 320 tracks)
│   ├── catalog.js         # Pure filtering, search, routing, and SVG emblem helpers
│   ├── stations.js        # Station catalog grid renderer
│   ├── music.js           # Station profile and Spotify-style tracklist renderer
│   ├── tier-list-state.js # Pure Tier List state, deduplicated moves, URL serialization
│   ├── tier-list.js       # Pointer Events drag & drop (desktop + touch), quick-assign, PNG Canvas export
│   ├── covers.js          # Album cover resolver with vector fallback
│   ├── spotify.js         # Client-side Spotify PKCE integration
│   ├── audio-sources.js   # Structured YouTube & preview source resolution
│   ├── youtube.js         # Official YouTube IFrame Player API controller
│   ├── player.js          # Global unified audio player controller
│   └── catalog.test.mjs   # Unit test suite (node:test)
└── public/assets/
    ├── aistudio/          # Official station logos & soundtrack promotional artwork
    └── stations/          # Additional official station logos (WKTT, CircoLoco Records)
```

## Key Features

1. **Three Primary Sections**:
   - **Home (`#home`)**: Minimalist Vice City nocturnal showcase with catalog metrics and featured stations & soundtracks.
   - **Radio Stations (`#stations`)**: Searchable, category-filtered directory of all 26 stations & soundtrack collections, opening into full tracklists (`#station/<id>`).
   - **Tier List Maker (`#tier-list`)**: Drag and drop all 23 radio stations across customizable `S`–`F` tiers (mouse, touch, or tap-to-assign), edit ranking title, tier names & colors, persist in `localStorage`, share via URL (`#tier-list?r=...`), and export high-resolution PNG images.
2. **Visual Identity & Official Assets**:
   - Minimalist dark palette (black predominant, punctual pink highlights, crisp white/gray text) powered by CSS/SVG geometry—without AI-generated background images.
   - Official station logos with contrast-aware plates (`logoSurface: 'dark' | 'light'`) and dedicated official artwork for **Grand Theft Auto VI: The Album** and **GTA VI: Original Score by Justice**.

## Deploying to GitHub Pages

This project includes `.github/workflows/deploy-pages.yml` and relative asset paths (`base: './'`) so it runs cleanly on both root domains and project subpaths (`https://<user>.github.io/<repo>/`).

1. Push the repository to GitHub on the `main` branch.
2. Open **Settings → Pages** in your GitHub repository and set **Source** to **GitHub Actions**.
3. Trigger or wait for the **Deploy GTA VI fm to GitHub Pages** workflow to publish `dist/`.

## Content Sources

- [GTABase — GTA 6 Radio Stations](https://www.gtabase.com/gta-6/radio-stations/)
- [GTA Wiki — Radio Stations in GTA VI](https://gta.fandom.com/wiki/Radio_Stations_in_GTA_VI)
