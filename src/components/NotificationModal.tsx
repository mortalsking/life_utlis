import { useState, useMemo } from "react";
import Icon from "./Icon";
import { useStore } from "../store";
import {
  computeNotifications,
  dismissAllNotificationIds,
  dismissNotificationId,
  getDismissedIds,
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  resetDismissedNotifications,
  sendLocalNotification,
  toast,
  type AppNotification,
} from "../notifications";

interface NotificationModalProps {
  onClose: () => void;
  onNavigateTab: (tab: "today" | "attend" | "money" | "tasks" | "notes" | "stats" | "forum" | "settings") => void;
}

export default function NotificationModal({ onClose, onNavigateTab }: NotificationModalProps) {
  const isNativeShell =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { isReactNativeApp?: boolean }).isReactNativeApp ||
      (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView
    );

  const { data, isGuest, playHaptic, setShowAuthModal } = useStore();
  const [filter, setFilter] = useState<"all" | "alerts" | "info">("all");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(getDismissedIds);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(getNotificationPermission);
  const [showBlockedGuide, setShowBlockedGuide] = useState(false);

  // Compute all current notifications from live state
  const allComputed = useMemo(() => computeNotifications(data, isGuest), [data, isGuest]);

  // Active (undismissed) notifications
  const activeNotifications = useMemo(
    () => allComputed.filter((n) => !dismissedIds.has(n.id)),
    [allComputed, dismissedIds],
  );

  const alertCount = activeNotifications.filter((n) => n.level === "danger" || n.level === "warning").length;
  const infoCount = activeNotifications.filter((n) => n.level === "info" || n.level === "success").length;

  const displayedNotifications = useMemo(() => {
    if (filter === "alerts") {
      return activeNotifications.filter((n) => n.level === "danger" || n.level === "warning");
    }
    if (filter === "info") {
      return activeNotifications.filter((n) => n.level === "info" || n.level === "success");
    }
    return activeNotifications;
  }, [activeNotifications, filter]);

  const handleDismiss = (id: string) => {
    playHaptic("delete");
    dismissNotificationId(id);
    setDismissedIds(new Set([...dismissedIds, id]));
  };

  const handleClearAll = () => {
    playHaptic("delete");
    const ids = activeNotifications.map((n) => n.id);
    dismissAllNotificationIds(ids);
    setDismissedIds(new Set([...dismissedIds, ...ids]));
    toast.info("All notifications cleared");
  };

  const handleResetDismissed = () => {
    playHaptic("success");
    resetDismissedNotifications();
    setDismissedIds(new Set());
    toast.success("Notifications restored");
  };

  const handleActionClick = (notif: AppNotification) => {
    playHaptic("click");
    if (notif.id === "cloud-guest-backup-notice") {
      onClose();
      setShowAuthModal(true);
      return;
    }
    if (notif.actionTab) {
      onNavigateTab(notif.actionTab);
      onClose();
    }
  };

  const handleRequestPush = async () => {
    playHaptic("click");
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === "granted") {
      sendLocalNotification("Life Utils Alerts Enabled! 🔔", {
        body: "You'll receive notifications for attendance warnings and overdue tasks.",
      });
      toast.success("Browser notifications enabled!");
      setShowBlockedGuide(false);
    } else if (res === "denied") {
      setShowBlockedGuide(true);
      toast.error("Notifications blocked in browser settings. Tap 'Blocked' to fix.");
    }
  };

  const handleRecheckPermission = () => {
    playHaptic("click");
    const res = getNotificationPermission();
    setPermission(res);
    if (res === "granted") {
      toast.success("✓ Notifications unblocked and enabled!");
      setShowBlockedGuide(false);
    } else if (res === "default") {
      handleRequestPush();
    } else {
      toast.info("Still marked as blocked. Follow the 3 steps above to allow.");
    }
  };

  const handleTestInApp = () => {
    playHaptic("success");
    toast.success("🔔 In-App Alerts Active: You'll see alerts here inside the app!");
    sendLocalNotification("Life Utils Notification Test 🔔", {
      body: "Test notification received successfully!",
    });
  };

  const getLevelBadge = (level: AppNotification["level"]) => {
    switch (level) {
      case "danger":
        return { icon: "🚨", color: "var(--bad)", bg: "rgba(244, 63, 94, 0.12)" };
      case "warning":
        return { icon: "⚠️", color: "var(--warn)", bg: "rgba(245, 158, 11, 0.12)" };
      case "success":
        return { icon: "✅", color: "var(--good)", bg: "rgba(16, 185, 129, 0.12)" };
      case "info":
      default:
        return { icon: "ℹ️", color: "var(--accent)", bg: "var(--accent-soft)" };
    }
  };

  return (
    <div className="clean-notif-modal-wrapper">
      {/* Modal Topbar Header */}
      <div className="clean-notif-header">
        <div className="clean-notif-header-left">
          <div className="clean-notif-bell-icon">
            <Icon name="bell" size={20} />
            {activeNotifications.length > 0 && (
              <span className="clean-notif-count-badge">{activeNotifications.length}</span>
            )}
          </div>
          <div>
            <h2 className="clean-notif-title">Notifications & Alerts</h2>
            <p className="clean-notif-subtitle">
              {activeNotifications.length === 0
                ? "All clear & caught up"
                : `${activeNotifications.length} required update${
                    activeNotifications.length > 1 ? "s" : ""
                  } across your apps`}
            </p>
          </div>
        </div>

        <div className="clean-notif-header-actions">
          {activeNotifications.length > 0 && (
            <button
              type="button"
              className="clean-notif-clear-btn"
              onClick={handleClearAll}
              title="Clear all active notifications"
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            className="icon-btn close-btn"
            onClick={onClose}
            title="Close notifications"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
      </div>

      {/* Web Push Notification Banner */}
      {isNotificationSupported() && (
        <>
          <div className="clean-push-banner">
            <div className="clean-push-banner-content">
              <span className="clean-push-icon">🔔</span>
              <div className="clean-push-text">
                <strong>Push & System Alerts</strong>
                <p>Receive notifications when classes are missed or tasks fall overdue.</p>
              </div>
            </div>
            {isNativeShell ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="clean-push-granted-pill">✓ Mobile Alerts Active</span>
                <button
                  type="button"
                  className="btn small ghost"
                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                  onClick={handleTestInApp}
                  title="Send test in-app alert"
                >
                  Test
                </button>
              </div>
            ) : permission === "granted" ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="clean-push-granted-pill">✓ Enabled</span>
                <button
                  type="button"
                  className="btn small ghost"
                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                  onClick={handleTestInApp}
                  title="Test alert"
                >
                  Test
                </button>
              </div>
            ) : permission === "denied" ? (
              <button
                type="button"
                className="clean-push-denied-pill"
                style={{ border: "none", cursor: "pointer" }}
                onClick={() => {
                  playHaptic("click");
                  setShowBlockedGuide((v) => !v);
                }}
                title="Tap to see instructions to unblock"
              >
                ⚠️ Blocked &middot; Tap to Fix
              </button>
            ) : (
              <button
                type="button"
                className="btn small primary clean-push-enable-btn"
                onClick={handleRequestPush}
              >
                Enable Alerts
              </button>
            )}
          </div>

          {showBlockedGuide && (
            <div className="clean-notif-blocked-guide">
              <div className="guide-header">
                <span>⚠️ How to Unblock on Mobile:</span>
                <button
                  type="button"
                  className="icon-btn small"
                  onClick={() => setShowBlockedGuide(false)}
                >
                  <Icon name="x" size={13} />
                </button>
              </div>
              <ol className="guide-steps">
                <li>
                  Tap the <strong>tune / lock icon 🔒</strong> beside the website address in your mobile browser.
                </li>
                <li>
                  Tap <strong>Permissions</strong> &rarr; <strong>Notifications</strong>.
                </li>
                <li>
                  Select <strong>Allow</strong> (or Reset permissions).
                </li>
              </ol>
              <div className="guide-actions">
                <button
                  type="button"
                  className="btn small primary"
                  onClick={handleRecheckPermission}
                >
                  <Icon name="refresh" size={13} /> Re-check Status
                </button>
                <button
                  type="button"
                  className="btn small ghost"
                  onClick={handleTestInApp}
                >
                  Send In-App Test
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Filter Tabs */}
      <div className="clean-notif-tabs">
        <button
          type="button"
          className={`clean-notif-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => {
            playHaptic("click");
            setFilter("all");
          }}
        >
          All ({activeNotifications.length})
        </button>
        <button
          type="button"
          className={`clean-notif-tab ${filter === "alerts" ? "active" : ""}`}
          onClick={() => {
            playHaptic("click");
            setFilter("alerts");
          }}
        >
          🚨 Urgent ({alertCount})
        </button>
        <button
          type="button"
          className={`clean-notif-tab ${filter === "info" ? "active" : ""}`}
          onClick={() => {
            playHaptic("click");
            setFilter("info");
          }}
        >
          ℹ️ Updates ({infoCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="clean-notif-list">
        {displayedNotifications.map((notif) => {
          const badge = getLevelBadge(notif.level);
          return (
            <div key={notif.id} className={`clean-notif-card level-${notif.level}`}>
              <div className="clean-notif-card-header">
                <div className="clean-notif-card-badge" style={{ background: badge.bg, color: badge.color }}>
                  <span>{badge.icon}</span>
                  <span className="clean-notif-badge-label">{notif.category}</span>
                </div>
                <button
                  type="button"
                  className="clean-notif-dismiss-btn"
                  onClick={() => handleDismiss(notif.id)}
                  title="Dismiss notification"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>

              <h4 className="clean-notif-card-title">{notif.title}</h4>
              <p className="clean-notif-card-msg">{notif.message}</p>

              {notif.actionLabel && (
                <div className="clean-notif-card-footer">
                  <button
                    type="button"
                    className="clean-notif-action-btn"
                    onClick={() => handleActionClick(notif)}
                  >
                    <span>{notif.actionLabel}</span>
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {displayedNotifications.length === 0 && (
          <div className="clean-notif-empty">
            <span className="clean-notif-empty-icon">🎉</span>
            <h3>You're All Caught Up!</h3>
            <p>
              {filter !== "all"
                ? `No notifications in this filter.`
                : "No pending attendance warnings, overdue tasks, or alerts. Everything is running smoothly!"}
            </p>
            {dismissedIds.size > 0 && (
              <button
                type="button"
                className="btn ghost small-btn clean-notif-restore-btn"
                onClick={handleResetDismissed}
              >
                Restore Dismissed ({dismissedIds.size})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
