import { useState } from "react";
import TxForm from "../components/TxForm";
import { useStore } from "../store";
import { fmtDate, fmtMoney, greeting, todayISO } from "../utils";

export default function Today() {
  const { data, markAttendance, clearAttendance, addTask, saveJournal } = useStore();
  const today = todayISO();
  const [taskText, setTaskText] = useState("");
  const [journalText, setJournalText] = useState("");

  const attToday = data.attendance.filter((a) => a.date === today);
  const txToday = data.txs.filter((t) => t.date === today);
  const spentToday = txToday.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  const savedToday = txToday.filter((t) => t.kind === "saved").reduce((s, t) => s + t.amount, 0);

  const openTasks = data.tasks.filter((t) => !t.done);
  const journalToday = data.journal.find((j) => j.date === today);

  function status(subject: string): "present" | "absent" | undefined {
    return attToday.find((a) => a.subject === subject)?.status;
  }

  return (
    <div className="page">
      <h2 className="page-title">
        {greeting()} — {fmtDate(today)}
      </h2>

      <section className="card">
        <h3>Attendance</h3>
        {data.subjects.length === 0 && (
          <p className="muted small">Add subjects on the Attendance tab first.</p>
        )}
        <div className="att-row">
          {data.subjects.map((s) => {
            const st = status(s);
            return (
              <div key={s} className="att-subject">
                <span className="att-name">{s}</span>
                <div className="seg small">
                  <button
                    className={st === "present" ? "on good" : ""}
                    onClick={() =>
                      st === "present"
                        ? clearAttendance(today, s)
                        : markAttendance(today, s, "present")
                    }
                  >
                    P
                  </button>
                  <button
                    className={st === "absent" ? "on bad" : ""}
                    onClick={() =>
                      st === "absent"
                        ? clearAttendance(today, s)
                        : markAttendance(today, s, "absent")
                    }
                  >
                    A
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
            addTask(taskText);
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
                saveJournal({ date: today, text: journalText });
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
