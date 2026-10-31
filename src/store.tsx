/* eslint-disable react-refresh/only-export-components, react/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { todayISO } from "./utils";
import {
  defaultData,
  DEFAULT_SETTINGS,
  loadData,
  saveData,
  sanitizeAndValidateAppData,
  uid,
  type AppData,
  type AttStatus,
  type JournalEntry,
  type Task,
  type UserSettings,
} from "./types";
import { playAudioFeedback, setCurrencySymbol } from "./utils";

export interface Store {
  data: AppData;
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  playHaptic: (type?: "click" | "success" | "toggle" | "delete") => void;
  addTx: (tx: { date: string; kind: "expense" | "saved"; category: string; amount: number; note?: string }) => void;
  delTx: (id: string) => void;
  markAttendance: (date: string, subject: string, status: AttStatus) => void;
  clearAttendance: (date: string, subject?: string) => void;
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
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData(null));
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Track system dark mode preference
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Listen to messages from React Native WebView (e.g. mobile settings button triggering web modal)
  useEffect(() => {
    const handleNativeMessage = (event: MessageEvent) => {
      if (event.origin && event.origin !== window.location.origin && !event.origin.includes('localhost')) {
        return;
      }
      try {
        const raw = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (raw?.type === "OPEN_SETTINGS") {
          setShowSettingsModal(true);
        } else if (raw?.type === "OPEN_AUTH") {
          setShowAuthModal(true);
        }
      } catch {
        // Ignore unparsed messages
      }
    };

    window.addEventListener("message", handleNativeMessage);
    // Also listen to document message for Android WebView injection
    document.addEventListener("message" as unknown as keyof DocumentEventMap, handleNativeMessage as unknown as EventListener);

    return () => {
      window.removeEventListener("message", handleNativeMessage);
      document.removeEventListener("message" as unknown as keyof DocumentEventMap, handleNativeMessage as unknown as EventListener);
    };
  }, []);

  // Compute effective theme
  const currentSettings = data.settings || DEFAULT_SETTINGS;
  const effectiveTheme: "light" | "dark" =
    currentSettings.themeMode === "system"
      ? systemIsDark
        ? "dark"
        : "light"
      : currentSettings.themeMode;

  // Apply Appearance Attributes & CSS Variables to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", effectiveTheme === "light");
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.setAttribute("data-accent", currentSettings.accentColor || "cyan");
    root.setAttribute("data-compact", currentSettings.compactMode ? "true" : "false");
    root.setAttribute("data-animations", currentSettings.enableAnimations ? "true" : "false");
    setCurrencySymbol(currentSettings.currencySymbol || "₹");
    localStorage.setItem("lifeutils-theme", effectiveTheme);

    // Notify React Native native container of theme change if wrapped
    try {
      const rn = (window as unknown as { ReactNativeWebView?: { postMessage: (msg: string) => void } }).ReactNativeWebView;
      if (rn && typeof rn.postMessage === "function") {
        rn.postMessage(JSON.stringify({ type: "THEME_CHANGED", theme: effectiveTheme }));
      }
    } catch {
      // Ignore
    }
  }, [effectiveTheme, currentSettings.accentColor, currentSettings.compactMode, currentSettings.enableAnimations, currentSettings.currencySymbol]);

  useEffect(() => {
    // Strictly fetches THIS authenticated user's private data from Supabase
    const fetchUserData = async (u: User) => {
      const { data: cloudRes, error } = await supabase
        .from("user_data")
        .select("data")
        .eq("id", u.id)
        .single();

      const metaUsername =
        (u.user_metadata?.username as string) ||
        (u.user_metadata?.full_name as string) ||
        (u.user_metadata?.display_name as string);

      const defaultName = metaUsername || (u.email ? u.email.split("@")[0] : "Friend");

      if (cloudRes && cloudRes.data) {
        const cloudData = sanitizeAndValidateAppData(cloudRes.data);
        const resolvedName = cloudData.settings?.userName || defaultName;

        const merged: AppData = {
          ...defaultData(),
          ...cloudData,
          settings: {
            ...DEFAULT_SETTINGS,
            ...(cloudData.settings || {}),
            userName: resolvedName,
          },
        };

        setData(merged);
        saveData(merged, u.id);
      } else if (error && error.code === "PGRST116") {
        // Brand new user: initialize clean isolated profile
        const initData: AppData = {
          ...defaultData(),
          settings: {
            ...DEFAULT_SETTINGS,
            userName: defaultName,
          },
        };
        await supabase.from("user_data").upsert({ id: u.id, data: initData });
        setData(initData);
        saveData(initData, u.id);
      } else {
        // Fallback: check cached user-specific storage
        const cached = loadData(u.id);
        setData(cached);
      }
      setIsLoaded(true);
    };

    // Helper to process session changes and load data strictly isolated per user
    const handleSession = (session: Session | null) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        // Guest mode: load strictly isolated guest storage (never prior user data)
        const guestData = loadData(null);
        setData(guestData);
        setIsLoaded(true);
      }

      // Notify React Native native container of auth change if wrapped
      try {
        const rn = (window as unknown as { ReactNativeWebView?: { postMessage: (msg: string) => void } }).ReactNativeWebView;
        if (rn && typeof rn.postMessage === "function") {
          const metaName =
            (session?.user?.user_metadata?.username as string) ||
            (session?.user?.user_metadata?.full_name as string) ||
            (session?.user?.user_metadata?.display_name as string);
          const activeName =
            metaName || (session?.user?.email ? session.user.email.split("@")[0] : "Guest");

          rn.postMessage(JSON.stringify({
            type: "AUTH_CHANGED",
            session: session ? { user: { email: session.user.email, id: session.user.id } } : null,
            userName: activeName,
          }));
        }
      } catch {
        // Ignore
      }
    };

    // Get initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setData(loadData(null));
        setIsLoaded(true);
        try {
          const rn = (window as unknown as { ReactNativeWebView?: { postMessage: (msg: string) => void } }).ReactNativeWebView;
          if (rn && typeof rn.postMessage === "function") {
            rn.postMessage(JSON.stringify({ type: "AUTH_CHANGED", session: null }));
          }
        } catch {
          // Ignore
        }
      } else {
        handleSession(session);
      }
    });

    // Listen to subsequent auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Save locally under user-scoped storage key
    saveData(data, user?.id || null);
    // Sync to supabase if logged in and loaded
    if (user && isLoaded) {
      supabase.from("user_data").upsert({ id: user.id, data }).then();
    }
  }, [data, user, isLoaded]);

  const store: Store = {
    data,
    settings: currentSettings,
    updateSettings: (partial) => {
      setData((d) => ({
        ...d,
        settings: {
          ...(d.settings || DEFAULT_SETTINGS),
          ...partial,
        },
      }));
    },
    playHaptic: (type = "click") => {
      playAudioFeedback(type, currentSettings.soundEffects);
    },
    theme: effectiveTheme,
    setTheme: (t) => {
      setData((d) => ({
        ...d,
        settings: {
          ...(d.settings || DEFAULT_SETTINGS),
          themeMode: t,
        },
      }));
    },
    session,
    user,
    isGuest: !session,
    showAuthModal,
    setShowAuthModal,
    showSettingsModal,
    setShowSettingsModal,
    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      // Clean isolated guest slate so previous user's sensitive data is wiped from active view
      const cleanGuest = defaultData();
      setData(cleanGuest);
      saveData(cleanGuest, null);
    },
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
          (a) => (subject ? !(a.date === date && a.subject === subject) : a.date !== date),
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
        const task: Task = { id: uid(), text: t, created: todayISO(), done: false };
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
              : { ...t, done: true, doneAt: todayISO() }
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
          links: [{ id: uid(), title: title.trim() || u, url: u, category }, ...d.links],
        };
      }),
    delLink: (id) =>
      setData((d) => ({ ...d, links: d.links.filter((l) => l.id !== id) })),
    replaceAll: (nd) => setData(sanitizeAndValidateAppData(nd)),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}