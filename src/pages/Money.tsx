import { useMemo, useState } from "react";
import Bars from "../components/Bars";
import TxForm from "../components/TxForm";
import { useStore } from "../store";
import type { Tx } from "../types";
import {
  addDaysISO,
  fmtDayShort,
  fmtMoney,
  inRange,
  monthRange,
  parseISO,
  startOfWeekISO,
  todayISO,
  weekRange,
  yearRange,
} from "../utils";

type Period = "week" | "month" | "year";

export default function Money() {
  const { data, delTx } = useStore();
  const [period, setPeriod] = useState<Period>("week");
  const [offset, setOffset] = useState(0);

  const range = useMemo(() => {
    if (period === "week") return weekRange(offset);
    if (period === "month") return monthRange(offset);
    return yearRange(offset);
  }, [period, offset]);

  const txs = useMemo(
    () => data.txs.filter((t) => inRange(t.date, range)).sort((a, b) => b.date.localeCompare(a.date)),
    [data.txs, range],
  );

  const spent = txs.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  const saved = txs.filter((t) => t.kind === "saved").reduce((s, t) => s + t.amount, 0);

  const avgPerDay = useMemo(() => {
    const today = todayISO();
    const effectiveEnd = range.end > today ? today : range.end;
    const days =
      Math.round((parseISO(effectiveEnd).getTime() - parseISO(range.start).getTime()) / 86400000) + 1;
    return days > 0 ? spent / days : 0;
  }, [spent, range]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of txs) {
      if (t.kind !== "expense") continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [txs]);

  const buckets = useMemo(() => {
    if (period === "year") {
      const out: { label: string; value: number }[] = [];
      for (let m = 0; m < 12; m++) {
        const prefix = `${range.start.slice(0, 4)}-${String(m + 1).padStart(2, "0")}`;
        const value = data.txs
          .filter((t) => t.date.startsWith(prefix) && t.kind === "expense")
          .reduce((s, t) => s + t.amount, 0);
        out.push({ label: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][m], value });
      }
      return out;
    }
    if (period === "month") {
      const out: { label: string; value: number }[] = [];
      let day = monthRange(offset).start;
      const end = monthRange(offset).end;
      while (day <= end) {
        const d = day;
        const value = data.txs
          .filter((t) => t.date === d && t.kind === "expense")
          .reduce((s, t) => s + t.amount, 0);
        out.push({ label: String(parseISO(d).getDate()), value });
        day = addDaysISO(day, 1);
      }
      return out;
    }
    // week — one bar per weekday, Monday to Sunday
    const names = ["M", "T", "W", "T", "F", "S", "S"];
    const monday = startOfWeekISO(weekRange(offset).start);
    return names.map((label, i) => {
      const d = addDaysISO(monday, i);
      const value = data.txs
        .filter((t) => t.date === d && t.kind === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return { label, value };
    });
  }, [data.txs, period, offset, range.start]);

  const savedAllTime = useMemo(
    () =>
      data.txs
        .filter((t: Tx) => t.kind === "saved")
        .reduce((s, t) => s + t.amount, 0),
    [data.txs],
  );

  function switchPeriod(p: Period) {
    setPeriod(p);
    setOffset(0);
  }

  return (
    <div className="page">
      <h2 className="page-title">Money</h2>

      <div className="seg full">
        {(["week", "month", "year"] as const).map((p) => (
          <button key={p} className={period === p ? "on" : ""} onClick={() => switchPeriod(p)}>
            {p[0].toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="range-nav">
        <button className="icon-btn boxed" onClick={() => setOffset((o) => o - 1)}>
          ←
        </button>
        <span>{range.label}</span>
        {offset < 0 ? (
          <button className="icon-btn boxed" onClick={() => setOffset((o) => o + 1)}>
            →
          </button>
        ) : (
          <span className="nav-spacer" />
        )}
      </div>

      <div className="statgrid">
        <div className="card stat bad-stat">
          <span>Spent · {range.label.toLowerCase()}</span>
          <strong>{fmtMoney(spent)}</strong>
          <em>≈ {fmtMoney(Math.round(avgPerDay))}/day</em>
        </div>
        <div className="card stat good-stat">
          <span>Saved</span>
          <strong>{fmtMoney(saved)}</strong>
          <em>{saved + spent > 0 ? `${Math.round((saved / (saved + spent)) * 100)}% of money flow` : "—"}</em>
        </div>
      </div>

      <section className="card">
        <h3>Daily spending</h3>
        <Bars values={buckets} format={(v) => (v > 0 ? String(v) : "")} />
      </section>

      {byCategory.length > 0 && (
        <section className="card">
          <h3>Categories</h3>
          {byCategory.map((c) => (
            <div key={c.category} className="meter-row">
              <div className="meter-head">
                <span>{c.category}</span>
                <span className="muted small">{fmtMoney(c.amount)}</span>
              </div>
              <div className="meter">
                <div
                  className="meter-fill"
                  style={{ width: `${spent === 0 ? 0 : (c.amount / spent) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      <TxForm />

      <section className="card">
        <h3>Transactions · {range.label}</h3>
        {txs.length === 0 && <p className="muted small">Nothing logged in this period.</p>}
        {txs.map((t) => (
          <div key={t.id} className={`tx ${t.kind}`}>
            <div className="tx-main">
              <span className={`tx-dot ${t.kind}`} />
              <div className="tx-info">
                <strong>{t.kind === "expense" ? t.category : "Saved"}</strong>
                <span className="muted small">
                  {fmtDayShort(t.date)}
                  {t.note ? ` · ${t.note}` : ""}
                </span>
              </div>
            </div>
            <div className="tx-right">
              <strong className={t.kind === "expense" ? "neg" : "pos"}>
                {t.kind === "expense" ? "-" : "+"}
                {fmtMoney(t.amount)}
              </strong>
              <button className="icon-btn" onClick={() => delTx(t.id)} title="Delete">
                ×
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Total saved all-time</h3>
        <p className="big-line pos">{fmtMoney(savedAllTime)}</p>
        <p className="hint">Every "Saved" entry you've logged, across all periods.</p>
      </section>
    </div>
  );
}
