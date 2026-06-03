import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getFile, putFile } from "../github.js";

const config = { token: "t0ken", repo: "owner/data", branch: "main" };

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getFile", () => {
  it("decodes base64 content and returns the blob sha", async () => {
    // Arrange
    const text = "héllo\nwörld";
    const content = Buffer.from(text, "utf8").toString("base64");
    fetch.mockResolvedValue(jsonResponse({ content, sha: "deadbeef" }));

    // Act
    const result = await getFile({ ...config, path: "subscribers.ndjson" });

    // Assert
    expect(result).toEqual({ text, sha: "deadbeef" });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain("/repos/owner/data/contents/subscribers.ndjson");
    expect(init.headers.Authorization).toBe("Bearer t0ken");
  });

  it("returns an empty file when the path does not exist (404)", async () => {
    // Arrange
    fetch.mockResolvedValue(jsonResponse({}, 404));

    // Act
    const result = await getFile({ ...config, path: "queue.ndjson" });

    // Assert
    expect(result).toEqual({ text: "", sha: null });
  });

  it("throws on unexpected error statuses", async () => {
    // Arrange
    fetch.mockResolvedValue(jsonResponse({}, 500));

    // Act / Assert
    await expect(getFile({ ...config, path: "x" })).rejects.toThrow(/500/);
  });
});

describe("putFile", () => {
  it("sends base64 content with the sha and returns the new sha", async () => {
    // Arrange
    fetch.mockResolvedValue(jsonResponse({ content: { sha: "newsha" } }));

    // Act
    const sha = await putFile({
      ...config,
      path: "subscribers.ndjson",
      text: "line\n",
      sha: "oldsha",
      message: "test commit",
    });

    // Assert
    expect(sha).toBe("newsha");
    const [, init] = fetch.mock.calls[0];
    expect(init.method).toBe("PUT");
    const body = JSON.parse(init.body);
    expect(body.sha).toBe("oldsha");
    expect(body.message).toBe("test commit");
    expect(Buffer.from(body.content, "base64").toString("utf8")).toBe("line\n");
  });

  it("omits the sha when creating a new file", async () => {
    // Arrange
    fetch.mockResolvedValue(jsonResponse({ content: { sha: "created" } }));

    // Act
    await putFile({ ...config, path: "new.ndjson", text: "", sha: null });

    // Assert
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.sha).toBeUndefined();
  });

  it("flags a 409 sha conflict so callers can retry", async () => {
    // Arrange
    fetch.mockResolvedValue(jsonResponse({}, 409));

    // Act
    const promise = putFile({ ...config, path: "x", text: "y", sha: "s" });

    // Assert
    await expect(promise).rejects.toMatchObject({ conflict: true });
  });
});
