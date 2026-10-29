import { useEffect, useState } from "react";
import { toast, type ToastMessage } from "../notifications";
import Icon from "./Icon";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsub = toast.subscribe((updated) => {
      setToasts(updated);
    });
    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="clean-toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`clean-toast-pill type-${t.type}`}>
          <span className="clean-toast-icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="clean-toast-msg">{t.message}</span>
          <button
            type="button"
            className="clean-toast-close"
            onClick={() => toast.remove(t.id)}
            title="Dismiss toast"
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
