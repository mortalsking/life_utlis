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
        const chosenUsername = username.trim() || email.trim().split("@")[0];
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

        // Save username to settings right away
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
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close / Continue as Guest"
        >
          ✕
        </button>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isLogin
            ? "Sign in to sync your attendance & finances across devices"
            : "Register for free cloud auto-backup and multi-device access"}
        </p>
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900/50 font-medium">
          {error}
        </div>
      )}
      {msg && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-md border border-green-200 dark:border-green-900/50 font-medium">
          {msg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-950 dark:text-zinc-50" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="e.g. rushi or alex_99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              autoFocus
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-300 transition-colors"
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-zinc-950 dark:text-zinc-50" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-300 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-zinc-950 dark:text-zinc-50" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-300 transition-colors"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:opacity-50 disabled:pointer-events-none bg-zinc-950 text-zinc-50 hover:bg-zinc-950/90 h-10 py-2 px-4 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-50/90 shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Please wait
            </span>
          ) : (
            isLogin ? "Sign In" : "Sign Up"
          )}
        </button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors font-medium underline underline-offset-4"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>

      {onClose && (
        <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            ← Skip for now & explore as Guest
          </button>
        </div>
      )}
    </div>
  );
}
