import { useState } from "react";
import Icon from "../components/Icon";
import { useStore } from "../store";
import { LINK_CATEGORIES, MOODS } from "../types";
import { fmtDate, todayISO } from "../utils";

function JournalSection() {
  const { data, saveJournal, delJournal } = useStore();
  const [date, setDate] = useState(todayISO());
  const [mood, setMood] = useState("");
  const [text, setText] = useState("");

  const existing = data.journal.find((j) => j.date === date);
  const entries = [...data.journal].sort((a, b) => b.date.localeCompare(a.date));

  function loadEntry(d: string) {
    const e = data.journal.find((j) => j.date === d);
    setDate(d);
    setMood(e?.mood ?? "");
    setText(e?.text ?? "");
  }

  return (
    <>
      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          saveJournal({ date, mood: mood || undefined, text });
          setText("");
        }}
      >
        <div className="grid2">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => loadEntry(e.target.value)} />
          </label>
          <label>
            Mood
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="">—</option>
              {MOODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Entry
          <textarea
            rows={5}
            placeholder="Write freely…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
        {existing && text === existing.text && (
          <p className="hint">You're editing the saved entry for this day.</p>
        )}
        <button className="btn primary" type="submit">
          {existing ? "Update entry" : "Save entry"}
        </button>
      </form>

      <section className="card">
        <h3>Past entries</h3>
        {entries.length === 0 && <p className="empty">Nothing written yet.</p>}
        {entries.map((j) => (
          <details key={j.id} className="journal-entry">
            <summary>
              <span>{fmtDate(j.date)}</span>
              {j.mood && <span className={`chip mood-${j.mood.toLowerCase()}`}>{j.mood}</span>}
            </summary>
            <p className="journal-text">{j.text}</p>
            <div className="row-actions">
              <button className="btn ghost small-btn" onClick={() => loadEntry(j.date)}>
                Edit
              </button>
              <button className="btn ghost small-btn neg" onClick={() => delJournal(j.id)}>
                Delete
              </button>
            </div>
          </details>
        ))}
      </section>
    </>
  );
}

function hueOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function LinksSection() {
  const { data, addLink, delLink } = useStore();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>("Study");

  function domain(u: string): string {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch {
      return u;
    }
  }

  const grouped = LINK_CATEGORIES.map((c) => ({
    category: c,
    items: data.links.filter((l) => l.category === c),
  })).filter((g) => g.items.length > 0);

  const otherItems = data.links.filter(
    (l) => !LINK_CATEGORIES.includes(l.category as (typeof LINK_CATEGORIES)[number]),
  );

  return (
    <>
      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!url.trim()) return;
          addLink({ title, url, category });
          setTitle("");
          setUrl("");
        }}
      >
        <label>
          Link
          <input
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>
        <div className="grid2">
          <label>
            Name
            <input
              type="text"
              placeholder="DSA sheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {LINK_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn primary" type="submit">
          <Icon name="plus" size={16} /> Save link
        </button>
      </form>

      {grouped.length === 0 && otherItems.length === 0 && (
        <section className="card">
          <p className="empty">No links saved yet. Paste one above.</p>
        </section>
      )}

      {[...grouped, ...(otherItems.length ? [{ category: "Other", items: otherItems }] : [])].map(
        (g) => (
          <section key={g.category} className="card">
            <h3>{g.category}</h3>
            {g.items.map((l) => (
              <div key={l.id} className="link-row">
                <a
                  className="link-main"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span
                    className="link-avatar"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hueOf(l.category)} 70% 45%), hsl(${(hueOf(l.category) + 40) % 360} 70% 55%))`,
                    }}
                  >
                    {(l.title || l.url).charAt(0).toUpperCase()}
                  </span>
                  <span className="link-info">
                    <strong>{l.title}</strong>
                    <span className="muted small-text">{domain(l.url)}</span>
                  </span>
                  <span className="link-open">
                    <Icon name="external" size={16} />
                  </span>
                </a>
                <button className="icon-btn" onClick={() => delLink(l.id)} title="Delete">
                  <Icon name="x" size={16} />
                </button>
              </div>
            ))}
          </section>
        ),
      )}
    </>
  );
}

export default function Notes() {
  const [tab, setTab] = useState<"journal" | "links">("journal");

  return (
    <div className="page">
      <h2 className="page-title">Notes</h2>

      <div className="seg full">
        <button className={tab === "journal" ? "on" : ""} onClick={() => setTab("journal")}>
          Journal
        </button>
        <button className={tab === "links" ? "on" : ""} onClick={() => setTab("links")}>
          Links
        </button>
      </div>

      {tab === "journal" ? <JournalSection /> : <LinksSection />}
    </div>
  );
}
