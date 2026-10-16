export type TxKind = "expense" | "saved";
export type AttStatus = "present" | "absent";

export interface Tx {
  id: string;
  date: string; // YYYY-MM-DD
  kind: TxKind;
  category: string;
  amount: number;
  note?: string;
}

export interface AttEntry {
  id: string;
  date: string;
  subject: string;
  status: AttStatus;
}

export interface Task {
  id: string;
  text: string;
  created: string;
  due?: string;
  done: boolean;
  doneAt?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood?: string;
  text: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  category: string;
}

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "cyan" | "violet" | "emerald" | "amber" | "rose" | "blue";

export interface AccentOption {
  id: AccentColor;
  label: string;
  color: string;
  secondary: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: "cyan", label: "Cyan", color: "#38bdf8", secondary: "#818cf8" },
  { id: "violet", label: "Violet", color: "#a855f7", secondary: "#c084fc" },
  { id: "emerald", label: "Emerald", color: "#10b981", secondary: "#34d399" },
  { id: "amber", label: "Amber", color: "#f59e0b", secondary: "#fbbf24" },
  { id: "rose", label: "Rose", color: "#f43f5e", secondary: "#fb7185" },
  { id: "blue", label: "Electric Blue", color: "#3b82f6", secondary: "#60a5fa" },
];

export interface UserSettings {
  userName: string;
  avatarUrl: string;
  appStyle: "Classic" | "Modern" | "Minimal";
  themeMode: ThemeMode;
  accentColor: AccentColor;
  targetAttendancePct: number;
  currencySymbol: string;
  enableAnimations: boolean;
  compactMode: boolean;
  soundEffects: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  userName: "Rushi",
  avatarUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80",
  appStyle: "Classic",
  themeMode: "dark",
  accentColor: "violet",
  targetAttendancePct: 75,
  currencySymbol: "₹",
  enableAnimations: true,
  compactMode: false,
  soundEffects: true,
};

export interface AppData {
  version: number;
  settings: UserSettings;
  txs: Tx[];
  attendance: AttEntry[];
  tasks: Task[];
  journal: JournalEntry[];
  links: LinkItem[];
  subjects: string[];
}

export const CATEGORIES = [
  "Food",
  "Transport",
  "College",
  "Study",
  "Fun",
  "Shopping",
  "Health",
  "Bills",
  "Other",
] as const;

export const MOODS = ["Great", "Good", "Okay", "Meh", "Bad"] as const;

export const LINK_CATEGORIES = ["Study", "College", "Tools", "Fun", "Other"] as const;

const KEY = "lifeutils-data";

export function defaultData(): AppData {
  return {
    version: 2,
    settings: { ...DEFAULT_SETTINGS },
    txs: [],
    attendance: [],
    tasks: [],
    journal: [],
    links: [],
    subjects: ["Class"],
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    const legacyTheme = localStorage.getItem("lifeutils-theme") as "light" | "dark" | null;
    const baseSettings: UserSettings = {
      ...DEFAULT_SETTINGS,
      ...(legacyTheme ? { themeMode: legacyTheme } : {}),
    };

    if (!raw) {
      return {
        ...defaultData(),
        settings: baseSettings,
      };
    }

    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (typeof parsed !== "object" || parsed === null) return defaultData();

    return {
      ...defaultData(),
      ...parsed,
      settings: {
        ...baseSettings,
        ...(parsed.settings || {}),
      },
    };
  } catch {
    return defaultData();
  }
}

export function saveData(d: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(d));
}

export function uid(): string {
  return crypto.randomUUID();
}
