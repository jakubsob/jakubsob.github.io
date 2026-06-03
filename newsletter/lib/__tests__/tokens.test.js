import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  isValidEmail,
  randomToken,
  nowIso,
} from "../tokens.js";

describe("normalizeEmail", () => {
  it("trims surrounding whitespace and lowercases", () => {
    // Arrange
    const input = "  Jakub@Example.COM  ";

    // Act
    const result = normalizeEmail(input);

    // Assert
    expect(result).toBe("jakub@example.com");
  });

  it("returns an empty string for nullish input", () => {
    // Arrange / Act / Assert
    expect(normalizeEmail(undefined)).toBe("");
    expect(normalizeEmail(null)).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts a well-formed address", () => {
    // Arrange / Act / Assert
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("First.Last@sub.domain.io")).toBe(true);
  });

  it("rejects addresses without a domain or local part", () => {
    // Arrange / Act / Assert
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("@b.com")).toBe(false);
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects addresses containing internal whitespace", () => {
    // Arrange / Act / Assert
    expect(isValidEmail("a b@c.com")).toBe(false);
    expect(isValidEmail("a@c\n.com")).toBe(false);
  });

  it("tolerates surrounding whitespace by normalizing first", () => {
    // Arrange / Act / Assert — leading/trailing whitespace is trimmed
    expect(isValidEmail("  a@c.com\n")).toBe(true);
  });

  it("rejects addresses longer than 254 characters", () => {
    // Arrange
    const tooLong = "a".repeat(250) + "@b.com";

    // Act / Assert
    expect(isValidEmail(tooLong)).toBe(false);
  });
});

describe("randomToken", () => {
  it("produces URL-safe tokens without padding", () => {
    // Arrange / Act
    const token = randomToken();

    // Assert
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toContain("=");
  });

  it("produces a unique value on each call", () => {
    // Arrange / Act
    const tokens = new Set(Array.from({ length: 100 }, () => randomToken()));

    // Assert
    expect(tokens.size).toBe(100);
  });
});

describe("nowIso", () => {
  it("formats a supplied date as an ISO string", () => {
    // Arrange
    const date = new Date("2026-06-02T10:00:00.000Z");

    // Act
    const result = nowIso(date);

    // Assert
    expect(result).toBe("2026-06-02T10:00:00.000Z");
  });
});
