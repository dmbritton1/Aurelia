"use client";

const PERSPECTIVES = [
  { value: "left",         label: "Left",        color: "#4A8FE0" },
  { value: "center-left",  label: "Ctr-Left",    color: "#7EB8E0" },
  { value: "balanced",     label: "Balanced",    color: "#F4B942" },
  { value: "center-right", label: "Ctr-Right",   color: "#E07A7A" },
  { value: "right",        label: "Right",       color: "#E63946" },
];

interface PerspectiveSliderProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PerspectiveSlider({ value, onChange }: PerspectiveSliderProps) {
  const activeIndex = PERSPECTIVES.findIndex((p) => p.value === value);
  const activeColor = PERSPECTIVES[activeIndex]?.color || "#F4B942";

  return (
    <div>
      {/* Spectrum bar */}
      <div
        style={{
          height: "4px",
          borderRadius: "2px",
          background: "linear-gradient(90deg, #4A8FE0, #7EB8E0, #F4B942, #E07A7A, #E63946)",
          marginBottom: "0.875rem",
          position: "relative",
        }}
      >
        {/* Indicator */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${(activeIndex / (PERSPECTIVES.length - 1)) * 100}%`,
            transform: "translate(-50%, -50%)",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: activeColor,
            border: "2px solid var(--nf-ink)",
            boxShadow: `0 0 8px ${activeColor}60`,
            transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease, box-shadow 0.3s ease",
          }}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.375rem",
        }}
      >
        {PERSPECTIVES.map((p) => {
          const active = value === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "0.5rem 0.25rem",
                borderRadius: "4px",
                border: active
                  ? `1px solid ${p.color}50`
                  : "1px solid var(--nf-border)",
                background: active ? `${p.color}12` : "var(--nf-paper)",
                color: active ? p.color : "var(--nf-muted)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "center",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = `${p.color}40`;
                  e.currentTarget.style.color = p.color;
                  e.currentTarget.style.background = `${p.color}08`;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "var(--nf-border)";
                  e.currentTarget.style.color = "var(--nf-muted)";
                  e.currentTarget.style.background = "var(--nf-paper)";
                }
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
