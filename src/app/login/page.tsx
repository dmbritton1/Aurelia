"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
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
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(244,185,66,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        className="animate-fade-up"
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--nf-paper)",
          border: "1px solid var(--nf-border)",
          borderRadius: "12px",
          padding: "2.5rem",
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--nf-gold), transparent)",
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
              color: "var(--nf-gold)",
              marginBottom: "0.625rem",
            }}
          >
            Welcome Back
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
            Sign in to NewsFlow
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

          <div>
            <label
              htmlFor="email"
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
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-dark"
              style={{
                width: "100%",
                borderRadius: "6px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
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
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-dark"
              style={{
                width: "100%",
                borderRadius: "6px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
              }}
            />
          </div>

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
            {loading ? "Signing in…" : "Sign In"}
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
            No account?{" "}
            <Link
              href="/register"
              style={{
                color: "var(--nf-gold)",
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
