// Owned email templates. Plain functions returning HTML strings — no template
// lives in a provider GUI, and the same code runs in the Worker (opt-in /
// lead-magnet emails) and in the drain script (broadcasts).
//
// Styling mirrors the site's LIGHT theme, with the design tokens converted from
// oklch to hex (email clients don't support oklch): warm near-white canvas,
// near-black warm text, orange primary, ocean-green success, Barlow + Fira Code
// fonts, uppercase light headings, and square "surface" corners.

import { SITE_NAME, SITE_URL } from "./config.js";

const BRAND = SITE_NAME;

// Hex equivalents of the app's light-mode tokens (src/styles/global.css).
const C = {
  bg: "#fbf8f4", // --background
  card: "#fdfbf9", // --card
  surface: "#f7ece2", // --secondary (warm pale, footer)
  text: "#0c0806", // --foreground
  muted: "#4f4c4a", // --muted-foreground
  border: "#e3e1de", // --border
  primary: "#e66900", // --primary (orange)
  onPrimary: "#0c0806", // --primary-foreground (dark text on orange)
  green: "#37A577", // ocean-green (success)
};

const FONT_SANS = "'Barlow','Helvetica Neue',Arial,sans-serif";
const FONT_MONO = "'Fira Code','SFMono-Regular',Consolas,monospace";

const STYLES = `
  body { margin:0; padding:0; background-color:${C.bg}; color:${C.text};
    font-family:${FONT_SANS}; -webkit-font-smoothing:antialiased; }
  table { border-collapse:collapse; }
  img { border:0; line-height:100%; }
  .wrap { background-color:${C.bg}; }
  .card { width:600px; max-width:100%; margin:0 auto; background-color:${C.card};
    border:1px solid ${C.border}; }
  .accent { height:4px; line-height:4px; font-size:0; background-color:${C.primary}; }
  .px { padding-left:40px; padding-right:40px; }
  .eyebrow { font-family:${FONT_MONO}; font-size:13px; letter-spacing:0.06em;
    color:${C.muted}; margin:0 0 18px; }
  .title { font-family:${FONT_SANS}; font-size:34px; line-height:1.15;
    font-weight:300; text-transform:uppercase; margin:0; color:${C.text}; }
  .subtitle { font-size:18px; line-height:1.5; color:${C.muted}; margin:16px 0 0; }
  .divider { height:1px; line-height:1px; font-size:0; background-color:${C.border}; }
  .btn { display:inline-block; font-family:${FONT_SANS}; font-weight:700;
    font-size:16px; line-height:1; padding:15px 28px; background-color:${C.primary};
    color:${C.onPrimary} !important; text-decoration:none; }
  .p { font-size:17px; line-height:1.6; color:${C.text}; margin:0 0 16px; }
  .muted { color:${C.muted}; }
  .small { font-size:14px; }
  .check { color:${C.green}; }
  a { color:${C.primary}; }
  .footer-text { font-size:13px; line-height:1.6; color:${C.muted}; margin:0; }
  .footer-text a { color:${C.muted}; }
  /* Article excerpt: bare tags from the rendered post */
  .body p { font-size:17px; line-height:1.6; color:${C.text}; margin:0 0 16px; }
  .body ul, .body ol { font-size:17px; line-height:1.6; color:${C.text};
    margin:0 0 16px; padding-left:22px; }
  .body li { margin:0 0 8px; }
  .body a { color:${C.primary}; }
  .body code { font-family:${FONT_MONO}; font-size:0.92em; background-color:${C.surface};
    padding:1px 5px; }
`;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Shared chrome: orange accent bar, a light header (wordmark + uppercase title),
// a body slot, and a footer carrying the unsubscribe link when one is given.
function layout({ title, subtitle, body, unsubscribeUrl, footerNote }) {
  const header = `
    <tr><td class="px" style="padding-top:40px;padding-bottom:32px;">
      <p class="eyebrow">${BRAND}</p>
      <h1 class="title">${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
    </td></tr>`;

  const footer = `
    <tr><td class="divider"></td></tr>
    <tr><td class="px" style="padding-top:28px;padding-bottom:36px;background-color:${C.surface};">
      <p class="footer-text">
        ${footerNote ||
          `You received this email because you signed up at ` +
            `<a href="${SITE_URL}">jakubsobolewski.com</a>.`}
        ${unsubscribeUrl
          ? `<br><a href="${unsubscribeUrl}" style="text-decoration:underline;">Unsubscribe</a>`
          : ""}
      </p>
    </td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700&family=Fira+Code&display=swap" rel="stylesheet">
  <style>${STYLES}</style>
</head>
<body>
  <center class="wrap" style="padding:32px 12px;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="wrap">
      <tr><td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="card">
          ${header}
          <tr><td class="divider"></td></tr>
          <tr><td class="px" style="padding-top:36px;padding-bottom:40px;">${body}</td></tr>
          ${footer}
        </table>
      </td></tr>
    </table>
  </center>
</body>
</html>`;
}

// Double opt-in: the only thing this email does is confirm intent.
export function confirmEmail({ confirmUrl }) {
  const body = `
    <p class="p">Thanks for signing up. One quick step to confirm it's really
      you:</p>
    <p style="margin:28px 0;">
      <a href="${confirmUrl}" class="btn">Confirm my subscription &rarr;</a>
    </p>
    <p class="p muted small">If the button doesn't work, paste this link into
      your browser:<br><a href="${confirmUrl}">${confirmUrl}</a></p>
    <p class="p muted small">Didn't request this? Ignore this email and nothing
      happens.</p>`;
  return {
    subject: "Please confirm your subscription",
    html: layout({
      title: "Confirm your email",
      body,
      footerNote:
        "You're receiving this because someone entered this address at " +
        "jakubsobolewski.com. No action is needed if it wasn't you.",
    }),
  };
}

// Sent right after confirmation. Delivers the lead magnet (if any) and always
// carries an unsubscribe link.
export function leadMagnetEmail({ magnet, unsubscribeUrl }) {
  const downloadUrl = magnet.file ? SITE_URL + magnet.file : null;
  const body = `
    <p class="p"><span class="check">&#10003;</span> You're in — your
      subscription is confirmed.</p>
    ${downloadUrl
      ? `<p class="p">Here's ${magnet.label || "your download"}:</p>
         <p style="margin:28px 0;">
           <a href="${downloadUrl}" class="btn">Download &rarr;</a>
         </p>`
      : `<p class="p">I'll email you when there's something worth reading —
          practical notes on testing R and Shiny.</p>`}
    <p class="p muted small">Just reply to this email if you ever want to reach
      me directly.</p>`;
  return {
    subject: magnet.subject,
    html: layout({ title: "You're confirmed", body, unsubscribeUrl }),
  };
}

// The newsletter broadcast: a teaser. It shows the article's intro
// (`excerptHtml`, the author's own first paragraphs — trusted, so not escaped)
// and a prominent link to read the rest on the web. Keeping it to the lede
// avoids email-client quirks with code blocks and Gmail's ~102KB clip.
export function broadcastEmail({ title, url, excerptHtml, unsubscribeUrl }) {
  const body = `
    <div class="body">${excerptHtml}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
      <tr><td align="center">
        <a href="${url}" class="btn">Read the full article &rarr;</a>
      </td></tr>
    </table>`;
  return {
    subject: title,
    html: layout({ title, body, unsubscribeUrl }),
  };
}
