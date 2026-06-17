"use client";

import AutomationForm from "@/components/AutomationForm";
import Link from "next/link";

export default function NewAutomationPage() {
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "var(--nf-ink)" }}>
      {/* Page header */}
      <div
        style={{
          borderBottom: "1px solid var(--nf-border)",
          background: "var(--nf-void)",
          padding: "2.5rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--nf-muted)",
              textDecoration: "none",
              marginBottom: "1.25rem",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--nf-body)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--nf-muted)")}
          >
            ← Dashboard
          </Link>

          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--nf-gold)",
              marginBottom: "0.5rem",
            }}
          >
            New Automation
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--nf-bright)",
              lineHeight: 1.1,
            }}
          >
            Configure your digest
          </h1>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <AutomationForm mode="create" />
      </div>
    </div>
  );
}
