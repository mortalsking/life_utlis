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

export default function SettingsPage({ onNavigateTab, onClose, onOpenTerms }: SettingsPageProps) {
  const isNativeApp =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { isReactNativeApp?: boolean }).isReactNativeApp ||
      (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView
    );

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
  const [activeSection, setActiveSection] = useState<"appearance" | "preferences" | "data" | "support" | "about" | null>("appearance");
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(settings.userName || "Rushi");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState<"All" | "Students" | "Mascot & Animals" | "Abstract">("All");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const PRESET_AVATARS = [
    { label: "Mascot (Official)", category: "Mascot & Animals", url: "/logo.jpg" },
    { label: "Alex (Student)", category: "Students", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" },
    { label: "Maya (Student)", category: "Students", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80" },
    { label: "Arjun (Techie)", category: "Students", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
    { label: "Sarah (Scholar)", category: "Students", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80" },
    { label: "Zoe (Creative)", category: "Students", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
    { label: "Leo (Athlete)", category: "Students", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
    { label: "Cat (Cozy)", category: "Mascot & Animals", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80" },
    { label: "Fox (Clever)", category: "Mascot & Animals", url: "https://images.unsplash.com/photo-1516934024742-b461fba47600?w=200&auto=format&fit=crop&q=80" },
    { label: "Owl (Wisdom)", category: "Mascot & Animals", url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200&auto=format&fit=crop&q=80" },
    { label: "Puppy (Friendly)", category: "Mascot & Animals", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80" },
    { label: "Panda (Zen)", category: "Mascot & Animals", url: "https://images.unsplash.com/photo-1527118732049-c88155f2107c?w=200&auto=format&fit=crop&q=80" },
    { label: "Neon Cyber", category: "Abstract", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80" },
    { label: "Cosmic Nebula", category: "Abstract", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200&auto=format&fit=crop&q=80" },
    { label: "Sunset Glow", category: "Abstract", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80" },
    { label: "Emerald Zen", category: "Abstract", url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&auto=format&fit=crop&q=80" },
  ];

  const handleToggleSection = (section: "appearance" | "preferences" | "data" | "support" | "about") => {
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

  const handleAppStyleChange = (style: "Classic" | "Modern" | "Minimal") => {
    playHaptic("click");
    updateSettings({ appStyle: style });
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
    toast.success("✓ Backup exported successfully");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object") throw new Error("bad file");
        replaceAll(parsed);
        playHaptic("success");
        toast.success("✓ Backup restored successfully!");
      } catch {
        playHaptic("delete");
        toast.error("Invalid file format. Please upload a valid Life Utils backup.");
      }
    };
    reader.readAsText(file);
  };

  const CURRENCY_PRESETS = [
    { symbol: "₹", label: "₹ INR", name: "Indian Rupee" },
    { symbol: "$", label: "$ USD", name: "US Dollar" },
    { symbol: "€", label: "€ EUR", name: "Euro" },
    { symbol: "£", label: "£ GBP", name: "British Pound" },
    { symbol: "¥", label: "¥ JPY", name: "Japanese Yen" },
  ];

  const ATTENDANCE_GOALS = [70, 75, 80, 85, 90];

  const statsCount = {
    txs: data.txs.length,
    attendance: data.attendance.length,
    tasks: data.tasks.length,
    journal: data.journal.length,
  };

  return (
    <div className="clean-settings-container">
      {/* Top Header */}
      <div className="clean-settings-topbar">
        <div>
          <h1 className="clean-settings-title">Settings</h1>
          <p className="clean-settings-desc">Customize your preferences, theme & cloud sync</p>
        </div>
        {onClose && (
          <button className="icon-btn close-btn" onClick={onClose} title="Close Settings">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {/* User Profile Card with Avatar, Badge, & Sync State */}
      <div className="clean-profile-hero-card">
        <div className="clean-profile-glow-ring" />
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
          <div className="clean-avatar-picker-dropdown expanded">
            <div className="avatar-picker-header">
              <span className="clean-dropdown-hint">Choose Your Avatar ({PRESET_AVATARS.length} choices):</span>
              <button
                type="button"
                className="icon-btn close-avatar-btn"
                onClick={() => setAvatarPickerOpen(false)}
              >
                <Icon name="x" size={14} />
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="avatar-cat-chips">
              {(["All", "Students", "Mascot & Animals", "Abstract"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`avatar-cat-chip ${avatarCategory === cat ? "active" : ""}`}
                  onClick={() => setAvatarCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="clean-avatar-options grid">
              {PRESET_AVATARS.filter(
                (av) => avatarCategory === "All" || av.category === avatarCategory
              ).map((av, idx) => (
                <div
                  key={idx}
                  className={`avatar-chip-container ${settings.avatarUrl === av.url ? "selected" : ""}`}
                  onClick={() => {
                    playHaptic("click");
                    updateSettings({ avatarUrl: av.url });
                    setAvatarPickerOpen(false);
                  }}
                  title={av.label}
                >
                  <img src={av.url} alt={av.label} className="clean-avatar-option-chip" />
                  <span className="avatar-chip-label">{av.label.split(" ")[0]}</span>
                </div>
              ))}
            </div>

            {/* Custom URL & Photo Upload Section */}
            <div className="avatar-custom-section">
              <span className="custom-section-title">Or Use Custom Photo / URL:</span>
              <div className="avatar-custom-input-row">
                <input
                  type="text"
                  className="avatar-url-input"
                  placeholder="Paste image URL (https://...)"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn primary small"
                  disabled={!customAvatarUrl.trim()}
                  onClick={() => {
                    const trimmed = customAvatarUrl.trim();
                    if (trimmed) {
                      if (!/^(\/|https?:\/\/|data:image\/)/i.test(trimmed)) {
                        toast.error("Please enter a valid HTTP or HTTPS image URL.");
                        return;
                      }
                      playHaptic("success");
                      updateSettings({ avatarUrl: trimmed });
                      setAvatarPickerOpen(false);
                      setCustomAvatarUrl("");
                    }
                  }}
                >
                  Apply
                </button>
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
                <Icon name="upload" size={13} /> Upload Photo from Device
              </button>
            </div>
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
                setEditingName(true);
              }}
              title="Click to edit display name"
            >
              <span className="clean-profile-name">{settings.userName || "Rushi"}</span>
              <span className="clean-name-edit-icon">
                <Icon name="edit" size={14} />
              </span>
            </button>
          )}

          {/* Cloud Sync Status Pill */}
          <div className="clean-profile-sync-pill">
            {session ? (
              <>
                <span className="sync-dot active" />
                <span className="sync-text">Cloud Synced &middot; {user?.email}</span>
              </>
            ) : (
              <>
                <span className="sync-dot guest" />
                <span className="sync-text">Guest Mode &middot; Local Storage</span>
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

      {/* Unified Settings Accordion */}
      <div className="clean-settings-card grouped">
        {/* Accordion 1: Appearance */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "appearance" ? "open" : ""}`}
            onClick={() => handleToggleSection("appearance")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box violet">
                <Icon name="palette" size={17} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Appearance & Themes</span>
                <span className="clean-row-subtitle">Theme mode, accent palettes, style and animations</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-pill-hint">
                {settings.themeMode.toUpperCase()} &middot; {settings.accentColor}
              </span>
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
                    <span className="theme-emoji">🌙</span>
                    <span className="theme-name">Dark</span>
                  </button>
                  <button
                    type="button"
                    className={`clean-theme-chip ${settings.themeMode === "light" ? "active" : ""}`}
                    onClick={() => handleThemeChange("light")}
                  >
                    <span className="theme-emoji">☀️</span>
                    <span className="theme-name">Light</span>
                  </button>
                  <button
                    type="button"
                    className={`clean-theme-chip ${settings.themeMode === "system" ? "active" : ""}`}
                    onClick={() => handleThemeChange("system")}
                  >
                    <span className="theme-emoji">💻</span>
                    <span className="theme-name">System</span>
                  </button>
                </div>

                <label className="subpanel-label" style={{ marginTop: "16px" }}>
                  Accent Highlight Color
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

                <label className="subpanel-label" style={{ marginTop: "16px" }}>
                  App Layout Style
                </label>
                <div className="clean-style-grid">
                  {(
                    [
                      { id: "Classic", icon: "🏛️", desc: "Balanced 7-tab dock layout" },
                      { id: "Modern", icon: "✨", desc: "Rounded glass cards & subtle glow" },
                      { id: "Minimal", icon: "⚡", desc: "Distraction-free typography" },
                    ] as const
                  ).map((st) => {
                    const isSelected = (settings.appStyle || "Classic") === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        className={`clean-style-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleAppStyleChange(st.id)}
                      >
                        <div className="style-card-header">
                          <span className="style-icon">{st.icon}</span>
                          <span className="style-name">{st.id}</span>
                          {isSelected && <span className="style-check"><Icon name="check" size={12} /></span>}
                        </div>
                        <p className="style-desc">{st.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="clean-toggle-inline" style={{ marginTop: "18px" }}>
                  <div>
                    <strong>Micro-animations</strong>
                    <p>Smooth transitions and spring scale effects</p>
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

                <div className="clean-toggle-inline" style={{ marginTop: "12px" }}>
                  <div>
                    <strong>Compact Layout</strong>
                    <p>Reduces whitespace for higher information density</p>
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

        {/* Accordion 2: Preferences */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "preferences" ? "open" : ""}`}
            onClick={() => handleToggleSection("preferences")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box amber">
                <Icon name="sliders" size={17} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Preferences</span>
                <span className="clean-row-subtitle">Attendance threshold, currency and audio haptics</span>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label className="subpanel-label">Target Attendance Goal</label>
                  <span style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 600 }}>
                    {settings.targetAttendancePct}% goal
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "2px 0 8px" }}>
                  The bunk predictor calculates how many classes you can skip or must attend to hit this mark.
                </p>
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

                <label className="subpanel-label" style={{ marginTop: "16px" }}>
                  Currency Symbol
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
                      <span style={{ fontSize: "0.74rem", opacity: 0.8 }}>{curr.label.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>

                <div className="clean-toggle-inline" style={{ marginTop: "16px" }}>
                  <div>
                    <strong>Tactile Audio Feedback</strong>
                    <p>Web Audio synthetic clicks and haptics on tap</p>
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

        {/* Accordion 3: Data & Cloud Sync */}
        <div className="clean-grouped-item">
          <button
            type="button"
            className={`clean-setting-row ${activeSection === "data" ? "open" : ""}`}
            onClick={() => handleToggleSection("data")}
          >
            <div className="clean-row-left">
              <span className="clean-row-icon-box emerald">
                <Icon name="database" size={17} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Data & Cloud Storage</span>
                <span className="clean-row-subtitle">Account status, JSON backups and metrics</span>
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
                {/* Metrics snapshot */}
                <label className="subpanel-label">Current Data Stored Locally</label>
                <div className="clean-stats-chips">
                  <div className="stat-chip">
                    <span className="stat-val">{statsCount.attendance}</span>
                    <span className="stat-lbl">Attendance</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-val">{statsCount.txs}</span>
                    <span className="stat-lbl">Finances</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-val">{statsCount.tasks}</span>
                    <span className="stat-lbl">Tasks</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-val">{statsCount.journal}</span>
                    <span className="stat-lbl">Journals</span>
                  </div>
                </div>

                <div className="clean-account-badge" style={{ marginTop: "14px" }}>
                  {session ? (
                    <>
                      <span className="clean-dot active" />
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: "block", color: "var(--text)" }}>Cloud Account Synced</strong>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{user?.email}</span>
                      </div>
                      <button className="btn ghost small-btn" onClick={signOut}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="clean-dot guest" />
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: "block", color: "var(--text)" }}>Guest Mode (Local Only)</strong>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Sync your data to the cloud</span>
                      </div>
                      <button
                        className="btn primary small-btn"
                        onClick={() => {
                          playHaptic("click");
                          setShowAuthModal(true);
                        }}
                      >
                        Sign In / Register
                      </button>
                    </>
                  )}
                </div>

                <div className="clean-action-stack" style={{ marginTop: "14px" }}>
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
                    <Icon name="upload" size={15} /> Restore from JSON Backup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="clean-divider" />

        {/* Row 4: Community & Support */}
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
              <span className="clean-row-icon-box pink">
                <Icon name="heart" size={17} />
              </span>
              <div className="clean-row-texts">
                <span className="clean-row-title">Community & Forum</span>
                <span className="clean-row-subtitle">Share feedback, feature ideas & view discussions</span>
              </div>
            </div>
            <div className="clean-row-right">
              <span className="clean-row-pill-hint accent">Open Forum</span>
              <span className="clean-row-chevron">
                <Icon name="chevronRight" size={16} />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 3: About App Card */}
      <div className="clean-settings-card">
        <button
          type="button"
          className={`clean-setting-row ${activeSection === "about" ? "open" : ""}`}
          onClick={() => handleToggleSection("about")}
        >
          <div className="clean-row-left">
            <span className="clean-row-icon-box slate">
              <Icon name="info" size={17} />
            </span>
            <div className="clean-row-texts">
              <span className="clean-row-title">About Life Utils</span>
              <span className="clean-row-subtitle">Version v1.2.1 &middot; Offline-first PWA</span>
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
                <div className="about-banner-wrapper">
                  <img src="/banner.jpg" alt="Life Utils Banner" className="clean-about-banner-img" />
                </div>
                <div className="clean-about-badge-row" style={{ marginTop: "12px" }}>
                  <span className="version-pill">v1.2.1</span>
                  <span className="stack-pill">React 19</span>
                  <span className="stack-pill">Vite 6</span>
                  <span className="stack-pill">Cloud Engine</span>
                  <span className="stack-pill">Expo Android</span>
                </div>
                <p style={{ marginTop: "10px", fontSize: "0.86rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
                  Life Utils is an offline-first, cloud-synced personal daily utility app designed to track attendance, manage expenses, organize to-dos, record journals, and connect with fellow users.
                </p>

                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
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
                    <span>Terms of Service & Privacy Policy</span>
                  </button>
                  {!isNativeApp && (
                    <a href="/life-utils.apk" download="life-utils.apk" className="clean-apk-download-btn">
                      <Icon name="download" size={15} />
                      <span>Download Android APK (v1.2.1)</span>
                    </a>
                  )}
                  <a
                    href="https://github.com/mortalsking/life_utlis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clean-github-link"
                  >
                    ⭐ Star on GitHub (mortalsking/life_utlis)
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
