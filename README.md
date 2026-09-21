
# 📱 Life Utils

> An offline-first personal utility PWA to track your daily life—attendance, finances, tasks, and journals—with zero backend. 

**Live Demo:** [[life-utlis.vercel.app](https://life-utlis.vercel.app)](https://app-sandy-alpha-82.vercel.app/)

All data lives entirely and privately within your device's browser storage. No accounts, no servers, no tracking.

---

## ✨ Core Features

### 📅 Today
Your daily ritual, centralized on one screen. Mark attendance per subject, log daily expenses or savings, add quick backlog items, and write your daily journal entry without navigating away.

### 🎓 Attendance
*   **Smart Calendar:** Color-coded month views (present, absent, mixed) that are fully browsable.
*   **Flexible Logging:** Mark or edit any date—including past dates—per subject.
*   **Rich Metrics:** Track this-month and all-time percentages, plus an all-present streak counter that intelligently skips no-class days.
*   **Subject Management:** Add, edit, and monitor individual per-subject percentage meters.

### 💰 Money
*   **Historical Browsing:** Navigate seamlessly between Week, Month, and Year views.
*   **Visual Insights:** View daily spending via a dynamic bar chart for your selected time period.
*   **Category Breakdown:** Track spending across tags like Food, Transport, College, Study, Fun, Shopping, Health, Bills, and Other.
*   **Savings Tracker:** Dedicated logging for money saved, complete with an all-time total and average daily spend metrics.

### ✅ Tasks (Backlog)
*   **Task Management:** Add pending items with optional due dates.
*   **Status Tracking:** Monitor overdue items with a dedicated counter.
*   **Quick Cleanup:** View recently completed tasks and clear them instantly.

### 📓 Notes
*   **Journal:** Log one entry per date with mood tracking. Fully editable for past entries.
*   **Quick Links:** Save useful URLs under structured categories (Study, College, Tools, Fun) for one-tap access.

### 📊 Stats & Backup
*   **At-a-Glance Dashboard:** Review attendance %, spending across all timeframes, top spending categories, and total savings.
*   **Data Portability:** Generate complete JSON export backups of your data, and import them seamlessly to switch devices.

---

## 🛠️ Tech Stack

*   **Core:** [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev) (strict config)
*   **Styling:** Zero UI libraries. 100% hand-rolled components and CSS for maximum performance and customization.
*   **Typography:** [Outfit variable font](https://fontsource.org/fonts/outfit) bundled locally to ensure full offline capability.
*   **Architecture (PWA):** Web manifest and a Service Worker utilizing a cache-first shell.
*   **Persistence:** Versioned schema utilizing the browser's native `localStorage`.

---

## 🚀 Getting Started

**Prerequisites:** [Node.js](https://nodejs.org) (v18 or higher)

1. **Install dependencies and run locally:**
   ```bash
   npm install
   npm run dev      # Starts the dev server with hot reload

```

2. **Build for production:**
```bash
npm run build    # Type-checks and outputs static files to dist/
npm run preview  # Serves the production build locally

```



---

## 🌍 Deployment & Installation

The application is deployed globally on [Vercel](https://vercel.com) and updates automatically.

* **Continuous Integration:** Every push to `main` triggers an automatic build (`npm run build`) and publishes the `dist/` directory to Vercel's CDN.
* **Deploy Your Own:** Import this repository at [vercel.com/new](https://vercel.com/new). Vercel auto-detects the Vite configuration—just accept the defaults and deploy.

### 📱 Install as an App (PWA)

1. Open [life-utlis.vercel.app](https://life-utlis.vercel.app) in Chrome or Safari on your phone.
2. Open the browser menu and select **"Add to Home screen"**.
3. It will install and run fullscreen and offline, exactly like a native application.

---

## 🔒 Data & Privacy

Because this is a zero-backend application, **there is no server and no account.**

Everything you log stays locally in your browser's `localStorage` on that specific device.

> **⚠️ Important:** Clearing your browser or site data will permanently erase your app data. Use **Stats → Export backup** regularly to download a JSON snapshot of your data, and use *Import backup* to restore it or migrate to a new phone/computer.

---

## 📂 Project Structure

```text
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.webmanifest
│   └── sw.js               # Service worker
├── src/
│   ├── components/         # Shared UI (icons, charts, transaction form)
│   ├── pages/              # Today, Attendance, Money, Backlog, Notes, Summary
│   ├── store.tsx           # Context store + localStorage persistence logic
│   ├── types.ts            # TypeScript data models
│   ├── utils.ts            # Date and currency formatting helpers
│   ├── App.tsx             # App shell + bottom navigation routing
│   └── main.tsx            # Entry point + SW registration
└── index.html

```

```

```
