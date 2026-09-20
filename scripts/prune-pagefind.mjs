#!/usr/bin/env node
/**
 * Pagefind ships a drop-in search UI alongside the index. The command palette
 * uses the search API directly and never loads that UI, so those bundles are
 * dead weight in the published site — and they carry a credits blob full of
 * contributor email addresses, which the privacy scan rightly flags.
 *
 * Runs after `pagefind --site dist`. Deleting a file that is not there is fine:
 * if a future Pagefind stops shipping these, nothing breaks.
 */
import { rm } from "node:fs/promises";
import { join } from "node:path";

const DIR = join("dist", "pagefind");
const UNUSED = [
  "pagefind-ui.js",
  "pagefind-ui.css",
  "pagefind-modular-ui.js",
  "pagefind-modular-ui.css",
  "pagefind-component-ui.js",
  "pagefind-component-ui.css",
  "pagefind-highlight.js",
];

let removed = 0;
for (const name of UNUSED) {
  try {
    await rm(join(DIR, name));
    removed += 1;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

console.log(`prune-pagefind: removed ${removed} unused UI file(s).`);
