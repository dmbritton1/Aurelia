"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryPicker from "./CategoryPicker";
import PerspectiveSlider from "./PerspectiveSlider";
import LengthSlider from "./LengthSlider";

interface AutomationData {
  name: string;
  topic_prompt: string;
  categories: string[];
  perspective: string;
  length: string;
  frequency: string;
}

interface AutomationFormProps {
  initial?: AutomationData;
  automationId?: string;
  mode: "create" | "edit";
}

export default function AutomationForm({ initial, automationId, mode }: AutomationFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initial?.name || "");
  const [topicPrompt, setTopicPrompt] = useState(initial?.topic_prompt || "");
  const [categories, setCategories] = useState<string[]>(initial?.categories || []);
  const [perspective, setPerspective] = useState(initial?.perspective || "balanced");
  const [length, setLength] = useState(initial?.length || "standard");
  const [frequency, setFrequency] = useState(initial?.frequency || "daily");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = { name, topic_prompt: topicPrompt, categories, perspective, length, frequency };

    try {
      const url = mode === "edit" ? `/api/automations/${automationId}` : "/api/automations";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      router.push(`/automations/${data.automation.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {error && (
        <div
          style={{
            background: "rgba(230,57,70,0.1)",
            border: "1px solid rgba(230,57,70,0.3)",
            borderRadius: "6px",
            padding: "0.875rem 1rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "#E63946",
          }}
        >
          {error}
        </div>
      )}

      <FieldGroup label="Digest Name" hint="A short name to identify this automation">
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Daily Tech Digest"
          required
          className="input-dark"
          style={{
            width: "100%",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            fontSize: "0.9rem",
          }}
        />
      </FieldGroup>

      <FieldGroup
        label="Topic Prompt"
        hint="Describe what you want to read about in natural language. Be as specific as you like."
      >
        <textarea
          id="topic"
          value={topicPrompt}
          onChange={(e) => setTopicPrompt(e.target.value)}
          placeholder="AI regulation and its impact on startups, focusing on US and EU policy changes..."
          required
          rows={4}
          className="input-dark"
          style={{
            width: "100%",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            fontSize: "0.9rem",
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
      </FieldGroup>

      <FieldGroup label="Content Categories" hint="Select all that apply — used to filter source selection">
        <CategoryPicker selected={categories} onChange={setCategories} />
      </FieldGroup>

      <FieldGroup
        label="Perspective Preference"
        hint="Controls which sources are prioritized. Balanced draws from across the full spectrum."
      >
        <PerspectiveSlider value={perspective} onChange={setPerspective} />
      </FieldGroup>

      <FieldGroup
        label="Digest Length"
        hint="Controls how many sections and how much depth each digest is written to. Longer settings also pull from a wider range of stories."
      >
        <LengthSlider value={length} onChange={setLength} />
      </FieldGroup>

      <FieldGroup label="Digest Frequency" hint="How often new content should be generated">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
          {["realtime", "daily", "weekly"].map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFrequency(freq)}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "0.75rem",
                borderRadius: "6px",
                border:
                  frequency === freq
                    ? "1px solid rgba(244,185,66,0.4)"
                    : "1px solid var(--nf-border)",
                background:
                  frequency === freq ? "rgba(244,185,66,0.1)" : "var(--nf-paper)",
                color: frequency === freq ? "var(--nf-gold)" : "var(--nf-sub)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {freq === "realtime" ? "⚡ Real-time" : freq === "daily" ? "◑ Daily" : "○ Weekly"}
            </button>
          ))}
        </div>
      </FieldGroup>

      <button
        type="submit"
        disabled={saving}
        className="btn-gold"
        style={{
          width: "100%",
          padding: "0.9rem",
          cursor: saving ? "not-allowed" : "pointer",
          fontSize: "0.8rem",
        }}
      >
        {saving
          ? "Saving…"
          : mode === "edit"
          ? "Update Digest"
          : "Create Digest"}
      </button>
    </form>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-ui)",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--nf-body)",
          marginBottom: "0.625rem",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            color: "var(--nf-muted)",
            marginTop: "0.5rem",
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
