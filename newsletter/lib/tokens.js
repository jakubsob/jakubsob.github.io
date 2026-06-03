// Small helpers shared by the Worker and the Action scripts: email validation
// and cryptographically-random, URL-safe tokens. Uses the Web Crypto API,
// global in Cloudflare Workers and in Node 20+.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  const normalized = normalizeEmail(email);
  return normalized.length <= 254 && EMAIL_RE.test(normalized);
}

// 32 random bytes, base64url-encoded — unguessable and safe in a URL.
export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// A stable ISO timestamp. Pass a Date when determinism matters (tests, resume).
export function nowIso(date) {
  return (date || new Date()).toISOString();
}
