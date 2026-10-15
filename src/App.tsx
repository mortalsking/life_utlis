import { useState } from "react";
import Icon, { type IconName } from "./components/Icon";
import { useStore } from "./store";
import Attendance from "./pages/Attendance";
import Backlog from "./pages/Backlog";
import Money from "./pages/Money";
import Notes from "./pages/Notes";
import Summary from "./pages/Summary";
import Today from "./pages/Today";
import Auth from "./pages/Auth";
import FeedbackPage from "./pages/Feedback";
import { fmtDate, todayISO } from "./utils";

type Tab = "today" | "attend" | "money" | "tasks" | "notes" | "stats" | "forum";

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: "today", icon: "home", label: "Today" },
  { id: "attend", icon: "calendar", label: "Attend" },
  { id: "money", icon: "wallet", label: "Money" },
  { id: "tasks", icon: "tasks", label: "Tasks" },
  { id: "notes", icon: "pen", label: "Notes" },
  { id: "stats", icon: "chart", label: "Stats" },
  { id: "forum", icon: "chat", label: "Forum" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const { theme, setTheme, session, signOut, showAuthModal, setShowAuthModal } = useStore();
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem("lifeutils-guest-banner-dismissed") === "1";
  });

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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {!session ? (
            <button
              className="btn-auth-badge"
              onClick={() => setShowAuthModal(true)}
              title="Sign in or register to sync your data"
            >
              <span className="guest-dot" />
              <span>Guest &middot; Sign In</span>
            </button>
          ) : (
            <div className="user-badge" title={`Signed in as ${session.user.email}`}>
              <span className="user-avatar">{session.user.email?.[0]?.toUpperCase() ?? "U"}</span>
              <button className="icon-btn" onClick={signOut} title="Sign Out">
                <Icon name="logOut" size={16} />
              </button>
            </div>
          )}
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle Theme"
          >
            <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
          </button>
        </div>
      </header>

      {!session && !bannerDismissed && (
        <div className="guest-banner">
          <div className="guest-banner-content">
            <span className="guest-banner-icon">✨</span>
            <p>
              <strong>Instant Access:</strong> You're in Guest Mode.{" "}
              <button className="guest-banner-link" onClick={() => setShowAuthModal(true)}>
                Sign in or register free
              </button>{" "}
              to sync across phone & laptop.
            </p>
          </div>
          <button
            className="guest-banner-close"
            onClick={() => {
              setBannerDismissed(true);
              sessionStorage.setItem("lifeutils-guest-banner-dismissed", "1");
            }}
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      <main key={tab} className="page-host">
        {tab === "today" && <Today />}
        {tab === "attend" && <Attendance />}
        {tab === "money" && <Money />}
        {tab === "tasks" && <Backlog />}
        {tab === "notes" && <Notes />}
        {tab === "stats" && <Summary />}
        {tab === "forum" && <FeedbackPage />}
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

      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <Auth onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
