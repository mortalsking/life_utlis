import { useState } from "react";
import { useStore } from "../store";
import { fmtDate, todayISO } from "../utils";

export default function Backlog() {
  const { data, addTask, toggleTask, delTask, clearDoneTasks } = useStore();
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const today = todayISO();

  const open = data.tasks.filter((t) => !t.done);
  const done = data.tasks
    .filter((t) => t.done)
    .sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""))
    .slice(0, 10);
  const overdue = open.filter((t) => t.due && t.due < today).length;

  return (
    <div className="page">
      <h2 className="page-title">Backlog</h2>

      <div className="statgrid two">
        <div className="card stat">
          <span>Open</span>
          <strong>{open.length}</strong>
        </div>
        <div className={`card stat ${overdue ? "bad-stat" : ""}`}>
          <span>Overdue</span>
          <strong>{overdue}</strong>
        </div>
      </div>

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          addTask(text, due || undefined);
          setText("");
          setDue("");
        }}
      >
        <label>
          What is pending?
          <input
            type="text"
            placeholder="Lab report, fee payment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
        <label>
          Due (optional)
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>
        <button className="btn primary" type="submit">
          Add to backlog
        </button>
      </form>

      <section className="card">
        <h3>Open</h3>
        {open.length === 0 && <p className="muted small">All clear.</p>}
        {open.map((t) => (
          <div key={t.id} className="task">
            <button className="check" onClick={() => toggleTask(t.id)} title="Mark done">
              ✓
            </button>
            <div className="task-body">
              <span>{t.text}</span>
              {t.due && (
                <span className={`small ${t.due < today ? "neg" : "muted"}`}>
                  Due {fmtDate(t.due)}
                </span>
              )}
            </div>
            <button className="icon-btn" onClick={() => delTask(t.id)} title="Delete">
              ×
            </button>
          </div>
        ))}
      </section>

      {done.length > 0 && (
        <section className="card">
          <h3>Recently done</h3>
          {done.map((t) => (
            <div key={t.id} className="task done">
              <button className="check checked" onClick={() => toggleTask(t.id)} title="Undo">
                ✓
              </button>
              <div className="task-body strikethrough">{t.text}</div>
              <button className="icon-btn" onClick={() => delTask(t.id)} title="Delete">
                ×
              </button>
            </div>
          ))}
          <button className="btn ghost full" onClick={clearDoneTasks}>
            Clear done
          </button>
        </section>
      )}
    </div>
  );
}
