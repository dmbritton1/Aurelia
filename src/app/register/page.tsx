"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "var(--nf-void)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(74,143,224,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        className="animate-fade-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--nf-paper)",
          border: "1px solid var(--nf-border)",
          borderRadius: "12px",
          padding: "2.5rem",
          position: "relative",
        }}
      >
        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--nf-cobalt), transparent)",
            borderRadius: "1px",
          }}
        />

        {/* Header */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--nf-cobalt)",
              marginBottom: "0.625rem",
            }}
          >
            Get Started Free
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--nf-bright)",
              lineHeight: 1.1,
            }}
          >
            Create your account
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div
              style={{
                background: "rgba(230,57,70,0.1)",
                border: "1px solid rgba(230,57,70,0.3)",
                borderRadius: "6px",
                padding: "0.75rem 1rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: "#E63946",
              }}
            >
              {error}
            </div>
          )}

          {[
            { id: "name", label: "Full Name", type: "text", value: name, set: setName, placeholder: "Your name" },
            { id: "email", label: "Email", type: "email", value: email, set: setEmail, placeholder: "you@example.com" },
            { id: "password", label: "Password", type: "password", value: password, set: setPassword, placeholder: "Min. 6 characters" },
          ].map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                style={{
                  display: "block",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--nf-sub)",
                  marginBottom: "0.5rem",
                }}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                required
                minLength={field.id === "password" ? 6 : undefined}
                className="input-dark"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              width: "100%",
              padding: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
              marginTop: "0.25rem",
            }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center" }}>
          <div className="rule-gold" style={{ marginBottom: "1.25rem" }} />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              color: "var(--nf-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--nf-gold)",
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
