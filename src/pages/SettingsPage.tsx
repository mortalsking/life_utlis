import { useState, useRef } from "react";
import Icon from "../components/Icon";
import { useStore } from "../store";
import { ACCENT_OPTIONS, type AccentColor, type ThemeMode } from "../types";
import { todayISO } from "../utils";
import { toast } from "../notifications";

interface SettingsPageProps {
  onNavigateTab?: (tab: "today" | "attend" | "money" | "tasks" | "notes" | "stats" | "forum") => void;
  onClose?: () => void;
  onOpenTerms?: () => void;
}

const PRESET_AVATARS = [
  { label: "UL Brand", url: "/logo.png" },
  { label: "Mascot", url: "/mascot.jpg" },
  { label: "Alex", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" },
  { label: "Maya", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80" },
  { label: "Arjun", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
  { label: "Cat", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80" },
];

const CURRENCY_PRESETS = [
  { symbol: "₹", code: "INR" },
  { symbol: "$", code: "USD" },
  { symbol: "€", code: "EUR" },
  { symbol: "£", code: "GBP" },
  { symbol: "¥", code: "JPY" },
];

const ATTENDANCE_GOALS = [70, 75, 80, 85, 90];

export default function SettingsPage({ onNavigateTab, onClose, onOpenTerms }: SettingsPageProps) {
  const {
    data,
    settings,
    updateSettings,
    playHaptic,
    session,
    user,
    signOut,
    setShowAuthModal,
    replaceAll,
  } = useStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<"appearance" | "preferences" | "data" | "about" | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(settings.userName || (user?.email ? user.email.split("@")[0] : "Rushi"));
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const profileName = settings.userName || (user?.email ? user.email.split("@")[0] : "Rushi");

  const handleToggleSection = (section: "appearance" | "preferences" | "data" | "about") => {
    playHaptic("click");
    setActiveSection((cur) => (cur === section ? null : section));
  };

  const handleThemeChange = (mode: ThemeMode) => {
    playHaptic("toggle");
    updateSettings({ themeMode: mode });
  };

  const handleAccentChange = (accent: AccentColor) => {
    playHaptic("click");
    updateSettings({ accentColor: accent });
  };

  const saveName = () => {
    if (nameVal.trim()) {
      updateSettings({ userName: nameVal.trim() });
    }
    setEditingName(false);
    playHaptic("success");
  };

  const handleExport = () => {
    playHaptic("click");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeutils-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("✓ Backup exported");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object") throw new Error("bad file");
        replaceAll(parsed);
        playHaptic("success");
        toast.success("✓ Backup restored!");
      } catch {
        playHaptic("delete");
        toast.error("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="clean-settings-container">
      {/* Compact Header */}
      <div className="clean-settings-topbar">
        <h1 className="clean-settings-title">Settings</h1>
        {onClose && (
          <button className="icon-btn close-btn" onClick={onClose} title="Close Settings">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {/* Compact Profile Card */}
      <div className="clean-profile-hero-card" style={{ padding: "14px 16px" }}>
        <div className="clean-avatar-wrapper">
          <img
            src={settings.avatarUrl || "/logo.png"}
            alt={profileName}
            className="clean-avatar-img"
          />
          <button
            type="button"
            className="clean-avatar-edit-badge"
            onClick={() => {
              playHaptic("click");
              setAvatarPickerOpen((v) => !v);
            }}
            title="Change Avatar"
          >
            <Icon name="edit" size={13} />
          </button>
        </div>

        {avatarPickerOpen && (
          <div className="clean-avatar-picker-dropdown">
            <div className="avatar-picker-header">
              <span className="clean-dropdown-hint">Choose Avatar</span>
              <button
                type="button"
                className="icon-btn close-avatar-btn"
                onClick={() => setAvatarPickerOpen(false)}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
            <div className="clean-avatar-options grid">
              {PRESET_AVATARS.map((av, idx) => (
                <div
                  key={idx}
                  className={`avatar-chip-container ${settings.avatarUrl === av.url ? "selected" : ""}`}
                  onClick={() => {
                    playHaptic("click");
                    updateSettings({ avatarUrl: av.url });
                    setAvatarPickerOpen(false);
                  }}
                >
                  <img src={av.url} alt={av.label} className="clean-avatar-option-chip" />
                  <span className="avatar-chip-label">{av.label}</span>
                </div>
              ))}
            </div>
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (reader.result) {
                      playHaptic("success");
                      updateSettings({ avatarUrl: String(reader.result) });
                      setAvatarPickerOpen(false);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <button
              type="button"
              className="btn ghost small full upload-avatar-btn"
              onClick={() => avatarFileRef.current?.click()}
            >
              <Icon name="upload" size={13} /> Upload Photo
            </button>
          </div>
        )}

        <div className="clean-profile-details">
          {editingName ? (
            <div className="clean-name-edit-form">
              <input
                type="text"
                className="clean-name-input"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                autoFocus
                maxLength={24}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
              />
              <button className="clean-name-save-btn" onClick={saveName} title="Save Name">
                <Icon name="check" size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="clean-profile-name-btn"
              onClick={() => {
                playHaptic("click");
                setNameVal(profileName);
                setEditingName(true);
              }}
              title="Edit profile name"
            >
              <span className="clean-profile-name">{profileName}</span>
              <span className="clean-name-edit-icon">
                <Icon name="edit" size={14} />
              </span>
            </button>
          )}

          <div className="clean-profile-sync-pill">
            {session ? (
              <>
                <span className="sync-dot active" />
                <span className="sync-text">Synced &middot; {profileName}</span>
                <button
                  type="button"
                  className="clean-sync-action-btn"
                  onClick={signOut}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <span className="sync-dot guest" />
                <span className="sync-text">Guest &middot; Local</span>
                <button
                  type="button"
                  className="clean-sync-action-btn"
                  onClick={() => {
                    playHaptic("click");
                    setShowAuthModal(true);
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Minimal Settings List */}
      <div className="clean-settings-card grouped">
        {/* 1. Appearance */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "appearance" ? "open" : ""}`}
            onClick={() => handleToggleSection("appearance")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box violet">
                <Icon name="palette" size={16} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Appearance</span>
                <span className="clean-row-subtitle">Theme, color &amp; layout</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-pill-hint">{settings.themeMode}</span>
              <span className="clean-row-chevron">
                <Icon name={activeSection === "appearance" ? "chevronLeft" : "chevronRight"} size={16} />
              </span>
            </div>
          </button>

          {activeSection === "appearance" && (
            <div className="clean-subpanel">
              <div className="subpanel-inner">
                <label className="subpanel-label">Theme</label>
                <div className="clean-theme-grid">
                  {(["dark", "light", "system"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`clean-theme-chip ${settings.themeMode === mode ? "active" : ""}`}
                      onClick={() => handleThemeChange(mode)}
                    >
                      <span className="theme-emoji">{mode === "dark" ? "🌙" : mode === "light" ? "☀️" : "💻"}</span>
                      <span className="theme-name">{mode[0].toUpperCase() + mode.slice(1)}</span>
                    </button>
                  ))}
                </div>

                <label className="subpanel-label" style={{ marginTop: "14px" }}>
                  Accent Color
                </label>
                <div className="clean-accent-row">
                  {ACCENT_OPTIONS.map((acc) => {
                    const isSelected = settings.accentColor === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        className={`clean-accent-circle ${isSelected ? "active" : ""}`}
                        style={{ backgroundColor: acc.color }}
                        onClick={() => handleAccentChange(acc.id)}
                        title={acc.label}
                      >
                        {isSelected && <Icon name="check" size={12} />}
                      </button>
                    );
                  })}
                </div>

                <div className="clean-toggle-inline" style={{ marginTop: "14px" }}>
                  <div>
                    <strong>Compact Mode</strong>
                    <p>Tighter spacing for more content</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={(e) => {
                        playHaptic("toggle");
                        updateSettings({ compactMode: e.target.checked });
                      }}
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="clean-divider" />

        {/* 2. Preferences */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "preferences" ? "open" : ""}`}
            onClick={() => handleToggleSection("preferences")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box amber">
                <Icon name="sliders" size={16} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Preferences</span>
                <span className="clean-row-subtitle">Attendance goal, currency &amp; sounds</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-pill-hint">
                {settings.targetAttendancePct}% &middot; {settings.currencySymbol}
              </span>
              <span className="clean-row-chevron">
                <Icon name={activeSection === "preferences" ? "chevronLeft" : "chevronRight"} size={16} />
              </span>
            </div>
          </button>

          {activeSection === "preferences" && (
            <div className="clean-subpanel">
              <div className="subpanel-inner">
                <label className="subpanel-label">Target Attendance ({settings.targetAttendancePct}%)</label>
                <div className="clean-pill-row">
                  {ATTENDANCE_GOALS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      className={`clean-pill-btn ${settings.targetAttendancePct === pct ? "active" : ""}`}
                      onClick={() => {
                        playHaptic("click");
                        updateSettings({ targetAttendancePct: pct });
                      }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <label className="subpanel-label" style={{ marginTop: "14px" }}>
                  Currency
                </label>
                <div className="clean-pill-row">
                  {CURRENCY_PRESETS.map((curr) => (
                    <button
                      key={curr.symbol}
                      type="button"
                      className={`clean-pill-btn ${settings.currencySymbol === curr.symbol ? "active" : ""}`}
                      onClick={() => {
                        playHaptic("click");
                        updateSettings({ currencySymbol: curr.symbol });
                      }}
                    >
                      <span>{curr.symbol}</span>
                      <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>{curr.code}</span>
                    </button>
                  ))}
                </div>

                <div className="clean-toggle-inline" style={{ marginTop: "14px" }}>
                  <div>
                    <strong>Tap Sounds</strong>
                    <p>Subtle audio feedback on actions</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.soundEffects}
                      onChange={(e) => {
                        const next = e.target.checked;
                        updateSettings({ soundEffects: next });
                        if (next) playHaptic("success");
                      }}
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="clean-divider" />

        {/* 3. Backup & Data */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "data" ? "open" : ""}`}
            onClick={() => handleToggleSection("data")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box emerald">
                <Icon name="database" size={16} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Backup &amp; Data</span>
                <span className="clean-row-subtitle">Export or restore JSON snapshot</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-chevron">
                <Icon name={activeSection === "data" ? "chevronLeft" : "chevronRight"} size={16} />
              </span>
            </div>
          </button>

          {activeSection === "data" && (
            <div className="clean-subpanel">
              <div className="subpanel-inner">
                <div className="clean-stats-chips">
                  <div className="stat-chip">
                    <span className="stat-val">{data.attendance.length}</span>
                    <span className="stat-lbl">Classes</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-val">{data.txs.length}</span>
                    <span className="stat-lbl">Money</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-val">{data.tasks.length}</span>
                    <span className="stat-lbl">Tasks</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-val">{data.journal.length}</span>
                    <span className="stat-lbl">Notes</span>
                  </div>
                </div>

                <div className="clean-action-stack" style={{ marginTop: "12px" }}>
                  <button className="btn ghost full" onClick={handleExport}>
                    <Icon name="download" size={15} /> Export JSON Backup
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImport(f);
                      e.target.value = "";
                    }}
                  />
                  <button className="btn ghost full" onClick={() => fileRef.current?.click()}>
                    <Icon name="upload" size={15} /> Restore from JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="clean-divider" />

        {/* 4. Community Forum */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className="clean-setting-row"
            onClick={() => {
              playHaptic("click");
              if (onNavigateTab) onNavigateTab("forum");
            }}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box pink">
                <Icon name="heart" size={16} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Community &amp; Feedback</span>
                <span className="clean-row-subtitle">Share ideas or report issues</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-chevron">
                <Icon name="chevronRight" size={16} />
              </span>
            </div>
          </button>
        </div>

        <div className="clean-divider" />

        {/* 5. About & Terms */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "about" ? "open" : ""}`}
            onClick={() => handleToggleSection("about")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box slate">
                <Icon name="info" size={16} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">About &amp; Legal</span>
                <span className="clean-row-subtitle">v1.2.1 &middot; Terms &amp; Privacy</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-chevron">
                <Icon name={activeSection === "about" ? "chevronLeft" : "chevronRight"} size={16} />
              </span>
            </div>
          </button>

          {activeSection === "about" && (
            <div className="clean-subpanel">
              <div className="subpanel-inner" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.45 }}>
                  Life Utils v1.2.1 — Offline-first attendance, finance, tasks &amp; journal utility.
                </p>
                <button
                  type="button"
                  className="clean-terms-row-btn"
                  onClick={() => {
                    playHaptic("click");
                    if (onOpenTerms) onOpenTerms();
                    else window.postMessage({ type: "OPEN_TERMS" });
                  }}
                >
                  <Icon name="info" size={15} />
                  <span>Terms of Service &amp; Privacy Policy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
