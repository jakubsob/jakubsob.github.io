// Side-effect import: load the non-secret newsletter config from the single
// source of truth, the Worker's wrangler.toml [vars] table, into process.env.
// This way the scripts (and `task newsletter:*`) need only the two real secrets
// (GITHUB_TOKEN, BREVO_API_KEY) in newsletter/.env — everything else (DATA_REPO,
// MAIL_FROM_*, WORKER_PUBLIC_URL, ...) is read from the toml.
//
// Anything already set in the environment wins, so secrets and one-off
// overrides (CAMPAIGN_SLUG, DAILY_BUDGET, a test DATA_REPO) take precedence.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tomlPath =
  process.env.WRANGLER_TOML || join(here, "..", "worker", "wrangler.toml");

// Minimal parser for the [vars] table of our own, controlled wrangler.toml.
function parseVars(text) {
  const vars = {};
  let inVars = false;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    if (line.startsWith("[")) {
      inVars = line === "[vars]";
      continue;
    }
    if (!inVars) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();

    const quoted = val.match(/^"([^"]*)"|^'([^']*)'/);
    if (quoted) {
      val = quoted[1] !== undefined ? quoted[1] : quoted[2];
    } else {
      val = val.split("#")[0].trim(); // strip trailing inline comment
    }
    vars[key] = val;
  }
  return vars;
}

try {
  const vars = parseVars(readFileSync(tomlPath, "utf8"));
  for (const [key, value] of Object.entries(vars)) {
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
} catch (err) {
  console.warn(`Could not read vars from ${tomlPath}: ${err.message}`);
}
