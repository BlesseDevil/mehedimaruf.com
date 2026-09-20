#!/usr/bin/env node
/**
 * Generates public/og-image.png — the picture that shows when a link to this
 * site is pasted into a chat app or a social post.
 *
 *   node scripts/make-og.mjs
 *
 * Run it again after changing the name, the role line or the emblem. The output
 * is committed, so the build itself never depends on this script.
 *
 * Text is drawn through an SVG overlay, which means the fonts are whatever this
 * machine has. Georgia and Arial are used deliberately: both are present on
 * Windows and macOS, so the result is reproducible rather than a surprise.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const W = 1200;
const H = 630;
const NAME = "Mehedi Hasan Maruf";
// Two short lines rather than one long one: at 1200px wide a single line of
// this length runs straight off the edge.
const ROLE_LINES = [
  "Banking operations · project management",
  "Research and language data",
];
const DOMAIN = "mehedimaruf.com";

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const background = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="22%" cy="45%" r="62%">
      <stop offset="0%" stop-color="#3a1018"/>
      <stop offset="60%" stop-color="#220d12"/>
      <stop offset="100%" stop-color="#1a0b10"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="#a81830"/>
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="#d8b478"/>
</svg>`;

const text = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="420" y="248" font-family="Georgia, 'Times New Roman', serif" font-size="58"
        font-weight="600" fill="#f2e6d8">${escape(NAME)}</text>
  <text x="422" y="300" font-family="Arial, Helvetica, sans-serif" font-size="24"
        fill="#a8958c">${escape(ROLE_LINES[0])}</text>
  <text x="422" y="334" font-family="Arial, Helvetica, sans-serif" font-size="24"
        fill="#a8958c">${escape(ROLE_LINES[1])}</text>
  <rect x="422" y="372" width="86" height="3" fill="#d8b478"/>
  <text x="422" y="432" font-family="Consolas, 'Courier New', monospace" font-size="24"
        letter-spacing="3" fill="#d8b478">${escape(DOMAIN)}</text>
</svg>`;

const emblem = await sharp("src/assets/brand/emblem.png")
  .resize(268, 268, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

await sharp(Buffer.from(background))
  .composite([
    { input: emblem, left: 96, top: 181 },
    { input: Buffer.from(text), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/og-image.png");

const { size } = await import("node:fs").then((fs) => fs.promises.stat("public/og-image.png"));
console.log(`make-og: wrote public/og-image.png (${Math.round(size / 1024)} KB)`);
