import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstile } from "../turnstile.js";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("verifyTurnstile", () => {
  it("returns true and posts secret + token when Cloudflare accepts", async () => {
    // Arrange
    fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

    // Act
    const result = await verifyTurnstile("sec", "tok", "1.2.3.4");

    // Assert
    expect(result).toBe(true);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain("/turnstile/v0/siteverify");
    const body = new URLSearchParams(init.body);
    expect(body.get("secret")).toBe("sec");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("returns false when Cloudflare reports failure", async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
    });

    // Act / Assert
    expect(await verifyTurnstile("sec", "bad-token")).toBe(false);
  });

  it("fails closed without calling the network when token or secret is missing", async () => {
    // Act / Assert
    expect(await verifyTurnstile("sec", "")).toBe(false);
    expect(await verifyTurnstile("", "tok")).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fails closed on a non-OK response or network error", async () => {
    // Arrange
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    // Act / Assert
    expect(await verifyTurnstile("sec", "tok")).toBe(false);

    fetch.mockRejectedValueOnce(new Error("network down"));
    expect(await verifyTurnstile("sec", "tok")).toBe(false);
  });
});
