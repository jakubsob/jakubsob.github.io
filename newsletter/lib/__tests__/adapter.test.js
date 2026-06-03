import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail } from "../adapter.js";

const baseEnv = {
  MAIL_PROVIDER: "brevo",
  BREVO_API_KEY: "brevo-key",
  MAIL_FROM_NAME: "Jakub Sobolewski",
  MAIL_FROM_EMAIL: "newsletter@jakubsobolewski.com",
  MAIL_REPLY_TO: "jakub@jakubsobolewski.com",
};

const message = {
  to: "subscriber@example.com",
  subject: "Hello",
  html: "<p>Hi</p>",
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendEmail via Brevo", () => {
  it("POSTs the correct payload and headers and returns the message id", async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ messageId: "msg-1" }),
    });

    // Act
    const result = await sendEmail(baseEnv, message);

    // Assert
    expect(result).toEqual({ id: "msg-1" });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.headers["api-key"]).toBe("brevo-key");
    const body = JSON.parse(init.body);
    expect(body.sender).toEqual({
      name: "Jakub Sobolewski",
      email: "newsletter@jakubsobolewski.com",
    });
    expect(body.to).toEqual([{ email: "subscriber@example.com" }]);
    expect(body.replyTo).toEqual({ email: "jakub@jakubsobolewski.com" });
    expect(body.subject).toBe("Hello");
    expect(body.htmlContent).toBe("<p>Hi</p>");
  });

  it("throws with the provider response when the send fails", async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });

    // Act / Assert
    await expect(sendEmail(baseEnv, message)).rejects.toThrow(
      /Brevo send failed: 401 unauthorized/
    );
  });
});

describe("sendEmail configuration guards", () => {
  it("defaults the provider to brevo when MAIL_PROVIDER is unset", async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ messageId: "msg-2" }),
    });
    const env = { ...baseEnv, MAIL_PROVIDER: undefined };

    // Act
    await sendEmail(env, message);

    // Assert
    expect(fetch.mock.calls[0][0]).toBe("https://api.brevo.com/v3/smtp/email");
  });

  it("throws for an unknown provider", async () => {
    // Arrange
    const env = { ...baseEnv, MAIL_PROVIDER: "carrier-pigeon" };

    // Act / Assert
    await expect(sendEmail(env, message)).rejects.toThrow(
      /Unknown MAIL_PROVIDER/
    );
  });

  it("throws when the from address is not configured", async () => {
    // Arrange
    const env = { ...baseEnv, MAIL_FROM_EMAIL: undefined };

    // Act / Assert
    await expect(sendEmail(env, message)).rejects.toThrow(
      /MAIL_FROM_EMAIL is not set/
    );
  });
});
