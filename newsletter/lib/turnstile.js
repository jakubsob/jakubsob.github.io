// Cloudflare Turnstile server-side verification. The form returns a single-use
// token (the `cf-turnstile-response` field); we exchange it with Cloudflare's
// siteverify endpoint to confirm a human solved the challenge. Uses global
// fetch, so it runs in the Worker unchanged.

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(secret, token, remoteip) {
  if (!secret || !token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  let res;
  try {
    res = await fetch(SITEVERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    return false; // network error → fail closed
  }
  if (!res.ok) return false;

  const data = await res.json().catch(() => ({}));
  return data.success === true;
}
