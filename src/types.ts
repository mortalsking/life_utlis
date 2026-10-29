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
  avatarUrl: "/logo.jpg",
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

export function sanitizeAndValidateAppData(raw: unknown): AppData {
  const base = defaultData();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }
  const obj = raw as Record<string, unknown>;
  const txs = Array.isArray(obj.txs)
    ? (obj.txs as unknown[]).filter(
        (t): t is Tx =>
          Boolean(t) &&
          typeof t === "object" &&
          typeof (t as Record<string, unknown>).id === "string" &&
          typeof (t as Record<string, unknown>).amount === "number",
      )
    : [];
  const attendance = Array.isArray(obj.attendance)
    ? (obj.attendance as unknown[]).filter(
        (a): a is AttEntry =>
          Boolean(a) &&
          typeof a === "object" &&
          typeof (a as Record<string, unknown>).id === "string" &&
          typeof (a as Record<string, unknown>).subject === "string",
      )
    : [];
  const tasks = Array.isArray(obj.tasks)
    ? (obj.tasks as unknown[]).filter(
        (t): t is Task =>
          Boolean(t) &&
          typeof t === "object" &&
          typeof (t as Record<string, unknown>).id === "string" &&
          typeof (t as Record<string, unknown>).text === "string",
      )
    : [];
  const journal = Array.isArray(obj.journal)
    ? (obj.journal as unknown[]).filter(
        (j): j is JournalEntry =>
          Boolean(j) &&
          typeof j === "object" &&
          typeof (j as Record<string, unknown>).id === "string",
      )
    : [];
  const links = Array.isArray(obj.links)
    ? (obj.links as unknown[]).filter(
        (l): l is LinkItem =>
          Boolean(l) &&
          typeof l === "object" &&
          typeof (l as Record<string, unknown>).id === "string" &&
          typeof (l as Record<string, unknown>).url === "string" &&
          /^https?:\/\//i.test(((l as Record<string, unknown>).url as string).trim()),
      )
    : [];
  const subjects = Array.isArray(obj.subjects)
    ? (obj.subjects as unknown[])
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : ["Class"];

  const settingsObj =
    obj.settings && typeof obj.settings === "object" && !Array.isArray(obj.settings)
      ? (obj.settings as Partial<UserSettings>)
      : {};

  return {
    version: 2,
    txs,
    attendance,
    tasks,
    journal,
    links,
    subjects: subjects.length > 0 ? subjects : ["Class"],
    settings: {
      ...DEFAULT_SETTINGS,
      ...settingsObj,
      userName:
        typeof settingsObj.userName === "string" && settingsObj.userName.trim()
          ? settingsObj.userName.trim().slice(0, 50)
          : DEFAULT_SETTINGS.userName,
      targetAttendancePct:
        typeof settingsObj.targetAttendancePct === "number" &&
        settingsObj.targetAttendancePct > 0 &&
        settingsObj.targetAttendancePct <= 100
          ? settingsObj.targetAttendancePct
          : 75,
      currencySymbol:
        typeof settingsObj.currencySymbol === "string" && settingsObj.currencySymbol.trim()
          ? settingsObj.currencySymbol.trim().slice(0, 5)
          : "₹",
      avatarUrl:
        typeof settingsObj.avatarUrl === "string" &&
        /^(\/|https?:\/\/|data:image\/)/i.test(settingsObj.avatarUrl.trim())
          ? settingsObj.avatarUrl.trim()
          : DEFAULT_SETTINGS.avatarUrl,
    },
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

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeAndValidateAppData(parsed);
    return {
      ...sanitized,
      settings: {
        ...baseSettings,
        ...sanitized.settings,
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
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
}
