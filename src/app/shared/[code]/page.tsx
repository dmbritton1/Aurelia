"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Template {
  name: string;
  topic_prompt: string;
  categories: string[];
  perspective: string;
  length: string;
  frequency: string;
  created_by: string;
}

const PERSPECTIVE_LABELS: Record<string, string> = {
  left: "Left",
  "center-left": "Center-Left",
  balanced: "Balanced",
  "center-right": "Center-Right",
  right: "Right",
};

export default function SharedTemplatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    fetch(`/api/shared/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setTemplate(data.template))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  async function handleImport() {
    if (!template) return;
    setImporting(true);

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (imported)`,
          topic_prompt: template.topic_prompt,
          categories: template.categories,
          perspective: template.perspective,
          length: template.length || "standard",
          frequency: template.frequency,
        }),
      });

      if (res.ok) {
        setImported(true);
      }
    } catch {
      // ignore
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <div className="py-20 text-center text-zinc-400">Loading...</div>;

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Template Not Found</h1>
        <p className="mt-2 text-sm text-zinc-500">This share link is invalid or has been removed.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
          Go Home
        </Link>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <p className="mb-1 text-sm text-zinc-500">Shared Newsletter Template</p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{template.name}</h1>
        <p className="mt-1 text-sm text-zinc-400">Created by {template.created_by}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Topic</h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{template.topic_prompt}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Categories</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {template.categories.map((c: string) => (
                <span key={c} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {c}
                </span>
              ))}
              {template.categories.length === 0 && (
                <span className="text-sm text-zinc-400">None specified</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Perspective</h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              {PERSPECTIVE_LABELS[template.perspective] || template.perspective}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Frequency</h3>
            <p className="mt-1 text-sm capitalize text-zinc-700 dark:text-zinc-300">{template.frequency}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        {imported ? (
          <div>
            <p className="mb-2 text-sm font-medium text-green-600">Template imported successfully!</p>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? "Importing..." : "Import This Template"}
            </button>
            <p className="text-xs text-zinc-400">
              You must be logged in to import templates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
