import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/ogImage";

export const GET: APIRoute = async function GET() {
  const png = await renderOgImage({
    eyebrow: "R Tests Gallery",
    lines: ["R Testing", "Patterns"],
    subline: "real-world testing patterns from R projects",
  });

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
