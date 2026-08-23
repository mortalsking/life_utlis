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

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function fmtMoney(n: number): string {
  return inr.format(n);
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
