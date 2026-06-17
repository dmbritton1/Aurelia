"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AutomationCard from "@/components/AutomationCard";
import ApiKeySetup from "@/components/ApiKeySetup";

interface Automation {
  id: string;
  name: string;
  topic_prompt: string;
  categories: string[];
  perspective: string;
  frequency: string;
  active: number;
  updated_at: number;
}

export default function DashboardPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/automations")
      .then((r) => r.json())
      .then((data) => setAutomations(data.automations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = automations.filter((a) => a.active).length;

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
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div>
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
                Dashboard
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                  fontWeight: 700,
                  color: "var(--nf-bright)",
                  lineHeight: 1.1,
                }}
              >
                Your Digests
              </h1>
            </div>

            <Link
              href="/automations/new"
              className="btn-gold"
              style={{
                padding: "0.75rem 1.5rem",
                textDecoration: "none",
                display: "inline-block",
                fontSize: "0.75rem",
              }}
            >
              + New Digest
            </Link>
          </div>

          {/* Stats bar */}
          {!loading && automations.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "1px",
                background: "var(--nf-border)",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--nf-border)",
              }}
            >
              {[
                { label: "Total Digests", value: automations.length },
                { label: "Active", value: activeCount, color: "var(--nf-emerald)" },
                { label: "Paused", value: automations.length - activeCount, color: "var(--nf-muted)" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    background: "var(--nf-paper)",
                    padding: "1rem 1.25rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: stat.color || "var(--nf-bright)",
                      lineHeight: 1,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--nf-muted)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <ApiKeySetup />

        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "6rem 0",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "2px solid var(--nf-border)",
                borderTopColor: "var(--nf-gold)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                color: "var(--nf-muted)",
              }}
            >
              Loading your digests…
            </span>
          </div>
        ) : automations.length === 0 ? (
          <div
            style={{
              border: "1px dashed var(--nf-border-hi)",
              borderRadius: "12px",
              padding: "5rem 2rem",
              textAlign: "center",
              background: "var(--nf-paper)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "4rem",
                lineHeight: 1,
                color: "var(--nf-border-hi)",
                marginBottom: "1.5rem",
              }}
            >
              ◆
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--nf-bright)",
                marginBottom: "0.75rem",
              }}
            >
              No digests yet
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                color: "var(--nf-sub)",
                marginBottom: "2rem",
                maxWidth: "380px",
                margin: "0 auto 2rem",
                lineHeight: 1.65,
              }}
            >
              Create your first news digest automation to start receiving AI-curated intelligence.
            </p>
            <Link
              href="/automations/new"
              className="btn-gold"
              style={{
                padding: "0.875rem 2rem",
                textDecoration: "none",
                display: "inline-block",
                fontSize: "0.8rem",
              }}
            >
              Create Your First Digest
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1px",
              background: "var(--nf-border)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--nf-border)",
            }}
          >
            {automations.map((a) => (
              <AutomationCard key={a.id} automation={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
