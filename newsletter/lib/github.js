// Low-level client for the GitHub Contents API.
//
// The newsletter owns its state as files in a private repo. This module is the
// only place that talks to GitHub: it reads a file (returning its text + blob
// sha) and writes a file back (using the sha for optimistic concurrency). It
// uses global `fetch`, so it runs unchanged in Cloudflare Workers and in
// Node 18+ (GitHub Actions).

const API = "https://api.github.com";

// Parse "owner/repo" into its parts.
function splitRepo(repo) {
  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new Error(`Invalid repo "${repo}", expected "owner/name"`);
  }
  return { owner, name };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "jakubsobolewski-newsletter",
  };
}

// base64 <-> utf8 helpers that work in both Workers and Node. The GitHub
// Contents API exchanges file bodies as base64.
function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(base64) {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Read a file. Returns { text, sha } or { text: "", sha: null } when the file
// does not exist yet (so callers can create it on first write).
export async function getFile({ token, repo, path, branch = "main" }) {
  const { owner, name } = splitRepo(repo);
  const url =
    `${API}/repos/${owner}/${name}/contents/${path}` +
    `?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: headers(token) });

  if (res.status === 404) return { text: "", sha: null };
  if (!res.ok) {
    throw new Error(`GitHub getFile ${path} failed: ${res.status}`);
  }

  const json = await res.json();
  return { text: decodeBase64(json.content), sha: json.sha };
}

// Write a file. Pass the sha returned by getFile to update in place, or null to
// create. Returns the new blob sha. A 409 (sha conflict) is surfaced so callers
// can re-read and retry.
export async function putFile({
  token,
  repo,
  path,
  branch = "main",
  text,
  sha,
  message,
}) {
  const { owner, name } = splitRepo(repo);
  const url = `${API}/repos/${owner}/${name}/contents/${path}`;
  const body = {
    message: message || `chore(newsletter): update ${path}`,
    content: encodeBase64(text),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    const err = new Error(`GitHub putFile ${path} conflict`);
    err.conflict = true;
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GitHub putFile ${path} failed: ${res.status} ${detail}`);
  }

  const json = await res.json();
  return json.content.sha;
}
