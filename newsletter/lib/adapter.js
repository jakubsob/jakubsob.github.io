// The send adapter: the one place that knows about an email provider. Every
// transactional provider takes the same { from, to, subject, html } shape, so
// each implementation is tiny and switching providers never touches the logic
// above it. Selected at runtime by env.MAIL_PROVIDER.
//
// `env` is the Worker bindings object or `process.env` — both expose the same
// keys, so this module stays runtime-agnostic.

// --- Brevo (https://developers.brevo.com/reference/sendtransacemail) ---------
async function sendViaBrevo({ env, from, to, subject, html, replyTo }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: from.name, email: from.email },
      to: [{ email: to }],
      replyTo: replyTo ? { email: replyTo } : undefined,
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Brevo send failed: ${res.status} ${detail}`);
  }
  const json = await res.json().catch(() => ({}));
  return { id: json.messageId };
}

// Add new providers here — each is the same shape. Swapping is an env var.
const PROVIDERS = {
  brevo: sendViaBrevo,
  // ses: sendViaSES,
  // resend: sendViaResend,
};

// Send one email through the configured provider. `from` defaults to the
// MAIL_FROM_* env vars so callers only pass { to, subject, html }.
export async function sendEmail(env, { to, subject, html, replyTo }) {
  const provider = env.MAIL_PROVIDER || "brevo";
  const send = PROVIDERS[provider];
  if (!send) throw new Error(`Unknown MAIL_PROVIDER "${provider}"`);

  const from = {
    name: env.MAIL_FROM_NAME || "Jakub Sobolewski",
    email: env.MAIL_FROM_EMAIL,
  };
  if (!from.email) throw new Error("MAIL_FROM_EMAIL is not set");

  return send({
    env,
    from,
    to,
    subject,
    html,
    replyTo: replyTo || env.MAIL_REPLY_TO,
  });
}
