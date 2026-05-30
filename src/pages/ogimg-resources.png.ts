import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/ogImage";

export const GET: APIRoute = async function GET() {
  const png = await renderOgImage({
    eyebrow: "Resources",
    lines: ["Testing &", "Engineering"],
    subline: "the references that shaped how I build R & Shiny",
  });

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
