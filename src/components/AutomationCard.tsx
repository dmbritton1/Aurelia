"use client";

import Link from "next/link";
import { useState } from "react";

interface AutomationCardProps {
  automation: {
    id: string;
    name: string;
    topic_prompt: string;
    categories: string[];
    perspective: string;
    frequency: string;
    active: number;
    updated_at: number;
  };
}

const PERSPECTIVE_LABELS: Record<string, string> = {
  left: "Left",
  "center-left": "Ctr-Left",
  balanced: "Balanced",
  "center-right": "Ctr-Right",
  right: "Right",
};

const PERSPECTIVE_COLORS: Record<string, string> = {
  left: "#4A8FE0",
  "center-left": "#7EB8E0",
  balanced: "#F4B942",
  "center-right": "#E07A7A",
  right: "#E63946",
};

const FREQ_ICONS: Record<string, string> = {
  realtime: "⚡",
  daily: "◑",
  weekly: "○",
};

export default function AutomationCard({ automation }: AutomationCardProps) {
  const [hovered, setHovered] = useState(false);
  const perspColor = PERSPECTIVE_COLORS[automation.perspective] || "var(--nf-gold)";
  const updated = new Date(automation.updated_at * 1000);
  const dateStr = updated.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Link
      href={`/automations/${automation.id}`}
      style={{
        display: "block",
        background: hovered ? "var(--nf-surface)" : "var(--nf-paper)",
        padding: "1.75rem",
        textDecoration: "none",
        transition: "background 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent line top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, ${perspColor}, transparent)`,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Status + date */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: automation.active ? "var(--nf-emerald)" : "var(--nf-muted)",
              flexShrink: 0,
              boxShadow: automation.active ? "0 0 6px rgba(45,206,143,0.5)" : "none",
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
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.62rem",
            color: "var(--nf-muted)",
            letterSpacing: "0.04em",
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.25rem",
          fontWeight: 700,
          lineHeight: 1.25,
          color: "var(--nf-bright)",
          marginBottom: "0.625rem",
        }}
      >
        {automation.name}
      </h3>

      {/* Topic */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.82rem",
          lineHeight: 1.55,
          color: "var(--nf-sub)",
          marginBottom: "1.25rem",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}
      >
        {automation.topic_prompt}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {automation.categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
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
            {cat}
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
          {PERSPECTIVE_LABELS[automation.perspective] || automation.perspective}
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
          {FREQ_ICONS[automation.frequency]} {automation.frequency}
        </span>
      </div>

      {/* Arrow indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          right: "1.5rem",
          fontFamily: "var(--font-ui)",
          fontSize: "0.75rem",
          color: hovered ? "var(--nf-gold)" : "var(--nf-border-hi)",
          transition: "color 0.2s ease, transform 0.2s ease",
          transform: hovered ? "translateX(3px)" : "translateX(0)",
        }}
      >
        →
      </div>
    </Link>
  );
}
