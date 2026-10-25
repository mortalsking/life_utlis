# 📱 Life Utils

> **An offline-first, cloud-synced personal utility app and PWA to track your daily life—attendance, finances, tasks, journals, appearance preferences, and community feedback—powered by React 19, Vite, Supabase, and React Native (Expo).**

[![GitHub Repository](https://img.shields.io/badge/GitHub-mortalsking%2Flife__utlis-blue?logo=github)](https://github.com/mortalsking/life_utlis)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-success?logo=vercel)](https://app-sandy-alpha-82.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vite.dev)
[![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo)](https://expo.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ecf8e?logo=supabase)](https://supabase.com)

**🌐 Live Web App:** [https://app-sandy-alpha-82.vercel.app/](https://app-sandy-alpha-82.vercel.app/)  
**📦 GitHub Repository:** [https://github.com/mortalsking/life_utlis](https://github.com/mortalsking/life_utlis)

---

## ✨ What's New in v1.2.0

* 🧭 **7-Tab Single Flow Bottom Navigation Dock:** Clean, continuous floating dock displaying all 7 core modules (`Today`, `Attend`, `Money`, `Tasks`, `Notes`, `Stats`, `Forum`) without clutter or wrapping.
* ⚙️ **Dedicated Settings & Appearance Suite:**
  * **Header Topbar Trigger:** Prominent Settings button in the topbar accessible across all views.
  * **Pixel-Matched Settings Design:** Profile cat avatar with purple edit badge, customizable display name, standalone `App style` (Classic), grouped categories (`Appearance`, `Preferences`, `Data`, `Support`), and `About this app`.
  * **Appearance Preferences:** Theme Modes (Dark, Light, System Auto) and 6 vibrant accent color palettes (Cyan, Violet, Emerald, Amber, Rose, Sky Blue).
  * **Customizable Attendance Threshold:** Dynamic bunk margin calculations tailored to your custom attendance goal (70%, 75%, 80%, 85%, 90%).
  * **Multi-Currency Support:** Switch between ₹ (INR), $ (USD), € (EUR), £ (GBP), and ¥ (JPY/CNY) across all financial metrics.
  * **Micro-interactions:** Smooth spring animations and tactile Web Audio synthetic haptic feedback.
* 📱 **Mobile Native Shell Enhancements (Expo):**
  * Native Mobile topbar with **⚙️ Settings** button and floating quick-access trigger.
  * Dedicated Native Settings & Normal Account Registration Modal directly inside React Native for easy sign-up, sign-in, and instant cloud sync.
  * Hardware back-button handling, pull-to-refresh, OS share sheet, and dynamic status bar theming.

---

## 🚀 Core Features

### 🔐 Instant Guest Mode & Cloud Sync
* **Zero-Friction Access:** Directly opens into the live utility in local Guest Mode without requiring an upfront login barrier.
* **Hybrid Storage:** Works offline-first with `localStorage` and automatically syncs user data seamlessly to the Supabase cloud database when signed in.
* **Smart Data Migration:** When a guest user decides to register or sign in, all local progress (attendance, expenses, tasks, settings) is automatically migrated into their cloud account without losing any data.

### ⚙️ Settings & Customization
* **Appearance Preferences:** Customize theme mode (Dark/Light/System) and choose from 6 hand-crafted accent palettes.
* **Custom Attendance Goal:** Configure your university or college attendance threshold (e.g., 75%, 80%, 85%) to customize bunk margins.
* **Currency Selection:** Easily switch the display currency symbol across all money modules.
* **Sensory Feedback:** Toggle micro-animations and tactile Web Audio synthetic click/tick feedback.

### 📅 Today (Daily Dashboard)
Your central daily hub. Mark attendance per subject, log daily expenses or savings, manage task backlogs, and record journal entries—all on one convenient screen.

### 🎓 Attendance Tracking & Bunk Margin Predictor
* **Goal Predictor:** Solves student attendance anxiety by calculating exactly how many lectures can be safely skipped or how many consecutive classes are needed to reach your target attendance percentage.
* **Smart Calendar:** Color-coded monthly calendar views (present, absent, mixed days).
* **Flexible Logging:** Record or adjust attendance for any date—including past dates—per subject.
* **Rich Metrics:** Monthly and all-time attendance percentages, plus an intelligent streak counter that ignores no-class days.
* **Subject Management:** Add, edit, and track individual per-subject progress meters with real-time bunk margin badges.

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
* **Mobile Client:** [React Native](https://reactnative.dev) + [Expo](https://expo.dev) + [React Native WebView](https://github.com/react-native-webview/react-native-webview)
* **Backend & Auth:** [Supabase](https://supabase.com) (`@supabase/supabase-js`) for User Auth, Database, and Realtime sync
* **Styling:** Vanilla CSS design tokens with custom HSL theme variables, 6 dynamic accent palettes, dark/light modes, and micro-animations
* **Typography:** [Outfit Variable Font](https://fontsource.org/fonts/outfit) bundled locally for offline capability
* **PWA & Offline Shell:** Web App Manifest (`manifest.webmanifest`) and Service Worker (`sw.js`)
* **Linter:** [Oxlint](https://oxc.rs) for ultra-fast code quality checks

---

## 📁 Repository Structure

```text
├── app/                     # Web Application (React 19 + TypeScript + Vite)
│   ├── public/              # PWA manifest, service worker & icons
│   ├── src/
│   │   ├── components/      # Icon, Bars, TxForm, SettingsModal
│   │   ├── pages/           # Attendance, Auth, Backlog, Feedback, Money, Notes, SettingsPage, Summary, Today
│   │   ├── store.tsx        # Global store with appearance & Supabase sync
│   │   ├── supabaseClient.ts# Supabase client initialization
│   │   ├── types.ts         # TypeScript models & UserSettings definitions
│   │   ├── utils.ts         # Bunk advisor algorithm, currency formatter & Web Audio haptics
│   │   ├── App.tsx          # Main shell & 7-tab single flow dock navigation
│   │   └── index.css        # Core design tokens, accent palettes & animations
│   ├── package.json         # Web dependencies & scripts
│   └── vite.config.ts       # Vite bundler configuration
│
├── mobile/                  # Native Mobile App (React Native + Expo)
│   ├── App.js               # Native WebView shell, Settings Modal & environment bridge
│   ├── app.json             # Expo project configuration & package IDs
│   ├── package.json         # Mobile dependencies
│   ├── assets/              # App icons, adaptive icons, splash screens
│   └── README.md            # Mobile build & test instructions
│
└── README.md                # Project documentation
```

---

## ⚙️ Environment Setup

Create a `.env` file in the `app` directory (or copy from `app/.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🗄️ Database Schema (Supabase)

If deploying your own Supabase backend, configure the following tables in the Supabase SQL editor:

```sql
-- User data table for storing full cloud state
create table public.user_data (
  id uuid references auth.users not null primary key,
  data jsonb not null default '{}'::jsonb
);

-- Enable Row Level Security (RLS)
alter table public.user_data enable row level security;

create policy "Users can read their own data"
  on public.user_data for select
  using (auth.uid() = id);

create policy "Users can upsert their own data"
  on public.user_data for insert
  with check (auth.uid() = id);

create policy "Users can update their own data"
  on public.user_data for update
  using (auth.uid() = id);

-- Feedback board table
create table public.feedback (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_email text not null,
  content text not null
);

alter table public.feedback enable row level security;

create policy "Anyone can view feedback"
  on public.feedback for select
  using (true);

create policy "Logged-in users can post feedback"
  on public.feedback for insert
  with check (auth.role() = 'authenticated');
```

---

## 🚀 Getting Started

### 1. Web Application

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Run development server
npm run dev

# Run linter
npm run lint

# Build production bundle
npm run build
```

### 2. React Native Mobile App (Expo)

```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo dev client
npx expo start
```

* **On Android:** Press `a` or scan the QR code with **Expo Go**.
* **On iOS:** Scan the QR code using the iOS Camera app with **Expo Go** installed.
* **Standalone APK build:** Run `npx eas-cli build -p android --profile preview`.

---

## 🌐 Mobile PWA Installation

You can also install Life Utils directly on your mobile device without any app store:

1. Open [https://app-sandy-alpha-82.vercel.app/](https://app-sandy-alpha-82.vercel.app/) in Chrome (Android) or Safari (iOS).
2. Tap the browser options menu (or Share button on iOS).
3. Select **"Add to Home Screen"**.
4. Enjoy the full native full-screen experience with offline storage.

---

## 🤝 Contributing

Contributions, feedback, and feature requests are welcome!

1. Fork the Project: [mortalsking/life_utlis](https://github.com/mortalsking/life_utlis)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
