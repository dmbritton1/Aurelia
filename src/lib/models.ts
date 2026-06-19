// Selectable writer models for newsletter generation. Only the writer step is
// configurable; the Google-Search step always uses gemini-2.5-flash.

export interface WriterModel {
  id: string;
  label: string;
  hint: string;
}

export const WRITER_MODELS: WriterModel[] = [
  { id: "gemma-4-26b-a4b-it", label: "Gemma 4 26B", hint: "Faster" },
  { id: "gemma-4-31b-it", label: "Gemma 4 31B", hint: "Higher quality, slower" },
];

export const DEFAULT_WRITER_MODEL = "gemma-4-26b-a4b-it";

export function isValidModel(id: unknown): id is string {
  return typeof id === "string" && WRITER_MODELS.some((m) => m.id === id);
}

/** Coerce any input to a valid model id, falling back to the default. */
export function normalizeModel(id: unknown): string {
  return isValidModel(id) ? id : DEFAULT_WRITER_MODEL;
}
