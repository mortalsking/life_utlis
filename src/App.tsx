import { useState, useEffect } from "react";
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
import SettingsPage from "./pages/SettingsPage";
import SettingsModal from "./components/SettingsModal";
import { fmtDate, todayISO } from "./utils";

type Tab = "today" | "attend" | "money" | "tasks" | "notes" | "stats" | "forum" | "settings";

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
  const {
    theme,
    setTheme,
    session,
    signOut,
    showAuthModal,
    setShowAuthModal,
    showSettingsModal,
    setShowSettingsModal,
    playHaptic,
  } = useStore();
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem("lifeutils-guest-banner-dismissed") === "1";
  });

  // Listen for native shell postMessages (e.g. from React Native Expo shell)
  useEffect(() => {
    const handleNativeMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.type === "OPEN_SETTINGS") {
          setShowSettingsModal(true);
        } else if (data?.type === "SET_THEME" && (data.theme === "light" || data.theme === "dark")) {
          setTheme(data.theme);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("message", handleNativeMessage);
    // React Native WebView on Android can dispatch to document
    document.addEventListener("message", handleNativeMessage as unknown as EventListener);
    return () => {
      window.removeEventListener("message", handleNativeMessage);
      document.removeEventListener("message", handleNativeMessage as unknown as EventListener);
    };
  }, [setTheme, setShowSettingsModal]);

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
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          {!session ? (
            <button
              className="btn-auth-badge"
              onClick={() => {
                playHaptic("click");
                setShowAuthModal(true);
              }}
              title="Sign in or register to sync your data"
            >
              <span className="guest-dot" />
              <span>Guest &middot; Sign In</span>
            </button>
          ) : (
            <div className="user-badge" title={`Signed in as ${session.user.email}`}>
              <span className="user-avatar">{session.user.email?.[0]?.toUpperCase() ?? "U"}</span>
              <button
                className="icon-btn"
                onClick={() => {
                  playHaptic("click");
                  signOut();
                }}
                title="Sign Out"
              >
                <Icon name="logOut" size={16} />
              </button>
            </div>
          )}
          <button
            className="icon-btn"
            onClick={() => {
              playHaptic("toggle");
              setTheme(theme === "light" ? "dark" : "light");
            }}
            title="Toggle Light/Dark Theme"
          >
            <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
          </button>
          <button
            className={`topbar-settings-btn ${showSettingsModal ? "active" : ""}`}
            onClick={() => {
              playHaptic("click");
              setShowSettingsModal(true);
            }}
            title="Settings & Appearance"
            id="settings-btn"
          >
            <Icon name="settings" size={16} />
            <span className="settings-btn-text">Settings</span>
          </button>
        </div>
      </header>

      {!session && !bannerDismissed && (
        <div className="guest-banner">
          <div className="guest-banner-content">
            <span className="guest-banner-icon">✨</span>
            <p>
              <strong>Instant Access:</strong> You're in Guest Mode.{" "}
              <button
                className="guest-banner-link"
                onClick={() => {
                  playHaptic("click");
                  setShowAuthModal(true);
                }}
              >
                Sign in or register free
              </button>{" "}
              to sync across phone & laptop.
            </p>
          </div>
          <button
            className="guest-banner-close"
            onClick={() => {
              playHaptic("click");
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
        {tab === "settings" && <SettingsPage onNavigateTab={(t) => setTab(t)} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => {
              playHaptic("click");
              setTab(t.id);
            }}
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

      {showSettingsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <SettingsModal
              onClose={() => setShowSettingsModal(false)}
              onNavigateTab={(t) => {
                setTab(t);
                setShowSettingsModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
