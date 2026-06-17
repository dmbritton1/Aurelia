"use client";

import SourceTransparency from "./SourceTransparency";

interface NewsletterViewProps {
  newsletter: {
    id: string;
    title: string;
    summary_html: string;
    sources: { url: string; title: string; outlet: string; lean: string }[];
    generated_at: number;
  };
}

export default function NewsletterView({ newsletter }: NewsletterViewProps) {
  const date = new Date(newsletter.generated_at * 1000);

  return (
    <article>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--nf-border)",
          paddingBottom: "1.75rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--nf-gold)",
            }}
          />
          <time
            dateTime={date.toISOString()}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--nf-gold)",
            }}
          >
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </time>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "var(--nf-bright)",
            letterSpacing: "-0.01em",
          }}
        >
          {newsletter.title}
        </h1>
      </header>

      {/* Inline style override for link rendering */}
      <style>{`
        .newsletter-content a { word-break: break-all; overflow-wrap: break-word; }
        .newsletter-content a[href]::after { content: none !important; }
      `}</style>

      {/* Body */}
      <div
        className="newsletter-content"
        dangerouslySetInnerHTML={{ __html: newsletter.summary_html }}
        style={{ marginBottom: "2.5rem" }}
      />

      {/* Sources */}
      <SourceTransparency sources={newsletter.sources} />
    </article>
  );
}
