"use client";

export const LENGTHS = [
  { value: "brief",         label: "Brief",    color: "#C9B98A", range: "1 short section" },
  { value: "short",         label: "Short",    color: "#EFC97A", range: "1–2 sections" },
  { value: "standard",      label: "Standard", color: "#F4B942", range: "3–4 sections" },
  { value: "detailed",      label: "Detailed", color: "#E89B3C", range: "5–6 sections" },
  { value: "comprehensive", label: "In-depth", color: "#D97B2E", range: "7+ sections" },
];

interface LengthSliderProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LengthSlider({ value, onChange }: LengthSliderProps) {
  const activeIndex = Math.max(0, LENGTHS.findIndex((l) => l.value === value));
  const active = LENGTHS[activeIndex];
  const activeColor = active?.color || "#F4B942";

  return (
    <div>
      {/* Spectrum bar */}
      <div
        style={{
          height: "4px",
          borderRadius: "2px",
          background: "linear-gradient(90deg, #C9B98A, #EFC97A, #F4B942, #E89B3C, #D97B2E)",
          marginBottom: "0.875rem",
          position: "relative",
        }}
      >
        {/* Indicator */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${(activeIndex / (LENGTHS.length - 1)) * 100}%`,
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
        {LENGTHS.map((l) => {
          const isActive = value === l.value;
          return (
            <button
              key={l.value}
              type="button"
              onClick={() => onChange(l.value)}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "0.5rem 0.25rem",
                borderRadius: "4px",
                border: isActive ? `1px solid ${l.color}50` : "1px solid var(--nf-border)",
                background: isActive ? `${l.color}12` : "var(--nf-paper)",
                color: isActive ? l.color : "var(--nf-muted)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "center",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${l.color}40`;
                  e.currentTarget.style.color = l.color;
                  e.currentTarget.style.background = `${l.color}08`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--nf-border)";
                  e.currentTarget.style.color = "var(--nf-muted)";
                  e.currentTarget.style.background = "var(--nf-paper)";
                }
              }}
            >
              {l.label}
            </button>
          );
        })}
      </div>

      {/* Selected range feedback */}
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: activeColor,
          marginTop: "0.75rem",
        }}
      >
        ≈ {active?.range} · {active?.label.toLowerCase()} read
      </p>
    </div>
  );
}
