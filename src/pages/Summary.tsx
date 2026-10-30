import { useMemo, useRef } from "react";
import Icon from "../components/Icon";
import { useStore } from "../store";
import { defaultData } from "../types";
import { toast } from "../notifications";
import {
  calcAttStats,
  fmtDate,
  fmtMoney,
  inRange,
  monthRange,
  pct,
  todayISO,
  weekRange,
  yearRange,
} from "../utils";

export default function Summary() {
  const isNativeApp =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { isReactNativeApp?: boolean }).isReactNativeApp ||
      (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView
    );

  const { data, replaceAll, session, user, settings, setShowAuthModal, playHaptic } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const att = useMemo(() => {
    const month = monthRange();
    const mEntries = data.attendance.filter((a) => inRange(a.date, month));
    const mStats = calcAttStats(mEntries);
    const totalStats = calcAttStats(data.attendance);
    return {
      monthPercent: mStats.percent,
      total: totalStats.total,
      present: totalStats.present,
    };
  }, [data.attendance]);

  const spentIn = (r: { start: string; end: string; label?: string }) =>
    data.txs
      .filter((t) => t.kind === "expense" && inRange(t.date, r))
      .reduce((s, t) => s + t.amount, 0);

  const savedTotal = useMemo(
    () =>
      data.txs.filter((t) => t.kind === "saved").reduce((s, t) => s + t.amount, 0),
    [data.txs],
  );

  const openTasks = data.tasks.filter((t) => !t.done);
  const overdue = openTasks.filter((t) => t.due && t.due < todayISO());

  const topCats = useMemo(() => {
    const r = monthRange();
    const map = new Map<string, number>();
    for (const t of data.txs) {
      if (t.kind !== "expense" || !inRange(t.date, r)) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [data.txs]);

  const latestJournal = useMemo(
    () => [...data.journal].sort((a, b) => b.date.localeCompare(a.date))[0],
    [data.journal],
  );

  function exportJSON() {
    playHaptic("click");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeutils-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("✓ Backup exported successfully");
  }

  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object") throw new Error("bad file");
        replaceAll(parsed);
        playHaptic("success");
        toast.success("✓ Backup restored successfully");
      } catch {
        playHaptic("delete");
        toast.error("That file does not match a valid Life Utils backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="page">
      <h2 className="page-title">Summary</h2>

      <div className="mascot-companion-card">
        <div className="mascot-avatar-wrap">
          <img src="/mascot.jpg" alt="Life Utils Mascot" className="mascot-avatar-img" />
          <span className="mascot-live-indicator" title="Mascot Active" />
        </div>
        <div className="mascot-text-wrap">
          <div className="mascot-header-row">
            <span className="mascot-name">Buddy Mascot</span>
            <span className="mascot-status-pill">Companion</span>
          </div>
          <p className="mascot-quote">
            "Track daily, improve steadily. You've got this, {settings.userName || "friend"}!"
          </p>
        </div>
      </div>

      <div className="statgrid three">
        <div className="card stat">
          <span>Attendance (mo)</span>
          <strong>{att.monthPercent}%</strong>
        </div>
        <div className="card stat bad-stat">
          <span>Spent (mo)</span>
          <strong>{fmtMoney(spentIn(monthRange()))}</strong>
        </div>
        <div className="card stat good-stat">
          <span>Saved all-time</span>
          <strong>{fmtMoney(savedTotal)}</strong>
        </div>
      </div>

      <section className="card">
        <h3>Spending by period</h3>
        <div className="period-rows">
          <div>
            <span>This week</span>
            <strong>{fmtMoney(spentIn(weekRange()))}</strong>
          </div>
          <div>
            <span>This month</span>
            <strong>{fmtMoney(spentIn(monthRange()))}</strong>
          </div>
          <div>
            <span>This year</span>
            <strong>{fmtMoney(spentIn(yearRange()))}</strong>
          </div>
          <div>
            <span>All time</span>
            <strong>{fmtMoney(spentIn({ start: "0000-01-01", end: "9999-12-31" }))}</strong>
          </div>
        </div>
      </section>

      {topCats.length > 0 && (
        <section className="card">
          <h3>Top categories this month</h3>
          {topCats.map(([c, amount]) => (
            <div key={c} className="row-between">
              <span>{c}</span>
              <strong>{fmtMoney(amount)}</strong>
            </div>
          ))}
        </section>
      )}

      <div className="statgrid">
        <div className="card stat">
          <span>Open backlog</span>
          <strong>{openTasks.length}</strong>
        </div>
        <div className={`card stat ${overdue.length ? "bad-stat" : ""}`}>
          <span>Overdue</span>
          <strong>{overdue.length}</strong>
        </div>
        <div className="card stat">
          <span>Journal entries</span>
          <strong>{data.journal.length}</strong>
        </div>
        <div className="card stat">
          <span>Links saved</span>
          <strong>{data.links.length}</strong>
        </div>
      </div>

      <section className="card">
        <h3>All-time attendance</h3>
        <p className="big-line">
          {att.present}/{att.total} · {pct(att.present, att.total)}%
        </p>
      </section>

      {latestJournal && (
        <section className="card">
          <h3>Latest journal</h3>
          <p className="muted small">{fmtDate(latestJournal.date)}</p>
          <p className="journal-preview">{latestJournal.text}</p>
        </section>
      )}

      {!isNativeApp && (
        <section className="card app-download-card">
          <div className="app-download-header">
            <div className="app-download-icon">
              <Icon name="smartphone" size={26} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Life Utils for Android</h3>
                <span className="version-pill" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>v1.2.1</span>
              </div>
              <p className="muted small" style={{ margin: "2px 0 0" }}>
                Native Android App &middot; Direct APK Install
              </p>
            </div>
          </div>
          <p className="small-text" style={{ margin: "0.65rem 0", lineHeight: 1.5 }}>
            Install Life Utils on your Android phone to track attendance and expenses offline with instant multi-device cloud sync.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <a
              href="/life-utils.apk"
              download="life-utils.apk"
              className="btn primary full btn-download-card-action"
            >
              <Icon name="download" size={17} /> Download Android APK (.apk)
            </a>
          </div>
        </section>
      )}

      <section className="card">
        <h3>Cloud Sync & Data</h3>
        {!session ? (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: "12px", background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)" }}>
            <p className="small-text" style={{ margin: "0 0 0.5rem 0", color: "var(--warn)" }}>
              ⚡ <strong>Guest Mode Active:</strong> Data is saved on this browser only. Sign in to enable automatic cloud backup and access across all your devices.
            </p>
            <button className="btn primary full" onClick={() => setShowAuthModal(true)}>
              <Icon name="check" size={16} /> Sign In to Enable Auto Cloud Sync
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: "12px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.2)" }}>
            <p className="small-text" style={{ margin: 0, color: "var(--good)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--good)" }} />
              <strong>Cloud Sync Active:</strong> Synced as {settings.userName || user?.email?.split("@")[0]}
            </p>
          </div>
        )}

        <h4>Manual Backup</h4>
        <p className="muted small">
          Export or import a JSON snapshot file of your entire app data anytime.
        </p>
        <button className="btn ghost full" onClick={exportJSON}>
          <Icon name="download" size={17} /> Export backup (JSON)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJSON(f);
            e.target.value = "";
          }}
        />
        <button className="btn ghost full" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={17} /> Import backup
        </button>
        <button
          className="btn ghost full neg"
          onClick={() => {
            if (confirm("Erase ALL data on this device?")) replaceAll(defaultData());
          }}
        >
          Reset everything
        </button>
      </section>
    </div>
  );
}
