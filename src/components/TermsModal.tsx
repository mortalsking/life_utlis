import Icon from "./Icon";

interface TermsModalProps {
  onClose: () => void;
}

export default function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="terms-modal-container">
      <div className="terms-modal-header">
        <div className="terms-title-group">
          <span className="terms-badge-icon">📜</span>
          <div>
            <h2 className="terms-modal-title">Terms of Service & Privacy Policy</h2>
            <span className="terms-modal-subtitle">Last updated: October 2026 &middot; Life Utils v1.2.1</span>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn terms-close-btn"
          onClick={onClose}
          title="Close Terms & Privacy"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="terms-modal-body">
        {/* Section 1: Privacy Promise */}
        <div className="terms-section-card highlight">
          <div className="terms-section-header">
            <span className="section-icon">🛡️</span>
            <h3>Our Privacy & Data Promise</h3>
          </div>
          <p>
            Life Utils is built with an <strong>offline-first, privacy-respecting architecture</strong>.
            Your attendance logs, personal expenses, to-dos, and journal entries belong exclusively to you.
          </p>
          <ul className="terms-list">
            <li><strong>No Data Monetization:</strong> We do not sell, rent, or monetize your personal logs or habits to advertisers.</li>
            <li><strong>Local-First Storage:</strong> In Guest Mode, your data remains 100% on your device via secure browser storage.</li>
            <li><strong>Zero Tracking Cookies:</strong> No invasive third-party ad networks or tracking trackers.</li>
          </ul>
        </div>

        {/* Section 2: Terms of Service */}
        <div className="terms-section-card">
          <div className="terms-section-header">
            <span className="section-icon">⚖️</span>
            <h3>1. Terms of Service</h3>
          </div>
          <p>
            By accessing or using Life Utils (via web browser, PWA, or native Android app), you agree to these Terms. If you do not agree, please discontinue using the application.
          </p>
          <ul className="terms-list">
            <li><strong>Permitted Use:</strong> The utility is provided for personal, educational, and productivity purposes.</li>
            <li><strong>Account Security:</strong> If you register a cloud account, you are responsible for maintaining the confidentiality of your credentials.</li>
            <li><strong>Modifications:</strong> We reserve the right to enhance, modify, or release updates to the features to improve stability and performance.</li>
          </ul>
        </div>

        {/* Section 3: Attendance Disclaimer */}
        <div className="terms-section-card">
          <div className="terms-section-header">
            <span className="section-icon">🎓</span>
            <h3>2. Attendance Calculator Disclaimer</h3>
          </div>
          <p>
            The <strong>Attendance Tracker & Bunk Margin Advisor</strong> calculates percentage estimates and bunk margins based solely on the data you enter.
          </p>
          <ul className="terms-list">
            <li>Calculations are algorithmic aids for personal student planning and do not substitute for official college or university records.</li>
            <li>Institutional policies (medical leaves, condonation criteria, lab weightage, and debarment regulations) remain strictly under your university's authority.</li>
          </ul>
        </div>

        {/* Section 4: Community Forum Guidelines */}
        <div className="terms-section-card">
          <div className="terms-section-header">
            <span className="section-icon">💬</span>
            <h3>3. Community Forum Guidelines</h3>
          </div>
          <p>
            The Community Forum allows users to suggest features, report bugs, and exchange productivity tips. To maintain a welcoming environment:
          </p>
          <ul className="terms-list">
            <li>Respect other users: Harassment, hate speech, or offensive content is strictly prohibited.</li>
            <li>No spam, self-promotional bots, or malicious links.</li>
            <li>Contributions violating these guidelines may be removed to protect the community.</li>
          </ul>
        </div>

        {/* Section 5: Data Portability & Deletion */}
        <div className="terms-section-card">
          <div className="terms-section-header">
            <span className="section-icon">💾</span>
            <h3>4. Data Portability & Right to Erasure</h3>
          </div>
          <p>
            You have full control over your records at all times:
          </p>
          <ul className="terms-list">
            <li><strong>Export Anytime:</strong> Go to Settings &gt; Data &gt; Export JSON to download a full backup snapshot of your entire database.</li>
            <li><strong>Full Erasure:</strong> You can clear local device storage or delete your cloud account directly from Settings.</li>
          </ul>
        </div>
      </div>

      <div className="terms-modal-footer">
        <button type="button" className="btn primary full" onClick={onClose}>
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
