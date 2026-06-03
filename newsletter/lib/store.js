// The subscriber + queue store, backed by newline-delimited JSON files in the
// private data repo. One JSON object per line: easy to append, diff, and audit
// through Git history. Built on the GitHub Contents API client so it runs in
// the Worker and in Actions alike.

import { getFile, putFile } from "./github.js";

export const SUBSCRIBERS_PATH = "subscribers.ndjson";
export const QUEUE_PATH = "queue.ndjson";

// --- ndjson (de)serialization ------------------------------------------------

export function parseNdjson(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export function serializeNdjson(records) {
  if (records.length === 0) return "";
  return records.map((r) => JSON.stringify(r)).join("\n") + "\n";
}

// --- generic read / rewrite --------------------------------------------------

// Read every record from an ndjson file.
export async function readRecords(config, path) {
  const { text } = await getFile({ ...config, path });
  return parseNdjson(text);
}

// Rewrite an ndjson file via a pure transform of its current records. Retries
// on a sha conflict by re-reading, so concurrent writers don't clobber each
// other. `mutate` receives the current records and returns the new array (or a
// `{ records, result }` pair to also return a value to the caller).
export async function updateRecords(config, path, mutate, opts = {}) {
  const { message, retries = 4 } = opts;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { text, sha } = await getFile({ ...config, path });
    const current = parseNdjson(text);

    const out = mutate(current);
    const next = Array.isArray(out) ? out : out.records;
    const result = Array.isArray(out) ? undefined : out.result;

    try {
      await putFile({
        ...config,
        path,
        text: serializeNdjson(next),
        sha,
        message,
      });
      return result;
    } catch (err) {
      if (err.conflict && attempt < retries) continue; // re-read and retry
      throw err;
    }
  }
}

// --- subscriber helpers ------------------------------------------------------

export async function findSubscriberByEmail(config, email) {
  const records = await readRecords(config, SUBSCRIBERS_PATH);
  const normalized = email.trim().toLowerCase();
  return records.find((r) => r.email === normalized) || null;
}

// Append a pending subscriber, or refresh tokens if they already exist but are
// not yet confirmed (lets someone re-request the opt-in email). Returns the
// stored record. A throw with `.alreadyConfirmed` lets callers stay quiet.
export async function upsertPendingSubscriber(config, subscriber) {
  return updateRecords(
    config,
    SUBSCRIBERS_PATH,
    (records) => {
      const idx = records.findIndex((r) => r.email === subscriber.email);

      if (idx === -1) {
        return { records: [...records, subscriber], result: subscriber };
      }

      const existing = records[idx];
      if (existing.status === "confirmed") {
        return { records, result: existing };
      }

      // Reactivate an unsubscribed/pending record with fresh tokens + tags.
      const merged = {
        ...existing,
        status: "pending",
        confirm_token: subscriber.confirm_token,
        unsubscribe_token: subscriber.unsubscribe_token,
        subscribed_at: subscriber.subscribed_at,
        tags: Array.from(new Set([...(existing.tags || []), ...subscriber.tags])),
      };
      const next = [...records];
      next[idx] = merged;
      return { records: next, result: merged };
    },
    { message: `feat(newsletter): subscribe ${subscriber.email}` }
  );
}

// Flip a subscriber's status by matching one of its tokens. Returns the updated
// record, or null if no token matches. `extra` lets callers stamp timestamps.
export async function setStatusByToken(config, tokenField, token, status, extra = {}) {
  return updateRecords(
    config,
    SUBSCRIBERS_PATH,
    (records) => {
      const idx = records.findIndex((r) => r[tokenField] === token);
      if (idx === -1) return { records, result: null };

      const next = [...records];
      next[idx] = { ...next[idx], status, ...extra };
      return { records: next, result: next[idx] };
    },
    { message: `feat(newsletter): set status=${status}` }
  );
}
