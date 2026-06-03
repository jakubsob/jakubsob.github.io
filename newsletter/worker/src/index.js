// Cloudflare Worker: the public HTTP surface of the self-owned newsletter.
//
//   POST /subscribe       { email, tags? }  -> append pending, send opt-in
//   GET  /confirm?token=  -> pending -> confirmed, send lead magnet, redirect
//   GET  /unsubscribe?token= -> -> unsubscribed, redirect
//
// All state lives in the private data repo (via the GitHub Contents API); this
// Worker holds no database. The provider is reached only through the adapter.

import {
  findSubscriberByEmail,
  upsertPendingSubscriber,
  setStatusByToken,
} from "../../lib/store.js";
import { sendEmail } from "../../lib/adapter.js";
import { verifyTurnstile } from "../../lib/turnstile.js";
import {
  confirmEmail,
  leadMagnetEmail,
} from "../../lib/templates.js";
import { leadMagnetForTags } from "../../lib/config.js";
import {
  isValidEmail,
  normalizeEmail,
  randomToken,
  nowIso,
} from "../../lib/tokens.js";

function storeConfig(env) {
  return {
    token: env.GITHUB_TOKEN,
    repo: env.DATA_REPO,
    branch: env.DATA_BRANCH || "main",
  };
}

// --- CORS --------------------------------------------------------------------
function corsHeaders(env, request) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
  const origin = request.headers.get("Origin") || "";
  const allow = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function redirect(url) {
  return new Response(null, { status: 302, headers: { Location: url } });
}

// --- handlers ----------------------------------------------------------------

async function handleSubscribe(request, env) {
  const cors = corsHeaders(env, request);
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }

  // Bot protection: when a Turnstile secret is configured, require and verify
  // the challenge token before doing any work. Skipped when unset (local dev).
  if (env.TURNSTILE_SECRET) {
    const token =
      payload.token || payload["cf-turnstile-response"] || "";
    if (!token) {
      return json(
        { error: "Missing verification token" },
        { status: 400, headers: cors }
      );
    }
    const ip = request.headers.get("CF-Connecting-IP");
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, token, ip);
    if (!ok) {
      return json(
        { error: "Verification failed" },
        { status: 403, headers: cors }
      );
    }
  }

  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    return json({ error: "Invalid email" }, { status: 400, headers: cors });
  }
  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((t) => typeof t === "string").slice(0, 10)
    : [];

  const config = storeConfig(env);

  // If already confirmed, succeed silently — don't reveal subscription status
  // and don't re-send the opt-in.
  const existing = await findSubscriberByEmail(config, email);
  if (existing && existing.status === "confirmed") {
    return json({ ok: true }, { headers: cors });
  }

  const subscriber = {
    email,
    status: "pending",
    tags,
    subscribed_at: nowIso(),
    confirmed_at: null,
    confirm_token: randomToken(),
    unsubscribe_token: randomToken(),
    source: payload.source || "blog-form",
  };

  const stored = await upsertPendingSubscriber(config, subscriber);

  const confirmUrl =
    `${env.WORKER_PUBLIC_URL}/confirm?token=${stored.confirm_token}`;
  const { subject, html } = confirmEmail({ confirmUrl });
  await sendEmail(env, { to: email, subject, html });

  return json({ ok: true }, { headers: cors });
}

async function handleConfirm(request, env) {
  const token = new URL(request.url).searchParams.get("token");
  const site = env.SITE_URL;
  if (!token) return redirect(`${site}/newsletter/error`);

  const config = storeConfig(env);
  const subscriber = await setStatusByToken(
    config,
    "confirm_token",
    token,
    "confirmed",
    { confirmed_at: nowIso() }
  );

  if (!subscriber) return redirect(`${site}/newsletter/error`);

  // Deliver the lead magnet matching whatever tag they signed up through.
  const magnet = leadMagnetForTags(subscriber.tags);
  const unsubscribeUrl =
    `${env.WORKER_PUBLIC_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;
  const { subject, html } = leadMagnetEmail({ magnet, unsubscribeUrl });
  await sendEmail(env, { to: subscriber.email, subject, html });

  return redirect(`${site}/newsletter/confirmed`);
}

async function handleUnsubscribe(request, env) {
  const token = new URL(request.url).searchParams.get("token");
  const site = env.SITE_URL;
  if (!token) return redirect(`${site}/newsletter/error`);

  const config = storeConfig(env);
  const subscriber = await setStatusByToken(
    config,
    "unsubscribe_token",
    token,
    "unsubscribed",
    { unsubscribed_at: nowIso() }
  );

  if (!subscriber) return redirect(`${site}/newsletter/error`);
  return redirect(`${site}/newsletter/unsubscribed`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    try {
      if (request.method === "POST" && url.pathname === "/subscribe") {
        return await handleSubscribe(request, env);
      }
      if (request.method === "GET" && url.pathname === "/confirm") {
        return await handleConfirm(request, env);
      }
      if (request.method === "GET" && url.pathname === "/unsubscribe") {
        return await handleUnsubscribe(request, env);
      }
      return new Response("Not found", { status: 404 });
    } catch (err) {
      // Never leak internals to the caller; surface the message to logs.
      console.error("newsletter worker error:", err.stack || err.message);
      if (url.pathname === "/subscribe") {
        return json(
          { error: "Something went wrong" },
          { status: 500, headers: corsHeaders(env, request) }
        );
      }
      return redirect(`${env.SITE_URL}/newsletter/error`);
    }
  },
};
