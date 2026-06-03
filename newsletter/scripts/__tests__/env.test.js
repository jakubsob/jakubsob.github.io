import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// _env.js is a side-effect module: importing it reads the Worker's
// wrangler.toml [vars] into process.env (without overriding values already set).
// We point it at the real committed toml and re-import per test.

const here = dirname(fileURLToPath(import.meta.url));
const realToml = join(here, "..", "..", "worker", "wrangler.toml");

let savedEnv;

beforeEach(() => {
  savedEnv = { ...process.env };
  process.env.WRANGLER_TOML = realToml;
  vi.resetModules();
});

afterEach(() => {
  process.env = savedEnv;
});

describe("_env wrangler.toml loader", () => {
  it("loads non-secret [vars] into process.env", async () => {
    // Arrange
    delete process.env.DATA_REPO;
    delete process.env.MAIL_FROM_NAME;

    // Act
    await import("../_env.js");

    // Assert
    expect(process.env.DATA_REPO).toBe("jakubsob/newsletter-data");
    expect(process.env.MAIL_FROM_NAME).toBe("Jakub Sobolewski");
    expect(process.env.WORKER_PUBLIC_URL).toMatch(/^https:\/\//);
  });

  it("does not override a value already present in the environment", async () => {
    // Arrange — a one-off override should win over the toml default
    process.env.DATA_REPO = "someone/test-data";

    // Act
    await import("../_env.js");

    // Assert
    expect(process.env.DATA_REPO).toBe("someone/test-data");
  });

  it("warns but does not throw when the toml is missing", async () => {
    // Arrange
    process.env.WRANGLER_TOML = join(here, "does-not-exist.toml");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Act / Assert
    await expect(import("../_env.js")).resolves.toBeDefined();
    expect(warn).toHaveBeenCalled();
  });
});
