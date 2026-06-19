// Retry helper for transient upstream failures.
//
// The Gemini/Gemma API intermittently returns 5xx ("Internal error
// encountered") and 429 (rate limit / overloaded) — especially for the Gemma
// writer model. A single blip should not abort newsletter generation, so we
// retry these with exponential backoff + jitter. Non-transient errors (e.g.
// 400 INVALID_ARGUMENT, 401/403 bad key) are surfaced immediately.

// 429 = rate limited, 500 = internal, 503 = overloaded/unavailable.
const TRANSIENT_STATUSES = new Set([429, 500, 503]);

/**
 * True when an error looks like a transient upstream failure worth retrying.
 * The @google/generative-ai SDK throws GoogleGenerativeAIFetchError with a
 * numeric `status`; we also parse "[503 ...]" style prefixes from the message
 * as a fallback for other error shapes.
 */
export function isTransientError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  if (typeof e.status === "number" && TRANSIENT_STATUSES.has(e.status)) return true;
  if (typeof e.message === "string" && /\[(429|500|503)\s/.test(e.message)) return true;
  return false;
}

export interface RetryOptions {
  /** Number of retry attempts AFTER the initial try (default 3 → up to 4 calls). */
  retries?: number;
  /** Base backoff in ms; doubles each attempt (default 800). */
  baseDelayMs?: number;
  /** Upper bound on a single backoff delay (default 8000). */
  maxDelayMs?: number;
  /** Decide whether an error is retryable (default: isTransientError). */
  isRetryable?: (err: unknown) => boolean;
  /** Notified before each backoff sleep — used for logging. */
  onRetry?: (err: unknown, attempt: number, delayMs: number) => void;
  /** Injectable sleep so tests can run without real delays. */
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Run `fn`, retrying transient failures with exponential backoff + jitter.
 * Re-throws the last error once retries are exhausted or the error is not
 * retryable.
 */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = opts.retries ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 800;
  const maxDelayMs = opts.maxDelayMs ?? 8000;
  const isRetryable = opts.isRetryable ?? isTransientError;
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries || !isRetryable(err)) break;
      const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const delay = backoff + Math.random() * backoff * 0.25; // up to +25% jitter
      opts.onRetry?.(err, attempt + 1, delay);
      await sleep(delay);
    }
  }
  throw lastErr;
}
