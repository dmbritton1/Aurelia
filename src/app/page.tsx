"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import CategoryPicker from "@/components/CategoryPicker";
import PerspectiveSlider from "@/components/PerspectiveSlider";
import LengthSlider, { LENGTHS } from "@/components/LengthSlider";

/* ───────────────────────── HOME ───────────────────────── */

export default function Home() {
  const router = useRouter();
  const [demoing, setDemoing] = useState(false);

  async function handleDemo() {
    setDemoing(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      /* ignore */
    } finally {
      setDemoing(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Hero demoing={demoing} onDemo={handleDemo} />
      <TrustStrip />
      <Capabilities />
      <DarkFeatureBand />
      <Products />
      <Research />
      <Contact />
      <FooterNewsletter />
    </div>
  );
}

/* ───────────────────────── HERO ───────────────────────── */

function Hero({ demoing, onDemo }: { demoing: boolean; onDemo: () => void }) {
  return (
    <section style={{ background: "var(--canvas)", paddingTop: "5rem", overflow: "hidden" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Eyebrow + monumental headline */}
        <div style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center" }}>
          <p className="t-mono rise" style={{ color: "var(--steel)", marginBottom: "1.75rem" }}>
            Enterprise AI for the News Desk
          </p>
          <h1 className="t-hero rise-1" style={{ marginBottom: "1.75rem" }}>
            Intelligence,
            <br />
            without the noise.
          </h1>
          <p
            className="t-body-lg rise-2"
            style={{
              maxWidth: "560px",
              margin: "0 auto 2.5rem",
              color: "var(--slate)",
            }}
          >
            Aurelia turns the open news ecosystem into a single, citation-backed
            briefing — tuned to your beat, balanced to your editorial lens, and
            transparent down to the source.
          </p>
          <div
            className="rise-3"
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "4.5rem",
            }}
          >
            <Link href="/register" className="btn-primary">
              Request a demo
            </Link>
            <button onClick={onDemo} disabled={demoing} className="btn-secondary">
              {demoing ? "Loading…" : "Explore the product →"}
            </button>
          </div>
        </div>

        {/* Live, interactive product demo */}
        <div className="rise-4">
          <DigestStudioDemo />
        </div>
      </div>
    </section>
  );
}

/* ── Live demo vocabulary — mirrors the real digest customizations ── */
const PREVIEW_PERSPECTIVE: Record<string, { label: string; color: string }> = {
  left: { label: "Left", color: "#4A8FE0" },
  "center-left": { label: "Ctr-Left", color: "#7EB8E0" },
  balanced: { label: "Balanced", color: "#F4B942" },
  "center-right": { label: "Ctr-Right", color: "#E07A7A" },
  right: { label: "Right", color: "#E63946" },
};
const PREVIEW_FREQ: Record<string, { icon: string; label: string }> = {
  realtime: { icon: "⚡", label: "Real-time" },
  daily: { icon: "◑", label: "Daily" },
  weekly: { icon: "○", label: "Weekly" },
};

/* The same story, re-framed for each editorial lens — so toggling
   perspective visibly changes the generated briefing. */
const STUDIO_SAMPLES: Record<string, { headline: string; body: string }> = {
  left: {
    headline: "Senate moves to rein in frontier AI as oversight bill clears committee",
    body: "Backers framed the measure as overdue accountability for an industry that has outpaced its own guardrails, pointing to labor displacement and opaque training data as reasons the public deserves enforceable transparency before the next generation of models ever reaches the market.",
  },
  "center-left": {
    headline: "Oversight bill advances with new transparency mandates for AI labs",
    body: "The committee folded in disclosure requirements that supporters say close real accountability gaps, even as several members pushed to soften the reporting burden on smaller startups, leaving a compromise that now heads toward a floor vote few are willing to call.",
  },
  balanced: {
    headline: "Senate advances framework bill on frontier-model oversight",
    body: "A bipartisan committee moved the oversight framework forward ahead of a key floor vote, with supporters citing new transparency requirements and opponents questioning compliance costs, while analysts say its fate now hinges on a narrow band of undecided members weighing both arguments.",
  },
  "center-right": {
    headline: "AI oversight bill clears committee, but cost questions linger",
    body: "Negotiators trimmed several mandates to limit the burden on emerging firms and framed the revised text as a lighter-touch approach, drawing cautious praise from industry groups that still warned vague definitions could invite uneven enforcement down the line.",
  },
  right: {
    headline: "Committee passes AI bill as critics warn of regulatory overreach",
    body: "Opponents cautioned that sweeping definitions could hand regulators broad discretion and chill domestic innovation, arguing the market rather than Washington should set the pace, while backers countered that baseline rules are long overdue for the most capable systems.",
  },
};

function previewChip(color?: string): CSSProperties {
  const base: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.55rem",
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderRadius: "3px",
    padding: "0.2rem 0.45rem",
  };
  if (color) {
    return { ...base, color, background: `${color}1f`, border: `1px solid ${color}3d` };
  }
  return { ...base, color: "var(--nf-sub)", background: "var(--nf-surface)", border: "1px solid var(--nf-border)" };
}

/* An interactive demo of the real digest customizations. The controls
   are the exact components used in the app; the briefing on the right
   re-renders as you tune them, and its paragraph is clamped with an
   ellipsis to hint at the full digest behind it. */
function DigestStudioDemo() {
  const [categories, setCategories] = useState<string[]>(["Politics", "Tech"]);
  const [perspective, setPerspective] = useState("balanced");
  const [length, setLength] = useState("standard");
  const [frequency, setFrequency] = useState("daily");

  const persp = PREVIEW_PERSPECTIVE[perspective];
  const sample = STUDIO_SAMPLES[perspective];
  const lengthInfo = LENGTHS.find((l) => l.value === length) || LENGTHS[2];

  return (
    <div className="studio">
      {/* Window chrome */}
      <div className="studio-chrome">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="studio-live-dot" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--nf-gold)",
            }}
          >
            Aurelia Studio · Live demo
          </span>
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--nf-muted)",
          }}
        >
          Tune it — watch it rewrite
        </span>
      </div>

      <div className="studio-grid">
        {/* ── CONFIG ── */}
        <div className="studio-config">
          <StudioSection label="Topic prompt">
            <div className="studio-prompt">
              Frontier-AI policy and what it means for startups — US &amp; EU, in the read I choose
              <span className="studio-caret" />
            </div>
          </StudioSection>

          <StudioSection label="Content categories">
            <CategoryPicker selected={categories} onChange={setCategories} />
          </StudioSection>

          <StudioSection label="Perspective">
            <PerspectiveSlider value={perspective} onChange={setPerspective} />
          </StudioSection>

          <StudioSection label="Length">
            <LengthSlider value={length} onChange={setLength} />
          </StudioSection>

          <StudioSection label="Frequency">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.375rem" }}>
              {(["realtime", "daily", "weekly"] as const).map((f) => {
                const active = frequency === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "0.55rem 0.25rem",
                      borderRadius: "4px",
                      border: active ? "1px solid rgba(244,185,66,0.45)" : "1px solid var(--nf-border)",
                      background: active ? "rgba(244,185,66,0.12)" : "var(--nf-paper)",
                      color: active ? "var(--nf-gold)" : "var(--nf-muted)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      outline: "none",
                    }}
                  >
                    {PREVIEW_FREQ[f].icon} {PREVIEW_FREQ[f].label}
                  </button>
                );
              })}
            </div>
          </StudioSection>
        </div>

        {/* ── LIVE PREVIEW ── */}
        <div className="studio-preview">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--nf-muted)",
              }}
            >
              Live preview
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--nf-muted)",
              }}
            >
              From 4,200 sources
            </span>
          </div>

          <div key={perspective} className="studio-result fade-in">
            <div className="studio-accent" style={{ background: `linear-gradient(90deg, ${persp.color}, transparent)` }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--nf-emerald)",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--nf-emerald)",
                    boxShadow: "0 0 6px rgba(47,158,107,0.5)",
                  }}
                />
                Fresh today
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--nf-muted)",
                }}
              >
                ≈ {lengthInfo.range}
              </span>
            </div>

            <h4 className="studio-headline">{sample.headline}</h4>
            <p className="studio-body">{sample.body}</p>

            {/* inline citations */}
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {["Reuters", "AP", "Bloomberg"].map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.55rem",
                    color: "var(--nf-cobalt)",
                    background: "rgba(37,99,235,0.08)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    borderRadius: "3px",
                    padding: "0.15rem 0.4rem",
                  }}
                >
                  [{s}]
                </span>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.6rem",
                borderTop: "1px solid var(--nf-border)",
                paddingTop: "0.85rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                <span style={previewChip(persp.color)}>{persp.label}</span>
                <span style={previewChip()}>
                  {PREVIEW_FREQ[frequency].icon} {PREVIEW_FREQ[frequency].label}
                </span>
                {categories.slice(0, 2).map((c) => (
                  <span key={c} style={previewChip()}>
                    {c}
                  </span>
                ))}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: "var(--nf-cobalt)",
                  whiteSpace: "nowrap",
                }}
              >
                Read full digest →
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .studio {
          position: relative;
          background: var(--nf-void);
          border: 1px solid var(--nf-border);
          border-radius: var(--r-lg);
          overflow: hidden;
          box-shadow: 0 30px 70px -34px rgba(15,42,74,0.34);
        }
        .studio-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.85rem 1.25rem;
          background: var(--nf-paper);
          border-bottom: 1px solid var(--nf-border);
        }
        .studio-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--nf-emerald);
          box-shadow: 0 0 0 0 rgba(47,158,107,0.5);
          animation: statusPulse 2.4s ease-in-out infinite;
        }
        .studio-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: stretch;
        }
        .studio-config {
          padding: 1.5rem 1.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .studio-preview {
          padding: 1.5rem 1.5rem 1.75rem;
          background: var(--nf-ink);
          border-left: 1px solid var(--nf-border);
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 900px) {
          .studio-grid { grid-template-columns: 1fr; }
          .studio-preview { border-left: none; border-top: 1px solid var(--nf-border); }
        }
        .studio-prompt {
          position: relative;
          font-family: var(--font-body);
          font-size: 0.85rem;
          line-height: 1.55;
          color: var(--nf-body);
          background: var(--nf-paper);
          border: 1px solid var(--nf-border);
          border-radius: 6px;
          padding: 0.7rem 0.85rem;
        }
        .studio-caret {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: var(--nf-gold);
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 1.1s step-end infinite;
        }
        .studio-result {
          position: relative;
          background: var(--nf-paper);
          border: 1px solid var(--nf-border);
          border-radius: 10px;
          padding: 1.2rem 1.25rem 1.05rem;
          overflow: hidden;
        }
        .studio-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
        }
        .studio-headline {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: var(--nf-bright);
          margin: 0 0 0.6rem;
        }
        .studio-body {
          font-family: var(--font-body);
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--nf-sub);
          margin: 0 0 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function StudioSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-ui)",
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--nf-body)",
          marginBottom: "0.6rem",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ───────────────────────── TRUST STRIP ───────────────────────── */

function TrustStrip() {
  const logos = ["MERIDIAN", "NORTHWIND", "CIVICA", "HELIOS", "BYLINE", "ATLAS"];
  return (
    <section style={{ background: "var(--canvas)", padding: "7rem 1.5rem 6rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        <p className="t-caption" style={{ color: "var(--muted)", marginBottom: "3.5rem" }}>
          Trusted by editorial and research teams across the industry
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "3.5rem 5rem",
          }}
        >
          {logos.map((l) => (
            <span
              key={l}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "1.25rem",
                letterSpacing: "0.04em",
                color: "var(--ash)",
              }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CAPABILITIES ───────────────────────── */

function Capabilities() {
  const items = [
    {
      icon: <IconTopics />,
      title: "Natural-language beats",
      body: "Describe what you cover in plain language. Aurelia interprets intent — no rigid category trees, no keyword juggling.",
    },
    {
      icon: <IconCitation />,
      title: "Inline citations",
      body: "Every claim traces to its origin. Hover, verify, and cite without leaving the briefing.",
    },
    {
      icon: <IconLens />,
      title: "Perspective control",
      body: "Set an editorial lens from left to right, or hold the center to see every angle of a developing story.",
    },
    {
      icon: <IconDedup />,
      title: "Continuous dedup",
      body: "Yesterday's news stays in yesterday. The engine filters repeats so each digest is genuinely fresh.",
    },
    {
      icon: <IconTransparency />,
      title: "Source transparency",
      body: "See exactly which outlets were consulted and their editorial lean for every brief you generate.",
    },
    {
      icon: <IconShare />,
      title: "Shareable configs",
      body: "Package a beat as a portable configuration and hand it to a colleague or your whole desk.",
    },
  ];

  return (
    <section id="capabilities" style={{ background: "var(--pale-sky)", padding: "7rem 1.5rem" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ maxWidth: "640px", marginBottom: "4rem" }}>
          <p className="t-mono" style={{ color: "var(--steel)", marginBottom: "1.25rem" }}>
            Capabilities
          </p>
          <h2 className="t-section-display" style={{ color: "var(--ink)" }}>
            A research lab for the daily news cycle.
          </h2>
        </div>

        <div className="cap-grid">
          {items.map((it) => (
            <article
              key={it.title}
              style={{
                background: "var(--canvas)",
                borderRadius: "var(--r-md)",
                padding: "2rem",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              <div style={{ color: "var(--sapphire)", marginBottom: "1.5rem" }}>{it.icon}</div>
              <h3 className="t-feature-heading" style={{ color: "var(--ink)", marginBottom: "0.625rem" }}>
                {it.title}
              </h3>
              <p style={{ color: "var(--slate)", fontSize: "0.9375rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                {it.body}
              </p>
              <Link href="/register" className="btn-secondary" style={{ fontSize: "0.875rem" }}>
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .cap-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1000px) { .cap-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .cap-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

/* ───────────────────────── DARK FEATURE BAND ───────────────────────── */

function DarkFeatureBand() {
  const points = [
    { k: "SOC 2 Type II", v: "Audited controls across the entire pipeline." },
    { k: "Private retrieval", v: "Your beats and prompts never train shared models." },
    { k: "Citation ledger", v: "Every generated line keeps an immutable source trail." },
  ];
  return (
    <section style={{ background: "var(--deep-sapphire)", padding: "7rem 1.5rem", position: "relative", overflow: "hidden" }}>
      <div className="hairline-grid" style={{ position: "absolute", inset: 0, opacity: 0.06 }} />
      <div style={{ maxWidth: "1180px", margin: "0 auto", position: "relative" }}>
        <div className="band-grid">
          <div>
            <p className="t-mono" style={{ color: "var(--sky)", marginBottom: "1.25rem" }}>
              Trust &amp; Security
            </p>
            <h2 className="t-section-heading" style={{ color: "#fff", marginBottom: "1.5rem" }}>
              Built for desks that can&rsquo;t afford to be wrong.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", lineHeight: 1.5, marginBottom: "2rem", maxWidth: "440px" }}>
              Aurelia is an accountability system as much as a generation system.
              Provenance is preserved end to end, so editors can stand behind every word.
            </p>
            <Link href="/register" className="btn-primary btn-primary--invert">
              Talk to our team
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--on-dark-border)", borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--on-dark-border)" }}>
            {points.map((p) => (
              <div key={p.k} style={{ background: "rgba(255,255,255,0.03)", padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <CheckGlyph />
                  <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "1.125rem", letterSpacing: "-0.01em" }}>
                    {p.k}
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem", margin: "0 0 0 2rem", lineHeight: 1.45 }}>
                  {p.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .band-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 880px) { .band-grid { grid-template-columns: 1fr; gap: 2.5rem; } }
      `}</style>
    </section>
  );
}

/* ───────────────────────── PRODUCTS ───────────────────────── */

function Products() {
  const tiers = [
    {
      name: "Reader",
      tag: "For individuals",
      blurb: "Personal daily intelligence.",
      bullets: ["One active beat", "Balanced perspective", "Inline citations", "Email delivery"],
    },
    {
      name: "Desk",
      tag: "For teams",
      blurb: "Shared briefings for a newsroom.",
      bullets: ["Unlimited beats", "Perspective control", "Shareable configs", "Source transparency panel"],
      featured: true,
    },
    {
      name: "Command",
      tag: "For the enterprise",
      blurb: "Agentic workflows at scale.",
      bullets: ["Private retrieval", "Citation ledger export", "SSO & audit log", "Dedicated support"],
    },
  ];

  return (
    <section style={{ background: "var(--canvas)", padding: "7rem 1.5rem" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="t-mono" style={{ color: "var(--steel)", marginBottom: "1.25rem" }}>
            Editions
          </p>
          <h2 className="t-section-display" style={{ color: "var(--ink)" }}>
            Choose your altitude.
          </h2>
        </div>

        <div className="prod-grid">
          {tiers.map((t) => (
            <article
              key={t.name}
              style={{
                background: "var(--snow)",
                borderRadius: "var(--r-sm)",
                padding: "2.25rem",
                border: t.featured ? "1px solid var(--steel)" : "1px solid var(--border-faint)",
                position: "relative",
              }}
            >
              {t.featured && (
                <span
                  className="chip"
                  style={{ position: "absolute", top: "-12px", left: "2.25rem" }}
                >
                  Most popular
                </span>
              )}
              <p className="t-mono" style={{ color: "var(--muted)", fontSize: "0.625rem", marginBottom: "0.875rem" }}>
                {t.tag}
              </p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: "0.5rem" }}>
                {t.name}
              </h3>
              <p style={{ color: "var(--slate)", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>{t.blurb}</p>

              <div style={{ height: "1px", background: "var(--hairline)", margin: "0 0 1.5rem" }} />

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {t.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "center", gap: "0.625rem", color: "var(--slate)", fontSize: "0.9375rem" }}>
                    <CheckGlyph dark />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="btn-primary btn-primary--royal"
                style={{ width: "100%", fontSize: "0.875rem", padding: "0.6rem 1rem" }}
              >
                Get started
              </Link>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 980px) { .prod-grid { grid-template-columns: 1fr; max-width: 460px; margin: 0 auto; } }
      `}</style>
    </section>
  );
}

/* ───────────────────────── RESEARCH (editorial) ───────────────────────── */

const TOPICS = ["All", "Policy", "Frontier models", "Trust & safety", "Open source", "Markets"];

const PAPERS = [
  { title: "Provenance-preserving summarization for newsroom briefings", topic: "Trust & safety", date: "May 2026" },
  { title: "Measuring editorial balance across multi-source digests", topic: "Policy", date: "Apr 2026" },
  { title: "Deduplication under continuous wire ingestion", topic: "Open source", date: "Mar 2026" },
  { title: "Perspective vectors: steering tone without distorting fact", topic: "Frontier models", date: "Feb 2026" },
  { title: "Citation ledgers as an audit primitive", topic: "Trust & safety", date: "Jan 2026" },
];

function Research() {
  const [active, setActive] = useState("All");
  const rows = active === "All" ? PAPERS : PAPERS.filter((p) => p.topic === active);

  return (
    <section id="research" style={{ background: "var(--cloud)", padding: "7rem 1.5rem" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="t-mono" style={{ color: "var(--steel)", marginBottom: "1.25rem" }}>
            Research
          </p>
          <h2 className="t-section-display" style={{ color: "var(--ink)", marginBottom: "2rem" }}>
            What we&rsquo;re publishing.
          </h2>

          {/* filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
            {TOPICS.map((t) => (
              <button
                key={t}
                className="filter-chip"
                data-active={active === t}
                onClick={() => setActive(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* research table */}
        <div style={{ borderTop: "1px solid var(--hairline)" }}>
          {rows.map((p) => (
            <Link
              key={p.title}
              href="/register"
              className="research-row"
            >
              <span style={{ color: "var(--ink)", fontSize: "1.125rem", fontFamily: "var(--font-display)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                {p.title}
              </span>
              <span className="pill-outline" style={{ pointerEvents: "none", fontSize: "0.8125rem", padding: "0.35rem 0.875rem" }}>
                {p.topic}
              </span>
              <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", letterSpacing: "0.04em" }}>
                {p.date}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .research-row {
          display: grid;
          grid-template-columns: 1fr auto 110px;
          gap: 1.5rem;
          align-items: center;
          padding: 1.75rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
          text-decoration: none;
          transition: background 0.15s ease, padding-left 0.15s ease;
        }
        .research-row:hover { background: var(--canvas); padding-left: 1rem; }
        @media (max-width: 720px) {
          .research-row { grid-template-columns: 1fr; gap: 0.75rem; }
        }
      `}</style>
    </section>
  );
}

/* ───────────────────────── CONTACT FORM ───────────────────────── */

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" style={{ background: "var(--deep-sapphire)", padding: "7rem 1.5rem", position: "relative", overflow: "hidden" }}>
      <div className="hairline-grid" style={{ position: "absolute", inset: 0, opacity: 0.05 }} />
      <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative" }}>
        <div className="contact-grid">
          <div>
            <p className="t-mono" style={{ color: "var(--sky)", marginBottom: "1.25rem" }}>
              Request a demo
            </p>
            <h2 className="t-section-heading" style={{ color: "#fff", marginBottom: "1.25rem" }}>
              See Aurelia on your beat.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", lineHeight: 1.5, maxWidth: "360px" }}>
              Tell us what you cover. We&rsquo;ll generate a live briefing from your
              sources and walk you through the citation trail.
            </p>
          </div>

          {/* contact form card */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            style={{
              background: "var(--warm-white)",
              borderRadius: "var(--r-md)",
              padding: "2rem",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ color: "var(--success)", marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                  <CheckGlyph dark />
                </div>
                <p style={{ color: "var(--ink)", fontFamily: "var(--font-display)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  Thanks — we&rsquo;ll be in touch.
                </p>
                <p className="t-caption">A specialist will reach out within one business day.</p>
              </div>
            ) : (
              <>
                <div className="form-rows">
                  <Field label="First name" name="first" placeholder="Ada" />
                  <Field label="Last name" name="last" placeholder="Lovelace" />
                </div>
                <div className="form-rows">
                  <Field label="Work email" name="email" type="email" placeholder="you@newsroom.com" />
                  <Field label="Organization" name="org" placeholder="The Daily" />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="field-label" htmlFor="beat">What do you cover?</label>
                  <textarea id="beat" name="beat" rows={3} className="field" placeholder="AI policy, semiconductor supply chains, EU regulation…" style={{ resize: "vertical" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                  Request a demo
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 3.5rem;
          align-items: center;
        }
        .form-rows { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        @media (max-width: 820px) {
          .contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
        }
        @media (max-width: 480px) {
          .form-rows { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} className="field" />
    </div>
  );
}

/* ───────────────────────── FOOTER NEWSLETTER ───────────────────────── */

function FooterNewsletter() {
  const cols: { head: string; links: string[] }[] = [
    { head: "Product", links: ["Reader", "Desk", "Command", "Changelog"] },
    { head: "Research", links: ["Publications", "Methodology", "Benchmarks"] },
    { head: "Company", links: ["About", "Careers", "Press", "Contact"] },
  ];
  return (
    <footer style={{ background: "var(--midnight)", padding: "5rem 1.5rem 3rem" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        {/* newsletter block */}
        <div className="footer-top">
          <div style={{ maxWidth: "440px" }}>
            <p className="t-mono" style={{ color: "var(--sky)", marginBottom: "1.25rem" }}>
              AI moves fast
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: "1rem" }}>
              Stay ahead of the cycle.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.45 }}>
              Monthly research notes and product updates. No noise — you can
              unsubscribe anytime.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginTop: "1.5rem",
                borderBottom: "1px solid var(--on-dark-border)",
                paddingBottom: "0.5rem",
              }}
            >
              <input
                type="email"
                placeholder="you@newsroom.com"
                aria-label="Email address"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                }}
              />
              <button
                type="submit"
                aria-label="Subscribe"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: "1.25rem", lineHeight: 1 }}
              >
                →
              </button>
            </form>
          </div>

          {/* link columns */}
          <div className="footer-cols">
            {cols.map((c) => (
              <div key={c.head}>
                <p style={{ color: "#fff", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "1rem" }}>{c.head}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="/#" style={{ color: "var(--muted)", fontSize: "0.8125rem", textDecoration: "none" }}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* base row */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--on-dark-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>
            Aurelia
          </span>
          <span className="t-micro" style={{ color: "var(--muted)" }}>
            © 2026 Aurelia Intelligence. All rights reserved.
          </span>
        </div>
      </div>

      <style>{`
        .footer-top {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
        }
        .footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        @media (max-width: 820px) {
          .footer-top { grid-template-columns: 1fr; gap: 3rem; }
        }
      `}</style>
    </footer>
  );
}

/* ───────────────────────── GLYPHS / ICONS (thin-line) ───────────────────────── */

function CheckGlyph({ dark = false }: { dark?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="8" stroke={dark ? "var(--steel)" : "var(--sky)"} strokeWidth="1.2" />
      <path d="M5.5 9.2l2.2 2.2 4.8-4.8" stroke={dark ? "var(--royal)" : "#fff"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ico = { width: 40, height: 40, viewBox: "0 0 40 40", fill: "none" } as const;
const stroke = { stroke: "currentColor", strokeWidth: 1.25, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IconTopics() {
  return (
    <svg {...ico}>
      <rect x="6" y="9" width="20" height="2.2" rx="1.1" {...stroke} />
      <rect x="6" y="18" width="28" height="2.2" rx="1.1" {...stroke} />
      <rect x="6" y="27" width="14" height="2.2" rx="1.1" {...stroke} />
    </svg>
  );
}
function IconCitation() {
  return (
    <svg {...ico}>
      <rect x="8" y="6" width="18" height="24" rx="2" {...stroke} />
      <path d="M22 6v6h6" {...stroke} />
      <path d="M16 30l4 4 8-8" {...stroke} />
    </svg>
  );
}
function IconLens() {
  return (
    <svg {...ico}>
      <circle cx="20" cy="20" r="13" {...stroke} />
      <path d="M20 7v26" {...stroke} />
      <path d="M20 20c-5 0-9-3-9-6.5M20 20c5 0 9 3 9 6.5" {...stroke} />
    </svg>
  );
}
function IconDedup() {
  return (
    <svg {...ico}>
      <rect x="7" y="11" width="16" height="16" rx="2" {...stroke} />
      <path d="M17 11V9a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2h-2" {...stroke} />
    </svg>
  );
}
function IconTransparency() {
  return (
    <svg {...ico}>
      <path d="M5 20c3-6 9-9 15-9s12 3 15 9c-3 6-9 9-15 9S8 26 5 20z" {...stroke} />
      <circle cx="20" cy="20" r="4" {...stroke} />
    </svg>
  );
}
function IconShare() {
  return (
    <svg {...ico}>
      <circle cx="11" cy="20" r="4" {...stroke} />
      <circle cx="29" cy="11" r="4" {...stroke} />
      <circle cx="29" cy="29" r="4" {...stroke} />
      <path d="M14.5 18l11-5.5M14.5 22l11 5.5" {...stroke} />
    </svg>
  );
}
