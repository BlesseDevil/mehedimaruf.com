#!/usr/bin/env node
/**
 * Privacy scan — run against dist/ before anything is published.
 *
 *   node scripts/privacy-scan.mjs            # scans dist/
 *   node scripts/privacy-scan.mjs src        # scans another folder
 *
 * The rules here are GENERIC ON PURPOSE. Writing the actual private values into
 * a committed script would publish them, which is the very thing this script
 * exists to prevent. So it looks for the *shapes* of private data: phone
 * numbers, unlisted email addresses, ID-document words, and so on.
 *
 * Extra project-specific patterns can be kept in a file that is never
 * committed, one JS regex source per line, blank lines and # comments ignored:
 *
 *   .blessedevil/privacy-patterns.txt
 *
 * Exit code 1 means something private reached the build. Fix it, do not
 * suppress it.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";

const root = process.argv[2] ?? "dist";
const TEXT_EXT = new Set([".html", ".xml", ".txt", ".json", ".js", ".css", ".md", ".svg"]);

/** Addresses that are meant to be public. Everything else is a finding. */
const ALLOWED_EMAILS = [
  /^(cv|contact|dev)@mehedimaruf\.com$/i,
  /^noreply@/i,
  /@example\.(com|org)$/i,
  /@fontsource/i,
];

const RULES = [
  {
    id: "bd-phone",
    why: "Bangladeshi phone number",
    re: /(?:\+?880[\s-]?|\b0)1[3-9]\d[\s-]?\d{3}[\s-]?\d{4}\b/g,
  },
  {
    id: "intl-phone",
    why: "phone-number-shaped string",
    re: /\+\d{1,3}[\s-]\d{3,4}[\s-]?\d{5,7}\b/g,
  },
  { id: "gmail", why: "personal Gmail address", re: /\b[\w.+-]+@gmail\.com\b/gi },
  {
    id: "id-words",
    why: "identity-document or personal-detail wording",
    re: /\b(date of birth|permanent address|national id|nid no|passport no|father'?s name|mother'?s name|blood group|marital status)\b/gi,
  },
  {
    id: "referee-block",
    why: "referee contact block (references must be 'available on request')",
    re: /\breferences?\b[\s\S]{0,80}?(\+?880|@[\w.-]+\.(com|edu|ac\.bd))/gi,
  },
  {
    id: "memo-number",
    why: "government memo / reference number",
    re: /\b\d{2}\.\d{2}\.\d{4}\.\d{3}[\d.\-]+\b/g,
  },
];

function loadExtraRules() {
  const path = ".blessedevil/privacy-patterns.txt";
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((source, i) => ({
      id: `local-${i + 1}`,
      why: "project-specific private value",
      re: new RegExp(source, "gi"),
      // Never print the match itself: the pattern came from a private file.
      redact: true,
    }));
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) yield* walk(path);
    else if (TEXT_EXT.has(extname(name))) yield path;
  }
}

function isAllowedEmail(value) {
  return ALLOWED_EMAILS.some((re) => re.test(value));
}

if (!existsSync(root)) {
  console.error(`privacy-scan: "${root}" does not exist. Run the build first.`);
  process.exit(2);
}

const rules = [...RULES, ...loadExtraRules()];
const findings = [];
let scanned = 0;

for (const file of walk(root)) {
  scanned += 1;
  const text = readFileSync(file, "utf8");

  for (const rule of rules) {
    rule.re.lastIndex = 0;
    for (const match of text.matchAll(rule.re)) {
      if (rule.id === "gmail" && isAllowedEmail(match[0])) continue;
      const line = text.slice(0, match.index).split("\n").length;
      findings.push({
        file: relative(process.cwd(), file),
        line,
        why: rule.why,
        shown: rule.redact ? "[redacted]" : match[0].slice(0, 60),
      });
    }
  }

  // Any email address at all that is not on the allowlist.
  for (const match of text.matchAll(/\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g)) {
    if (isAllowedEmail(match[0])) continue;
    if (/@gmail\.com$/i.test(match[0])) continue; // already reported above
    const line = text.slice(0, match.index).split("\n").length;
    findings.push({
      file: relative(process.cwd(), file),
      line,
      why: "email address that is not one of the published site addresses",
      shown: match[0],
    });
  }
}

if (findings.length === 0) {
  console.log(`privacy-scan: clean — ${scanned} files, ${rules.length} rules.`);
  process.exit(0);
}

console.error(`privacy-scan: ${findings.length} finding(s) across ${scanned} files:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  ${f.why}\n    ${f.shown}`);
}
console.error("\nRemove these from the content, rebuild, and scan again.");
process.exit(1);
