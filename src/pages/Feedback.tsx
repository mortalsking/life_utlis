import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Icon from "../components/Icon";
import { useStore } from "../store";

type Feedback = {
  id: number;
  created_at: string;
  user_email: string;
  content: string;
};

export default function FeedbackPage() {
  const { user } = useStore();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setFeedbacks(data);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadFeedbacks = async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (isMounted && !error && data) {
        setFeedbacks(data);
      }
    };
    void loadFeedbacks();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const userEmail = user?.email || "Anonymous";

    const { error } = await supabase.from("feedback").insert([
      {
        content: content.trim(),
        user_email: userEmail,
      },
    ]);

    if (error) {
      setErrorMsg(error.message || "Could not submit feedback. Please try again.");
    } else {
      setContent("");
      setSuccessMsg("Feedback posted successfully!");
      fetchFeedbacks();
    }
    setLoading(false);
  };

  return (
    <div className="page p-1">
      <h2>Forum & Feedback</h2>
      <p className="subtitle">Share your thoughts or issues with the app!</p>
      
      <form onSubmit={handleSubmit} className="card mt-1">
        {errorMsg && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900/50 font-medium mb-2">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-md border border-green-200 dark:border-green-900/50 font-medium mb-2">
            {successMsg}
          </div>
        )}
        <textarea
          className="input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          required
        ></textarea>
        <button type="submit" className="btn primary mt-1" disabled={loading}>
          {loading ? "Posting..." : "Post Feedback"}
        </button>
      </form>

      <div className="mt-2">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="card mt-1">
            <div className="flex-row">
              <Icon name="pen" size={16} />
              <strong>{fb.user_email}</strong>
            </div>
            <p style={{ marginTop: "0.5rem" }}>{fb.content}</p>
            <small style={{ color: "var(--fg-dim)", fontSize: "0.8rem" }}>
              {new Date(fb.created_at).toLocaleString()}
            </small>
          </div>
        ))}
        {feedbacks.length === 0 && <p className="mt-2" style={{textAlign: "center", color: "var(--fg-dim)"}}>No feedback yet. Be the first!</p>}
      </div>
    </div>
  );
}
