# Scratch Music Player — Implementation Plan

## Context

Scratch is an Electron 40 + React 19 + TypeScript desktop music player. The foundation exists — window creation, IPC bridge, library scanning with metadata extraction, album grouping, and card components all work. However, the app has no audio playback, no playlist system, no navigation between views, broken recently-played logic, type inconsistencies across 3 files, and React anti-patterns (DOM manipulation in Main.tsx). This plan covers all foundational backend and structural frontend work needed to make Scratch a functional music player.

---

## Phase 0 - Foundational work

Set up all of the base code, including all of the functions needed, the types, components, etc. Implement functions as empty, unless they are foundational functions, ie. data storing/retrieving.

## datatypes.ts

`src/types/datatypes.ts`
Where all of the data types/interfaces are stored

### handlers.ts

`src/ipc/handlers.ts`
The functions ran on IPC main. Includes data storage; getting/storing the filepath; turning m3u and mp3 files into usable playlists/albums and songs, respectively; parsing files in data that can be used in React components;

**Exported functions:**

- setStorageDirectory(): Promise<string | null>
- getStorageDirectory(): Promise<string | null>
- registerIpcHandlers(): void

**Non-exported functions:**

- getKeyFromDataStore(key: string): Promise<string | string[][]>
- writeStore(data: UserData): void
- readStore(): UserData
- getStorePath(): string

### index.ts, renderer.tsx, App.tsx, index.html, \*.d.ts,

Basic files that are required for React/Electron to compile the app

### channels.ts

`src/ipc/channels.ts`

The IPC channels that can be called from renderer to main
