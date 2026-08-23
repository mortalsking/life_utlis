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

export interface AppData {
  version: number;
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
    version: 1,
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
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (typeof parsed !== "object" || parsed === null) return defaultData();
    return { ...defaultData(), ...parsed };
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
