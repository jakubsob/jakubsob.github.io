import { describe, it, expect } from "vitest";
import {
  confirmEmail,
  leadMagnetEmail,
  broadcastEmail,
} from "../templates.js";

describe("confirmEmail", () => {
  it("embeds the confirm URL in both a button and a fallback link", () => {
    // Arrange
    const confirmUrl = "https://worker.example/confirm?token=abc123";

    // Act
    const { subject, html } = confirmEmail({ confirmUrl });

    // Assert
    expect(subject).toBe("Please confirm your subscription");
    expect(html).toContain(`href="${confirmUrl}"`);
    expect(html).toContain("Confirm my subscription");
  });

  it("does not carry an unsubscribe link before opt-in", () => {
    // Arrange
    const confirmUrl = "https://worker.example/confirm?token=abc";

    // Act
    const { html } = confirmEmail({ confirmUrl });

    // Assert
    expect(html).not.toContain("/unsubscribe");
  });
});

describe("leadMagnetEmail", () => {
  it("renders a download button when the magnet has a file", () => {
    // Arrange
    const magnet = {
      subject: "Your roadmap",
      file: "/downloads/roadmap.pdf",
      label: "the roadmap",
    };
    const unsubscribeUrl = "https://worker.example/unsubscribe?token=u1";

    // Act
    const { subject, html } = leadMagnetEmail({ magnet, unsubscribeUrl });

    // Assert
    expect(subject).toBe("Your roadmap");
    expect(html).toContain(
      'href="https://jakubsobolewski.com/downloads/roadmap.pdf"'
    );
    expect(html).toContain(`href="${unsubscribeUrl}"`);
  });

  it("omits the download button when the magnet has no file", () => {
    // Arrange
    const magnet = { subject: "Welcome", file: null };
    const unsubscribeUrl = "https://worker.example/unsubscribe?token=u2";

    // Act
    const { html } = leadMagnetEmail({ magnet, unsubscribeUrl });

    // Assert
    expect(html).not.toContain("/downloads/");
    expect(html).toContain(`href="${unsubscribeUrl}"`);
  });
});

describe("broadcastEmail", () => {
  it("includes the excerpt, a read-the-full-article link, and unsubscribe", () => {
    // Arrange
    const args = {
      title: "My Post",
      url: "https://jakubsobolewski.com/blog/my-post",
      excerptHtml: "<p>Hello <strong>world</strong></p>",
      unsubscribeUrl: "https://worker.example/unsubscribe?token=u3",
    };

    // Act
    const { subject, html } = broadcastEmail(args);

    // Assert
    expect(subject).toBe("My Post");
    expect(html).toContain("<p>Hello <strong>world</strong></p>");
    expect(html).toContain("Read the full article");
    expect(html).toContain(`href="${args.url}"`);
    expect(html).toContain(`href="${args.unsubscribeUrl}"`);
  });

  it("escapes the title in the header to prevent markup injection", () => {
    // Arrange
    const args = {
      title: "Tags <script> & co",
      url: "https://example.com",
      excerptHtml: "<p>body</p>",
      unsubscribeUrl: "https://worker.example/unsubscribe?token=u4",
    };

    // Act
    const { html } = broadcastEmail(args);

    // Assert
    expect(html).toContain("Tags &lt;script&gt; &amp; co");
    expect(html).not.toContain("<script>");
  });
});
