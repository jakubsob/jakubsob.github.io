# Lead-magnet downloads

Files in this directory are served at `https://jakubsobolewski.com/downloads/`
and delivered by the newsletter's lead-magnet email after a subscriber confirms.

The mapping from signup tag → file lives in
[`newsletter/lib/config.js`](../../newsletter/lib/config.js) (`LEAD_MAGNETS`).

Expected files:

- `r-testing-roadmap.pdf` — delivered to `roadmap` signups (from `/get-roadmap`).

Drop the actual asset here (or host it as a GitHub Release asset and point the
`file` URL at it) before going live.
