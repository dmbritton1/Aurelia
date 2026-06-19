"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AutomationForm from "@/components/AutomationForm";

interface Newsletter {
  id: string;
  title: string;
  generated_at: number;
}

interface Automation {
  id: string;
  name: string;
  topic_prompt: string;
  categories: string[];
  perspective: string;
  length: string;
  frequency: string;
  model?: string;
  active: number;
  share_code: string | null;
}

const PERSPECTIVE_COLORS: Record<string, string> = {
  left: "#4A8FE0",
  "center-left": "#7EB8E0",
  balanced: "#F4B942",
  "center-right": "#E07A7A",
  right: "#E63946",
};

export default function AutomationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [genError, setGenError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/automations/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setAutomation(data.automation);
        setNewsletters(data.newsletters || []);
        setShareCode(data.automation.share_code);
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleGenerate() {
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch(`/api/automations/${id}/generate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/newsletters/${data.newsletter.id}`);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch(`/api/automations/${id}/share`, { method: "POST" });
      const data = await res.json();
      setShareCode(data.share_code);
    } catch { /* ignore */ }
    finally { setSharing(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this automation and all its newsletters?")) return;
    setDeleting(true);
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

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
          Loading…
        </span>
      </div>
    );
  }

  if (!automation) return null;

  const perspColor = PERSPECTIVE_COLORS[automation.perspective] || "var(--nf-gold)";

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "var(--nf-ink)" }}>

      {/* Page header */}
      <div
        style={{
          borderBottom: "1px solid var(--nf-border)",
          background: "var(--nf-void)",
          padding: "2.5rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${perspColor}, transparent 60%)`,
            opacity: 0.6,
          }}
        />

        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
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

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: automation.active ? "var(--nf-emerald)" : "var(--nf-muted)",
                    boxShadow: automation.active ? "0 0 6px rgba(45,206,143,0.5)" : "none",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: automation.active ? "var(--nf-emerald)" : "var(--nf-muted)",
                  }}
                >
                  {automation.active ? "Active" : "Paused"}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 700,
                  color: "var(--nf-bright)",
                  lineHeight: 1.1,
                }}
              >
                {automation.name}
              </h1>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowEdit(!showEdit)}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  border: "1px solid var(--nf-border-hi)",
                  background: showEdit ? "rgba(244,185,66,0.1)" : "transparent",
                  color: showEdit ? "var(--nf-gold)" : "var(--nf-sub)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {showEdit ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  border: "1px solid rgba(230,57,70,0.3)",
                  background: "transparent",
                  color: "#E63946",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {showEdit ? (
          <div
            style={{
              background: "var(--nf-paper)",
              border: "1px solid var(--nf-border)",
              borderRadius: "12px",
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--nf-bright)",
                marginBottom: "1.5rem",
              }}
            >
              Edit Digest
            </h2>
            <AutomationForm
              mode="edit"
              automationId={id}
              initial={{
                name: automation.name,
                topic_prompt: automation.topic_prompt,
                categories: automation.categories,
                perspective: automation.perspective,
                length: automation.length || "standard",
                frequency: automation.frequency,
                model: automation.model,
              }}
            />
          </div>
        ) : (
          <div
            style={{
              background: "var(--nf-paper)",
              border: "1px solid var(--nf-border)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: "var(--nf-sub)",
                marginBottom: "1.25rem",
              }}
            >
              {automation.topic_prompt}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {automation.categories.map((c: string) => (
                <span
                  key={c}
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--nf-sub)",
                    background: "var(--nf-surface)",
                    border: "1px solid var(--nf-border)",
                    borderRadius: "3px",
                    padding: "0.2rem 0.5rem",
                  }}
                >
                  {c}
                </span>
              ))}
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: perspColor,
                  background: `${perspColor}12`,
                  border: `1px solid ${perspColor}30`,
                  borderRadius: "3px",
                  padding: "0.2rem 0.5rem",
                }}
              >
                {automation.perspective}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--nf-sub)",
                  background: "var(--nf-surface)",
                  border: "1px solid var(--nf-border)",
                  borderRadius: "3px",
                  padding: "0.2rem 0.5rem",
                }}
              >
                {automation.frequency}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-gold"
            style={{
              padding: "0.75rem 1.75rem",
              cursor: generating ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
            }}
          >
            {generating ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                    display: "inline-block",
                  }}
                />
                Generating…
              </span>
            ) : (
              "Generate Digest Now"
            )}
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="btn-ghost"
            style={{
              padding: "0.75rem 1.5rem",
              cursor: sharing ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
            }}
          >
            {sharing ? "Sharing…" : "Share Template"}
          </button>
        </div>

        {genError && (
          <div
            style={{
              background: "rgba(230,57,70,0.1)",
              border: "1px solid rgba(230,57,70,0.3)",
              borderRadius: "6px",
              padding: "0.875rem 1rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              color: "#E63946",
              marginBottom: "1.5rem",
            }}
          >
            {genError}
          </div>
        )}

        {shareCode && (
          <div
            style={{
              background: "rgba(74,143,224,0.08)",
              border: "1px solid rgba(74,143,224,0.25)",
              borderRadius: "8px",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--nf-cobalt)",
                marginBottom: "0.5rem",
              }}
            >
              Share Link
            </p>
            <code
              style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: "0.85rem",
                color: "var(--nf-body)",
                wordBreak: "break-all",
              }}
            >
              {typeof window !== "undefined" ? window.location.origin : ""}/shared/{shareCode}
            </code>
          </div>
        )}

        {/* Newsletters list */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--nf-bright)",
              }}
            >
              Generated Digests
            </h2>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--nf-muted)",
                background: "var(--nf-surface)",
                border: "1px solid var(--nf-border)",
                borderRadius: "20px",
                padding: "0.25rem 0.75rem",
              }}
            >
              {newsletters.length}
            </span>
          </div>

          {newsletters.length === 0 ? (
            <div
              style={{
                border: "1px dashed var(--nf-border-hi)",
                borderRadius: "8px",
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--nf-muted)",
                  lineHeight: 1.6,
                }}
              >
                No digests generated yet.
                <br />
                Click <strong style={{ color: "var(--nf-gold)" }}>Generate Digest Now</strong> to create your first.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1px",
                background: "var(--nf-border)",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--nf-border)",
              }}
            >
              {newsletters.map((nl, i) => (
                <NewsletterRow key={nl.id} newsletter={nl} isFirst={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsletterRow({ newsletter, isFirst }: { newsletter: Newsletter; isFirst: boolean }) {
  const [hovered, setHovered] = useState(false);
  const date = new Date(newsletter.generated_at * 1000);

  return (
    <Link
      href={`/newsletters/${newsletter.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.25rem",
        background: hovered ? "var(--nf-surface)" : "var(--nf-paper)",
        textDecoration: "none",
        transition: "background 0.15s ease",
        gap: "1rem",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
        {isFirst && (
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--nf-gold)",
              background: "rgba(244,185,66,0.1)",
              border: "1px solid rgba(244,185,66,0.2)",
              borderRadius: "3px",
              padding: "0.15rem 0.45rem",
              flexShrink: 0,
            }}
          >
            Latest
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: hovered ? "var(--nf-bright)" : "var(--nf-body)",
            transition: "color 0.15s ease",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {newsletter.title}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
        <time
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.7rem",
            color: "var(--nf-muted)",
            letterSpacing: "0.03em",
          }}
        >
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </time>
        <span
          style={{
            color: hovered ? "var(--nf-gold)" : "var(--nf-border-hi)",
            fontSize: "0.75rem",
            transition: "color 0.15s ease, transform 0.15s ease",
            transform: hovered ? "translateX(3px)" : "translateX(0)",
            display: "inline-block",
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
