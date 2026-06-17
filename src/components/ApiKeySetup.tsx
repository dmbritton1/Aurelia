"use client";

import { useState, useEffect } from "react";

export default function ApiKeySetup() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch("/api/auth/apikey")
      .then((r) => r.json())
      .then((data) => { setHasKey(data.hasKey); setMaskedKey(data.maskedKey); })
      .catch(() => setHasKey(false));
  }, []);

  async function handleSave() {
    if (!inputKey.trim()) return;
    setSaving(true);
    setError(""); setSuccess("");

    try {
      const res = await fetch("/api/auth/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: inputKey.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setHasKey(true);
      setMaskedKey(inputKey.trim().slice(0, 6) + "..." + inputKey.trim().slice(-4));
      setInputKey(""); setEditing(false);
      setSuccess("API key saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await fetch("/api/auth/apikey", { method: "DELETE" });
      setHasKey(false); setMaskedKey(null); setEditing(false);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  if (hasKey === null) return null;

  // No key — setup banner
  if (!hasKey && !editing) {
    return (
      <div
        style={{
          background: "rgba(74,143,224,0.06)",
          border: "1px solid rgba(74,143,224,0.2)",
          borderRadius: "10px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(74,143,224,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "1rem",
            }}
          >
            🔑
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: "var(--nf-bright)",
                marginBottom: "0.375rem",
              }}
            >
              Gemini API Key Required
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: "var(--nf-sub)",
                lineHeight: 1.5,
                marginBottom: "0.5rem",
              }}
            >
              NewsFlow uses Google&apos;s Gemini AI to generate your digests.{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--nf-cobalt)",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(74,143,224,0.35)",
                }}
              >
                Get a free key →
              </a>
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(230,57,70,0.1)",
                  border: "1px solid rgba(230,57,70,0.3)",
                  borderRadius: "4px",
                  padding: "0.5rem 0.75rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  color: "#E63946",
                  marginBottom: "0.75rem",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste your Gemini API key…"
                className="input-dark"
                style={{
                  flex: 1,
                  borderRadius: "5px",
                  padding: "0.6rem 0.875rem",
                  fontSize: "0.85rem",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={saving || !inputKey.trim()}
                className="btn-gold"
                style={{
                  padding: "0.6rem 1.25rem",
                  cursor: saving || !inputKey.trim() ? "not-allowed" : "pointer",
                  fontSize: "0.75rem",
                }}
              >
                {saving ? "Saving…" : "Save Key"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Key set — compact status
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      {success && (
        <div
          style={{
            background: "rgba(45,206,143,0.08)",
            border: "1px solid rgba(45,206,143,0.2)",
            borderRadius: "6px",
            padding: "0.625rem 0.875rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--nf-emerald)",
            marginBottom: "0.75rem",
          }}
        >
          {success}
        </div>
      )}
      {error && (
        <div
          style={{
            background: "rgba(230,57,70,0.1)",
            border: "1px solid rgba(230,57,70,0.3)",
            borderRadius: "6px",
            padding: "0.625rem 0.875rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "#E63946",
            marginBottom: "0.75rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: "var(--nf-paper)",
          border: "1px solid var(--nf-border)",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--nf-muted)",
          }}
        >
          Gemini API
        </span>

        {editing ? (
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "0.5rem", minWidth: "200px" }}>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="New key…"
              className="input-dark"
              style={{
                flex: 1,
                borderRadius: "4px",
                padding: "0.4rem 0.625rem",
                fontSize: "0.8rem",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={saving || !inputKey.trim()}
              className="btn-gold"
              style={{
                padding: "0.4rem 0.875rem",
                cursor: saving || !inputKey.trim() ? "not-allowed" : "pointer",
                fontSize: "0.7rem",
              }}
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setInputKey(""); setError(""); }}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.7rem",
                color: "var(--nf-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.4rem 0.25rem",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <code
              style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: "0.78rem",
                color: "var(--nf-sub)",
                background: "var(--nf-surface)",
                border: "1px solid var(--nf-border)",
                borderRadius: "3px",
                padding: "0.2rem 0.5rem",
              }}
            >
              {maskedKey}
            </code>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--nf-emerald)",
                boxShadow: "0 0 6px rgba(45,206,143,0.5)",
              }}
              title="Connected"
            />
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.875rem" }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--nf-cobalt)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                disabled={saving}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#E63946",
                  background: "none",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  padding: 0,
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
