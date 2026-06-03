// drain.js — daily cron. Sends up to a fixed daily budget of queued broadcast
// emails, marks each entry sent the instant the send succeeds, and stops.
// Because it runs once a day with a fixed cap, the daily provider quota is
// respected without a separate counter; tomorrow's run picks up the rest.
//
// Env:
//   GITHUB_TOKEN, DATA_REPO, DATA_BRANCH   data repo access
//   BREVO_API_KEY, MAIL_PROVIDER, MAIL_FROM_*, MAIL_REPLY_TO   send adapter
//   WORKER_PUBLIC_URL   used to build per-recipient unsubscribe links
//   DAILY_BUDGET        broadcast sends per run (default 80; reserve the rest
//                       of the provider's daily cap for opt-in / lead magnets)
//   MAX_ATTEMPTS        give up after this many failures (default 3)

import "./_env.js"; // load non-secret config from wrangler.toml (must be first)
import { readRecords, updateRecords } from "../lib/store.js";
import { sendEmail } from "../lib/adapter.js";
import { broadcastEmail } from "../lib/templates.js";
import { nowIso } from "../lib/tokens.js";

const CAMPAIGNS_PATH = "campaigns.ndjson";
const QUEUE_PATH = "queue.ndjson";
const SUBSCRIBERS_PATH = "subscribers.ndjson";

const config = {
  token: requireEnv("GITHUB_TOKEN"),
  repo: requireEnv("DATA_REPO"),
  branch: process.env.DATA_BRANCH || "main",
};
const BUDGET = Number(process.env.DAILY_BUDGET || 80);
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS || 3);
const env = process.env;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

// Flip a single queue entry (matched by campaign+email) to a terminal or
// retry state, and commit immediately. Keeping each write atomic means a
// mid-run crash can never double-send: a sent entry is already persisted.
function patchEntry(campaign, email, patch, message) {
  return updateRecords(
    config,
    QUEUE_PATH,
    (queue) => {
      const idx = queue.findIndex(
        (q) => q.campaign === campaign && q.email === email
      );
      if (idx === -1) return queue;
      const next = [...queue];
      next[idx] = { ...next[idx], ...patch };
      return next;
    },
    { message }
  );
}

async function main() {
  const [queue, campaigns, subscribers] = await Promise.all([
    readRecords(config, QUEUE_PATH),
    readRecords(config, CAMPAIGNS_PATH),
    readRecords(config, SUBSCRIBERS_PATH),
  ]);

  const campaignById = new Map(campaigns.map((c) => [c.id, c]));
  const subByEmail = new Map(subscribers.map((s) => [s.email, s]));

  const pending = queue.filter(
    (q) => q.status === "pending" && (q.attempts || 0) < MAX_ATTEMPTS
  );

  if (pending.length === 0) {
    console.log("Nothing to send.");
    return;
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of pending) {
    if (sent >= BUDGET) break;

    const campaign = campaignById.get(entry.campaign);
    if (!campaign) {
      await patchEntry(entry.campaign, entry.email, {
        status: "error",
        last_error: "campaign not found",
      }, `chore(newsletter): drop ${entry.email} (no campaign)`);
      skipped++;
      continue;
    }

    // Respect consent at send time: someone may have unsubscribed after being
    // enqueued. Only confirmed subscribers get the broadcast.
    const sub = subByEmail.get(entry.email);
    if (!sub || sub.status !== "confirmed") {
      await patchEntry(entry.campaign, entry.email, {
        status: "skipped",
        last_error: "not confirmed at send time",
      }, `chore(newsletter): skip ${entry.email} (unsubscribed)`);
      skipped++;
      continue;
    }

    const unsubscribeUrl =
      `${env.WORKER_PUBLIC_URL}/unsubscribe?token=${sub.unsubscribe_token}`;
    const { subject, html } = broadcastEmail({
      title: campaign.title,
      url: campaign.url,
      // `contentHtml` fallback covers campaigns enqueued before teaser mode.
      excerptHtml: campaign.excerptHtml || campaign.contentHtml || "",
      unsubscribeUrl,
    });

    try {
      await sendEmail(env, { to: sub.email, subject, html });
      await patchEntry(entry.campaign, entry.email, {
        status: "sent",
        sent_at: nowIso(),
      }, `feat(newsletter): sent ${entry.campaign} to ${entry.email}`);
      sent++;
    } catch (err) {
      const attempts = (entry.attempts || 0) + 1;
      const gaveUp = attempts >= MAX_ATTEMPTS;
      await patchEntry(entry.campaign, entry.email, {
        status: gaveUp ? "failed" : "pending",
        attempts,
        last_error: String(err.message || err).slice(0, 200),
      }, `chore(newsletter): send failed ${entry.email} (try ${attempts})`);
      if (gaveUp) failed++;
      console.error(`Send to ${entry.email} failed: ${err.message}`);
    }
  }

  const remaining = pending.length - sent - skipped - failed;
  console.log(
    `Drained: ${sent} sent, ${skipped} skipped, ${failed} failed, ` +
      `~${Math.max(0, remaining)} still pending (budget ${BUDGET}).`
  );
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
