function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Monday-based start of the week containing the given ISO date */
export function startOfWeekISO(iso: string): string {
  const d = parseISO(iso);
  const dow = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setDate(d.getDate() - dow);
  return toISO(d);
}

export interface Range {
  start: string;
  end: string;
  label: string;
}

export function weekRange(offset = 0): Range {
  const monday = startOfWeekISO(addDaysISO(todayISO(), offset * 7));
  const sunday = addDaysISO(monday, 6);
  const end = parseISO(sunday);
  const start = parseISO(monday);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const label =
    offset === 0
      ? "This week"
      : offset === -1
        ? "Last week"
        : `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  return { start: monday, end: sunday, label };
}

export function monthRange(offset = 0): Range {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const label =
    offset === 0
      ? "This month"
      : first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return { start: toISO(first), end: toISO(last), label };
}

export function yearRange(offset = 0): Range {
  const y = new Date().getFullYear() + offset;
  const label = offset === 0 ? "This year" : String(y);
  return { start: `${y}-01-01`, end: `${y}-12-31`, label };
}

export function inRange(iso: string, r: { start: string; end: string }): boolean {
  return iso >= r.start && iso <= r.end;
}

export function fmtDate(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function fmtDayShort(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

let currentCurrency = "₹";

export function setCurrencySymbol(symbol: string) {
  currentCurrency = symbol || "₹";
}

export function fmtMoney(n: number, symbol?: string): string {
  const sym = symbol || currentCurrency || "₹";
  const rounded = Math.round(n).toLocaleString();
  return `${sym}${rounded}`;
}

// Micro-interaction Audio / Haptic Feedback Synthesizer
let audioCtx: AudioContext | null = null;

export function playAudioFeedback(
  type: "click" | "success" | "toggle" | "delete" = "click",
  enabled = true,
) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "toggle") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "delete") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch {
    // Ignore audio policy or device restriction errors silently
  }
}

export function pct(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export interface AttSummaryStats {
  total: number;
  present: number;
  absent: number;
  percent: number;
}

export function calcAttStats(entries: { status: string }[]): AttSummaryStats {
  const total = entries.length;
  const present = entries.filter((e) => e.status === "present").length;
  const absent = total - present;
  return { total, present, absent, percent: pct(present, total) };
}

export interface SubjectAttStats extends AttSummaryStats {
  subject: string;
}

export function calcSubjectAttStats(entries: { subject: string; status: string }[]): SubjectAttStats[] {
  const map = new Map<string, { present: number; total: number }>();
  for (const a of entries) {
    const cur = map.get(a.subject) ?? { present: 0, total: 0 };
    cur.total += 1;
    if (a.status === "present") cur.present += 1;
    map.set(a.subject, cur);
  }
  return [...map.entries()]
    .map(([subject, s]) => ({
      subject,
      total: s.total,
      present: s.present,
      absent: s.total - s.present,
      percent: pct(s.present, s.total),
    }))
    .sort((a, b) => b.percent - a.percent);
}

export function calcStreak(entries: { date: string; status: string }[], today: string): number {
  let day = today;
  if (!entries.some((a) => a.date === day)) day = addDaysISO(day, -1);
  let count = 0;
  for (let i = 0; i < 90; i++) {
    const dayEntries = entries.filter((a) => a.date === day);
    if (dayEntries.length === 0) {
      day = addDaysISO(day, -1);
      continue;
    }
    if (dayEntries.every((a) => a.status === "present")) {
      count += 1;
      day = addDaysISO(day, -1);
    } else {
      break;
    }
  }
  return count;
}

export interface BunkAdvice {
  status: "safe" | "short" | "exact" | "no_data";
  margin: number;
  message: string;
}

export function calcBunkAdvice(present: number, total: number, targetPct = 75): BunkAdvice {
  if (total === 0) return { status: "no_data", margin: 0, message: "No lectures logged yet" };
  const currentPct = (present / total) * 100;
  const target = targetPct / 100;

  if (currentPct > targetPct) {
    const canBunk = Math.floor(present / target - total);
    return {
      status: "safe",
      margin: canBunk,
      message:
        canBunk === 0
          ? "On the borderline! Don't miss the next lecture."
          : `Safe to miss ${canBunk} lecture${canBunk > 1 ? "s" : ""} and stay >= ${targetPct}%`,
    };
  } else if (currentPct < targetPct) {
    const needToAttend = Math.ceil((target * total - present) / (1 - target));
    return {
      status: "short",
      margin: needToAttend,
      message: `Need to attend ${needToAttend} consecutive lecture${needToAttend > 1 ? "s" : ""} to reach ${targetPct}%`,
    };
  } else {
    return {
      status: "exact",
      margin: 0,
      message: `Exactly at ${targetPct}%! Don't miss your next lecture.`,
    };
  }
}

