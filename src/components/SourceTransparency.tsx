"use client";

interface Source {
  url: string;
  title: string;
  outlet: string;
  lean: string;
}

const LEAN_STYLE: Record<string, { color: string; bg: string }> = {
  "Left":         { color: "#4A8FE0", bg: "rgba(74,143,224,0.1)" },
  "Center-Left":  { color: "#7EB8E0", bg: "rgba(126,184,224,0.1)" },
  "Center":       { color: "#F4B942", bg: "rgba(244,185,66,0.1)" },
  "Center-Right": { color: "#E07A7A", bg: "rgba(224,122,122,0.1)" },
  "Right":        { color: "#E63946", bg: "rgba(230,57,70,0.1)" },
};

export default function SourceTransparency({ sources }: { sources: Source[] }) {
  const grouped = sources.reduce<Record<string, Source[]>>((acc, s) => {
    acc[s.lean] = acc[s.lean] || [];
    acc[s.lean].push(s);
    return acc;
  }, {});

  const leanOrder = ["Left", "Center-Left", "Center", "Center-Right", "Right"];

  return (
    <div
      style={{
        background: "var(--nf-paper)",
        border: "1px solid var(--nf-border)",
        borderRadius: "10px",
        padding: "1.5rem",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--nf-gold)",
          marginBottom: "1.25rem",
        }}
      >
        Source Transparency
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {leanOrder
          .filter((lean) => grouped[lean])
          .map((lean) => {
            const style = LEAN_STYLE[lean] || { color: "var(--nf-sub)", bg: "var(--nf-surface)" };
            return (
              <div key={lean}>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: style.color,
                    background: style.bg,
                    border: `1px solid ${style.color}30`,
                    borderRadius: "3px",
                    padding: "0.175rem 0.5rem",
                    marginBottom: "0.625rem",
                  }}
                >
                  {lean}
                </span>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {grouped[lean].map((s, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "flex-start",
                        fontSize: "0.82rem",
                      }}
                    >
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontWeight: 600,
                          color: style.color,
                          textDecoration: "none",
                          flexShrink: 0,
                          letterSpacing: "0.02em",
                          borderBottom: `1px solid ${style.color}35`,
                          lineHeight: 1.4,
                        }}
                      >
                        {s.outlet}
                      </a>
                      <span style={{ color: "var(--nf-border-hi)" }}>—</span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--nf-sub)",
                          lineHeight: 1.4,
                        }}
                      >
                        {s.title.length > 90 ? s.title.slice(0, 90) + "…" : s.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.72rem",
          color: "var(--nf-muted)",
          marginTop: "1.25rem",
          lineHeight: 1.5,
          borderTop: "1px solid var(--nf-border)",
          paddingTop: "1rem",
        }}
      >
        Editorial lean classifications are based on generally recognized media bias ratings and
        may not reflect every article&apos;s individual perspective.
      </p>
    </div>
  );
}
