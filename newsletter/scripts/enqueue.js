// enqueue.js — run on publish. Turns the newest (or a named) blog post into a
// broadcast campaign: it renders nothing itself, instead reusing the live RSS
// feed (which already contains each post's rendered HTML), records the campaign
// in the data repo, and appends one pending queue entry per confirmed
// subscriber. The drain script does the actual sending.
//
// Env:
//   GITHUB_TOKEN   PAT with contents:write on DATA_REPO
//   DATA_REPO      "owner/name" of the private data repo
//   DATA_BRANCH    default "main"
//   RSS_URL        default https://jakubsobolewski.com/rss.xml
//   CAMPAIGN_SLUG  optional blog slug; default = newest post

import "./_env.js"; // load non-secret config from wrangler.toml (must be first)
import { readRecords, updateRecords, SUBSCRIBERS_PATH } from "../lib/store.js";
import { parseFeed } from "../lib/rss.js";
import { extractExcerpt } from "../lib/excerpt.js";
import { nowIso } from "../lib/tokens.js";

const CAMPAIGNS_PATH = "campaigns.ndjson";
const QUEUE_PATH = "queue.ndjson";

const config = {
  token: requireEnv("GITHUB_TOKEN"),
  repo: requireEnv("DATA_REPO"),
  branch: process.env.DATA_BRANCH || "main",
};
const RSS_URL = process.env.RSS_URL || "https://jakubsobolewski.com/rss.xml";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

// campaign id like "2026-06-02-my-post" — stable, sortable, human-readable.
function campaignId(item) {
  const d = new Date(item.pubDate);
  const date = Number.isNaN(d.getTime())
    ? "undated"
    : d.toISOString().slice(0, 10);
  return `${date}-${item.slug}`;
}

async function main() {
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`Failed to fetch RSS ${RSS_URL}: ${res.status}`);
  const items = parseFeed(await res.text());
  if (items.length === 0) throw new Error("No items found in RSS feed");

  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const wanted = process.env.CAMPAIGN_SLUG;
  const item = wanted
    ? items.find((i) => i.slug === wanted)
    : items[0];
  if (!item) throw new Error(`No post matching slug "${wanted}"`);

  const id = campaignId(item);
  // Teaser-style broadcasts: store only the intro (everything before the first
  // heading), not the whole post.
  const excerptHtml =
    extractExcerpt(item.contentHtml) || `<p>${item.description}</p>`;
  const campaign = {
    id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    url: item.link,
    excerptHtml,
    created_at: nowIso(),
  };

  // Record the campaign (idempotent on id).
  let alreadyExists = false;
  await updateRecords(
    config,
    CAMPAIGNS_PATH,
    (records) => {
      if (records.some((c) => c.id === id)) {
        alreadyExists = true;
        return records;
      }
      return [...records, campaign];
    },
    { message: `feat(newsletter): campaign ${id}` }
  );

  // Append a pending queue entry per confirmed subscriber, skipping any that
  // are already queued for this campaign (so re-running is safe).
  const subscribers = await readRecords(config, SUBSCRIBERS_PATH);
  const confirmed = subscribers.filter((s) => s.status === "confirmed");

  let added = 0;
  await updateRecords(
    config,
    QUEUE_PATH,
    (queue) => {
      const queued = new Set(
        queue.filter((q) => q.campaign === id).map((q) => q.email)
      );
      const fresh = confirmed
        .filter((s) => !queued.has(s.email))
        .map((s) => ({
          email: s.email,
          campaign: id,
          status: "pending",
          attempts: 0,
          enqueued_at: nowIso(),
        }));
      added = fresh.length;
      return [...queue, ...fresh];
    },
    { message: `feat(newsletter): enqueue ${id}` }
  );

  console.log(
    `Campaign ${id}${alreadyExists ? " (existing)" : " (new)"}: ` +
      `${confirmed.length} confirmed, ${added} newly enqueued.`
  );
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
