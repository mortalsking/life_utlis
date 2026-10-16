import { useState, useRef } from "react";
import Icon from "../components/Icon";
import { useStore } from "../store";
import { ACCENT_OPTIONS, type AccentColor, type ThemeMode } from "../types";
import { todayISO } from "../utils";

interface SettingsPageProps {
  onNavigateTab?: (tab: "today" | "attend" | "money" | "tasks" | "notes" | "stats" | "forum") => void;
  onClose?: () => void;
}

export default function SettingsPage({ onNavigateTab, onClose }: SettingsPageProps) {
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
  const [activeSection, setActiveSection] = useState<"appearance" | "preferences" | "data" | "about" | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(settings.userName || "Rushi");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const PRESET_AVATARS = [
    { label: "Cat (Default)", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80" },
    { label: "Fox", url: "https://images.unsplash.com/photo-1516934024742-b461fba47600?w=200&auto=format&fit=crop&q=80" },
    { label: "Owl", url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200&auto=format&fit=crop&q=80" },
    { label: "Minimal", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
  ];

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

  const cycleAppStyle = () => {
    playHaptic("click");
    const styles: ("Classic" | "Modern" | "Minimal")[] = ["Classic", "Modern", "Minimal"];
    const curIdx = styles.indexOf(settings.appStyle || "Classic");
    const nextStyle = styles[(curIdx + 1) % styles.length];
    updateSettings({ appStyle: nextStyle });
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
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object") throw new Error("bad file");
        replaceAll(parsed);
        playHaptic("success");
        alert("Backup restored successfully!");
      } catch {
        alert("Invalid file format. Please upload a valid Life Utils JSON backup.");
      }
    };
    reader.readAsText(file);
  };

  const CURRENCY_PRESETS = [
    { symbol: "₹", label: "₹ INR" },
    { symbol: "$", label: "$ USD" },
    { symbol: "€", label: "€ EUR" },
    { symbol: "£", label: "£ GBP" },
    { symbol: "¥", label: "¥ JPY" },
  ];

  const ATTENDANCE_GOALS = [70, 75, 80, 85, 90];

  return (
    <div className="clean-settings-container">
      {/* Top Header */}
      <div className="clean-settings-topbar">
        <h1 className="clean-settings-title">Settings</h1>
        {onClose && (
          <button className="icon-btn close-btn" onClick={onClose} title="Close Settings">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {/* User Profile Avatar & Name */}
      <div className="clean-profile-section">
        <div className="clean-avatar-wrapper">
          <img
            src={settings.avatarUrl || PRESET_AVATARS[0].url}
            alt={settings.userName || "User"}
            className="clean-avatar-img"
          />
          <button
            type="button"
            className="clean-avatar-edit-badge"
            onClick={() => {
              playHaptic("click");
              setAvatarPickerOpen((v) => !v);
            }}
            title="Change Profile Picture"
          >
            <Icon name="edit" size={13} />
          </button>
        </div>

        {avatarPickerOpen && (
          <div className="clean-avatar-picker-dropdown">
            <span className="clean-dropdown-hint">Choose Avatar:</span>
            <div className="clean-avatar-options">
              {PRESET_AVATARS.map((av, idx) => (
                <img
                  key={idx}
                  src={av.url}
                  alt={av.label}
                  className={`clean-avatar-option-chip ${settings.avatarUrl === av.url ? "selected" : ""}`}
                  onClick={() => {
                    playHaptic("click");
                    updateSettings({ avatarUrl: av.url });
                    setAvatarPickerOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="clean-profile-name-row">
          {editingName ? (
            <div className="clean-name-edit-form">
              <input
                type="text"
                className="clean-name-input"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
              />
              <button className="clean-name-save-btn" onClick={saveName}>
                <Icon name="check" size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="clean-profile-name-btn"
              onClick={() => {
                playHaptic("click");
                setEditingName(true);
              }}
              title="Click to edit name"
            >
              <span className="clean-profile-name">{settings.userName || "Rushi"}</span>
              <span className="clean-name-edit-icon">
                <Icon name="edit" size={14} />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* GROUP 1: App Style */}
      <div className="clean-settings-card">
        <button
          type="button"
          className="clean-setting-row"
          onClick={cycleAppStyle}
        >
          <div className="clean-row-left">
            <span className="clean-row-icon-box">
              <Icon name="smartphone" size={18} />
            </span>
            <span className="clean-row-title">App style</span>
          </div>
          <div className="clean-row-right">
            <span className="clean-row-value">{settings.appStyle || "Classic"}</span>
            <span className="clean-row-chevron"><Icon name="chevronRight" size={16} /></span>
          </div>
        </button>
      </div>

      {/* GROUP 2: Main Settings Group */}
      <div className="clean-settings-card grouped">
        {/* Row 1: Appearance */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "appearance" ? "open" : ""}`}
            onClick={() => handleToggleSection("appearance")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box">
                <Icon name="palette" size={18} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Appearance</span>
                <span className="clean-row-subtitle">Theme, accent and background</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-chevron">
                <Icon name={activeSection === "appearance" ? "chevronLeft" : "chevronRight"} size={16} />
              </span>
            </div>
          </button>

          {activeSection === "appearance" && (
            <div className="clean-subpanel">
              <div className="subpanel-inner">
                <label className="subpanel-label">Theme Mode</label>
                <div className="clean-theme-grid">
                  <button
                    type="button"
                    className={`clean-theme-chip ${settings.themeMode === "dark" ? "active" : ""}`}
                    onClick={() => handleThemeChange("dark")}
                  >
                    <span>🌙</span> Dark
                  </button>
                  <button
                    type="button"
                    className={`clean-theme-chip ${settings.themeMode === "light" ? "active" : ""}`}
                    onClick={() => handleThemeChange("light")}
                  >
                    <span>☀️</span> Light
                  </button>
                  <button
                    type="button"
                    className={`clean-theme-chip ${settings.themeMode === "system" ? "active" : ""}`}
                    onClick={() => handleThemeChange("system")}
                  >
                    <span>💻</span> System
                  </button>
                </div>

                <label className="subpanel-label" style={{ marginTop: "14px" }}>Accent Highlight Color</label>
                <div className="clean-accent-row">
                  {ACCENT_OPTIONS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      className={`clean-accent-circle ${settings.accentColor === acc.id ? "active" : ""}`}
                      style={{ backgroundColor: acc.color }}
                      onClick={() => handleAccentChange(acc.id)}
                      title={acc.label}
                    >
                      {settings.accentColor === acc.id && (
                        <Icon name="check" size={12} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="clean-toggle-inline" style={{ marginTop: "14px" }}>
                  <div>
                    <strong>Micro-animations</strong>
                    <p>Smooth spring transitions & interactions</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.enableAnimations}
                      onChange={(e) => {
                        playHaptic("toggle");
                        updateSettings({ enableAnimations: e.target.checked });
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

        {/* Row 2: Preferences */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "preferences" ? "open" : ""}`}
            onClick={() => handleToggleSection("preferences")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box">
                <Icon name="sliders" size={18} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Preferences</span>
                <span className="clean-row-subtitle">Attendance goal, currency and sounds</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-chevron">
                <Icon name={activeSection === "preferences" ? "chevronLeft" : "chevronRight"} size={16} />
              </span>
            </div>
          </button>

          {activeSection === "preferences" && (
            <div className="clean-subpanel">
              <div className="subpanel-inner">
                <label className="subpanel-label">Target Attendance Goal</label>
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

                <label className="subpanel-label" style={{ marginTop: "14px" }}>Currency Symbol</label>
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
                      {curr.label}
                    </button>
                  ))}
                </div>

                <div className="clean-toggle-inline" style={{ marginTop: "14px" }}>
                  <div>
                    <strong>Tactile Sounds & Haptics</strong>
                    <p>Subtle click effects for buttons and switches</p>
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

        {/* Row 3: Data */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "data" ? "open" : ""}`}
            onClick={() => handleToggleSection("data")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box">
                <Icon name="database" size={18} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Data</span>
                <span className="clean-row-subtitle">Backups, archive and import</span>
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
                {session ? (
                  <div className="clean-account-badge">
                    <span className="clean-dot active" />
                    <span>Cloud synced with <strong>{user?.email}</strong></span>
                    <button className="btn ghost small-btn" onClick={signOut}>Sign Out</button>
                  </div>
                ) : (
                  <div className="clean-account-badge">
                    <span className="clean-dot guest" />
                    <span>Guest Mode (Local Only)</span>
                    <button className="btn primary small-btn" onClick={() => setShowAuthModal(true)}>Sign In</button>
                  </div>
                )}

                <div className="clean-action-stack" style={{ marginTop: "12px" }}>
                  <button className="btn ghost full" onClick={handleExport}>
                    <Icon name="download" size={15} /> Export Backup (JSON)
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
                    <Icon name="upload" size={15} /> Import Backup (JSON)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="clean-divider" />

        {/* Row 4: Support */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className="clean-setting-row"
            onClick={() => {
              playHaptic("click");
              if (onNavigateTab) {
                onNavigateTab("forum");
              }
            }}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box">
                <Icon name="heart" size={18} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Support</span>
                <span className="clean-row-subtitle">Report a bug or ask for a feature</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-chevron"><Icon name="chevronRight" size={16} /></span>
            </div>
          </button>
        </div>
      </div>

      {/* GROUP 3: About this app */}
      <div className="clean-settings-card">
        <button
          type="button"
          className={`clean-setting-row ${activeSection === "about" ? "open" : ""}`}
          onClick={() => handleToggleSection("about")}
        >
          <div className="clean-row-left">
            <span className="clean-row-icon-box">
              <Icon name="info" size={18} />
            </span>
            <div className="clean-row-texts">
              <span className="clean-row-title">About this app</span>
              <span className="clean-row-subtitle">Version, credits and source code</span>
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
            <div className="subpanel-inner">
              <div className="clean-about-meta">
                <strong>Life Utils v1.2.0</strong>
                <p>Personal daily tracking utility built with React 19, Vite & Supabase.</p>
                <div style={{ marginTop: "10px" }}>
                  <a
                    href="https://github.com/mortalsking/life_utlis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clean-github-link"
                  >
                    ⭐ View Source on GitHub (mortalsking/life_utlis)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
