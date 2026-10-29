import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import { useStore } from "../store";
import {
  calcAttStats,
  calcBunkAdvice,
  calcStreak,
  calcSubjectAttStats,
  fmtDate,
  todayISO,
} from "../utils";
import { toast } from "../notifications";

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
  const { data, settings, playHaptic, markAttendance, clearAttendance, delAtt, addSubject, removeSubject } = useStore();
  const targetPct = settings?.targetAttendancePct || 75;
  const today = todayISO();
  const [viewMonth, setViewMonth] = useState(() => today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(today);
  const [newSubject, setNewSubject] = useState("");
  const [attendanceSubject, setAttendanceSubject] = useState(() => data.subjects[0] ?? "");
  const selectedAttendanceSubject = data.subjects.includes(attendanceSubject)
    ? attendanceSubject
    : data.subjects[0] ?? "";

  const stats = useMemo(() => calcAttStats(data.attendance), [data.attendance]);

  const monthStats = useMemo(() => {
    const entries = data.attendance.filter((a) => a.date.startsWith(viewMonth));
    return calcAttStats(entries);
  }, [data.attendance, viewMonth]);

  const streak = useMemo(() => calcStreak(data.attendance, today), [data.attendance, today]);

  const perSubject = useMemo(
    () => calcSubjectAttStats(data.attendance),
    [data.attendance],
  );

  const overallAdvice = useMemo(
    () => calcBunkAdvice(stats.present, stats.total, targetPct),
    [stats, targetPct],
  );

  const cells = useMemo(() => monthMatrix(viewMonth), [viewMonth]);

  const selectedEntries = useMemo(
    () => data.attendance.filter((a) => a.date === selectedDate),
    [data.attendance, selectedDate],
  );

  const selectedStats = useMemo(
    () => calcAttStats(selectedEntries),
    [selectedEntries],
  );

  const history = useMemo(() => {
    const groups = new Map<string, typeof data.attendance>();
    const sorted = [...data.attendance].sort((x, y) => y.date.localeCompare(x.date));
    for (const a of sorted) {
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
      <h2 className="page-title">Attendance Tracker</h2>

      <div className="statgrid three">
        <div className="card stat">
          <span>This month</span>
          <strong>{monthStats.percent}%</strong>
          <small className="muted small-text">{monthStats.present}/{monthStats.total} lectures</small>
        </div>
        <div className="card stat">
          <span>All time</span>
          <strong>{stats.percent}%</strong>
          <small className="muted small-text">{stats.present}/{stats.total} lectures</small>
        </div>
        <div className="card stat flame-stat">
          <span>
            <Icon name="flame" size={13} /> Streak
          </span>
          <strong>{streak}d</strong>
          <small className="muted small-text">active days</small>
        </div>
      </div>

      {stats.total > 0 && (
        <div className={`card bunk-advisor-card ${overallAdvice.status}`}>
          <div className="bunk-advisor-header">
            <span className="bunk-advisor-icon">
              {overallAdvice.status === "safe" ? "🛡️" : overallAdvice.status === "short" ? "🚨" : "⚖️"}
            </span>
            <div style={{ flex: 1 }}>
              <div className="row-between">
                <strong>{targetPct}% Goal Predictor</strong>
                <span className={`pill ${overallAdvice.status === "safe" ? "present" : overallAdvice.status === "short" ? "absent" : "mixed"}`}>
                  {overallAdvice.status === "safe" ? "Safe" : overallAdvice.status === "short" ? "Short" : "On Target"}
                </span>
              </div>
              <p className="bunk-message">{overallAdvice.message}</p>
            </div>
          </div>
        </div>
      )}

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
          <span><i className="dot p" /> All Present</span>
          <span><i className="dot a" /> All Absent</span>
          <span><i className="dot m" /> Mixed</span>
        </div>
      </section>

      {/* Selected Date Attendance Panel */}
      <section className="card">
        <div className="row-between" style={{ marginBottom: "0.5rem" }}>
          <div>
            <h3>{fmtDate(selectedDate)}</h3>
            <p className="muted small-text">
              {selectedEntries.length === 0
                ? "No lectures logged for this day."
                : `${selectedEntries.length} lecture${selectedEntries.length > 1 ? "s" : ""} logged (${selectedStats.present} Present, ${selectedStats.absent} Absent)`}
            </p>
          </div>
          {selectedEntries.length > 0 && (
            <button
              className="btn ghost neg"
              style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
              onClick={() => clearAttendance(selectedDate)}
              title="Clear all lectures for this date"
            >
              Clear day
            </button>
          )}
        </div>

        {selectedEntries.length > 0 && (
          <div className="att-row" style={{ marginBottom: "1rem" }}>
            {selectedEntries.map((entry, idx) => (
              <div key={entry.id} className="att-subject" style={{ gap: "0.5rem" }}>
                <span className="att-name">
                  #{idx + 1} {entry.subject}
                </span>
                <span className={`pill ${entry.status}`}>
                  {entry.status === "present" ? "Present" : "Absent"}
                </span>
                <button
                  className="icon-btn neg"
                  aria-label={`Remove ${entry.subject} lecture #${idx + 1}`}
                  title="Delete this lecture entry"
                  onClick={() => delAtt(entry.id)}
                >
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {data.subjects.length > 0 ? (
          <div>
            <p className="muted small-text" style={{ marginBottom: "0.4rem" }}>
              Log a lecture for this date (multiple lectures allowed):
            </p>
            <div className="inline-form">
              <select
                value={selectedAttendanceSubject}
                onChange={(e) => setAttendanceSubject(e.target.value)}
              >
                {data.subjects.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </select>
              <button
                className="btn primary"
                onClick={() => {
                  playHaptic("success");
                  markAttendance(selectedDate, selectedAttendanceSubject, "present");
                  toast.success(`✓ Marked Present for ${selectedAttendanceSubject}`);
                }}
              >
                + Present
              </button>
              <button
                className="btn neg"
                onClick={() => {
                  playHaptic("click");
                  markAttendance(selectedDate, selectedAttendanceSubject, "absent");
                  toast.info(`Marked Absent for ${selectedAttendanceSubject}`);
                }}
              >
                + Absent
              </button>
            </div>
          </div>
        ) : (
          <p className="empty">Add subjects below to start logging lectures.</p>
        )}
      </section>

      {/* Subject Statistics */}
      {perSubject.length > 0 && (
        <section className="card">
          <h3>Subject Statistics & Bunk Margin</h3>
          {perSubject.map((s) => {
            const subjAdvice = calcBunkAdvice(s.present, s.total, targetPct);
            return (
              <div key={s.subject} className="meter-row">
                <div className="meter-head">
                  <span>{s.subject}</span>
                  <span className="muted small-text">
                    {s.present}/{s.total} attended · {s.percent}%
                  </span>
                </div>
                <div className="meter">
                  <div
                    className={`meter-fill ${s.percent >= targetPct ? "" : "warn"}`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
                <div style={{ marginTop: "0.35rem" }}>
                  <span className={`bunk-tag ${subjAdvice.status}`}>
                    {subjAdvice.message}
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Manage Subjects */}
      <section className="card">
        <h3>Manage Subjects</h3>
        <div className="chips" style={{ marginBottom: "0.75rem" }}>
          {data.subjects.map((s) => (
            <button
              key={s}
              className="chip removable"
              onClick={() => {
                removeSubject(s);
                toast.info(`Removed ${s}`);
              }}
            >
              {s} ×
            </button>
          ))}
        </div>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = newSubject.trim();
            if (!trimmed) return;
            addSubject(trimmed);
            toast.success(`✓ Added subject ${trimmed}`);
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
            Add Subject
          </button>
        </form>
      </section>

      {/* Recent Days History Log */}
      <section className="card">
        <h3>Recent Days</h3>
        {history.length === 0 && <p className="empty">No entries logged yet.</p>}
        {history.map(([date, entries]) => {
          const dayStats = calcAttStats(entries);
          return (
            <div key={date} className="history-day" style={{ marginBottom: "0.75rem" }}>
              <div className="row-between" style={{ width: "100%", marginBottom: "0.25rem" }}>
                <button className="history-date linkish" onClick={() => setSelectedDate(date)}>
                  {fmtDate(date)} ({entries.length} lecture{entries.length > 1 ? "s" : ""})
                </button>
                <span className="muted small-text">
                  {dayStats.present}/{dayStats.total} Present
                </span>
              </div>
              <div className="history-entries" style={{ gap: "0.4rem", flexWrap: "wrap" }}>
                {entries.map((a) => (
                  <span
                    key={a.id}
                    className={`pill ${a.status}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    {a.subject}
                    <button
                      className="icon-btn"
                      style={{ padding: 0, height: "auto", minWidth: "auto", border: "none", color: "inherit" }}
                      title="Delete entry"
                      onClick={(e) => {
                        e.stopPropagation();
                        delAtt(a.id);
                      }}
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
