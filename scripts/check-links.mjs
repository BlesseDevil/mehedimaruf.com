#!/usr/bin/env node
/**
 * Internal link check over the built site.
 *
 *   node scripts/check-links.mjs           # checks dist/
 *
 * Every internal href and every #anchor is resolved against what the build
 * actually produced. External links are listed but not fetched — a network
 * check would make the result depend on someone else's uptime.
 *
 * Exits 1 if anything internal is broken.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, posix } from "node:path";

const ROOT = process.argv[2] ?? "dist";

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const pages = [...walk(ROOT)].filter((path) => path.endsWith(".html"));

/** Every id and name on a page, so #anchors can be resolved. */
const idsByPage = new Map();
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  idsByPage.set(urlOf(page), ids);
}

function urlOf(file) {
  const rel = relative(ROOT, file).split(/[\\/]/).join("/");
  return "/" + rel.replace(/index\.html$/, "").replace(/\.html$/, "");
}

/** Does this path exist in the build, as a file or as a directory index? */
function resolves(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\/$/, "");
  const candidates = [
    join(ROOT, clean),
    join(ROOT, clean + ".html"),
    join(ROOT, clean, "index.html"),
  ];
  return candidates.some((candidate) => existsSync(candidate));
}

const broken = [];
const external = new Set();
let checked = 0;

/** Inline scripts and styles contain template strings that look like hrefs. */
const stripCode = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

for (const page of pages) {
  const from = urlOf(page);
  const html = stripCode(readFileSync(page, "utf8"));

  for (const match of html.matchAll(/\shref="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("data:")) continue;

    if (/^https?:\/\//.test(href)) {
      external.add(href);
      continue;
    }

    checked += 1;

    // A bare anchor points inside the current page.
    if (href.startsWith("#")) {
      const id = href.slice(1);
      if (id && !idsByPage.get(from)?.has(id)) {
        broken.push({ from, href, why: "no element with that id on this page" });
      }
      continue;
    }

    const [pathname, hash] = href.split("#");
    const target = pathname === "" ? from : pathname;

    if (!target.startsWith("/")) {
      broken.push({ from, href, why: "relative link — use a path from the site root" });
      continue;
    }

    if (!resolves(target)) {
      broken.push({ from, href, why: "no such page in the build" });
      continue;
    }

    if (hash) {
      const targetUrl = target.replace(/\/$/, "") || "/";
      const ids = idsByPage.get(targetUrl) ?? idsByPage.get(targetUrl + "/");
      if (ids && !ids.has(hash)) {
        broken.push({ from, href, why: `target page has no id "${hash}"` });
      }
    }
  }
}

console.log(
  `check-links: ${pages.length} pages, ${checked} internal links, ${external.size} external.`,
);

if (broken.length > 0) {
  console.error(`\n${broken.length} broken link(s):`);
  for (const item of broken) console.error(`  ${item.from}  →  ${item.href}\n    ${item.why}`);
  process.exit(1);
}

console.log("check-links: all internal links resolve.");
for (const href of [...external].sort()) console.log(`  external (not fetched): ${href}`);
