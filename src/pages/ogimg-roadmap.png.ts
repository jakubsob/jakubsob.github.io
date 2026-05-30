import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/ogImage";

export const GET: APIRoute = async function GET() {
  const png = await renderOgImage({
    eyebrow: "Free Guide",
    lines: ["R Testing", "Roadmap"],
    subline: "a step-by-step path to tests you can trust",
  });

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
