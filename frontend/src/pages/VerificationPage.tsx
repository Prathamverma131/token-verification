import React, { useState } from "react";
import { VERIFICATION_API_URL } from "../config";
import "./Page.css";

type Message = { type: "success" | "error"; text: string };

export default function VerificationPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [result, setResult] = useState<{
    worker_id: string;
    issuance_record: Record<string, unknown>;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setResult(null);

    const trimmed = token.trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "Please enter a token to verify." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/verification/${encodeURIComponent(trimmed)}`
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Token verified successfully.",
        });
        setResult({
          worker_id: data.worker_id ?? "—",
          issuance_record: data.issuance_record ?? {},
        });
      } else if (res.status === 404) {
        setMessage({
          type: "error",
          text: (data.error as string) || "No issuance found for this token.",
        });
      } else {
        setMessage({
          type: "error",
          text: (data.error as string) || (data.message as string) || "Verification failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Unable to reach the verification service. Please check that it is running and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Verification</h1>
      <p className="page-desc">Verify a credential by entering the token you received during issuance.</p>

      <form onSubmit={handleSubmit} className="page-form">
        <label htmlFor="verification-token">Token</label>
        <input
          id="verification-token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your token here"
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying…" : "Verify token"}
        </button>
      </form>

      {message && (
        <div className={`message message-${message.type}`} role="alert">
          {message.text}
        </div>
      )}
      {result && (
        <div className="result-block">
          <p><strong>Verified by worker:</strong> <code>{result.worker_id}</code></p>
          <details>
            <summary>Issuance record</summary>
            <pre className="result-json">
              {JSON.stringify(result.issuance_record, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
