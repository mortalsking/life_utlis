import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useStore } from "../store";

interface AuthProps {
  onClose?: () => void;
}

export default function Auth({ onClose }: AuthProps) {
  const { updateSettings } = useStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        onClose?.();
      } else {
        const chosenUsername = username.trim();
        if (!chosenUsername) {
          throw new Error("Please enter a Profile Name.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: chosenUsername,
              full_name: chosenUsername,
              display_name: chosenUsername,
            },
          },
        });
        if (error) throw error;

        updateSettings({ userName: chosenUsername });

        if (data?.session) {
          setMsg(`Welcome, ${chosenUsername}! Signed in successfully.`);
          setTimeout(() => {
            onClose?.();
          }, 1000);
        } else {
          setMsg(`Account created for ${chosenUsername}! You can now sign in.`);
          setIsLogin(true);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl"
      style={{
        background: "var(--card)",
        color: "var(--text)",
        border: "1px solid var(--border-strong)",
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{
            background: "var(--bg-soft)",
            color: "var(--muted)",
            border: "1px solid var(--border)",
          }}
          title="Close / Continue as Guest"
          aria-label="Close"
        >
          ✕
        </button>
      )}

      <div className="text-center space-y-1.5 pt-1">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {isLogin
            ? "Sign in to sync your attendance & finances across devices"
            : "Register for free cloud backup and your own profile"}
        </p>
      </div>

      {error && (
        <div
          className="p-3 text-sm rounded-xl font-medium"
          style={{
            background: "rgba(248, 113, 113, 0.12)",
            color: "var(--bad)",
            border: "1px solid rgba(248, 113, 113, 0.3)",
          }}
        >
          {error}
        </div>
      )}
      {msg && (
        <div
          className="p-3 text-sm rounded-xl font-medium"
          style={{
            background: "rgba(52, 211, 153, 0.12)",
            color: "var(--good)",
            border: "1px solid rgba(52, 211, 153, 0.3)",
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: "var(--text)" }} htmlFor="username">
              Profile Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="e.g. Rushi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              maxLength={50}
              autoFocus
              className="w-full h-11 rounded-xl px-3.5 text-sm focus:outline-none transition-colors"
              style={{
                background: "var(--bg-soft)",
                color: "var(--text)",
                border: "1px solid var(--border-strong)",
              }}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: "var(--text)" }} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full h-11 rounded-xl px-3.5 text-sm focus:outline-none transition-colors"
            style={{
              background: "var(--bg-soft)",
              color: "var(--text)",
              border: "1px solid var(--border-strong)",
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: "var(--text)" }} htmlFor="password">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full h-11 rounded-xl pl-3.5 pr-11 text-sm focus:outline-none transition-colors"
              style={{
                background: "var(--bg-soft)",
                color: "var(--text)",
                border: "1px solid var(--border-strong)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 p-1.5 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ color: "var(--muted)", background: "transparent" }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            color: "#ffffff",
          }}
        >
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          className="font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
          style={{ color: "var(--accent)", background: "transparent" }}
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setMsg(null);
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>

      {onClose && (
        <div className="pt-3 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={onClose}
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: "var(--muted)", background: "transparent" }}
          >
            ← Skip for now &amp; explore as Guest
          </button>
        </div>
      )}
    </div>
  );
}
