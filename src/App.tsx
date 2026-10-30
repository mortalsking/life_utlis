import { useState, useEffect, useRef, lazy, Suspense } from "react";
import Icon, { type IconName } from "./components/Icon";
import { useStore } from "./store";
import Today from "./pages/Today";
import { fmtDate, todayISO } from "./utils";

// Code-split pages for instant initial paint & minimal bundle
const Attendance = lazy(() => import("./pages/Attendance"));
const Backlog = lazy(() => import("./pages/Backlog"));
const Money = lazy(() => import("./pages/Money"));
const Notes = lazy(() => import("./pages/Notes"));
const Summary = lazy(() => import("./pages/Summary"));
const FeedbackPage = lazy(() => import("./pages/Feedback"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const Auth = lazy(() => import("./pages/Auth"));
const SettingsModal = lazy(() => import("./components/SettingsModal"));
const TermsModal = lazy(() => import("./components/TermsModal"));
const NotificationModal = lazy(() => import("./components/NotificationModal"));
import ToastContainer from "./components/ToastContainer";
import {
  computeNotifications,
  getDismissedIds,
  isNotificationSupported,
  sendLocalNotification,
} from "./notifications";

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
  const isNativeApp =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { isReactNativeApp?: boolean }).isReactNativeApp ||
      (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView
    );

  const [tab, setTab] = useState<Tab>("today");
  const {
    data,
    theme,
    setTheme,
    settings,
    session,
    user,
    isGuest,
    signOut,
    showAuthModal,
    setShowAuthModal,
    showSettingsModal,
    setShowSettingsModal,
    playHaptic,
  } = useStore();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem("lifeutils-guest-banner-dismissed") === "1";
  });
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Active undismissed notifications
  const activeNotifs = (data ? computeNotifications(data, isGuest) : []).filter(
    (n) => !getDismissedIds().has(n.id),
  );

  // Push urgent alert on initial launch if granted
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (hasNotifiedRef.current) return;
    if (isNotificationSupported() && Notification.permission === "granted") {
      const urgent = activeNotifs.filter((n) => n.level === "danger");
      if (urgent.length > 0) {
        hasNotifiedRef.current = true;
        sendLocalNotification(urgent[0].title, { body: urgent[0].message });
      }
    }
  }, [activeNotifs]);

  // Listen for native shell postMessages (e.g. from React Native Expo shell)
  useEffect(() => {
    const handleNativeMessage = (e: MessageEvent) => {
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d?.type === "OPEN_SETTINGS") {
          setShowSettingsModal(true);
        } else if (d?.type === "OPEN_NOTIFICATIONS") {
          setShowNotifModal(true);
        } else if (d?.type === "SET_THEME" && (d.theme === "light" || d.theme === "dark")) {
          setTheme(d.theme);
        } else if (d?.type === "NAVIGATE_TAB" && d.tab) {
          setTab(d.tab);
          setShowSettingsModal(false);
          setShowNotifModal(false);
        } else if (d?.type === "OPEN_TERMS") {
          setShowTermsModal(true);
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
          <img src="/logo.png" alt="Life Utils Logo" className="brand-logo-img" />
          <div className="brand-text">
            <h1>Life Utils</h1>
            <span>{fmtDate(todayISO())}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          {!isNativeApp && (
            <a
              href="/life-utils.apk"
              download="life-utils.apk"
              className="btn-download-app"
              title="Download Life Utils Android APK (v1.2.1 Latest Release)"
            >
              <Icon name="smartphone" size={15} />
              <span className="btn-download-label">Get App</span>
              <span className="btn-download-pill">APK</span>
            </a>
          )}

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
            <div
              className="user-badge"
              title={`Signed in as ${
                settings.userName ||
                user?.user_metadata?.username ||
                user?.user_metadata?.full_name ||
                session.user.email?.split("@")[0] ||
                "User"
              }`}
            >
              <span className="user-avatar">
                {(
                  settings.userName ||
                  user?.user_metadata?.username ||
                  user?.user_metadata?.full_name ||
                  session.user.email?.split("@")[0] ||
                  "U"
                )[0]?.toUpperCase()}
              </span>
              <span className="user-badge-name">
                {settings.userName ||
                  user?.user_metadata?.username ||
                  user?.user_metadata?.full_name ||
                  session.user.email?.split("@")[0] ||
                  "User"}
              </span>
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
            className={`icon-btn topbar-bell-btn ${showNotifModal ? "active" : ""}`}
            onClick={() => {
              playHaptic("click");
              setShowNotifModal(true);
            }}
            title="Notifications & Alerts"
            id="notifications-btn"
            style={{ position: "relative" }}
          >
            <Icon name="bell" size={18} />
            {activeNotifs.length > 0 && (
              <span className="topbar-notif-pill">{activeNotifs.length}</span>
            )}
          </button>
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
        <Suspense
          fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "220px", width: "100%" }}>
              <div style={{ width: "100%", height: "180px", borderRadius: "18px", background: "rgba(148, 163, 184, 0.08)", animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            </div>
          }
        >
          {tab === "today" && <Today />}
          {tab === "attend" && <Attendance />}
          {tab === "money" && <Money />}
          {tab === "tasks" && <Backlog />}
          {tab === "notes" && <Notes />}
          {tab === "stats" && <Summary />}
          {tab === "forum" && <FeedbackPage />}
          {tab === "settings" && (
            <SettingsPage
              onNavigateTab={(t) => setTab(t)}
              onOpenTerms={() => setShowTermsModal(true)}
            />
          )}
        </Suspense>
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
            <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Loading...</div>}>
              <Auth onClose={() => setShowAuthModal(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Loading...</div>}>
              <SettingsModal
                onClose={() => setShowSettingsModal(false)}
                onNavigateTab={(t) => {
                  setTab(t);
                  setShowSettingsModal(false);
                }}
                onOpenTerms={() => {
                  setShowSettingsModal(false);
                  setShowTermsModal(true);
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="modal-backdrop" onClick={() => setShowTermsModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Loading...</div>}>
              <TermsModal onClose={() => setShowTermsModal(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {showNotifModal && (
        <div className="modal-backdrop" onClick={() => setShowNotifModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Loading notifications...</div>}>
              <NotificationModal
                onClose={() => setShowNotifModal(false)}
                onNavigateTab={(t) => {
                  setTab(t);
                  setShowNotifModal(false);
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
