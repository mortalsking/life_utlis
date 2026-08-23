import { useMemo, useRef } from "react";
import Icon from "../components/Icon";
import { useStore } from "../store";
import { defaultData, type AppData } from "../types";
import {
  fmtDate,
  fmtMoney,
  inRange,
  monthRange,
  pct,
  weekRange,
  yearRange,
} from "../utils";

export default function Summary() {
  const { data, replaceAll } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const att = useMemo(() => {
    const month = monthRange();
    const mEntries = data.attendance.filter((a) => inRange(a.date, month));
    const mPresent = mEntries.filter((a) => a.status === "present").length;
    return {
      monthPercent: pct(mPresent, mEntries.length),
      total: data.attendance.length,
      present: data.attendance.filter((a) => a.status === "present").length,
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
  const overdue = openTasks.filter((t) => t.due && t.due < new Date().toISOString().slice(0, 10));

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
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeutils-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!parsed || typeof parsed !== "object") throw new Error("bad file");
        replaceAll(parsed);
        alert("Backup restored.");
      } catch {
        alert("That file doesn't look like a Life Utils backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="page">
      <h2 className="page-title">Summary</h2>

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

      <section className="card">
        <h3>Data</h3>
        <p className="muted small">
          Everything lives in this phone's browser. Back it up now and then — clearing browser
          data wipes the app.
        </p>
        <button className="btn primary full" onClick={exportJSON}>
          <Icon name="download" size={17} /> Export backup
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
