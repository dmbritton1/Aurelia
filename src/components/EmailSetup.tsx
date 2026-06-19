"use client";

import { useState, useEffect } from "react";

export default function EmailSetup() {
  const [loginEmail, setLoginEmail] = useState<string | null>(null);
  const [deliveryEmail, setDeliveryEmail] = useState<string | null>(null);
  const [effectiveEmail, setEffectiveEmail] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  function apply(data: {
    loginEmail: string | null;
    deliveryEmail: string | null;
    effectiveEmail: string | null;
    emailEnabled: boolean;
  }) {
    setLoginEmail(data.loginEmail);
    setDeliveryEmail(data.deliveryEmail);
    setEffectiveEmail(data.effectiveEmail);
    setEnabled(data.emailEnabled);
  }

  useEffect(() => {
    fetch("/api/auth/email")
      .then((r) => r.json())
      .then(apply)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function patch(body: Record<string, unknown>, msg: string) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      apply(d);
      setEditing(false);
      setInput("");
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 3500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded || !loginEmail) return null;

  const usingOverride = !!deliveryEmail;

  const labelEl = (
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
      Email Delivery
    </span>
  );

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
        {labelEl}

        {editing ? (
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "0.5rem", minWidth: "220px" }}>
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loginEmail}
              className="input-dark"
              style={{ flex: 1, borderRadius: "4px", padding: "0.4rem 0.625rem", fontSize: "0.8rem" }}
              onKeyDown={(e) =>
                e.key === "Enter" && input.trim() && patch({ deliveryEmail: input.trim() }, "Delivery email updated.")
              }
              autoFocus
            />
            <button
              onClick={() => patch({ deliveryEmail: input.trim() }, "Delivery email updated.")}
              disabled={saving || !input.trim()}
              className="btn-gold"
              style={{
                padding: "0.4rem 0.875rem",
                cursor: saving || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "0.7rem",
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setInput("");
                setError("");
              }}
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
              {effectiveEmail}
            </code>

            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: enabled ? "var(--nf-emerald)" : "var(--nf-muted)",
              }}
            >
              {enabled ? "On" : "Off"}
            </span>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: enabled ? "var(--nf-emerald)" : "var(--nf-muted)",
                boxShadow: enabled ? "0 0 6px rgba(45,206,143,0.5)" : "none",
              }}
            />

            <div style={{ marginLeft: "auto", display: "flex", gap: "0.875rem", alignItems: "center" }}>
              <button
                onClick={() => {
                  setEditing(true);
                  setInput(deliveryEmail || "");
                }}
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
              {usingOverride && (
                <button
                  onClick={() => patch({ deliveryEmail: "" }, "Reverted to your login email.")}
                  disabled={saving}
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--nf-muted)",
                    background: "none",
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    padding: 0,
                  }}
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => patch({ emailEnabled: !enabled }, !enabled ? "New digests will be emailed to you." : "Email delivery paused.")}
                disabled={saving}
                className={enabled ? undefined : "btn-gold"}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: enabled ? "var(--nf-cobalt)" : undefined,
                  background: enabled ? "none" : undefined,
                  border: enabled ? "none" : undefined,
                  padding: enabled ? 0 : "0.45rem 0.9rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {enabled ? "Turn off" : "Email me new digests"}
              </button>
            </div>
          </>
        )}
      </div>

      {usingOverride && !editing && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            color: "var(--nf-muted)",
            marginTop: "0.5rem",
          }}
        >
          Digests go to this address instead of your login email ({loginEmail}).
        </p>
      )}
    </div>
  );
}
