/* eslint-disable react-refresh/only-export-components, react/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  defaultData,
  loadData,
  saveData,
  uid,
  type AppData,
  type AttStatus,
  type JournalEntry,
  type Task,
} from "./types";

export interface Store {
  data: AppData;
  addTx: (tx: { date: string; kind: "expense" | "saved"; category: string; amount: number; note?: string }) => void;
  delTx: (id: string) => void;
  markAttendance: (date: string, subject: string, status: AttStatus) => void;
  clearAttendance: (date: string, subject: string) => void;
  delAtt: (id: string) => void;
  addSubject: (name: string) => void;
  removeSubject: (name: string) => void;
  addTask: (text: string, due?: string) => void;
  toggleTask: (id: string) => void;
  delTask: (id: string) => void;
  clearDoneTasks: () => void;
  saveJournal: (entry: { date: string; mood?: string; text: string }) => void;
  delJournal: (id: string) => void;
  addLink: (link: { title: string; url: string; category: string }) => void;
  delLink: (id: string) => void;
  replaceAll: (d: AppData) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [theme] = useState(() => {
    const stored = localStorage.getItem("lifeutils-theme");
    return stored === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("lifeutils-theme", theme);
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const store: Store = {
    data,
    addTx: ({ date, kind, category, amount, note }) =>
      setData((d) => ({
        ...d,
        txs: [...d.txs, { id: uid(), date, kind, category, amount, note }],
      })),
    delTx: (id) => setData((d) => ({ ...d, txs: d.txs.filter((t) => t.id !== id) })),
    markAttendance: (date, subject, status) =>
      setData((d) => ({
        ...d,
        attendance: [...d.attendance, { id: uid(), date, subject, status }],
      })),
    clearAttendance: (date, subject) =>
      setData((d) => ({
        ...d,
        attendance: d.attendance.filter(
          (a) => !(a.date === date && a.subject === subject),
        ),
      })),
    delAtt: (id) =>
      setData((d) => ({ ...d, attendance: d.attendance.filter((a) => a.id !== id) })),
    addSubject: (name) =>
      setData((d) => {
        const n = name.trim();
        if (!n || d.subjects.some((s) => s.toLowerCase() === n.toLowerCase())) return d;
        return { ...d, subjects: [...d.subjects, n] };
      }),
    removeSubject: (name) =>
      setData((d) => ({ ...d, subjects: d.subjects.filter((s) => s !== name) })),
    addTask: (text, due) =>
      setData((d) => {
        const t = text.trim();
        if (!t) return d;
        const task: Task = { id: uid(), text: t, created: new Date().toISOString().slice(0, 10), done: false };
        if (due) task.due = due;
        return { ...d, tasks: [task, ...d.tasks] };
      }),
    toggleTask: (id) =>
      setData((d) => ({
        ...d,
        tasks: d.tasks.map((t): Task =>
          t.id === id
            ? t.done
              ? { ...t, done: false, doneAt: undefined }
              : { ...t, done: true, doneAt: new Date().toISOString().slice(0, 10) }
            : t,
        ),
      })),
    delTask: (id) => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })),
    clearDoneTasks: () => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => !t.done) })),
    saveJournal: ({ date, mood, text }) =>
      setData((d) => {
        const entry: JournalEntry = { id: uid(), date, mood, text: text.trim() };
        const exists = d.journal.find((j) => j.date === date);
        return {
          ...d,
          journal: exists
            ? d.journal.map((j) => (j.date === date ? { ...j, text: entry.text, mood } : j))
            : [entry, ...d.journal],
        };
      }),
    delJournal: (id) =>
      setData((d) => ({ ...d, journal: d.journal.filter((j) => j.id !== id) })),
    addLink: ({ title, url, category }) =>
      setData((d) => {
        let u = url.trim();
        if (!u) return d;
        if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
        return {
          ...d,
          links: [{ id: uid(), title: title.trim() || u, url: u, category }],
          ...d.links,
        };
      }),
    delLink: (id) =>
      setData((d) => ({ ...d, links: d.links.filter((l) => l.id !== id) })),
    replaceAll: (nd) => setData({ ...defaultData(), ...nd }),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}