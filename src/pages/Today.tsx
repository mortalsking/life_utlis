import { useMemo, useState } from "react";
import TxForm from "../components/TxForm";
import Icon from "../components/Icon";
import { useStore } from "../store";
import { calcAttStats, fmtDate, fmtMoney, greeting, todayISO } from "../utils";
import { toast } from "../notifications";

export default function Today() {
  const { data, markAttendance, delAtt, clearAttendance, addTask, saveJournal, playHaptic } = useStore();
  const today = todayISO();
  const [taskText, setTaskText] = useState("");
  const [journalText, setJournalText] = useState("");

  const attToday = useMemo(
    () => data.attendance.filter((a) => a.date === today),
    [data.attendance, today],
  );
  const attStats = useMemo(() => calcAttStats(attToday), [attToday]);

  const txToday = data.txs.filter((t) => t.date === today);
  const spentToday = txToday.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  const savedToday = txToday.filter((t) => t.kind === "saved").reduce((s, t) => s + t.amount, 0);

  const openTasks = data.tasks.filter((t) => !t.done);
  const journalToday = data.journal.find((j) => j.date === today);

  return (
    <div className="page">
      <h2 className="page-title">
        {greeting()} — {fmtDate(today)}
      </h2>

      {/* Today's Attendance Logger */}
      <section className="card">
        <div className="row-between" style={{ marginBottom: "0.5rem" }}>
          <div>
            <h3>Today's Attendance</h3>
            <p className="muted small-text">
              {attToday.length === 0
                ? "No lectures logged for today."
                : `${attToday.length} lecture${attToday.length > 1 ? "s" : ""} logged (${attStats.present} Present, ${attStats.absent} Absent)`}
            </p>
          </div>
          {attToday.length > 0 && (
            <button
              className="btn ghost neg"
              style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
              onClick={() => {
                playHaptic("delete");
                clearAttendance(today);
                toast.info("Cleared today's lectures");
              }}
              title="Clear all today's lectures"
            >
              Clear today
            </button>
          )}
        </div>

        {data.subjects.length === 0 ? (
          <p className="muted small-text">Add subjects on the Attendance tab to start tracking.</p>
        ) : (
          <div className="att-row" style={{ flexDirection: "column", gap: "0.5rem" }}>
            {data.subjects.map((s) => {
              const subjectEntries = attToday.filter((a) => a.subject === s);
              const pCount = subjectEntries.filter((a) => a.status === "present").length;
              const aCount = subjectEntries.filter((a) => a.status === "absent").length;

              return (
                <div key={s} className="row-between" style={{ padding: "0.4rem 0", borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <strong style={{ fontSize: "0.95rem" }}>{s}</strong>
                    {subjectEntries.length > 0 && (
                      <span className="muted small-text" style={{ marginLeft: "0.5rem" }}>
                        ({pCount} P, {aCount} A)
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      className="btn primary small"
                      onClick={() => {
                        playHaptic("success");
                        markAttendance(today, s, "present");
                        toast.success(`✓ Marked Present for ${s}`);
                      }}
                      title={`Log 1 Present lecture for ${s}`}
                    >
                      + Present
                    </button>
                    <button
                      className="btn neg small"
                      onClick={() => {
                        playHaptic("click");
                        markAttendance(today, s, "absent");
                        toast.info(`Marked Absent for ${s}`);
                      }}
                      title={`Log 1 Absent lecture for ${s}`}
                    >
                      + Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Today Log list with individual delete buttons */}
        {attToday.length > 0 && (
          <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem" }}>
            <p className="muted small-text" style={{ marginBottom: "0.4rem" }}>Logged today:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {attToday.map((a, idx) => (
                <span
                  key={a.id}
                  className={`pill ${a.status}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  #{idx + 1} {a.subject}
                  <button
                    className="icon-btn"
                    style={{ padding: 0, height: "auto", minWidth: "auto", border: "none", color: "inherit" }}
                    title="Delete lecture entry"
                    onClick={() => {
                      playHaptic("delete");
                      delAtt(a.id);
                      toast.info(`Removed ${a.subject} #${idx + 1}`);
                    }}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <TxForm />

      <div className="statgrid">
        <div className="card stat bad-stat">
          <span>Spent today</span>
          <strong>{fmtMoney(spentToday)}</strong>
        </div>
        <div className="card stat good-stat">
          <span>Saved today</span>
          <strong>{fmtMoney(savedToday)}</strong>
        </div>
      </div>

      <section className="card">
        <h3>Backlog</h3>
        <p className="muted small">
          {openTasks.length === 0
            ? "Nothing pending. Nice."
            : `${openTasks.length} open item${openTasks.length > 1 ? "s" : ""}`}
        </p>
        <ul className="plain-list">
          {openTasks.slice(0, 3).map((t) => (
            <li key={t.id}>{t.text}</li>
          ))}
        </ul>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!taskText.trim()) return;
            addTask(taskText);
            playHaptic("success");
            toast.success("✓ Task added to backlog");
            setTaskText("");
          }}
        >
          <input
            type="text"
            placeholder="Add a pending thing…"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Journal</h3>
        {journalToday ? (
          <>
            <p className="muted small">Written today</p>
            <p className="journal-preview">{journalToday.text}</p>
            <p className="muted small">Edit it on the Journal tab.</p>
          </>
        ) : (
          <>
            <p className="muted small">How was the day?</p>
            <textarea
              rows={3}
              placeholder="Write freely…"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
            <button
              className="btn primary full"
              disabled={!journalText.trim()}
              onClick={() => {
                playHaptic("success");
                saveJournal({ date: today, text: journalText });
                toast.success("✓ Daily journal saved");
                setJournalText("");
              }}
            >
              Save entry
            </button>
          </>
        )}
      </section>
    </div>
  );
}
