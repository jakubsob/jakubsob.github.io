import type { APIRoute } from 'astro';
import { codeToHtml } from 'shiki';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code, language } = body;

    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid code provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default to text if no language provided
    const lang = language || 'text';

    // Highlight the code with Shiki
    const html = await codeToHtml(code, {
      lang: lang,
      theme: 'github-light',
      transformers: []
    });

    return new Response(JSON.stringify({ html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error highlighting code:', error);

    // Return a fallback response
    const { code } = await request.json();
    const fallbackHtml = `<pre class="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded border overflow-x-auto"><code>${escapeHtml(code)}</code></pre>`;

    return new Response(JSON.stringify({ html: fallbackHtml }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
