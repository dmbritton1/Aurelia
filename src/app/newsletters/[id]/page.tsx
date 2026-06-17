"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewsletterView from "@/components/NewsletterView";

export default function NewsletterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [newsletter, setNewsletter] = useState<{
    id: string;
    title: string;
    summary_html: string;
    sources: { url: string; title: string; outlet: string; lean: string }[];
    generated_at: number;
    automation_id: string;
  } | null>(null);
  const [automationName, setAutomationName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/newsletters/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setNewsletter(data.newsletter);
        setAutomationName(data.automation?.name || "");
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 60px)",
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
          Loading digest…
        </span>
      </div>
    );
  }

  if (!newsletter) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "var(--nf-ink)" }}>
      {/* Breadcrumb strip */}
      <div
        style={{
          borderBottom: "1px solid var(--nf-border)",
          background: "var(--nf-void)",
          padding: "1rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <Link
            href={`/automations/${newsletter.automation_id}`}
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
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--nf-body)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--nf-muted)")}
          >
            ← {automationName || "Back to Automation"}
          </Link>
        </div>
      </div>

      {/* Article content */}
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
        }}
      >
        <NewsletterView newsletter={newsletter} />
      </div>
    </div>
  );
}
