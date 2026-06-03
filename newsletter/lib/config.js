// Static configuration shared across the newsletter stack. Values that are
// secret (API keys, tokens) come from env; values that are just site facts
// live here so templates and scripts agree on them.

export const SITE_URL = "https://jakubsobolewski.com";
export const SITE_NAME = "Jakub Sobolewski";

// Lead magnets, keyed by the tag captured at signup. `file` is resolved against
// SITE_URL and is served from the blog repo's public/downloads/ directory.
// `default` is used when a signup carries no recognised tag.
export const LEAD_MAGNETS = {
  default: {
    subject: "Welcome — here's what to expect",
    file: null,
  },
  roadmap: {
    subject: "Your R Testing Roadmap is ready",
    file: "/downloads/r-testing-roadmap.pdf",
    label: "the R Testing Roadmap",
  },
};

export function leadMagnetForTags(tags = []) {
  for (const tag of tags) {
    if (LEAD_MAGNETS[tag]) return LEAD_MAGNETS[tag];
  }
  return LEAD_MAGNETS.default;
}
