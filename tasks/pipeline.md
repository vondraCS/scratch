# Scratch — Full Project Pipeline

> Comprehensive development pipeline covering backend, frontend structure, frontend design, API integration, testing, and future features. Each stage groups work that should happen concurrently. Complete all items in a stage before moving to the next.

---

## Stage 1: Foundation Cleanup

**Prerequisite:** None — this is the starting point.

**Goal:** Clean codebase with consistent types, no dead code, no anti-patterns. Everything compiles cleanly.

### Backend
- [ ] Consolidate `StoreData` into single canonical definition in `src/types/music.ts`
- [ ] Export `PlaylistInfo` and `StoreData` from `src/types/music.ts`
- [ ] Remove duplicate `StoreData` from `src/ipc/handlers.ts` and `src/types/electron-api.d.ts`
- [ ] Import shared types in `handlers.ts` and `electron-api.d.ts` from `music.ts`
- [ ] Remove unused `import { connect } from 'http2'` in `handlers.ts`
- [ ] Fix `readStore()` default return to `{ filePath: '', favoriteAlbums: [], favoritePlaylists: [], recentlyPlayed: [] }`
- [ ] Remove commented-out `compactCardInfo`/`arrayToParsedPlaylistInfo` code blocks
- [ ] Fix `getPlaylistFromName` return type to `Playlist | null`

### Frontend Structure
- [ ] Remove DOM manipulation functions from `Main.tsx` (`populateHomepage`, `updateSectionRecentlyPlayed`, `updateSectionPlaylists`, `updateSectionAlbums`)
- [ ] Remove `populateHomepage()` call that runs during render
- [ ] Remove unused `StoreData` import from `Main.tsx`
- [ ] Remove unused `PlaylistCompactCard` import from `ParseFiles.tsx`
- [ ] Keep Recently Played section in JSX but render empty (placeholder for Stage 4)

### Verify
- [ ] `npm start` launches without errors
- [ ] No TypeScript compilation errors
- [ ] No unused import warnings in console

---

## Stage 2: Core Backend Systems

**Prerequisite:** Stage 1 complete.

**Goal:** Two major backend systems built in parallel — M3U playlist parsing and audio file serving. These are independent and can be developed simultaneously.

### Stream A: M3U Parsing & Playlist CRUD

#### Types (`src/types/music.ts`)
- [ ] Add `ParsedM3U` interface (`name`, `description`, `coverArt`, `artistName`, `year`, `trackPaths`)

#### M3U Module (`src/ipc/m3u.ts` — new file)
- [ ] `parseM3UFile(filePath)` — read file, parse `#EXTM3U`, `#PLAYLIST`, `#EXTINF`, `#EXTART`, `#EXTIMG`, `#EXTDESC` directives, resolve relative track paths
- [ ] `writeM3UFile(filePath, data)` — write extended M3U with all directives
- [ ] `collectM3UFiles(dir)` — recursively find `.m3u`/`.m3u8` files

#### IPC Handlers (`src/ipc/handlers.ts`)
- [ ] `scanPlaylists()` — collect M3U files, parse into `Playlist[]`, cache in `cachedPlaylists`
- [ ] `createPlaylist(name, trackPaths, description?)` — write M3U to `{storageDir}/playlists/`
- [ ] `addTrackToPlaylist(playlistPath, trackPath)` — append entry to M3U
- [ ] `removeTrackFromPlaylist(playlistPath, trackIndex)` — rewrite M3U without entry
- [ ] `deletePlaylist(playlistPath)` — delete M3U file from disk
- [ ] `renamePlaylist(playlistPath, newName)` — rename file + update `#PLAYLIST` line

#### IPC Wiring
- [ ] Add 7 new channel constants to `src/ipc/channels.ts` (`SCAN_PLAYLISTS`, `GET_PLAYLISTS`, `CREATE_PLAYLIST`, `ADD_TO_PLAYLIST`, `REMOVE_FROM_PLAYLIST`, `DELETE_PLAYLIST`, `RENAME_PLAYLIST`)
- [ ] Register all handlers in `registerIpcHandlers()`
- [ ] Expose all methods in `src/preload.ts`
- [ ] Add method signatures to `ElectronAPI` in `src/types/electron-api.d.ts`
- [ ] Add renderer-side wrappers in `src/tsx/ParseFiles.tsx`

### Stream B: Audio Playback Engine

#### Custom Protocol (`src/index.ts`)
- [ ] Import `protocol` and `net` from Electron
- [ ] Register `scratch-audio://` protocol in `app.on('ready')` using `protocol.handle()` + `net.fetch()`
- [ ] Protocol decodes URL to local file path and serves the audio file

#### AudioEngine Singleton (`src/tsx/Player/AudioEngine.ts` — new file)
- [ ] Internal `Audio` instance (HTML5 Audio API)
- [ ] State: `currentTrack`, `isPlaying`, `currentTime`, `duration`, `volume`, `isMuted`, `shuffleEnabled`, `repeatMode`, `queue`, `queueIndex`
- [ ] `play(track, queue, queueIndex)` — load via `scratch-audio://` URL, start playback
- [ ] `pause()` / `resume()` / `stop()`
- [ ] `seek(time)` — set `audio.currentTime`
- [ ] `setVolume(vol)` / `toggleMute()`
- [ ] `next()` — advance queue (shuffle-aware: shuffled index array; repeat-aware: off/one/all)
- [ ] `previous()` — if >3s into track, restart; else go to previous
- [ ] `setQueue(tracks, startIndex)` — replace current queue
- [ ] `setShuffle(enabled)` — toggle + regenerate shuffled indices
- [ ] `setRepeat(mode)` — cycle off/one/all
- [ ] `onStateChange(callback)` — subscribe for React context bridge
- [ ] Event listeners: `timeupdate`, `ended`, `loadedmetadata`, `error`
- [ ] On `ended`: auto-advance via `next()` respecting repeat mode

### Verify
- [ ] M3U: create a test `.m3u` file in storage dir, call `scanPlaylists()` via DevTools console, confirm parsed result
- [ ] Audio: instantiate AudioEngine in DevTools console, call `play()` with a known track, confirm audio output

---

## Stage 3: Global State & App Architecture

**Prerequisite:** Stage 2 complete (both streams).

**Goal:** Centralized React state management replacing all per-component data loading. AudioEngine bridged to React. App-level initialization.

### AppContext (`src/tsx/AppContext.tsx` — new file)
- [ ] Define `AppState` interface (library, playback, navigation, store data)
- [ ] Define `ViewType` union: `'home' | 'songs' | 'albums' | 'playlists' | 'artists' | 'album-detail' | 'playlist-detail' | 'artist-detail'`
- [ ] Define `ViewParams` interface (`albumName?`, `artistName?`, `playlistPath?`)
- [ ] Define `AppAction` discriminated union (all action types)
- [ ] Implement `appReducer(state, action)` — handles all state transitions
- [ ] Create `AppStateContext` and `AppDispatchContext` (separate for performance)
- [ ] Implement `AppProvider` component:
  - Instantiates AudioEngine singleton
  - Subscribes to AudioEngine `onStateChange` -> dispatches `UPDATE_PLAYBACK`
  - Exposes engine actions through context value
- [ ] Export hooks: `useAppState()`, `useAppDispatch()`, `usePlayback()`
- [ ] Export `navigate(view, params?)` helper

### Library Loader (`src/tsx/hooks/useLibraryLoader.ts` — new file)
- [ ] Custom hook called once inside `AppProvider`
- [ ] On mount: check storage directory -> dispatch `SET_HAS_STORAGE_DIR`
- [ ] Call `scanLibrary()` + `groupTracksByAlbum()` + `scanPlaylists()` -> dispatch `SET_LIBRARY`
- [ ] Load store data (recently played, favorites) -> dispatch `SET_RECENTLY_PLAYED`, `SET_FAVORITES`

### Integration
- [ ] Modify `src/App.tsx` — wrap `<div id="frame">` in `<AppProvider>`
- [ ] Modify `src/tsx/Main/Main.tsx` — remove `useEffect` loading logic, `useState` for albums/loading/hasDirectory; read everything from `useAppState()`
- [ ] Modify `src/tsx/Sidebar/Sidebar.tsx` — remove `useEffect` loading logic; read from context

### Verify
- [ ] `npm start` — app launches, library loads once at top level
- [ ] React DevTools: inspect AppProvider, confirm state contains tracks, albums, playlists
- [ ] No duplicate `scanLibrary()` calls (Main and Sidebar no longer load independently)

---

## Stage 4: Core UI Build-Out

**Prerequisite:** Stage 3 complete.

**Goal:** All primary UI components functional — player bar, navigation tabs, all content views, clickable tracks. Three parallel work streams.

### Stream A: Full Player Bar

#### New Components (all in `src/tsx/Player/`)
- [ ] `TrackInfo.tsx` — cover art thumbnail (small), song title, artist name; shows placeholder when no track
- [ ] `PlaybackControls.tsx` — previous / play-pause / next buttons container
- [ ] `ProgressBar.tsx` — `<input type="range">` bound to `currentTime`/`duration`; `onChange` calls `seek()`; displays `mm:ss / mm:ss`
- [ ] `VolumeControl.tsx` — volume `<input type="range">` (0-100 -> 0-1) + mute toggle button
- [ ] `ModeControls.tsx` — shuffle toggle + repeat cycle button (off -> all -> one -> off)

#### Modified Components
- [ ] Rewrite `Player.tsx` — context consumer; composes TrackInfo, PlaybackControls, ProgressBar, VolumeControl, ModeControls
- [ ] Refactor `PlayButton.tsx` — reads `isPlaying` from context; calls `audioEngine.pause()`/`resume()` on click

#### HTML Hierarchy
```
<footer id="player">
  <div class="player-track-info">       // TrackInfo
  <div class="player-controls">          // PlaybackControls
    <div class="player-progress">         // ProgressBar
  <div class="player-secondary">          // VolumeControl + ModeControls
</footer>
```

### Stream B: Navigation & Tab System

#### New Components
- [ ] `src/tsx/Main/TabBar.tsx` — tab buttons: Home, Songs, Albums, Playlists, Artists; highlights active tab from `currentView`; dispatches `NAVIGATE` on click

#### Modified Components
- [ ] Rewrite `src/tsx/Main/Main.tsx` as thin view router: renders `<TabBar />` + active view based on `currentView` state
- [ ] Add `onClick?: () => void` prop to all 3 card components in `src/tsx/Components/Cards.tsx`

### Stream C: Content Views

#### Shared Component
- [ ] `src/tsx/Components/TrackRow.tsx` — reusable row: index number, title, artist, album, duration (`mm:ss`), playing indicator (highlights if current track matches)

#### View Components (all in `src/tsx/Main/views/`)
- [ ] `HomeView.tsx` — sections: Recently Played (compact cards, max 4, hidden if empty), Albums (first 6, large cover cards), Playlists (first 4, horizontal cards); "Show All" buttons call `navigate()`
- [ ] `SongsView.tsx` — scrollable list of all tracks using `TrackRow`; click dispatches `PLAY_TRACK` with queue = all tracks
- [ ] `AlbumsView.tsx` — full grid of `AlbumLargeCoverCard`; click navigates to `album-detail`
- [ ] `AlbumDetailView.tsx` — album header (large cover, name, artist, year, track count, total duration) + `TrackRow` list; "Play All" button queues all album tracks from index 0
- [ ] `PlaylistsView.tsx` — grid/list of `PlaylistHorizontalCard`; "Create Playlist" button; click navigates to `playlist-detail`
- [ ] `PlaylistDetailView.tsx` — playlist header (cover, name, description, track count, duration) + `TrackRow` list with remove button per row; "Delete Playlist" button
- [ ] `ArtistsView.tsx` — list grouped by `artist` field; shows album count and track count per artist; click navigates to `artist-detail`
- [ ] `ArtistDetailView.tsx` — artist name header + album cards + full track list

### Verify
- [ ] Play/pause/skip/volume/seek all produce audio and update UI in real-time
- [ ] All 5 tabs render correct content
- [ ] Clicking a track in any view starts playback with correct queue
- [ ] Album/playlist detail views load from card clicks
- [ ] "Show All" and "Play All" buttons work

---

## Stage 5: Data Features & Integration

**Prerequisite:** Stage 4 complete.

**Goal:** Recently played tracking, favorites/pinning, file import system, dynamic sidebar — all the features that tie the UI and backend together. Four parallel streams.

### Stream A: Recently Played

#### Backend
- [ ] `addToRecentlyPlayed(info: PlaylistInfo)` in `handlers.ts` — read store, deduplicate by filePath, unshift, slice to max 4, write store
- [ ] Fix `parseRecentlyPlayed()` — return enriched `PlaylistInfo[]` from store
- [ ] Add IPC channels: `ADD_RECENTLY_PLAYED`, `GET_RECENTLY_PLAYED`
- [ ] Expose in `preload.ts` and `electron-api.d.ts`

#### Frontend
- [ ] Wire `AppContext` to call `addToRecentlyPlayed` when user plays an album/playlist (in `playAlbum()`/`playPlaylist()` action creators)
- [ ] `HomeView.tsx` renders `PlaylistCompactCard` from `recentlyPlayed` context state; section hidden via conditional rendering when empty

### Stream B: Favorites / Pinning

#### Backend
- [ ] `addFavoriteAlbum(info)` / `removeFavoriteAlbum(filePath)` in `handlers.ts`
- [ ] `addFavoritePlaylist(info)` / `removeFavoritePlaylist(filePath)` in `handlers.ts`
- [ ] `getFavorites()` — returns `{ albums: PlaylistInfo[], playlists: PlaylistInfo[] }`
- [ ] Add 5 IPC channels: `ADD_FAVORITE_ALBUM`, `REMOVE_FAVORITE_ALBUM`, `ADD_FAVORITE_PLAYLIST`, `REMOVE_FAVORITE_PLAYLIST`, `GET_FAVORITES`
- [ ] Expose in `preload.ts` and `electron-api.d.ts`

#### Frontend
- [ ] Add `SET_FAVORITES` and `TOGGLE_FAVORITE` actions to `AppContext`
- [ ] `AlbumDetailView.tsx` — heart/star toggle button; checks if album in `favoriteAlbums`
- [ ] `PlaylistDetailView.tsx` — heart/star toggle button; checks if playlist in `favoritePlaylists`

### Stream C: Import System

#### Backend
- [ ] `importSong()` — file dialog (audio extensions filter) -> copy to storage dir -> parse metadata -> add to cache -> return `Track`
- [ ] `importPlaylistFiles()` — file dialog for `.m3u` -> copy to playlists dir -> parse -> return `Playlist`
- [ ] `importAlbumFolder()` — folder dialog -> copy audio files -> generate M3U -> parse -> return `Album`
- [ ] Add IPC channels: `IMPORT_SONG`, `IMPORT_PLAYLIST`, `IMPORT_ALBUM`

#### Main Process Integration (`src/index.ts`)
- [ ] Wire `File > Import > Song` menu click to call `importSong()` then `webContents.send('library-updated')`
- [ ] Wire `File > Import > Playlist` menu click similarly
- [ ] Wire `File > Import > Album` menu click similarly
- [ ] Add `onLibraryUpdated(callback)` to preload (wraps `ipcRenderer.on`)
- [ ] `AppContext` listens for `library-updated` event, triggers full re-scan

### Stream D: Dynamic Sidebar

#### Rewrite `src/tsx/Sidebar/Sidebar.tsx`
- [ ] Navigation links section: Home, Songs, Albums, Playlists, Artists — highlight active `currentView`, dispatch `NAVIGATE` on click
- [ ] Favorite Playlists section: list from `favoritePlaylists` context + "+" button for playlist creation
- [ ] Favorite Albums section: list from `favoriteAlbums` context
- [ ] Recently Played section: list from `recentlyPlayed` context
- [ ] All items clickable — navigate to appropriate detail view
- [ ] Remove all hardcoded data and independent `useEffect` loading

### Verify
- [ ] Play an album -> navigate home -> Recently Played shows it
- [ ] Favorite an album -> restart app -> favorite persists in sidebar
- [ ] File > Import > Song -> select file -> track appears in Songs view
- [ ] Sidebar nav links switch tabs; favorites and recently played are live data

---

## Stage 6: Frontend Design & Polish

**Prerequisite:** Stage 5 complete — all features functional.

**Goal:** Visual polish using existing CSS custom properties. Structural CSS (display, grid, flexbox) for new components. Consistent look and feel across all views.

### Player Bar Styling (`src/styling/player.css`)
- [ ] Three-column grid layout: `player-track-info | player-controls | player-secondary`
- [ ] Track info: small cover art (album art thumbnail), ellipsis overflow on title/artist
- [ ] Controls: centered row, button sizing, hover/active states
- [ ] Progress bar: custom range input styling using `--main-color` / `--secondary-color`
- [ ] Volume slider: narrower range input, mute button icon states
- [ ] Mode buttons: visual toggle states (active = `--main-color`, inactive = `--accent-color`)

### Tab Bar Styling (`src/styling/main.css`)
- [ ] Horizontal tab row with gap
- [ ] Active tab indicator (bottom border or background using `--main-color`)
- [ ] Hover states on inactive tabs

### View Layouts (`src/styling/main.css`)
- [ ] `HomeView` — section spacing, header rows with "Show All" aligned right
- [ ] `SongsView` — table-like track list: grid columns for #, title, artist, album, duration
- [ ] `AlbumsView` / `PlaylistsView` — responsive grid (auto-fill, minmax)
- [ ] Detail views (album/playlist/artist) — header with large cover art left + info right, track list below
- [ ] `TrackRow` — hover highlight, playing indicator (color or icon), consistent column widths

### Sidebar Styling (`src/styling/sidebar.css`)
- [ ] Nav links: vertical list, active state highlight, hover effect
- [ ] Section headers with spacing
- [ ] Compact card sizing for sidebar items
- [ ] "+" button styling matching existing `primary-btn`

### Card Component Refinements (`src/styling/cards.css`)
- [ ] Clickable cursor (`pointer`) on all cards with `onClick`
- [ ] Hover scale/brightness effect on cards
- [ ] Album placeholder consistent across all card sizes
- [ ] Favorite heart/star icon positioning on detail view headers

### Global / Responsive (`src/styling/root.css`)
- [ ] Scrollbar styling on all `.scrollable` containers
- [ ] Text overflow handling (ellipsis) on all text-heavy components
- [ ] Min-width / min-height guards on resize
- [ ] Loading states: spinner or skeleton for `libraryLoading`
- [ ] Empty states: friendly message + icon for views with no data

### Verify
- [ ] All views visually consistent with existing color palette
- [ ] Resize window to min dimensions (600x400) — no layout breaks
- [ ] Hover/active states on all interactive elements
- [ ] Text truncates properly on long titles/artist names

---

## Stage 7: Advanced Features

**Prerequisite:** Stage 6 complete — app is visually polished and fully functional for local playback.

**Goal:** Quality-of-life features that enhance the user experience beyond basic playback.

### Queue Management
- [ ] Add `queue` view type — shows current playback queue
- [ ] Queue view: reorderable track list (drag-and-drop or move up/down buttons)
- [ ] "Add to Queue" context action on tracks (appends to current queue without replacing it)
- [ ] "Play Next" context action (inserts after current track in queue)
- [ ] Queue button in player bar to toggle queue view

### Add to Playlist (from anywhere)
- [ ] "Add to Playlist" button/action on tracks and in player bar
- [ ] Dropdown/modal listing existing playlists + "Create New" option
- [ ] Calls `addTrackToPlaylist()` IPC handler
- [ ] Confirmation feedback (brief toast or visual cue)

### Song Info Panel
- [ ] Expandable info panel or modal showing full track metadata
- [ ] Fields: title, artist, album, album artist, year, genre, duration, file path, bitrate/format, track number
- [ ] Accessible from track context menu or info button

### Search
- [ ] Search bar in TabBar or top of Main area
- [ ] Client-side filtering: search across track titles, artists, albums, playlist names
- [ ] Results grouped by category (tracks, albums, artists, playlists)
- [ ] Click result navigates to appropriate view or plays track

### Keyboard Shortcuts
- [ ] Space: play/pause
- [ ] Arrow Left/Right: seek -5s/+5s
- [ ] Ctrl+Arrow Left/Right: previous/next track
- [ ] Ctrl+Up/Down: volume up/down
- [ ] Register via `useEffect` on `window.keydown` in `AppProvider`

### Verify
- [ ] Queue view shows correct order, reordering works
- [ ] Adding to playlist from any view persists to M3U file
- [ ] Song info shows accurate metadata
- [ ] Search returns relevant results, clicking navigates correctly
- [ ] All keyboard shortcuts work globally

---

## Stage 8: Online Mode & API Integration

**Prerequisite:** Stage 7 complete — solid offline player.

**Goal:** Download tracks from external APIs for the planned online mode.

### API Research & Selection
- [ ] Evaluate music download/streaming APIs (licensing, rate limits, audio quality)
- [ ] Design API service interface: `searchTracks(query)`, `downloadTrack(id, destPath)`, `getTrackInfo(id)`
- [ ] Define types for API responses in `src/types/`

### Backend API Service (`src/ipc/api-service.ts` — new file)
- [ ] HTTP client setup (Node.js `fetch` or `axios` in main process)
- [ ] `searchTracks(query): Promise<ApiTrack[]>` — search external API
- [ ] `downloadTrack(id, destPath): Promise<Track>` — download audio file to storage dir, parse metadata, return Track
- [ ] `getTrackPreview(id): Promise<string>` — get preview/stream URL
- [ ] Rate limiting / error handling / retry logic

### IPC Integration
- [ ] Add IPC channels: `API_SEARCH`, `API_DOWNLOAD`, `API_PREVIEW`
- [ ] Register handlers, expose in preload, add to ElectronAPI type

### Frontend: Online Mode UI
- [ ] Online search view (new tab or search mode toggle)
- [ ] Search results displayed as track rows with "Download" button
- [ ] Download progress indicator
- [ ] Downloaded tracks auto-appear in library (trigger `library-updated`)

### Verify
- [ ] Search returns results from external API
- [ ] Download saves file to storage dir with correct metadata
- [ ] Downloaded track appears in library and is playable

---

## Stage 9: Testing & Quality Assurance

**Prerequisite:** Can run in parallel with Stages 7-8, but should be complete before Stage 10.

**Goal:** Confidence that the app works reliably across use cases.

### Unit Tests
- [ ] Set up test framework (Vitest or Jest)
- [ ] `m3u.ts` — parseM3UFile, writeM3UFile round-trip tests
- [ ] `groupTracksByAlbum()` — edge cases (no album, mixed artists, missing metadata)
- [ ] `appReducer` — all action types produce correct state transitions
- [ ] AudioEngine — mock Audio API, verify queue advancement, shuffle, repeat logic
- [ ] Store read/write — mock filesystem, verify StoreData integrity

### Integration Tests
- [ ] IPC round-trip: renderer -> preload -> main -> response, for each channel
- [ ] Library scan with a test audio directory (small set of tagged files)
- [ ] Playlist CRUD lifecycle: create -> add track -> remove track -> rename -> delete

### Manual QA Checklist
- [ ] First-run experience: no storage dir set, app prompts correctly
- [ ] Large library (1000+ tracks): scan completes without hanging UI
- [ ] Edge cases: tracks with no metadata, corrupt files, empty albums, empty playlists
- [ ] Window resize to all extremes
- [ ] Menu items all functional
- [ ] Quit and reopen: favorites, recently played, storage dir all persist

---

## Stage 10: Packaging & Distribution

**Prerequisite:** Stage 9 complete — app is tested and stable.

**Goal:** Distributable application for Windows (primary), with groundwork for macOS/Linux.

### Build Configuration
- [ ] Review `forge.config.ts` makers (Squirrel for Windows)
- [ ] Configure app icon at all required sizes
- [ ] Set app metadata (name, version, description, author) in `package.json`
- [ ] Ensure ASAR packaging works with `music-metadata` (dynamic import)

### Build & Package
- [ ] `npm run make` — produces Windows installer
- [ ] Test installer on clean Windows machine
- [ ] Verify auto-update integration (Squirrel) if desired
- [ ] Code signing (optional, prevents Windows SmartScreen warnings)

### Cross-Platform (stretch)
- [ ] Test on macOS (DMG maker)
- [ ] Test on Linux (deb/rpm makers)
- [ ] Platform-specific menu behavior (macOS app menu conventions)

---

## Stage 11: Future Features (Stretch)

**Prerequisite:** Stages 1-10 complete — fully functional, tested, distributable music player.

**Goal:** Aspirational features from the roadmap. Implement as time and interest allow.

### Audio Enhancement
- [ ] Equalizer — Web Audio API `BiquadFilterNode` chain; presets + custom bands
- [ ] Playback speed — `audio.playbackRate` control (0.5x - 2x)
- [ ] Crossfade between tracks — overlap Audio instances during transitions
- [ ] Gapless playback — preload next track, swap on `ended`

### Library Management
- [ ] Rate songs and albums (1-5 stars) — persist in store, sortable/filterable
- [ ] Hide songs — filtered from all views but still on disk
- [ ] Delete songs from app — remove file + remove from cache + remove from playlists
- [ ] Duplicate detection — warn on import if similar track exists
- [ ] Smart playlists — auto-generated based on rules (genre, rating, recently added)

### Mobile & Server
- [ ] Home server integration — Node.js server in main process, serve library over HTTP/HTTPS on LAN
- [ ] Mobile companion app — React Native or web UI that connects to home server
- [ ] Sync library metadata between devices

### UI Enhancements
- [ ] Drag-and-drop track reordering in playlists
- [ ] Album art view mode (grid of large covers, click to expand)
- [ ] Lyrics display (fetch from external API or embedded metadata)
- [ ] Visualizer — Web Audio API `AnalyserNode` + canvas rendering
- [ ] Theme system — user-selectable color palettes beyond current dark theme
- [ ] Mini player mode — compact floating window

---

## Pipeline Summary

```
Stage 1:  Foundation Cleanup
            |
Stage 2:  Core Backend (M3U + Audio Engine)      [parallel streams]
            |
Stage 3:  Global State & Architecture
            |
Stage 4:  Core UI Build-Out                       [3 parallel streams]
          (Player | Navigation | Views)
            |
Stage 5:  Data Features & Integration             [4 parallel streams]
          (Recently Played | Favorites | Import | Sidebar)
            |
Stage 6:  Frontend Design & Polish
            |
Stage 7:  Advanced Features (Queue, Search, Shortcuts)
            |
Stage 8:  Online Mode & API Integration
            |
Stage 9:  Testing & QA                            [can overlap with 7-8]
            |
Stage 10: Packaging & Distribution
            |
Stage 11: Future / Stretch Features
```

### Key Files by Stage

| Stage | Key Files |
|-------|-----------|
| 1 | `src/types/music.ts`, `src/ipc/handlers.ts`, `src/types/electron-api.d.ts`, `src/tsx/Main/Main.tsx`, `src/tsx/ParseFiles.tsx` |
| 2A | `src/ipc/m3u.ts` (new), `src/ipc/channels.ts`, `src/ipc/handlers.ts`, `src/preload.ts` |
| 2B | `src/tsx/Player/AudioEngine.ts` (new), `src/index.ts` |
| 3 | `src/tsx/AppContext.tsx` (new), `src/tsx/hooks/useLibraryLoader.ts` (new), `src/App.tsx` |
| 4A | `src/tsx/Player/*.tsx` (5 new + 2 modified) |
| 4B | `src/tsx/Main/TabBar.tsx` (new), `src/tsx/Main/Main.tsx`, `src/tsx/Components/Cards.tsx` |
| 4C | `src/tsx/Main/views/*.tsx` (8 new), `src/tsx/Components/TrackRow.tsx` (new) |
| 5 | `src/ipc/handlers.ts`, `src/ipc/channels.ts`, `src/preload.ts`, `src/index.ts`, `src/tsx/Sidebar/Sidebar.tsx` |
| 6 | `src/styling/*.css` (all files) |
| 7 | `src/tsx/AppContext.tsx`, new view components, `src/tsx/Player/Player.tsx` |
| 8 | `src/ipc/api-service.ts` (new), new IPC channels, new search UI |
| 9 | Test files (new directory) |
| 10 | `forge.config.ts`, `package.json` |
