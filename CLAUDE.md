# Scratch — Project Notes for Claude

## Project Overview
**Scratch** is a desktop music player built with Electron 40, React 19, and TypeScript 4.5.
- Populates the library from a user-selected local directory
- Planned online mode: download tracks via external APIs
- Planned offline mode: playback from local files
- Build tool: Electron Forge + Webpack (separate main/renderer configs)
- Focus: backend and foundational aspects of the project, the UI/CSS can come later.

---

## Architecture

### Process Split
- **Main process:** `src/index.ts` — window creation, app menu, Node.js APIs, file system
- **Renderer process:** `src/renderer.tsx` — React app entry, mounts `<App />`
- **Preload:** `src/preload.ts` — IPC bridge between main and renderer (currently empty, needs `contextBridge`)

### Key Directories
```
src/
  index.ts              # Electron main process
  renderer.tsx          # React entry point
  preload.ts            # contextBridge / IPC exposure
  App.tsx               # Root React component
  tsx/
    Components/         # Shared UI components (Cards.tsx)
    Main/               # Main content area
    Player/             # Playback controls
    Sidebar/            # Sidebar (playlists, albums)
    Storage/            # Directory selection, store.json persistence
  ParseFiles.tsx        # File parsing stubs (not yet implemented)
  styling/              # CSS files (root, main, sidebar, player)
  assets/               # Icons, images
tasks/
  lessons.md            # Running log of corrections and patterns learned
```

### Layout
```
┌──────────┬──────────────┐
│ Sidebar  │     Main     │
│ (0.65fr) │   (1.35fr)   │
├──────────┴──────────────┤
│         Player          │
└─────────────────────────┘
```

### Data Persistence
- `src/tsx/Storage/store.json` — persists `filePath`, `favoriteAlbums`, `favoritePlaylists`
- Managed via `electron-store`

### Color Palette (CSS custom properties)
- `--main-color`: `#1a49ba`
- `--secondary-color`: `#418edb`
- `--background-color`: `rgb(24, 25, 26)`
- `--accent-color`: `rgb(180, 186, 191)`

---

## Development Status

| Area | Status |
|------|--------|
| IPC bridge (preload) | Not implemented |
| Audio playback | Not implemented |
| File/metadata parsing | Stubbed only |
| Directory scanning | Partial (dialog + store) |
| Sidebar data | Hardcoded |
| Online mode / API | Not started |
| React state (Player) | Uses DOM manipulation, needs hooks |

---

## Conventions & Rules

### IPC Pattern
- All Node.js/Electron APIs must be called from the **main process**
- Expose them to the renderer only via `contextBridge` in `preload.ts`
- Never enable `nodeIntegration` or call Node APIs directly from renderer components

### TypeScript
- Strict mode is on (`noImplicitAny`). Do not use `any` without justification.
- Add type declarations for new assets in `src/declarations.d.ts`

### React
- Use functional components and hooks throughout — no class components
- Manage state with `useState`/`useReducer`, not direct DOM manipulation
- Keep components in their existing folder structure (`tsx/ComponentName/`)

### CSS
- All new styles go in the appropriate existing stylesheet, or a new file in `src/styling/`
- Use existing CSS custom properties (`--main-color`, etc.) for all colors

### Adding Features
- Before implementing a new feature, check if a stub already exists (`ParseFiles.tsx`)
- For any 3+ step or architectural task: stop and plan before coding

---

## Workflow Rules (carried over)
- If something goes sideways mid-task, **stop and re-plan** — don't keep pushing
- After any non-trivial correction from the user, log the pattern in `tasks/lessons.md`
- Never mark a task complete without verifying it actually works
