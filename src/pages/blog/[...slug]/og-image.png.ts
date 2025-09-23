import fs from "fs/promises";
import satori from "satori";
import sharp from "sharp";
import type { APIRoute } from "astro";
import { createElement } from "react";
import { getCollection, getEntry } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: post,
  }));
}

export const GET: APIRoute = async function GET({ params, props }) {
  // Get the blog post data
  const post = props;

  const fontData = await fs.readFile(
    "node_modules/@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff"
  );

  const fontDataBold = await fs.readFile(
    "node_modules/@fontsource/geist-sans/files/geist-sans-latin-700-normal.woff"
  );

  // Load author image with absolute path from project root
  const authorImagePath = new URL("../../../../public/author.png", import.meta.url).pathname;
  const img = (await fs.readFile(authorImagePath)).toString("base64");

  // Create a more sophisticated OG image with the blog post title
  const svg = await satori(
    createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
        color: '#f2f2f2',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)',
        padding: '20px 20px',
        fontFamily: 'Geist Sans, "Lucide Icons',
      }
    }, [
      // Blog post title
      createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
        }
      }, [
        createElement('h1', {
          style: {
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '0px',
            maxWidth: '100%',
            textAlign: 'left',
            textWrap: 'balance',
          }
        }, [post.data.title]),

        // Description if available
        post.data.description && createElement('p', {
          style: {
            fontSize: '28px',
            marginTop: '24px',
            lineHeight: 1.4,
            maxWidth: '100%',
            color: '#808080',
            textWrap: 'balance',
          }
        }, post.data.description),
      ]),

      // Author and site info
      createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          fontSize: '24px',
          width: '100%',
        }
      }, [
        // Author bubble and site pill container
        createElement('div', {
          style: {
            display: 'flex',
            marginLeft: 'auto',
            alignItems: 'center',
            gap: '16px',
          }
        }, [
          // Author image bubble
          createElement('div', {
            style: {
              width: '60px',
              height: '60px',
              border: '2px solid #808080',
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

          // Site name pill
          createElement('span', {
            style: {
              padding: '16px 24px',
              background: '#f2f2f2',
              borderRadius: '50px',
              border: '2px solid #f2f2f2',
              color: '#000000',
              fontWeight: 400,
              fontSize: '20px',
            }
          }, 'jakubsobolewski.com →'),
        ]),

        // Empty div for spacing (keeps the layout balanced)
        createElement('div', {}, ''),
      ])
    ]),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist Sans",
          data: fontData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist Sans",
          data: fontDataBold,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
