import { test } from "node:test";
import assert from "node:assert/strict";
import { withRetry, isTransientError } from "./retry.ts";

const noSleep = async () => {};

// A fake error mimicking the SDK's GoogleGenerativeAIFetchError.
function fetchError(status: number) {
  return Object.assign(new Error(`Error fetching from ...: [${status} X] Internal error encountered.`), { status });
}

test("isTransientError detects 5xx/429 by status and by message", () => {
  assert.equal(isTransientError(fetchError(500)), true);
  assert.equal(isTransientError(fetchError(503)), true);
  assert.equal(isTransientError(fetchError(429)), true);
  // message-only fallback (no numeric status field)
  assert.equal(isTransientError(new Error("Error fetching from ...: [503 Service Unavailable] x")), true);
  // non-transient
  assert.equal(isTransientError(fetchError(400)), false);
  assert.equal(isTransientError(new Error("API key not valid")), false);
});

test("returns immediately on success (no retries)", async () => {
  let calls = 0;
  const r = await withRetry(async () => { calls++; return "ok"; }, { sleep: noSleep });
  assert.equal(r, "ok");
  assert.equal(calls, 1);
});

test("retries transient failures then succeeds", async () => {
  let calls = 0;
  const r = await withRetry(async () => {
    calls++;
    if (calls < 3) throw fetchError(503);
    return "done";
  }, { sleep: noSleep, baseDelayMs: 1 });
  assert.equal(r, "done");
  assert.equal(calls, 3);
});

test("does NOT retry non-transient errors", async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(async () => { calls++; throw fetchError(400); }, { sleep: noSleep }),
    /\[400 /
  );
  assert.equal(calls, 1);
});

test("gives up after exhausting retries and throws the last error", async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(async () => { calls++; throw fetchError(500); }, { sleep: noSleep, retries: 3, baseDelayMs: 1 }),
    /\[500 /
  );
  assert.equal(calls, 4); // initial + 3 retries
});
