# Life Utils

An offline-first personal utility PWA built with React + TypeScript + Vite. Track your daily life — attendance, money, backlog, journal and links — with zero backend. All data lives privately in your device's browser storage.

**Live:** [life-utlis.vercel.app](https://life-utlis.vercel.app)

## Features

### Today
One screen for the daily ritual: mark attendance per subject, log expenses or savings, add backlog items, and write today's journal entry.

### Attendance
- Month calendar with color-coded days (present / absent / mixed), browsable across months
- Mark or edit any date — past included — per subject
- This-month and all-time percentage
- All-present streak counter (skips no-class days)
- Per-subject percentage meters
- Manageable subject list

### Money
- Week / Month / Year views with arrows to browse previous periods
- Daily spending bar chart for the selected period
- Category breakdown (Food, Transport, College, Study, Fun, Shopping, Health, Bills, Other)
- Average spend per day
- Savings entries ("Saved") tracked separately from spending, with an all-time total

### Tasks (Backlog)
- Pending items with optional due dates
- Overdue counter
- Recently-completed list with clear-all

### Notes
- **Journal** — one entry per date with mood; edit or delete past entries
- **Links** — save useful URLs under categories (Study, College, Tools, Fun) with quick-open

### Stats
Summary of everything at a glance: attendance %, spending by period (week/month/year/all-time), top categories, savings total, backlog status, journal and link counts — plus JSON export/import backups.

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) with strict TypeScript config
- Zero UI libraries — hand-rolled components and CSS
- [Outfit variable font](https://fontsource.org/fonts/outfit) bundled locally (fully offline-capable)
- PWA: web manifest + service worker (cache-first shell)
- Persistence: `localStorage`, versioned schema

## Getting Started

Prerequisites: [Node.js](https://nodejs.org) 18+

```bash
npm install
npm run dev      # start dev server with hot reload
```

Production build:

```bash
npm run build    # type-checks and outputs static files to dist/
npm run preview  # serve the production build locally
```

## Deployment

The app is deployed on [Vercel](https://vercel.com) and live at **[life-utlis.vercel.app](https://life-utlis.vercel.app)**.

Vercel connects directly to this GitHub repo:

- Every push to `main` triggers an automatic build (`npm run build`) and publishes `dist/` to their global CDN
- Pull requests get their own preview URL to test before merging
- No configuration was needed — Vercel auto-detects Vite (build command, output directory, SPA handling)

To deploy your own copy: import the repo at [vercel.com/new](https://vercel.com/new), accept the detected settings, and deploy.

**Install on your phone**

Open [life-utlis.vercel.app](https://life-utlis.vercel.app) in Chrome → menu → *Add to Home screen* → Install. It runs fullscreen, offline, like a native app.

## Data & Privacy

There is no server and no account. Everything you log stays in your browser's localStorage on that device. Use **Stats → Export backup** regularly to download a JSON snapshot, and *Import backup* to restore it (e.g., when switching devices).

Clearing browser/site data will erase the app's data — back up first.

## Project Structure

```
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.webmanifest
│   └── sw.js               # service worker
├── src/
│   ├── components/         # shared UI (icons, charts, transaction form)
│   ├── pages/              # Today, Attendance, Money, Backlog, Notes, Summary
│   ├── store.tsx           # context store + localStorage persistence
│   ├── types.ts            # data model
│   ├── utils.ts            # date/money helpers
│   ├── App.tsx             # shell + bottom navigation
│   └── main.tsx            # entry point + SW registration
└── index.html
```
