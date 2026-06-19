"use client";

import { useState, useEffect } from "react";

export default function PhoneSetup() {
  const [hasPhone, setHasPhone] = useState<boolean | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [inputPhone, setInputPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch("/api/auth/phone")
      .then((r) => r.json())
      .then((data) => {
        setHasPhone(data.hasPhone);
        setMaskedPhone(data.maskedPhone);
        setSmsEnabled(data.hasPhone ? data.smsEnabled : true);
      })
      .catch(() => setHasPhone(false));
  }, []);

  async function save(phone: string, enabled: boolean) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, smsEnabled: enabled }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setHasPhone(true);
      setMaskedPhone(d.maskedPhone);
      setSmsEnabled(enabled);
      setInputPhone("");
      setEditing(false);
      setSuccess(enabled ? "Phone saved — you'll get new digests by text." : "Phone saved (texts paused).");
      setTimeout(() => setSuccess(""), 3500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save phone");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await fetch("/api/auth/phone", { method: "DELETE" });
      setHasPhone(false);
      setMaskedPhone(null);
      setEditing(false);
      setSmsEnabled(true);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  // Toggle SMS on/off for the already-saved number via PATCH (no re-entry).
  async function handleToggle() {
    if (!maskedPhone) return;
    const next = !smsEnabled;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsEnabled: next }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setSmsEnabled(next);
      setSuccess(next ? "Texts resumed." : "Texts paused.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (hasPhone === null) return null;

  const label = (
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
      Text Delivery
    </span>
  );

  // No phone yet — setup banner
  if (!hasPhone && !editing) {
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
            💬
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
              Get digests by text
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
              Add your mobile number and new digests are sent straight to you as a text message.
              Use international format, e.g. <code>+15551234567</code>.
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
                type="tel"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="+15551234567"
                className="input-dark"
                style={{ flex: 1, borderRadius: "5px", padding: "0.6rem 0.875rem", fontSize: "0.85rem" }}
                onKeyDown={(e) => e.key === "Enter" && inputPhone.trim() && save(inputPhone.trim(), true)}
              />
              <button
                onClick={() => save(inputPhone.trim(), true)}
                disabled={saving || !inputPhone.trim()}
                className="btn-gold"
                style={{
                  padding: "0.6rem 1.25rem",
                  cursor: saving || !inputPhone.trim() ? "not-allowed" : "pointer",
                  fontSize: "0.75rem",
                }}
              >
                {saving ? "Saving…" : "Save Number"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editing (new number or changing) — single input row
  if (editing) {
    return (
      <div style={{ marginBottom: "1.75rem" }}>
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
            gap: "0.5rem",
            background: "var(--nf-paper)",
            border: "1px solid var(--nf-border)",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            flexWrap: "wrap",
          }}
        >
          {label}
          <input
            type="tel"
            value={inputPhone}
            onChange={(e) => setInputPhone(e.target.value)}
            placeholder="+15551234567"
            className="input-dark"
            style={{ flex: 1, minWidth: "180px", borderRadius: "4px", padding: "0.4rem 0.625rem", fontSize: "0.8rem" }}
            onKeyDown={(e) => e.key === "Enter" && inputPhone.trim() && save(inputPhone.trim(), smsEnabled)}
            autoFocus
          />
          <button
            onClick={() => save(inputPhone.trim(), smsEnabled)}
            disabled={saving || !inputPhone.trim()}
            className="btn-gold"
            style={{
              padding: "0.4rem 0.875rem",
              cursor: saving || !inputPhone.trim() ? "not-allowed" : "pointer",
              fontSize: "0.7rem",
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setInputPhone("");
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
      </div>
    );
  }

  // Phone set — compact status
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
        {label}

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
          {maskedPhone}
        </code>

        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: smsEnabled ? "var(--nf-emerald)" : "var(--nf-muted)",
          }}
        >
          {smsEnabled ? "Texts on" : "Texts paused"}
        </span>
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: smsEnabled ? "var(--nf-emerald)" : "var(--nf-muted)",
            boxShadow: smsEnabled ? "0 0 6px rgba(45,206,143,0.5)" : "none",
          }}
        />

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.875rem" }}>
          <button
            onClick={handleToggle}
            disabled={saving}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--nf-cobalt)",
              background: "none",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              padding: 0,
            }}
          >
            {smsEnabled ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => {
              setEditing(true);
              setInputPhone("");
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
      </div>
    </div>
  );
}
