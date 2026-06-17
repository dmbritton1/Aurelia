"use client";

const CATEGORIES = [
  "Politics",
  "Tech",
  "Business",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Culture",
];

interface CategoryPickerProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export default function CategoryPicker({ selected, onChange }: CategoryPickerProps) {
  function toggle(cat: string) {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {CATEGORIES.map((cat) => {
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "0.4rem 0.875rem",
              borderRadius: "4px",
              border: active
                ? "1px solid rgba(244,185,66,0.4)"
                : "1px solid var(--nf-border)",
              background: active
                ? "rgba(244,185,66,0.1)"
                : "var(--nf-paper)",
              color: active ? "var(--nf-gold)" : "var(--nf-sub)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = "var(--nf-border-hi)";
                e.currentTarget.style.color = "var(--nf-body)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = "var(--nf-border)";
                e.currentTarget.style.color = "var(--nf-sub)";
              }
            }}
          >
            {active && (
              <span style={{ marginRight: "0.35rem", fontSize: "0.6rem" }}>✓</span>
            )}
            {cat}
          </button>
        );
      })}
    </div>
  );
}
