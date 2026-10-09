# 📱 Life Utils

> An offline-first, cloud-synced personal utility PWA to track your daily life—attendance, finances, tasks, journals, and community feedback—powered by React, Vite, and Supabase.

**Live Demo:** [https://app-sandy-alpha-82.vercel.app/](https://app-sandy-alpha-82.vercel.app/)

---

## ✨ Core Features

### 🔐 User Authentication & Cloud Sync
* **Secure Auth:** Email and password registration & sign-in powered by Supabase Auth.
* **Hybrid Storage:** Works offline-first with `localStorage` and automatically syncs user data seamlessly to the cloud database when online.
* **Multi-Device Support:** Access your personal dashboard and data from any device by signing into your account.

### 📅 Today (Daily Dashboard)
Your central daily hub. Mark attendance per subject, log daily expenses or savings, manage task backlogs, and record journal entries—all on one convenient screen.

### 🎓 Attendance Tracking
* **Smart Calendar:** Color-coded monthly calendar views (present, absent, mixed days).
* **Flexible Logging:** Record or adjust attendance for any date—including past dates—per subject.
* **Rich Metrics:** Monthly and all-time attendance percentages, plus an intelligent streak counter that ignores no-class days.
* **Subject Management:** Add, edit, and track individual per-subject progress meters.

### 💰 Money & Budgeting
* **Historical Views:** Filter financial activity by Week, Month, or Year.
* **Visual Analytics:** Dynamic bar charts showcasing daily spending habits.
* **Category Breakdown:** Categorize expenses (Food, Transport, College, Study, Fun, Shopping, Health, Bills, Other).
* **Savings Tracker:** Dedicated logging for savings with all-time totals and average daily spend stats.

### ✅ Tasks & Backlog
* **Task Management:** Create pending tasks with optional due dates.
* **Overdue Warnings:** Visual counters and alerts for overdue items.
* **Quick Cleanup:** Easily filter and clear completed tasks.

### 📓 Notes & Journal
* **Daily Journal:** Record daily entries paired with mood tracking (editable for past dates).
* **Link Vault:** Save and categorize useful bookmarks (Study, College, Tools, Fun) for quick access.

### 💬 Forum & Feedback
* **Community Board:** Share feedback, report bugs, or discuss feature ideas with other users.
* **Live Feed:** Real-time feedback timeline sorted chronologically with author details and timestamps.

### 📊 Stats & Backup
* **At-a-Glance Summary:** Comprehensive metrics covering overall attendance %, lifetime spending, top expense categories, and total savings.
* **Data Portability:** Export complete JSON backups of your data at any time, or import snapshots for manual data restores.

---

## 🛠️ Tech Stack

* **Frontend:** [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
* **Backend & Auth:** [Supabase](https://supabase.com) (`@supabase/supabase-js`) for User Auth, Database, and Realtime sync.
* **Styling:** TailwindCSS, PostCSS, and custom CSS design system with Dark/Light theme toggle support.
* **Typography:** [Outfit Variable Font](https://fontsource.org/fonts/outfit) bundled locally for offline capability.
* **PWA & Offline Shell:** Web App Manifest (`manifest.webmanifest`) and Service Worker (`sw.js`).
* **Linter:** [Oxlint](https://oxc.rs) for fast code quality checks.

---

## ⚙️ Environment Setup

Create a `.env` file in the root of the app directory (or copy from `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🗄️ Database Schema (Supabase)

If deploying your own Supabase backend, set up the following tables:

1. **`user_data` Table:**
   - `id` (uuid, primary key, references `auth.users`)
   - `data` (jsonb, stores the user's complete app state)

2. **`feedback` Table:**
   - `id` (bigint / uuid, primary key, auto-generated)
   - `created_at` (timestamp with time zone, default `now()`)
   - `user_email` (text)
   - `content` (text)

---

## 🚀 Getting Started

**Prerequisites:** [Node.js](https://nodejs.org) (v18 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally in development mode:**
   ```bash
   npm run dev
   ```

3. **Check code quality:**
   ```bash
   npm run lint
   ```

4. **Build for production:**
   ```bash
   npm run build    # Type-checks and builds static assets to dist/
   npm run preview  # Previews the production build locally
   ```

---

## 🌍 Deployment & Installation

### Web Deployment (Vercel)
The project is optimized for deployment on [Vercel](https://vercel.com).
* Continuous Integration automatically builds `main` pushes using `npm run build`.
* Environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) should be added in the Vercel project settings.

### 📱 Mobile PWA Installation
1. Open [app-sandy-alpha-82.vercel.app](https://app-sandy-alpha-82.vercel.app/) in Chrome or Safari on your phone.
2. Tap the browser menu and select **"Add to Home Screen"**.
3. Launch the app directly from your home screen with native full-screen experience and offline support.

---

## 📂 Project Structure

```text
├── public/
│   ├── icons/              # PWA app icons
│   ├── manifest.webmanifest# Web app manifest configuration
│   └── sw.js               # Service Worker for offline caching
├── src/
│   ├── components/         # Reusable UI components (Icon, Bars, TxForm)
│   ├── pages/              # App views:
│   │   ├── Attendance.tsx  # Attendance calendar & subject management
│   │   ├── Auth.tsx        # Sign In & Sign Up authentication form
│   │   ├── Backlog.tsx     # Task & todo manager
│   │   ├── Feedback.tsx    # Forum & community feedback feed
│   │   ├── Money.tsx       # Expense & savings tracker
│   │   ├── Notes.tsx       # Journal & bookmark vault
│   │   ├── Summary.tsx     # Overall stats dashboard & JSON data export/import
│   │   └── Today.tsx       # Daily ritual overview dashboard
│   ├── store.tsx           # React Context store + local & Supabase sync
│   ├── supabaseClient.ts   # Supabase SDK initialization
│   ├── types.ts            # TypeScript interfaces & default state defaults
│   ├── utils.ts            # Date formatting and calculation helpers
│   ├── App.tsx             # Main layout, tab navigation, and header
│   ├── index.css           # Global theme styling, CSS variables & utilities
│   └── main.tsx            # App mounting & Service Worker registration
├── .env.example            # Sample environment variables config
├── index.html              # Entry HTML file
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite build tool configuration
└── package.json            # Project dependencies and script runner
```
