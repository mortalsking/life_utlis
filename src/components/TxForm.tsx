import { useState } from "react";
import { useStore } from "../store";
import { CATEGORIES } from "../types";
import { todayISO } from "../utils";

export default function TxForm({ onSaved }: { onSaved?: () => void }) {
  const { addTx } = useStore();
  const [kind, setKind] = useState<"expense" | "saved">("expense");
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Food");
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    addTx({
      date,
      kind,
      category: kind === "expense" ? category : "—",
      amount: amt,
      note: note.trim() || undefined,
    });
    setAmount("");
    setNote("");
    onSaved?.();
  }

  return (
    <form className="card form" onSubmit={submit}>
      <div className="seg">
        <button
          type="button"
          className={kind === "expense" ? "on" : ""}
          onClick={() => setKind("expense")}
        >
          Spent
        </button>
        <button
          type="button"
          className={kind === "saved" ? "on good" : ""}
          onClick={() => setKind("saved")}
        >
          Saved
        </button>
      </div>

      <div className="grid2">
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Amount
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="150"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
      </div>

      {kind === "expense" && (
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Note
        <input
          type="text"
          placeholder={kind === "expense" ? "Lunch, auto fare…" : "Cooked at home, didn't order"}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <button className="btn primary" type="submit">
        {kind === "expense" ? "Add expense" : "Add savings"}
      </button>
    </form>
  );
}
