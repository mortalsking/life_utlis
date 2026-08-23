import { useState } from "react";
import Icon, { type IconName } from "./components/Icon";
import Attendance from "./pages/Attendance";
import Backlog from "./pages/Backlog";
import Money from "./pages/Money";
import Notes from "./pages/Notes";
import Summary from "./pages/Summary";
import Today from "./pages/Today";
import { fmtDate, todayISO } from "./utils";

type Tab = "today" | "attend" | "money" | "tasks" | "notes" | "stats";

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: "today", icon: "home", label: "Today" },
  { id: "attend", icon: "calendar", label: "Attend" },
  { id: "money", icon: "wallet", label: "Money" },
  { id: "tasks", icon: "tasks", label: "Tasks" },
  { id: "notes", icon: "pen", label: "Notes" },
  { id: "stats", icon: "chart", label: "Stats" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="logo-mark">
            <Icon name="check" size={16} />
          </span>
          <div className="brand-text">
            <h1>Life Utils</h1>
            <span>{fmtDate(todayISO())}</span>
          </div>
        </div>
      </header>

      <main key={tab} className="page-host">
        {tab === "today" && <Today />}
        {tab === "attend" && <Attendance />}
        {tab === "money" && <Money />}
        {tab === "tasks" && <Backlog />}
        {tab === "notes" && <Notes />}
        {tab === "stats" && <Summary />}
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={21} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
