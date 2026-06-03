import { describe, it, expect, beforeEach, vi } from "vitest";

// In-memory stand-in for the GitHub Contents API, enforcing sha-based
// optimistic concurrency so we can exercise the store's read/rewrite logic and
// its conflict-retry behaviour without touching the network.
const { gh } = vi.hoisted(() => {
  const files = new Map(); // path -> { text, sha }
  let counter = 0;
  return {
    gh: {
      files,
      reset() {
        files.clear();
        counter = 0;
      },
      seed(path, text) {
        files.set(path, { text, sha: `seed-${++counter}` });
      },
      getFile: vi.fn(async ({ path }) => {
        const f = files.get(path);
        return f ? { text: f.text, sha: f.sha } : { text: "", sha: null };
      }),
      putFile: vi.fn(async ({ path, text, sha }) => {
        const current = files.get(path);
        const currentSha = current ? current.sha : null;
        if (currentSha !== sha) {
          const err = new Error("conflict");
          err.conflict = true;
          throw err;
        }
        const newSha = `sha-${++counter}`;
        files.set(path, { text, sha: newSha });
        return newSha;
      }),
    },
  };
});

vi.mock("../github.js", () => ({
  getFile: gh.getFile,
  putFile: gh.putFile,
}));

import {
  parseNdjson,
  serializeNdjson,
  readRecords,
  updateRecords,
  findSubscriberByEmail,
  upsertPendingSubscriber,
  setStatusByToken,
  SUBSCRIBERS_PATH,
} from "../store.js";

const config = { token: "t", repo: "owner/data", branch: "main" };

beforeEach(() => {
  gh.reset();
  gh.getFile.mockClear();
  gh.putFile.mockClear();
});

describe("ndjson (de)serialization", () => {
  it("round-trips records, ignoring blank lines", () => {
    // Arrange
    const records = [{ a: 1 }, { b: "two" }];

    // Act
    const text = serializeNdjson(records);
    const parsed = parseNdjson("\n" + text + "\n  \n");

    // Assert
    expect(text.endsWith("\n")).toBe(true);
    expect(parsed).toEqual(records);
  });

  it("serializes an empty list to an empty string", () => {
    // Arrange / Act / Assert
    expect(serializeNdjson([])).toBe("");
  });
});

describe("upsertPendingSubscriber", () => {
  const newSub = {
    email: "new@example.com",
    status: "pending",
    tags: ["roadmap"],
    subscribed_at: "2026-06-02T10:00:00.000Z",
    confirm_token: "c-new",
    unsubscribe_token: "u-new",
    source: "blog-form",
  };

  it("appends a pending record to an empty store", async () => {
    // Arrange (empty store)

    // Act
    const result = await upsertPendingSubscriber(config, newSub);

    // Assert
    expect(result).toEqual(newSub);
    const stored = await readRecords(config, SUBSCRIBERS_PATH);
    expect(stored).toEqual([newSub]);
  });

  it("leaves an already-confirmed subscriber untouched", async () => {
    // Arrange
    const confirmed = {
      email: "new@example.com",
      status: "confirmed",
      tags: ["blog"],
      confirm_token: "old",
      unsubscribe_token: "u-old",
    };
    gh.seed(SUBSCRIBERS_PATH, serializeNdjson([confirmed]));

    // Act
    const result = await upsertPendingSubscriber(config, newSub);

    // Assert
    expect(result.status).toBe("confirmed");
    expect(result.confirm_token).toBe("old");
    const stored = await readRecords(config, SUBSCRIBERS_PATH);
    expect(stored).toHaveLength(1);
  });

  it("reactivates an unsubscribed record with fresh tokens and merged tags", async () => {
    // Arrange
    const unsub = {
      email: "new@example.com",
      status: "unsubscribed",
      tags: ["blog"],
      confirm_token: "old",
      unsubscribe_token: "u-old",
    };
    gh.seed(SUBSCRIBERS_PATH, serializeNdjson([unsub]));

    // Act
    const result = await upsertPendingSubscriber(config, newSub);

    // Assert
    expect(result.status).toBe("pending");
    expect(result.confirm_token).toBe("c-new");
    expect(result.tags.sort()).toEqual(["blog", "roadmap"]);
    const stored = await readRecords(config, SUBSCRIBERS_PATH);
    expect(stored).toHaveLength(1);
  });
});

describe("setStatusByToken", () => {
  beforeEach(() => {
    const records = [
      {
        email: "a@example.com",
        status: "pending",
        confirm_token: "confirm-a",
        unsubscribe_token: "unsub-a",
      },
    ];
    gh.seed(SUBSCRIBERS_PATH, serializeNdjson(records));
  });

  it("flips status when a token matches and stamps extra fields", async () => {
    // Arrange / Act
    const result = await setStatusByToken(
      config,
      "confirm_token",
      "confirm-a",
      "confirmed",
      { confirmed_at: "2026-06-02T10:03:00.000Z" }
    );

    // Assert
    expect(result.status).toBe("confirmed");
    expect(result.confirmed_at).toBe("2026-06-02T10:03:00.000Z");
  });

  it("returns null and writes nothing when no token matches", async () => {
    // Arrange / Act
    const result = await setStatusByToken(
      config,
      "confirm_token",
      "does-not-exist",
      "confirmed"
    );

    // Assert
    expect(result).toBeNull();
    const stored = await readRecords(config, SUBSCRIBERS_PATH);
    expect(stored[0].status).toBe("pending");
  });
});

describe("findSubscriberByEmail", () => {
  it("matches case-insensitively after normalization", async () => {
    // Arrange
    gh.seed(
      SUBSCRIBERS_PATH,
      serializeNdjson([{ email: "a@example.com", status: "confirmed" }])
    );

    // Act
    const found = await findSubscriberByEmail(config, "  A@Example.com ");

    // Assert
    expect(found).not.toBeNull();
    expect(found.email).toBe("a@example.com");
  });
});

describe("updateRecords concurrency", () => {
  it("re-reads and retries when a write hits a sha conflict", async () => {
    // Arrange
    gh.seed(SUBSCRIBERS_PATH, serializeNdjson([{ n: 0 }]));
    // First write attempt collides; the retry then succeeds.
    gh.putFile.mockImplementationOnce(async () => {
      const err = new Error("conflict");
      err.conflict = true;
      throw err;
    });

    // Act
    await updateRecords(config, SUBSCRIBERS_PATH, (records) => [
      ...records,
      { n: 1 },
    ]);

    // Assert
    expect(gh.getFile.mock.calls.length).toBeGreaterThanOrEqual(2);
    const stored = await readRecords(config, SUBSCRIBERS_PATH);
    expect(stored).toEqual([{ n: 0 }, { n: 1 }]);
  });

  it("propagates a non-conflict error without retrying", async () => {
    // Arrange
    gh.seed(SUBSCRIBERS_PATH, serializeNdjson([]));
    gh.putFile.mockImplementationOnce(async () => {
      throw new Error("boom");
    });

    // Act / Assert
    await expect(
      updateRecords(config, SUBSCRIBERS_PATH, (r) => r)
    ).rejects.toThrow("boom");
  });
});
