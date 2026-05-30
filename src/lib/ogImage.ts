import fs from "fs/promises";
import satori from "satori";
import sharp from "sharp";
import { createElement } from "react";

const BG = "#141210";
const FG = "#f0ebe6";
const PRIMARY = "#d4820a";
const W = 1200;
const H = 630;

const NAME_FONT_SIZE = 132;
const TEXT_TOP = 150;

export interface OgImageOptions {
  /** Small uppercase kicker above the title (e.g. "R & Shiny"). */
  eyebrow: string;
  /** Big display lines, one per row (e.g. ["Jakub", "Sobolewski"]). */
  lines: readonly string[];
  /** Supporting line under the title. */
  subline: string;
}

export async function renderOgImage(opts: OgImageOptions): Promise<Buffer> {
  const { eyebrow, lines, subline } = opts;

  const [fontData, fontDataGeist, fontDataGeistBold] = await Promise.all([
    fs.readFile(
      "node_modules/@fontsource/barlow/files/barlow-latin-700-normal.woff",
    ),
    fs.readFile(
      "node_modules/@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff",
    ),
    fs.readFile(
      "node_modules/@fontsource/geist-sans/files/geist-sans-latin-700-normal.woff",
    ),
  ]);

  const authorImagePath = new URL("../../public/author.png", import.meta.url)
    .pathname;
  const img = (await fs.readFile(authorImagePath)).toString("base64");

  const eyebrowEl = createElement(
    "span",
    {
      key: "eyebrow",
      style: {
        fontFamily: "Geist Sans",
        fontSize: "34px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: PRIMARY,
        marginBottom: "20px",
      },
    },
    eyebrow,
  );

  const nameRows = lines.map((line, i) =>
    createElement(
      "span",
      {
        key: `name${i}`,
        style: {
          fontSize: `${NAME_FONT_SIZE}px`,
          fontWeight: 700,
          lineHeight: 0.88,
          letterSpacing: "-0.04em",
          color: FG,
          textTransform: "uppercase",
        },
      },
      line,
    ),
  );

  const sublineEl = createElement(
    "span",
    {
      key: "subline",
      style: {
        fontFamily: "Geist Sans",
        fontSize: "30px",
        fontWeight: 400,
        color: "#b8afa8",
        marginTop: "30px",
        maxWidth: "780px",
      },
    },
    subline,
  );

  const textRows = [eyebrowEl, ...nameRows, sublineEl];

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
          textRows,
        ),

        createElement(
          "div",
          {
            key: "footer",
            style: {
              position: "absolute",
              bottom: "20px",
              right: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontFamily: "Geist Sans",
            },
          },
          [
            createElement(
              "div",
              {
                style: {
                  width: "60px",
                  height: "60px",
                  border: "2px solid #9e9590",
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              [
                createElement("img", {
                  src: `data:image/png;base64,${img}`,
                  style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  },
                }),
              ],
            ),
            createElement(
              "span",
              {
                style: {
                  padding: "16px 24px",
                  background: "#d4820a",
                  borderRadius: "50px",
                  border: "2px solid #d4820a",
                  color: "#141210",
                  fontWeight: 400,
                  fontSize: "20px",
                },
              },
              "jakubsobolewski.com →",
            ),
          ],
        ),
      ],
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Barlow", data: fontData, weight: 700, style: "normal" },
        {
          name: "Geist Sans",
          data: fontDataGeist,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist Sans",
          data: fontDataGeistBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
