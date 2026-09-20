#!/usr/bin/env node
/**
 * WCAG contrast check over the design tokens.
 *
 *   node scripts/check-contrast.mjs
 *
 * Reads src/styles/tokens.css, pulls both halves out of every
 * light-dark(blessed, devil) pair, and checks the combinations the site
 * actually renders — in both themes, since a value that passes on paper can
 * fail on wine-black.
 *
 * AA is 4.5:1 for body text and 3:1 for large text and UI edges. Exits 1 if a
 * body-text pair falls below its target.
 */
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/tokens.css", "utf8");

/** --name: light-dark(a, b);  or  --name: value;  (same in both themes) */
const tokens = { blessed: {}, devil: {} };
for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gim)) {
  const [, name, raw] = match;
  const value = raw.trim();
  const pair = value.match(/^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/);
  if (pair) {
    tokens.blessed[name] = pair[1];
    tokens.devil[name] = pair[2];
  } else if (/^#|^rgba?\(/.test(value)) {
    tokens.blessed[name] = value;
    tokens.devil[name] = value;
  }
}

function parse(colour) {
  const hex = colour.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgba = colour.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(",").map((v) => Number.parseFloat(v.trim()));
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  }
  return null;
}

/** Flatten a translucent colour onto its background before measuring. */
const over = (fg, bg) => fg.map((v, i) => (i === 3 ? 1 : Math.round(v * fg[3] + bg[i] * (1 - fg[3]))));

const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function ratio(fgName, bgName, theme) {
  const bg = parse(tokens[theme][bgName]);
  let fg = parse(tokens[theme][fgName]);
  if (!fg || !bg) return null;
  if (fg[3] < 1) fg = over(fg, bg);
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// [foreground, background, minimum, what it is]
const PAIRS = [
  ["--text", "--bg", 4.5, "body text on the page"],
  ["--text", "--surface", 4.5, "body text on a card"],
  ["--text", "--bg-alt", 4.5, "body text on the alternate surface"],
  ["--muted", "--bg", 4.5, "muted text on the page"],
  ["--muted", "--surface", 4.5, "muted text on a card"],
  ["--accent", "--bg", 4.5, "links on the page"],
  ["--accent", "--surface", 4.5, "links on a card"],
  ["--accent-fg", "--accent", 4.5, "button label on the accent fill"],
  ["--control-edge", "--bg", 3, "input and control edges"],
  ["--control-edge", "--surface", 3, "input edges on a card"],
  ["--portal-text", "--portal-backdrop", 4.5, "portal text on its backdrop"],
];

let failures = 0;
for (const theme of ["blessed", "devil"]) {
  console.log(`\n${theme === "blessed" ? "Blessed (light)" : "Devil (dark)"}`);
  for (const [fg, bg, min, what] of PAIRS) {
    const value = ratio(fg, bg, theme);
    if (value === null) {
      console.log(`  ?     ${what} — could not read ${fg} or ${bg}`);
      continue;
    }
    const ok = value >= min;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${value.toFixed(2)}:1 (needs ${min}:1)  ${what}`,
    );
  }
}

console.log("");
if (failures > 0) {
  console.error(`check-contrast: ${failures} pair(s) below target.`);
  process.exit(1);
}
console.log("check-contrast: every pair meets its target.");
