import Icon from "./Icon";

interface TermsModalProps {
  onClose: () => void;
}

export default function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="terms-modal-container">
      <div className="terms-modal-header">
        <div className="terms-title-group">
          <span className="terms-badge-icon">🛡️</span>
          <div>
            <h2 className="terms-modal-title">Privacy &amp; Terms</h2>
            <span className="terms-modal-subtitle">Plain &amp; simple &middot; Life Utils</span>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn terms-close-btn"
          onClick={onClose}
          title="Close"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="terms-modal-body">
        <div className="terms-section-card highlight">
          <div className="terms-section-header">
            <span className="section-icon">🔒</span>
            <h3>Your Data Stays Yours</h3>
          </div>
          <p>
            Life Utils is a personal daily tool — not an ad network. We never sell your notes, expenses, or attendance logs, and there are zero third-party trackers.
          </p>
          <ul className="terms-list">
            <li><strong>Guest Mode:</strong> Everything stays only on your device.</li>
            <li><strong>Cloud Account:</strong> Synced privately to your own profile.</li>
          </ul>
        </div>

        <div className="terms-section-card">
          <div className="terms-section-header">
            <span className="section-icon">🎓</span>
            <h3>Attendance &amp; Estimates</h3>
          </div>
          <p>
            Bunk margins and attendance percentages are calculated purely from what you log. Always double-check your college&apos;s official portal for final records.
          </p>
        </div>

        <div className="terms-section-card">
          <div className="terms-section-header">
            <span className="section-icon">💬</span>
            <h3>Community Guidelines</h3>
          </div>
          <p>
            Keep the forum helpful and respectful. Spam, harassment, or malicious links will be removed.
          </p>
        </div>

        <div className="terms-section-card">
          <div className="terms-section-header">
            <span className="section-icon">💾</span>
            <h3>Backups &amp; Control</h3>
          </div>
          <p>
            You can export a full JSON backup of your data anytime from <strong>Settings &rarr; Backup &amp; Data</strong> and restore it on any device.
          </p>
        </div>
      </div>

      <div className="terms-modal-footer">
        <button type="button" className="btn primary full" onClick={onClose}>
          Got It
        </button>
      </div>
    </div>
  );
}
