import React, { useState } from "react";
import { ISSUANCE_API_URL } from "../config";
import "./Page.css";

type Message = { type: "success" | "error" | "info"; text: string };

export default function IssuancePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setToken(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "Please enter a name." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/issuances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setMessage({
          type: "success",
          text: "Credential issued successfully. Save your token below.",
        });
        setToken(data.id ?? "—");
      } else if (res.status === 200 && data.alreadyPresent) {
        setMessage({
          type: "info",
          text: data.info || "Credentials already exist for this name. Here is your existing token.",
        });
        setToken(data.id ?? "—");
      } else if (res.status === 400) {
        setMessage({
          type: "error",
          text: (data.error as string) || "Name is required.",
        });
      } else if (!res.ok) {
        setMessage({
          type: "error",
          text: (data.error as string) || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const isCorsOrNetwork =
        detail.includes("Failed to fetch") ||
        detail.includes("NetworkError") ||
        detail.includes("Load failed");
      setMessage({
        type: "error",
        text: isCorsOrNetwork
          ? "Cannot reach the issuance service. If the URL works in the browser, this may be a CORS issue—restart the issuance service (it must use the version with CORS enabled)."
          : `Unable to reach the issuance service: ${detail}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Issuance</h1>
      <p className="page-desc">Request a new credential. Enter your name to receive a token.</p>

      <form onSubmit={handleSubmit} className="page-form">
        <label htmlFor="issuance-name">Name</label>
        <input
          id="issuance-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? "Requesting…" : "Request credential"}
        </button>
      </form>

      {message && (
        <div className={`message message-${message.type}`} role="alert">
          {message.text}
        </div>
      )}
      {token && (
        <div className="token-block">
          <label>Your token</label>
          <code className="token-value">{token}</code>
          <p className="token-hint">Use this token on the Verification page to verify your credential.</p>
        </div>
      )}
    </div>
  );
}
