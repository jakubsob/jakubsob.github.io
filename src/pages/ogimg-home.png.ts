import fs from "fs/promises";
import satori from "satori";
import sharp from "sharp";
import type { APIRoute } from "astro";
import { createElement } from "react";

const BG = "#141210";
const FG = "#f0ebe6";
const PRIMARY = "#d4820a";
const W = 1200;
const H = 630;

const FONT_SIZE = 140;
const LINES = ["Building", "Quality", "By Testing"] as const;
const TEXT_TOP = 189;

export const GET: APIRoute = async function GET() {
  const [fontData, fontDataGeist, fontDataGeistBold] = await Promise.all([
    fs.readFile("node_modules/@fontsource/barlow/files/barlow-latin-700-normal.woff"),
    fs.readFile("node_modules/@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff"),
    fs.readFile("node_modules/@fontsource/geist-sans/files/geist-sans-latin-700-normal.woff"),
  ]);

  const authorImagePath = new URL("../../public/author.png", import.meta.url).pathname;
  const img = (await fs.readFile(authorImagePath)).toString("base64");

  const textRows = LINES.map((line, i) =>
    createElement(
      "span",
      {
        key: `row${i}`,
        style: {
          fontSize: `${FONT_SIZE}px`,
          fontWeight: 700,
          lineHeight: 0.88,
          letterSpacing: "-0.04em",
          color: i === 2 ? PRIMARY : FG,
          textTransform: "uppercase",
        },
      },
      line
    )
  );

  const svg = await satori(
    createElement(
      "div",
      {
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
          background: BG,
          fontFamily: "Barlow",
          position: "relative",
          overflow: "hidden",
        },
      },
      [
        // Text block — absolutely positioned with bottom anchored to TEXT_BOTTOM
        createElement(
          "div",
          {
            key: "text",
            style: {
              position: "absolute",
              top: `${TEXT_TOP}px`,
              left: "64px",
              display: "flex",
              flexDirection: "column",
            },
          },
          textRows
        ),

        // Author bubble + site pill (same as blog OG)
        createElement('div', {
          key: "footer",
          style: {
            position: "absolute",
            bottom: "20px",
            right: "20px",
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontFamily: 'Geist Sans',
          },
        }, [
          createElement('div', {
            style: {
              width: '60px',
              height: '60px',
              border: '2px solid #9e9590',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          }, [
            createElement('img', {
              src: `data:image/png;base64,${img}`,
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }
            })
          ]),
          createElement('span', {
            style: {
              padding: '16px 24px',
              background: '#d4820a',
              borderRadius: '50px',
              border: '2px solid #d4820a',
              color: '#141210',
              fontWeight: 400,
              fontSize: '20px',
            }
          }, 'jakubsobolewski.com →'),
        ]),
      ]
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Barlow", data: fontData, weight: 700, style: "normal" },
        { name: "Geist Sans", data: fontDataGeist, weight: 400, style: "normal" },
        { name: "Geist Sans", data: fontDataGeistBold, weight: 700, style: "normal" },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
