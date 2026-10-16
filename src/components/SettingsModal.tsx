import SettingsPage from "../pages/SettingsPage";

interface SettingsModalProps {
  onClose: () => void;
  onNavigateTab?: (tab: "today" | "attend" | "money" | "tasks" | "notes" | "stats" | "forum") => void;
}

export default function SettingsModal({ onClose, onNavigateTab }: SettingsModalProps) {
  return (
    <div className="clean-settings-modal-wrapper">
      <SettingsPage
        onClose={onClose}
        onNavigateTab={(tab) => {
          if (onNavigateTab) onNavigateTab(tab);
          onClose();
        }}
      />
    </div>
  );
}
