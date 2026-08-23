import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import { useStore } from "../store";
import { addDaysISO, fmtDate, pct, todayISO } from "../utils";

function monthMatrix(viewMonth: string): (string | null)[] {
  const [y, m] = viewMonth.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: startOffset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${viewMonth}-${String(d).padStart(2, "0")}`);
  }
  return cells;
}

function shiftMonth(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function Attendance() {
  const { data, markAttendance, clearAttendance, addSubject, removeSubject } = useStore();
  const today = todayISO();
  const [viewMonth, setViewMonth] = useState(() => today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(today);
  const [newSubject, setNewSubject] = useState("");

  const stats = useMemo(() => {
    const total = data.attendance.length;
    const present = data.attendance.filter((a) => a.status === "present").length;
    return { total, present, absent: total - present, percent: pct(present, total) };
  }, [data.attendance]);

  const monthStats = useMemo(() => {
    const entries = data.attendance.filter((a) => a.date.startsWith(viewMonth));
    const present = entries.filter((a) => a.status === "present").length;
    return { percent: pct(present, entries.length), count: entries.length };
  }, [data.attendance, viewMonth]);

  const streak = useMemo(() => {
    let day = today;
    if (!data.attendance.some((a) => a.date === day)) day = addDaysISO(day, -1);
    let count = 0;
    for (let i = 0; i < 90; i++) {
      const entries = data.attendance.filter((a) => a.date === day);
      if (entries.length === 0) {
        day = addDaysISO(day, -1); // skip no-class days like Sundays
        continue;
      }
      if (entries.every((a) => a.status === "present")) {
        count += 1;
        day = addDaysISO(day, -1);
      } else break;
    }
    return count;
  }, [data.attendance, today]);

  const perSubject = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    for (const a of data.attendance) {
      const cur = map.get(a.subject) ?? { present: 0, total: 0 };
      cur.total += 1;
      if (a.status === "present") cur.present += 1;
      map.set(a.subject, cur);
    }
    return [...map.entries()]
      .map(([subject, s]) => ({ subject, ...s, percent: pct(s.present, s.total) }))
      .sort((a, b) => b.percent - a.percent);
  }, [data.attendance]);

  const cells = useMemo(() => monthMatrix(viewMonth), [viewMonth]);

  const selectedEntries = data.attendance.filter((a) => a.date === selectedDate);

  const history = useMemo(() => {
    const groups = new Map<string, typeof data.attendance>();
    for (const a of [...data.attendance].sort((x, y) => y.date.localeCompare(x.date))) {
      const list = groups.get(a.date) ?? [];
      list.push(a);
      groups.set(a.date, list);
    }
    return [...groups.entries()].slice(0, 14);
  }, [data.attendance]);

  function dayClass(iso: string): string {
    const entries = data.attendance.filter((a) => a.date === iso);
    if (entries.length === 0) return "";
    if (entries.every((a) => a.status === "present")) return "p";
    if (entries.every((a) => a.status === "absent")) return "a";
    return "m";
  }

  return (
    <div className="page">
      <h2 className="page-title">Attendance</h2>

      <div className="statgrid three">
        <div className="card stat">
          <span>This month</span>
          <strong>{monthStats.percent}%</strong>
        </div>
        <div className="card stat">
          <span>All time</span>
          <strong>{stats.percent}%</strong>
        </div>
        <div className="card stat flame-stat">
          <span>
            <Icon name="flame" size={13} /> Streak
          </span>
          <strong>{streak}d</strong>
        </div>
      </div>

      <section className="card calendar-card">
        <div className="cal-nav">
          <button className="icon-btn boxed" onClick={() => setViewMonth(shiftMonth(viewMonth, -1))}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <strong>{monthLabel(viewMonth)}</strong>
          <button className="icon-btn boxed" onClick={() => setViewMonth(shiftMonth(viewMonth, 1))}>
            <Icon name="chevronRight" size={18} />
          </button>
        </div>

        <div className="cal-weekdays">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((iso, i) =>
            iso === null ? (
              <span key={`e${i}`} />
            ) : (
              <button
                key={iso}
                className={[
                  "cal-day",
                  dayClass(iso),
                  iso === today ? "today" : "",
                  iso === selectedDate ? "selected" : "",
                ].join(" ")}
                onClick={() => setSelectedDate(iso)}
              >
                {Number(iso.slice(-2))}
              </button>
            ),
          )}
        </div>

        <div className="cal-legend">
          <span><i className="dot p" /> Present</span>
          <span><i className="dot a" /> Absent</span>
          <span><i className="dot m" /> Mixed</span>
        </div>
      </section>

      <section className="card">
        <h3>{fmtDate(selectedDate)}</h3>
        {data.subjects.length === 0 && (
          <p className="empty">Add a subject below to start tracking.</p>
        )}
        <div className="att-row">
          {data.subjects.map((s) => {
            const st = selectedEntries.find((a) => a.subject === s)?.status;
            return (
              <div key={s} className="att-subject">
                <span className="att-name">{s}</span>
                <div className="tri-seg">
                  <button
                    className={st === "present" ? "on good" : ""}
                    onClick={() => markAttendance(selectedDate, s, "present")}
                  >
                    P
                  </button>
                  <button
                    className={st === "absent" ? "on bad" : ""}
                    onClick={() => markAttendance(selectedDate, s, "absent")}
                  >
                    A
                  </button>
                  <button className={!st ? "on" : ""} onClick={() => clearAttendance(selectedDate, s)}>
                    —
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {perSubject.length > 0 && (
        <section className="card">
          <h3>By subject</h3>
          {perSubject.map((s) => (
            <div key={s.subject} className="meter-row">
              <div className="meter-head">
                <span>{s.subject}</span>
                <span className="muted small-text">
                  {s.present}/{s.total} · {s.percent}%
                </span>
              </div>
              <div className="meter">
                <div
                  className={`meter-fill ${s.percent >= 75 ? "" : "warn"}`}
                  style={{ width: `${s.percent}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h3>Subjects</h3>
        <div className="chips">
          {data.subjects.map((s) => (
            <button key={s} className="chip removable" onClick={() => removeSubject(s)}>
              {s} ×
            </button>
          ))}
        </div>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            addSubject(newSubject);
            setNewSubject("");
          }}
        >
          <input
            type="text"
            placeholder="Add subject e.g. CS301"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Recent days</h3>
        {history.length === 0 && <p className="empty">No entries yet — tap a day above.</p>}
        {history.map(([date, entries]) => (
          <div key={date} className="history-day">
            <button className="history-date linkish" onClick={() => setSelectedDate(date)}>
              {fmtDate(date)}
            </button>
            <div className="history-entries">
              {entries.map((a) => (
                <span key={a.id} className={`pill ${a.status}`}>
                  {a.subject}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
